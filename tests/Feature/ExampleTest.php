<?php

use App\Models\Plan;
use Inertia\Testing\AssertableInertia as Assert;

test('that true is true', function () {
    expect(true)->toBeTrue();
});

test('the landing page receives active plans from the database', function () {
    $activePlan = Plan::factory()->create(['is_active' => true]);
    Plan::factory()->create(['is_active' => false]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->has('plans', 1)
            ->where('plans.0.id', $activePlan->id),
        );
});

test('returns a successful response', function () {
    $response = $this->get(route('home'));

    $response->assertOk();
});
