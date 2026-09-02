<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Plan::query()->updateOrCreate(
            ['slug' => 'free'],
            [
                'name' => 'Free',
                'description' => 'A free plan for getting started.',
                'price_etb' => 0,
                'price_usd' => 0,
                'billing_interval' => 'monthly',
                'free_documents' => 3,
                'is_active' => true,
            ],
        );

        Plan::query()->updateOrCreate(
            ['slug' => 'pro'],
            [
                'name' => 'Pro',
                'description' => 'More documents and editing capacity.',
                'price_etb' => 499,
                'price_usd' => 9.99,
                'billing_interval' => 'monthly',
                'free_documents' => 25,
                'is_active' => true,
            ],
        );

        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }
}
