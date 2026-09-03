<?php

namespace App\Services\Pdf;

final readonly class PdfValidationResult
{
    public function __construct(
        public bool $isValid,
        public bool $isEditable,
        public string $message,
        public string $code,
        public int $pageCount = 0,
    ) {}
}
