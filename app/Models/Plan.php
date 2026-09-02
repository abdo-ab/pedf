<?php

namespace App\Models;

use Database\Factories\PlanFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'slug', 'description', 'price_etb', 'price_usd', 'billing_interval', 'free_documents', 'is_active'])]
class Plan extends Model
{
    /** @use HasFactory<PlanFactory> */
    use HasFactory;

    protected $attributes = [
        'price_etb' => 0,
        'price_usd' => 0,
        'billing_interval' => 'monthly',
        'free_documents' => 0,
        'is_active' => true,
    ];

    protected function casts(): array
    {
        return [
            'price_etb' => 'decimal:2',
            'price_usd' => 'decimal:2',
            'free_documents' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return HasMany<Subscription, $this>
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }
}
