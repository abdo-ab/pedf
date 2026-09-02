<?php

use App\Models\User;

test('guests cannot access the authenticated user API endpoint', function () {
    $this->getJson('/api/user')->assertUnauthorized();
});

test('authenticated users can access their safe API representation', function () {
    $user = User::factory()->create([
        'name' => 'PEDE User',
        'email' => 'pede@example.com',
    ]);

    $this->actingAs($user)
        ->getJson('/api/user')
        ->assertSuccessful()
        ->assertJsonPath('data.id', $user->id)
        ->assertJsonPath('data.name', 'PEDE User')
        ->assertJsonPath('data.email', 'pede@example.com')
        ->assertJsonMissingPath('data.password');
});
