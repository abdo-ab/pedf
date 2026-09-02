<?php

use App\Models\Document;
use App\Models\DocumentEdit;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\UsageRecord;
use App\Models\User;

test('database models expose their ownership relationships and casts', function () {
    $user = User::factory()->create();
    $plan = Plan::factory()->create();
    $subscription = Subscription::factory()->for($user)->for($plan)->create();
    $document = Document::factory()->for($user)->create();
    $edit = DocumentEdit::factory()->for($document)->create([
        'object_data' => ['font' => 'Instrument Sans', 'text' => 'Editable'],
    ]);
    $usageRecord = UsageRecord::factory()->for($user)->for($document)->create();
    $payment = Payment::factory()->for($user)->for($subscription)->create([
        'raw_response' => ['transaction_id' => 'test-transaction'],
    ]);

    expect($user->documents->pluck('id'))->toContain($document->id)
        ->and($user->subscriptions->pluck('id'))->toContain($subscription->id)
        ->and($user->usageRecords->pluck('id'))->toContain($usageRecord->id)
        ->and($user->payments->pluck('id'))->toContain($payment->id)
        ->and($document->edits->pluck('id'))->toContain($edit->id)
        ->and($edit->object_data)->toBe(['font' => 'Instrument Sans', 'text' => 'Editable'])
        ->and($payment->raw_response)->toBe(['transaction_id' => 'test-transaction'])
        ->and($subscription->starts_at)->toBeInstanceOf(DateTimeInterface::class);
});

test('database seeder creates the initial plans', function () {
    $this->seed();

    expect(Plan::query()->whereIn('slug', ['free', 'pro'])->count())->toBe(2);
});
