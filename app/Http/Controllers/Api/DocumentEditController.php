<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentEditController extends Controller
{
    public function update(Request $request, Document $document): JsonResponse
    {
        abort_unless($document->user_id === $request->user()->getKey(), 404);

        $validated = $request->validate([
            'objects' => ['present', 'array', 'max:500'],
            'objects.*.page' => ['required', 'integer', 'min:1'],
            'objects.*.type' => ['required', 'string', 'in:text,image,signature,rectangle,circle,line,highlight,underline,strikethrough'],
        ]);

        $document->edits()->delete();

        foreach ($validated['objects'] as $object) {
            $document->edits()->create([
                'page_number' => $object['page'],
                'object_type' => $object['type'],
                'object_data' => $object,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Editor changes saved.',
        ]);
    }
}
