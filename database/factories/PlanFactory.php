<?php

namespace Database\Factories;

use App\Models\Plan;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Plan> */
class PlanFactory extends Factory
{
    protected $model = Plan::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
            'price_etb' => fake()->randomFloat(2, 0, 5000),
            'price_usd' => fake()->randomFloat(2, 0, 100),
            'billing_interval' => 'monthly',
            'free_documents' => fake()->numberBetween(0, 20),
            'is_active' => true,
        ];
    }
}
