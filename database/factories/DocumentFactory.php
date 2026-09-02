<?php

namespace Database\Factories;

use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Document> */
class DocumentFactory extends Factory
{
    protected $model = Document::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'original_filename' => fake()->unique()->lexify('document-????.pdf'),
            'stored_filename' => fake()->uuid().'.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => fake()->numberBetween(1024, 5000000),
            'page_count' => fake()->numberBetween(1, 20),
            'is_editable' => true,
            'status' => 'ready',
        ];
    }
}
