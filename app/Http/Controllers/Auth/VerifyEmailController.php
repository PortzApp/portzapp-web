<?php

namespace App\Http\Controllers\Auth;

use App\Enums\OnboardingStatus;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VerifyEmailController extends Controller
{
    /**
     * Mark the user's email address as verified.
     */
    public function __invoke(Request $request): RedirectResponse
    {
        // Check if we have a valid signed URL
        if (! $request->hasValidSignature()) {
            abort(401, 'Invalid verification link.');
        }

        // Get the user from the URL parameters
        $user = User::findOrFail($request->route('id'));

        // Verify the hash matches the user's email
        $expectedHash = sha1($user->getEmailForVerification());
        if (! hash_equals($request->route('hash'), $expectedHash)) {
            abort(401, 'Invalid verification link.');
        }

        // If user is already verified, redirect appropriately
        if ($user->hasVerifiedEmail()) {
            // Log them in if not already authenticated
            if (! Auth::check()) {
                Auth::login($user);
            }

            // Redirect based on onboarding status
            if ($user->onboarding_status === OnboardingStatus::COMPLETED) {
                return redirect()->route('dashboard')->with('status', 'email-already-verified');
            }

            return redirect()->route('onboarding.index')->with('status', 'email-already-verified');
        }

        // Mark email as verified
        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        // Log the user in if not already authenticated
        if (! Auth::check()) {
            Auth::login($user);
        }

        // Redirect based on onboarding status
        if ($user->onboarding_status === OnboardingStatus::COMPLETED) {
            return redirect()->route('dashboard')->with('status', 'email-verified');
        }

        return redirect()->route('onboarding.index')->with('status', 'email-verified');
    }
}
