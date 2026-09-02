<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Inertia\Inertia;
use Inertia\Response;

class LandingPageController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('welcome', [
            'plans' => Plan::query()
                ->where('is_active', true)
                ->orderBy('price_usd')
                ->get(['id', 'name', 'slug', 'description', 'price_etb', 'price_usd', 'billing_interval', 'free_documents']),
        ]);
    }
}
