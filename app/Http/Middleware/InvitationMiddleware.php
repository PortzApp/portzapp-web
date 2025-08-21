<?php

namespace App\Http\Middleware;

use App\Models\Invitation;
use App\Services\InvitationTokenService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class InvitationMiddleware
{
    public function __construct(
        private InvitationTokenService $tokenService
    ) {}

    /**
     * Handle an incoming request.
     * Check for pending invitations during login/registration flows.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only process for authenticated users after successful login/registration
        if (auth()->check()) {
            $user = auth()->user();

            // Check for pending invitations for this user's email
            $pendingInvitations = Invitation::where('email', strtolower($user->email))
                ->where('status', \App\Enums\InvitationStatus::PENDING)
                ->where('expires_at', '>', now())
                ->get();

            if ($pendingInvitations->isNotEmpty()) {
                // Store invitation tokens in session for auto-processing
                $invitationTokens = $pendingInvitations->pluck('token')->toArray();
                $request->session()->put('pending_invitation_tokens', $invitationTokens);

                // Redirect to invitation acceptance flow if it's a login/register action
                if ($this->shouldRedirectToInvitations($request)) {
                    return redirect()->route('invitations.auto-accept');
                }
            }
        }

        return $response;
    }

    /**
     * Determine if we should redirect to invitations flow.
     */
    private function shouldRedirectToInvitations(Request $request): bool
    {
        // Check if this is a login or registration request
        $isAuthRequest = $request->is('login') ||
                        $request->is('register') ||
                        $request->routeIs('login') ||
                        $request->routeIs('register');

        // Don't redirect if already on invitation pages
        $isInvitationPage = $request->routeIs('invitations.*');

        return $isAuthRequest && ! $isInvitationPage;
    }
}
