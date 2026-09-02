<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $subscription = $user->subscriptions()
            ->with('plan')
            ->latest('starts_at')
            ->first();
        $plan = $subscription
            ? $subscription->plan
            : Plan::query()->where('slug', 'free')->first();
        $periodStart = Carbon::now()->startOfMonth();
        $usedDocuments = $user->usageRecords()
            ->where('action', 'document_upload')
            ->where('created_at', '>=', $periodStart)
            ->sum('units');

        return Inertia::render('dashboard', [
            'dashboard' => [
                'plan' => $plan ? [
                    'name' => $plan->name,
                    'free_documents' => $plan->free_documents,
                ] : null,
                'subscription' => $subscription ? [
                    'status' => $subscription->status,
                    'currency' => $subscription->currency,
                    'amount' => $subscription->amount,
                    'ends_at' => $subscription->ends_at
                        ? Carbon::parse($subscription->ends_at)->toISOString()
                        : null,
                ] : null,
                'usage' => [
                    'used_documents' => $usedDocuments,
                    'available_documents' => $plan?->free_documents,
                ],
                'recent_documents' => $user->documents()
                    ->latest()
                    ->limit(5)
                    ->get(['id', 'original_filename', 'file_size', 'page_count', 'status', 'created_at'])
                    ->map(fn ($document): array => [
                        'id' => $document->id,
                        'original_filename' => $document->original_filename,
                        'file_size' => $document->file_size,
                        'page_count' => $document->page_count,
                        'status' => $document->status,
                        'created_at' => $document->created_at
                            ? Carbon::parse($document->created_at)->toISOString()
                            : null,
                    ])
                    ->values(),
            ],
        ]);
    }
}
