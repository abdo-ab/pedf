<?php

use App\Models\Document;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('local');
});

// ── Upload gating removed ────────────────────────────────────────────────────

test('users can upload without any subscription', function () {
    $user = User::factory()->create();

    $file = UploadedFile::fake()->createWithContent(
        'test.pdf',
        "%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
        ."2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
        ."3 0 obj << /Type /Page /Parent 2 0 R /Contents 4 0 R >> endobj\n"
        ."4 0 obj << /Length 26 >> stream\nBT (Free mode text) Tj ET\nendstream endobj\ntrailer << /Root 1 0 R >>\n%%EOF\n"
    );

    $this->actingAs($user)
        ->postJson(route('api.documents.upload'), ['file' => $file])
        ->assertCreated()
        ->assertJsonPath('success', true);
});

test('users can upload more than two PDFs without being blocked', function () {
    $user = User::factory()->create();

    $makeFile = fn (int $n) => UploadedFile::fake()->createWithContent(
        "doc{$n}.pdf",
        "%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
        ."2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
        ."3 0 obj << /Type /Page /Parent 2 0 R /Contents 4 0 R >> endobj\n"
        ."4 0 obj << /Length 26 >> stream\nBT (Document {$n}) Tj ET\nendstream endobj\ntrailer << /Root 1 0 R >>\n%%EOF\n"
    );

    for ($i = 1; $i <= 3; $i++) {
        $this->actingAs($user)
            ->postJson(route('api.documents.upload'), ['file' => $makeFile($i)])
            ->assertCreated();
    }

    expect(Document::query()->whereBelongsTo($user)->count())->toBe(3);
});

// ── Editor gating removed ────────────────────────────────────────────────────

test('users can open the editor without a subscription', function () {
    $user = User::factory()->create();

    Storage::disk('local')->put('documents/test.pdf', '%PDF-1.4');

    $document = Document::factory()->for($user)->create([
        'is_editable' => true,
        'stored_filename' => 'documents/test.pdf',
    ]);

    $this->actingAs($user)
        ->get(route('documents.edit', $document))
        ->assertOk();
});

test('users can open the editor even after uploading more than two documents', function () {
    $user = User::factory()->create();

    Document::factory()->for($user)->count(5)->create();

    Storage::disk('local')->put('documents/extra.pdf', '%PDF-1.4');

    $document = Document::factory()->for($user)->create([
        'is_editable' => true,
        'stored_filename' => 'documents/extra.pdf',
    ]);

    $this->actingAs($user)
        ->get(route('documents.edit', $document))
        ->assertOk();
});

// ── No Chapa requests ────────────────────────────────────────────────────────

test('no Chapa HTTP request is made during a document upload', function () {
    Http::fake();

    $user = User::factory()->create();

    $file = UploadedFile::fake()->createWithContent(
        'chk.pdf',
        "%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
        ."2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
        ."3 0 obj << /Type /Page /Parent 2 0 R /Contents 4 0 R >> endobj\n"
        ."4 0 obj << /Length 28 >> stream\nBT (Chapa test text) Tj ET\nendstream endobj\ntrailer << /Root 1 0 R >>\n%%EOF\n"
    );

    $this->actingAs($user)
        ->postJson(route('api.documents.upload'), ['file' => $file]);

    Http::assertNothingSent();
});

// ── Dashboard has no subscription/payment data ───────────────────────────────

test('dashboard no longer exposes subscription or plan data', function () {
    $user = User::factory()->create();
    $plan = Plan::factory()->create();
    Subscription::factory()->for($user)->for($plan)->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->missing('dashboard.plan')
            ->missing('dashboard.subscription')
            ->missing('dashboard.usage')
            ->has('dashboard.recent_documents')
        );
});

test('dashboard loads for a user with no subscription', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('dashboard.recent_documents')
        );
});
