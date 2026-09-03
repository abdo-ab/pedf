<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class ComingSoonController extends Controller
{
    public function subscription(): Response
    {
        return Inertia::render('coming-soon', [
            'feature' => 'Subscription',
        ]);
    }

    public function usage(): Response
    {
        return Inertia::render('coming-soon', [
            'feature' => 'Usage',
        ]);
    }
}
