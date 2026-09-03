<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UploadDocumentRequest;
use App\Models\Document;
use App\Models\UsageRecord;
use App\Services\Pdf\PdfValidationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentUploadController extends Controller
{
    public function __invoke(UploadDocumentRequest $request, PdfValidationService $pdfValidation): JsonResponse
    {
        $file = $request->file('file');
        $validation = $pdfValidation->validate($file);

        if (! $validation->isValid || ! $validation->isEditable) {
            return response()->json([
                'success' => false,
                'message' => $validation->message,
                'code' => $validation->code,
            ], $validation->isValid ? 422 : 422);
        }

        $user = $request->user();
        $storedFilename = Str::uuid()->toString().'.pdf';
        $storedPath = 'documents/'.$user->getKey().'/'.$storedFilename;

        try {
            $stored = Storage::disk('local')->putFileAs(
                'documents/'.$user->getKey(),
                $file,
                $storedFilename,
            );

            if (! $stored) {
                return response()->json([
                    'success' => false,
                    'message' => 'The PDF could not be stored.',
                    'code' => 'STORAGE_FAILED',
                ], 500);
            }

            $document = DB::transaction(function () use ($user, $file, $validation, $storedPath): Document {
                $document = $user->documents()->create([
                    'original_filename' => $file->getClientOriginalName(),
                    'stored_filename' => $storedPath,
                    'mime_type' => 'application/pdf',
                    'file_size' => $file->getSize(),
                    'page_count' => $validation->pageCount,
                    'is_editable' => true,
                    'status' => 'ready',
                ]);

                UsageRecord::query()->create([
                    'user_id' => $user->getKey(),
                    'document_id' => $document->getKey(),
                    'action' => 'document_upload',
                    'units' => 1,
                ]);

                return $document;
            });

            return response()->json([
                'success' => true,
                'message' => 'PDF uploaded successfully.',
                'data' => [
                    'route_key' => $document->getRouteKey(),
                    'original_filename' => $document->original_filename,
                    'status' => $document->status,
                    'page_count' => $document->page_count,
                ],
            ], 201);
        } catch (\Throwable $exception) {
            Storage::disk('local')->delete($storedPath);

            throw $exception;
        }
    }
}
