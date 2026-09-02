<?php

namespace Database\Factories;

use App\Models\UsageRecord;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<UsageRecord> */
class UsageRecordFactory extends Factory
{
    protected $model = UsageRecord::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'document_id' => null,
            'action' => 'document_upload',
            'units' => fake()->numberBetween(1, 3),
        ];
    }
}
