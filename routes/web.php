<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Service;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    Route::get('services', function () {
        return Inertia::render('services', [
            'services' => Service::all(),
        ]);
    })->name('services');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
