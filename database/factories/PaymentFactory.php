<?php

namespace Database\Factories;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Payment> */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'subscription_id' => null,
            'provider' => 'test',
            'provider_transaction_id' => fake()->unique()->uuid(),
            'provider_reference' => fake()->unique()->bothify('REF-#####'),
            'amount' => fake()->randomFloat(2, 0, 5000),
            'currency' => 'ETB',
            'status' => 'paid',
            'raw_response' => ['status' => 'success'],
            'paid_at' => now(),
        ];
    }
}
