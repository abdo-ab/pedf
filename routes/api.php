<?php

use App\Http\Controllers\Api\DocumentEditController;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['web', 'auth'])->group(function () {
    Route::get('user', fn (Request $request) => UserResource::make($request->user()))->name('api.user');

    Route::prefix('documents/{document}')->name('api.documents.')->group(function () {
        Route::put('edits', [DocumentEditController::class, 'update'])->name('edits.update');
    });
});
