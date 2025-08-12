<?php

use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\PortController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\SwitchOrganization;
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

    Route::put('/user/current-organization', SwitchOrganization::class)->name('user.current-organization.update');

    Route::resources([
        'vessels' => VesselController::class,
        'services' => ServiceController::class,
        'orders' => OrderController::class,
    ]);

    // Ports management routes (restricted to portzapp_team business type)
    Route::middleware('portzapp.team')->group(function (): void {
        Route::resource('ports', PortController::class);
    });

    // Organization management routes (restricted to portzapp_team business type)
    Route::middleware('portzapp.team')->group(function (): void {
        Route::resource('organizations', OrganizationController::class);

        // Member management routes
        Route::post('organizations/{organization}/members', [OrganizationController::class, 'addMember'])->name('organizations.members.add');
        Route::delete('organizations/{organization}/members/{user}', [OrganizationController::class, 'removeMember'])->name('organizations.members.remove');
        Route::put('organizations/{organization}/members/{user}/role', [OrganizationController::class, 'updateMemberRole'])->name('organizations.members.role.update');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
