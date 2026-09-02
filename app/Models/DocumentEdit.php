<?php

namespace App\Models;

use Database\Factories\DocumentEditFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['document_id', 'page_number', 'object_type', 'object_data'])]
class DocumentEdit extends Model
{
    /** @use HasFactory<DocumentEditFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'page_number' => 'integer',
            'object_data' => 'array',
        ];
    }

    /** @return BelongsTo<Document, $this> */
    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }
}
