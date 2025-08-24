<?php

use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderGroupController;
use App\Http\Controllers\OrderGroupServiceController;
use App\Http\Controllers\OrderWizardSessionController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\PortController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\SwitchOrganization;
use App\Http\Controllers\VesselController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Security.txt route
Route::get('/.well-known/security.txt', function () {
    $content = file_get_contents(public_path('.well-known/security.txt'));

    return response($content, 200)
        ->header('Content-Type', 'text/plain; charset=UTF-8');
});

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Onboarding routes
    Route::prefix('onboarding')->name('onboarding.')->group(function (): void {
        Route::get('/', [\App\Http\Controllers\OnboardingController::class, 'index'])->name('index');
        Route::get('/{step}', [\App\Http\Controllers\OnboardingController::class, 'show'])->name('show');
        Route::patch('/', [\App\Http\Controllers\OnboardingController::class, 'update'])->name('update');
    });

    Route::put('/user/current-organization', SwitchOrganization::class)->name('user.current-organization.update');

    Route::resources([
        'vessels' => VesselController::class,
        'services' => ServiceController::class,
        'orders' => OrderController::class,
        'order-groups' => OrderGroupController::class,
    ]);

    // Order group action routes
    Route::post('order-groups/{orderGroup}/accept', [OrderGroupController::class, 'accept'])->name('order-groups.accept');
    Route::post('order-groups/{orderGroup}/reject', [OrderGroupController::class, 'reject'])->name('order-groups.reject');
    Route::post('order-groups/{orderGroup}/start', [OrderGroupController::class, 'start'])->name('order-groups.start');
    Route::post('order-groups/{orderGroup}/complete', [OrderGroupController::class, 'complete'])->name('order-groups.complete');

    // Order group service action routes
    Route::patch('order-group-services/{orderGroupService}/status', [OrderGroupServiceController::class, 'updateStatus'])->name('order-group-services.status.update');

    // Order wizard routes
    Route::prefix('order-wizard')->group(function (): void {
        Route::get('dashboard', [OrderWizardSessionController::class, 'dashboard'])->name('order-wizard.dashboard');
        Route::get('flow/{session?}', [OrderWizardSessionController::class, 'flow'])->name('order-wizard.flow');

        // Individual step routes
        Route::get('session/{session}/step/vessel_port', [OrderWizardSessionController::class, 'showVesselPortStep'])->name('order-wizard.step.vessel-port');
        Route::get('session/{session}/step/categories', [OrderWizardSessionController::class, 'showCategoriesStep'])->name('order-wizard.step.categories');
        Route::get('session/{session}/step/services', [OrderWizardSessionController::class, 'showServicesStep'])->name('order-wizard.step.services');
        Route::get('session/{session}/step/review', [OrderWizardSessionController::class, 'showReviewStep'])->name('order-wizard.step.review');

        // Legacy route for backward compatibility
        Route::get('session/{session}/step/{step}', function ($session, $step) {
            return redirect()->route('order-wizard.step.'.str_replace('_', '-', $step), ['session' => $session]);
        })->name('order-wizard.step');

        Route::post('sessions/{session}/complete', [OrderWizardSessionController::class, 'complete'])->name('order-wizard.complete');
    });

    // Order wizard session API routes
    Route::apiResource('order-wizard-sessions', OrderWizardSessionController::class)->names([
        'index' => 'order-wizard-sessions.index',
        'store' => 'order-wizard-sessions.store',
        'show' => 'order-wizard-sessions.show',
        'update' => 'order-wizard-sessions.update',
        'destroy' => 'order-wizard-sessions.destroy',
    ]);

    // Additional Order wizard session routes
    Route::patch('order-wizard-sessions/{session}/vessel-port', [OrderWizardSessionController::class, 'setVesselAndPort'])
        ->name('order-wizard-sessions.vessel-port');
    Route::patch('order-wizard-sessions/{session}/categories', [OrderWizardSessionController::class, 'setCategories'])
        ->name('order-wizard-sessions.categories');
    Route::patch('order-wizard-sessions/{session}/services', [OrderWizardSessionController::class, 'setServices'])
        ->name('order-wizard-sessions.services');
    Route::post('order-wizard-sessions/{session}/complete', [OrderWizardSessionController::class, 'complete'])
        ->name('order-wizard-sessions.complete');

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

    // Organization slug API routes (available to all authenticated users)
    Route::post('api/organizations/check-slug', [\App\Http\Controllers\OrganizationController::class, 'checkSlugAvailability'])->name('organizations.slug.check');
    Route::post('api/organizations/generate-slug', [\App\Http\Controllers\OrganizationController::class, 'generateSlug'])->name('organizations.slug.generate');

    // Organization creation from onboarding flow
    Route::post('api/organizations/create-from-onboarding', [\App\Http\Controllers\OrganizationController::class, 'storeFromOnboarding'])->name('organizations.store.onboarding');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
