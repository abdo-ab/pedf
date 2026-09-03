<?php

use App\Models\Document;
use App\Models\DocumentEdit;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('local');
});

test('guests cannot open the editor', function () {
    $document = Document::factory()->create();

    $this->get(route('documents.edit', $document))
        ->assertRedirectToRoute('login');
});

test('users cannot open another users document in the editor', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $document = Document::factory()->for($owner)->create();

    $this->actingAs($other)
        ->get(route('documents.edit', $document))
        ->assertNotFound();
});

test('non-editable documents cannot be opened in the editor', function () {
    $user = User::factory()->create();
    $document = Document::factory()->for($user)->create([
        'is_editable' => false,
        'stored_filename' => null,
    ]);

    $this->actingAs($user)
        ->get(route('documents.edit', $document))
        ->assertStatus(422);
});

test('editor page renders with document data and existing edits', function () {
    $user = User::factory()->create();

    Storage::disk('local')->put('documents/test.pdf', '%PDF-1.4 test');

    $document = Document::factory()->for($user)->create([
        'is_editable' => true,
        'stored_filename' => 'documents/test.pdf',
        'page_count' => 2,
    ]);

    DocumentEdit::factory()->for($document)->create([
        'page_number' => 1,
        'object_type' => 'text',
        'object_data' => [
            'id' => 'test-123',
            'page' => 1,
            'type' => 'text',
            'x' => 0.1,
            'y' => 0.2,
            'width' => 0.3,
            'height' => 0.05,
            'text' => 'Hello PDF',
        ],
    ]);

    $response = $this->actingAs($user)
        ->get(route('documents.edit', $document));

    $response->assertOk()
        ->assertInertia(function ($page) use ($document) {
            $page->component('documents/editor')
                ->has('document')
                ->where('document.route_key', $document->public_id)
                ->where('document.page_count', 2)
                ->has('document.file_url')
                ->has('document.edits', 1)
                ->where('document.edits.0.type', 'text')
                ->where('document.edits.0.text', 'Hello PDF');
        });
});

test('numeric document IDs cannot be used in editor URLs', function () {
    $user = User::factory()->create();
    $document = Document::factory()->for($user)->create();

    $this->actingAs($user)
        ->get('/documents/'.$document->getKey().'/edit')
        ->assertNotFound();
});

test('file endpoint streams the PDF for the document owner', function () {
    $user = User::factory()->create();
    $path = 'documents/'.$user->id.'/test.pdf';

    Storage::disk('local')->put($path, '%PDF-1.4');

    $document = Document::factory()->for($user)->create([
        'stored_filename' => $path,
        'is_editable' => true,
    ]);

    $this->actingAs($user)
        ->get(route('documents.file', $document))
        ->assertOk()
        ->assertHeader('Content-Type', 'application/pdf');
});

test('file endpoint rejects other users', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $path = 'documents/test.pdf';

    Storage::disk('local')->put($path, '%PDF-1.4');

    $document = Document::factory()->for($owner)->create([
        'stored_filename' => $path,
    ]);

    $this->actingAs($other)
        ->get(route('documents.file', $document))
        ->assertNotFound();
});

test('file endpoint returns 404 when the stored file is missing', function () {
    $user = User::factory()->create();
    $document = Document::factory()->for($user)->create([
        'stored_filename' => 'documents/missing.pdf',
    ]);

    $this->actingAs($user)
        ->get(route('documents.file', $document))
        ->assertNotFound();
});
