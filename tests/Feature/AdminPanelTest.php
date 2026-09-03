<?php

use App\Models\Document;
use App\Models\User;

// ── Access control ──────────────────────────────────────────────────────────

test('guests are redirected to filament login', function () {
    $this->get('/yigita')->assertRedirect('/yigita/login');
});

test('non-admin users cannot access the admin panel', function () {
    $user = User::factory()->create(['is_admin' => false]);

    $this->actingAs($user)
        ->get('/yigita')
        ->assertForbidden();
});

test('admin users can access the admin panel', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get('/yigita')
        ->assertOk();
});

// ── User resource ────────────────────────────────────────────────────────────

test('admin can list users', function () {
    $admin = User::factory()->admin()->create();
    User::factory()->count(3)->create();

    $this->actingAs($admin)
        ->get('/yigita/users')
        ->assertOk();
});

test('admin can search users by name', function () {
    $admin = User::factory()->admin()->create();
    User::factory()->create(['name' => 'Searchable Person']);
    User::factory()->create(['name' => 'Other Person']);

    $this->actingAs($admin)
        ->get('/yigita/users?tableSearch=Searchable')
        ->assertOk()
        ->assertSee('Searchable Person');
});

test('admin can view a user record', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();

    $this->actingAs($admin)
        ->get("/yigita/users/{$user->id}")
        ->assertOk();
});

test('non-admin cannot access user list', function () {
    $user = User::factory()->create(['is_admin' => false]);

    $this->actingAs($user)
        ->get('/yigita/users')
        ->assertForbidden();
});

// ── Document resource ────────────────────────────────────────────────────────

test('admin can list documents', function () {
    $admin = User::factory()->admin()->create();
    Document::factory()->count(3)->create();

    $this->actingAs($admin)
        ->get('/yigita/documents')
        ->assertOk();
});

test('admin can view a document record', function () {
    $admin = User::factory()->admin()->create();
    $document = Document::factory()->create();

    $this->actingAs($admin)
        ->get("/yigita/documents/{$document->id}")
        ->assertOk();
});

test('admin can filter documents by status', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get('/yigita/documents?tableFilters[status][value]=ready')
        ->assertOk();
});

test('non-admin cannot delete documents via admin panel', function () {
    $nonAdmin = User::factory()->create(['is_admin' => false]);
    $document = Document::factory()->create();

    // Non-admins are blocked at the panel level — the page itself returns 403
    $this->actingAs($nonAdmin)
        ->get("/yigita/documents/{$document->id}")
        ->assertForbidden();

    $this->assertModelExists($document);
});

// ── Activity resource ────────────────────────────────────────────────────────

test('admin can view the activity log', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get('/yigita/usage-records')
        ->assertOk();
});

// ── Dashboard ────────────────────────────────────────────────────────────────

test('admin dashboard loads successfully', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get('/yigita')
        ->assertOk();
});
