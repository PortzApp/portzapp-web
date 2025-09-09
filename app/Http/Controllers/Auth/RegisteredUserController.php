<?php

namespace App\Http\Controllers\Auth;

use App\Enums\InvitationStatus;
use App\Enums\OnboardingStatus;
use App\Http\Controllers\Controller;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(Request $request): Response
    {
        $inviteToken = $request->query('invite');
        $invitation = null;

        if ($inviteToken) {
            $invitation = Invitation::where('token', $inviteToken)
                ->where('status', InvitationStatus::PENDING)
                ->where('expires_at', '>', now())
                ->with(['organization:id,name,business_type'])
                ->first();
        }

        return Inertia::render('auth/register', [
            'inviteToken' => $inviteToken,
            'invitation' => $invitation ? [
                'organization' => [
                    'name' => $invitation->organization->getAttribute('name'),
                    'business_type' => $invitation->organization->getAttribute('business_type')?->label(),
                ],
                'role' => $invitation->role->label(),
                'email' => $invitation->email,
            ] : null,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Throwable
     */
    public function store(Request $request): RedirectResponse
    {
        $inviteToken = $request->input('invite_token');
        $invitation = null;

        // Validate invitation token if provided
        if ($inviteToken) {
            $invitation = Invitation::where('token', $inviteToken)
                ->where('status', InvitationStatus::PENDING)
                ->where('expires_at', '>', now())
                ->first();

            if (! $invitation) {
                return back()->withErrors(['invite_token' => 'Invalid or expired invitation.']);
            }
        }

        $request->merge([
            'email' => strtolower($request->input('email')),
        ]);

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:'.User::class],
            'phone_number' => ['required', 'string', 'max:25'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'invite_token' => ['nullable', 'string'],
        ]);

        // If there's an invitation, ensure the email matches
        if ($invitation && $validated['email'] !== $invitation->email) {
            return back()->withErrors(['email' => 'Email must match the invitation email address.']);
        }

        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'],
            'password' => Hash::make($validated['password']),
            'onboarding_status' => OnboardingStatus::PENDING,
        ]);

        event(new Registered($user));

        Auth::login($user);

        // Store invitation info in session for onboarding process
        if ($invitation) {
            session(['pending_invitation' => [
                'invitation_id' => $invitation->id,
                'organization_id' => $invitation->organization_id,
                'role' => $invitation->role->value,
            ]]);
        }

        return redirect()->route('onboarding.index');
    }
}
