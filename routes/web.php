<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentEditorController;
use App\Http\Controllers\LandingPageController;
use Illuminate\Support\Facades\Route;

Route::get('/', LandingPageController::class)->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::prefix('documents')->name('documents.')->group(function () {
        Route::get('{document}/edit', [DocumentEditorController::class, 'edit'])->name('edit');
        Route::get('{document}/file', [DocumentEditorController::class, 'file'])->name('file');
    });
});

require __DIR__.'/settings.php';
