<?php

use App\Models\Document;
use App\Models\DocumentEdit;
use App\Models\User;

test('guests cannot save editor changes', function () {
    $document = Document::factory()->create();

    $this->putJson(route('api.documents.edits.update', $document), [
        'objects' => [],
    ])->assertUnauthorized();
});

test('authenticated users cannot save changes to another users document', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $document = Document::factory()->for($owner)->create();

    $this->actingAs($other)
        ->putJson(route('api.documents.edits.update', $document), [
            'objects' => [],
        ])->assertNotFound();
});

test('saving an empty objects array clears existing edits', function () {
    $user = User::factory()->create();
    $document = Document::factory()->for($user)->create();
    DocumentEdit::factory()->for($document)->count(3)->create();

    $response = $this->actingAs($user)
        ->putJson(route('api.documents.edits.update', $document), [
            'objects' => [],
        ]);

    $response->assertOk()->assertJsonPath('success', true);
    expect(DocumentEdit::whereBelongsTo($document)->count())->toBe(0);
});

test('saving replaces all existing edits with new objects', function () {
    $user = User::factory()->create();
    $document = Document::factory()->for($user)->create(['page_count' => 2]);
    DocumentEdit::factory()->for($document)->count(5)->create();

    $objects = [
        [
            'id' => 'aaaa-1111',
            'page' => 1,
            'type' => 'text',
            'x' => 0.1,
            'y' => 0.2,
            'width' => 0.3,
            'height' => 0.05,
            'text' => 'Hello',
            'color' => '#17221e',
            'fontSize' => 18,
            'sourceTextId' => '0-72-700',
        ],
        [
            'id' => 'bbbb-2222',
            'page' => 2,
            'type' => 'rectangle',
            'x' => 0.5,
            'y' => 0.5,
            'width' => 0.2,
            'height' => 0.1,
        ],
    ];

    $response = $this->actingAs($user)
        ->putJson(route('api.documents.edits.update', $document), [
            'objects' => $objects,
        ]);

    $response->assertOk()->assertJsonPath('success', true);

    $edits = DocumentEdit::whereBelongsTo($document)->get();
    expect($edits)->toHaveCount(2);
    expect($edits->first()->page_number)->toBe(1);
    expect($edits->first()->object_type)->toBe('text');
    expect($edits->first()->object_data['sourceTextId'])->toBe('0-72-700');
    expect($edits->last()->page_number)->toBe(2);
    expect($edits->last()->object_type)->toBe('rectangle');
});

test('all supported object types are accepted', function (string $type) {
    $user = User::factory()->create();
    $document = Document::factory()->for($user)->create();

    $this->actingAs($user)
        ->putJson(route('api.documents.edits.update', $document), [
            'objects' => [[
                'id' => 'test-id',
                'page' => 1,
                'type' => $type,
                'x' => 0.1,
                'y' => 0.1,
                'width' => 0.2,
                'height' => 0.1,
            ]],
        ])->assertOk()->assertJsonPath('success', true);
})->with([
    'text',
    'image',
    'signature',
    'rectangle',
    'circle',
    'line',
    'highlight',
    'underline',
    'strikethrough',
]);

test('unsupported object type is rejected', function () {
    $user = User::factory()->create();
    $document = Document::factory()->for($user)->create();

    $this->actingAs($user)
        ->putJson(route('api.documents.edits.update', $document), [
            'objects' => [[
                'page' => 1,
                'type' => 'unknown-type',
            ]],
        ])->assertUnprocessable();
});

test('request exceeding 500 objects is rejected', function () {
    $user = User::factory()->create();
    $document = Document::factory()->for($user)->create();

    $objects = array_fill(0, 501, [
        'page' => 1,
        'type' => 'text',
    ]);

    $this->actingAs($user)
        ->putJson(route('api.documents.edits.update', $document), [
            'objects' => $objects,
        ])->assertUnprocessable();
});
