<?php

use App\Http\Controllers\OrderController;
use App\Http\Controllers\PortController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\VesselController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('services', [ServiceController::class, 'index'])->name('services.index');
    Route::get('services/create', [ServiceController::class, 'create'])->name('services.create');
    Route::get('services/{service}', [ServiceController::class, 'show'])->name('services.show');
    Route::post('services', [ServiceController::class, 'store'])->name('services.store');
    Route::get('services/{service}/edit', [ServiceController::class, 'edit'])->name('services.edit');
    Route::put('services/{service}', [ServiceController::class, 'update'])->name('services.update');
    Route::delete('services/{service}', [ServiceController::class, 'destroy'])->name('services.destroy');

    Route::get('orders', [OrderController::class, 'index'])->name('orders');
    Route::get('orders/create', [OrderController::class, 'create'])->name('orders.create');
    Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::post('orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('orders/{order}/edit', [OrderController::class, 'edit'])->name('orders.edit');
    Route::put('orders/{order}', [OrderController::class, 'update'])->name('orders.update');
    Route::delete('orders/{order}', [OrderController::class, 'destroy'])->name('orders.destroy');

    Route::get('vessels', [VesselController::class, 'index'])->name('vessels.index');
    Route::get('vessels/create', [VesselController::class, 'create'])->name('vessels.create');
    Route::get('vessels/{vessel}', [VesselController::class, 'show'])->name('vessels.show');
    Route::post('vessels', [VesselController::class, 'store'])->name('vessels.store');
    Route::get('vessels/{vessel}/edit', [VesselController::class, 'edit'])->name('vessels.edit');
    Route::put('vessels/{vessel}', [VesselController::class, 'update'])->name('vessels.update');
    Route::delete('vessels/{vessel}', [VesselController::class, 'destroy'])->name('vessels.destroy');

    Route::get('ports', [PortController::class, 'index'])->name('ports.index');
    Route::get('ports/create', [PortController::class, 'create'])->name('ports.create');
    Route::get('ports/{port}', [PortController::class, 'show'])->name('ports.show');
    Route::post('ports', [PortController::class, 'store'])->name('ports.store');
    Route::get('ports/{port}/edit', [PortController::class, 'edit'])->name('ports.edit');
    Route::put('ports/{port}', [PortController::class, 'update'])->name('ports.update');
    Route::delete('ports/{port}', [PortController::class, 'destroy'])->name('ports.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
