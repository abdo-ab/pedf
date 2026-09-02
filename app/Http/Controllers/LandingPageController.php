<?php

namespace App\Http\Controllers;

use Artesaos\SEOTools\Facades\JsonLd;
use Artesaos\SEOTools\Facades\OpenGraph;
use Artesaos\SEOTools\Facades\SEOMeta;
use Artesaos\SEOTools\Facades\TwitterCard;
use Inertia\Inertia;
use Inertia\Response;

class LandingPageController extends Controller
{
    public function __invoke(): Response
    {
        SEOMeta::setTitle('PEDF — Edit PDFs. Keep the original design.')
            ->setDescription('PEDF lets you edit text in supported, text-based PDFs while preserving the original layout. Browser-based, no installation required.')
            ->setKeywords(['pdf editor', 'edit pdf online', 'pdf text editor', 'browser pdf editor', 'PEDF'])
            ->setCanonical(url('/'));

        OpenGraph::setTitle('PEDF — Edit PDFs. Keep the original design.')
            ->setDescription('Edit text in supported PDFs without breaking the original design. Fast, browser-based, and free to try.')
            ->setType('website')
            ->setSiteName('PEDF')
            ->setUrl(url('/'));

        TwitterCard::setType('summary_large_image')
            ->setTitle('PEDF — Edit PDFs. Keep the original design.')
            ->setDescription('Edit text in supported PDFs without breaking the original design. Fast, browser-based, and free to try.');

        JsonLd::setType('WebApplication')
            ->setTitle('PEDF — Edit PDFs. Keep the original design.')
            ->setDescription('Edit text in supported PDFs without breaking the original design. Fast, browser-based, and free to try.')
            ->setUrl(url('/'))
            ->addValue('applicationCategory', 'BusinessApplication')
            ->addValue('operatingSystem', 'Any')
            ->addValue('offers', [
                '@type' => 'Offer',
                'price' => '0',
                'priceCurrency' => 'USD',
            ]);

        return Inertia::render('welcome');
    }
}
