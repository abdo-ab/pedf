<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DocumentEditorController extends Controller
{
    public function edit(Request $request, Document $document): InertiaResponse
    {
        abort_unless($document->user_id === $request->user()->getKey(), 404);
        abort_unless($document->is_editable && $document->stored_filename, 422);

        return Inertia::render('documents/editor', [
            'document' => [
                'route_key' => $document->getRouteKey(),
                'name' => $document->original_filename,
                'page_count' => $document->page_count,
                'file_url' => route('documents.file', $document),
                'edits' => $document->edits()
                    ->latest()
                    ->get(['id', 'page_number', 'object_type', 'object_data'])
                    ->map(fn ($edit): array => [
                        'id' => $edit->id,
                        'page' => $edit->page_number,
                        'type' => $edit->object_type,
                        // @phpstan-ignore-next-line - object_data is cast to array in DocumentEdit model
                        ...$edit->object_data,
                    ])
                    ->values(),
            ],
        ]);
    }

    public function file(Request $request, Document $document): BinaryFileResponse
    {
        abort_unless($document->user_id === $request->user()->getKey(), 404);
        abort_unless((bool) $document->stored_filename, 404);

        $disk = Storage::disk('local');
        abort_unless($disk->exists($document->stored_filename), 404);

        return response()->file($disk->path($document->stored_filename), [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.addslashes($document->original_filename).'"',
            'Cache-Control' => 'private, max-age=300',
        ]);
    }
}
