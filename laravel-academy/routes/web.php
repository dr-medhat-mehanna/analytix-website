<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Academy Routes
Route::prefix('academy')->group(function () {
    Route::get('/', [App\Http\Controllers\AcademyController::class, 'index'])->name('academy.index');
    Route::get('/sitemap.xml', [App\Http\Controllers\AcademyController::class, 'sitemap']);
    Route::get('/{type}/{id}', [App\Http\Controllers\AcademyController::class, 'article']);
    Route::get('/{type}/{id}/', [App\Http\Controllers\AcademyController::class, 'article']);
});
