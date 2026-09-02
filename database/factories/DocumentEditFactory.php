<?php

namespace Database\Factories;

use App\Models\Document;
use App\Models\DocumentEdit;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<DocumentEdit> */
class DocumentEditFactory extends Factory
{
    protected $model = DocumentEdit::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'document_id' => Document::factory(),
            'page_number' => fake()->numberBetween(1, 10),
            'object_type' => 'text',
            'object_data' => ['text' => fake()->sentence()],
        ];
    }
}
