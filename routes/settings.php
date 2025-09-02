<?php

use App\Http\Controllers\InvitationController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function (): void {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/organization', [OrganizationController::class, 'edit'])->name('organization.edit');
    Route::patch('settings/organization', [OrganizationController::class, 'updateCurrent'])->name('organization.update');

    // Organization invitation routes
    Route::prefix('settings/organization/invitations')->name('organization.invitations.')->group(function (): void {
        Route::post('/', [InvitationController::class, 'sendInvitation'])->name('send');
        Route::get('/', [InvitationController::class, 'index'])->name('index');
        Route::delete('/{invitation}', [InvitationController::class, 'destroy'])->name('destroy');
        Route::post('/{invitation}/resend', [InvitationController::class, 'resend'])->name('resend');
    });

    // Organization member role management
    Route::patch('settings/organization/members/{user}/role', [OrganizationController::class, 'updateCurrentOrgMemberRole'])->name('organization.members.updateRole');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');
});
