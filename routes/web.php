<?php

use App\Http\Controllers\AgencyOrderController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderWizardController;
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

    // Order Wizard Routes
    Route::prefix('orders/create')->name('orders.wizard.')->group(function (): void {
        Route::get('/new', [OrderWizardController::class, 'start'])->name('start');
        Route::post('/start', [OrderWizardController::class, 'storeStart'])->name('store-start');
        Route::get('/categories', [OrderWizardController::class, 'categories'])->name('categories');
        Route::post('/categories', [OrderWizardController::class, 'storeCategories'])->name('store-categories');
        Route::get('/services/{category}', [OrderWizardController::class, 'services'])->name('services');
        Route::post('/services/{category}', [OrderWizardController::class, 'storeService'])->name('store-service');
        Route::get('/summary', [OrderWizardController::class, 'summary'])->name('summary');
        Route::post('/confirm', [OrderWizardController::class, 'confirm'])->name('confirm');
        Route::get('/confirmation/{order}', [OrderWizardController::class, 'confirmation'])->name('confirmation');
        Route::get('/cancel', [OrderWizardController::class, 'cancel'])->name('cancel');
    });

    // Order tracking route
    Route::get('/orders/{order}/track', [OrderController::class, 'track'])->name('orders.track');

    // Agency Order Management Routes
    Route::prefix('agency/orders')->name('agency.orders.')->group(function (): void {
        Route::get('/', [AgencyOrderController::class, 'index'])->name('index');
        Route::get('/{orderGroup}', [AgencyOrderController::class, 'show'])->name('show');
        Route::post('/{orderGroup}/accept', [AgencyOrderController::class, 'accept'])->name('accept');
        Route::post('/{orderGroup}/reject', [AgencyOrderController::class, 'reject'])->name('reject');
    });

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
