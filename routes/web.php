<?php

use App\Http\Controllers\ServiceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('services', [ServiceController::class, 'index'])->name('services');
    Route::post('services', [ServiceController::class, 'store'])->name('services.store');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
