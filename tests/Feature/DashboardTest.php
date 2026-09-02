<?php

use App\Models\Document;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\UsageRecord;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('dashboard receives owned documents and server calculated usage', function () {
    $user = User::factory()->create();
    $plan = Plan::factory()->create(['free_documents' => 3]);
    Subscription::factory()->for($user)->for($plan)->create();
    $document = Document::factory()->for($user)->create();
    UsageRecord::factory()->for($user)->for($document)->create([
        'action' => 'document_upload',
        'units' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('dashboard.plan.name', $plan->name)
            ->where('dashboard.usage.used_documents', 1)
            ->where('dashboard.recent_documents.0.id', $document->id),
        );
});
