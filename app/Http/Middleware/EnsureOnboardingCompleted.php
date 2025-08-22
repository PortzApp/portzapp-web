<?php

namespace App\Http\Middleware;

use App\Enums\OnboardingStatus;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureOnboardingCompleted
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        // Allow if user is not authenticated (handled by auth middleware)
        if (! $user) {
            return $next($request);
        }

        // Allow access to onboarding routes
        if ($request->routeIs('onboarding.*')) {
            return $next($request);
        }

        // Allow access to auth routes (logout, etc.)
        if ($request->routeIs('auth.*') || $request->routeIs('logout')) {
            return $next($request);
        }

        // Allow access to email verification routes
        if ($request->routeIs('verification.*') || $request->is('verify-email*')) {
            return $next($request);
        }

        // Allow API routes to pass through (for now)
        if ($request->is('api/*')) {
            return $next($request);
        }

        // Redirect incomplete users to onboarding
        if ($user->onboarding_status !== OnboardingStatus::COMPLETED) {
            return redirect()->route('onboarding.index');
        }

        return $next($request);
    }
}
