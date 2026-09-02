<?php

/**
 * SEOTools configuration for PEDF.
 *
 * @see https://github.com/artesaos/seotools
 */
return [
    /*
     * Set to true to add the inertia attribute to all generated tags so they
     * are picked up by Inertia's <x-inertia::head> component in app.blade.php.
     */
    'inertia' => env('SEO_TOOLS_INERTIA', true),

    'meta' => [
        'defaults' => [
            'title' => 'PEDF — Edit PDFs. Keep the original design.',
            'titleBefore' => false,
            'description' => 'PEDF lets you edit text in supported, text-based PDFs while preserving the original layout. Browser-based, no installation required.',
            'separator' => ' | ',
            'keywords' => ['pdf editor', 'edit pdf online', 'pdf text editor', 'browser pdf editor', 'PEDF'],
            'canonical' => 'full',
            'robots' => 'index, follow',
        ],
        'webmaster_tags' => [
            'google' => null,
            'bing' => null,
            'alexa' => null,
            'pinterest' => null,
            'yandex' => null,
            'norton' => null,
        ],
        'add_notranslate_class' => false,
    ],

    'opengraph' => [
        'defaults' => [
            'title' => 'PEDF — Edit PDFs. Keep the original design.',
            'description' => 'Edit text in supported PDFs without breaking the original design. Fast, browser-based, and free to try.',
            'url' => null,
            'type' => 'website',
            'site_name' => 'PEDF',
            'images' => [],
        ],
    ],

    'twitter' => [
        'defaults' => [
            'card' => 'summary_large_image',
            'site' => '@pedf',
        ],
    ],

    'json-ld' => [
        'defaults' => [
            'title' => 'PEDF — Edit PDFs. Keep the original design.',
            'description' => 'Edit text in supported PDFs without breaking the original design. Fast, browser-based, and free to try.',
            'url' => null,
            'type' => 'WebApplication',
            'images' => [],
        ],
    ],
];
