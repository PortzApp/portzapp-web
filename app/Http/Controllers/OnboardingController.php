<?php

namespace App\Http\Controllers;

use App\Enums\InvitationStatus;
use App\Enums\OnboardingStatus;
use App\Enums\OnboardingStep;
use App\Enums\OrganizationBusinessType;
use App\Enums\UserRoles;
use App\Models\Invitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    /**
     * Check if user can access a specific step and redirect if needed
     */
    private function checkStepAccess(OnboardingStep $requestedStep): ?RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // If user has completed onboarding, redirect to dashboard
        if ($user->onboarding_status === OnboardingStatus::COMPLETED) {
            return redirect()->route('dashboard');
        }

        // Check if user can access this step
        if (! $requestedStep->canAccessFrom($user->getAttribute('onboarding_step'))) {
            // Redirect to current step or welcome if no step set
            $currentStep = $user->onboarding_step ?? OnboardingStep::WELCOME;

            return redirect()->route('onboarding.'.strtolower($currentStep->value));
        }

        return null;
    }

    /**
     * Display the onboarding dashboard - redirects to current step
     */
    public function index(): RedirectResponse
    {
        Gate::authorize('view', Auth::user());

        $user = Auth::user();

        // If user has completed onboarding, redirect to dashboard
        if ($user->onboarding_status === OnboardingStatus::COMPLETED) {
            return redirect()->route('dashboard');
        }

        // Check if user has a pending invitation - if so, skip to complete step
        $pendingInvitation = session('pending_invitation');
        if ($pendingInvitation) {
            // If user hasn't started onboarding yet, set them to the complete step
            if (! $user->onboarding_step || $user->onboarding_step === OnboardingStep::WELCOME) {
                $user->update(['onboarding_step' => OnboardingStep::COMPLETE]);

                return redirect()->route('onboarding.complete');
            }
        }

        // Redirect to current step or welcome if no step set
        $currentStep = $user->onboarding_step ?? OnboardingStep::WELCOME;

        return redirect()->route('onboarding.'.strtolower($currentStep->value));
    }

    /**
     * Display the welcome page (choose action)
     */
    public function welcome(): Response|RedirectResponse
    {
        Gate::authorize('view', Auth::user());

        if ($redirect = $this->checkStepAccess(OnboardingStep::WELCOME)) {
            return $redirect;
        }

        $user = Auth::user();

        // Set current step if not already set
        if (! $user->onboarding_step) {
            $user->update(['onboarding_step' => OnboardingStep::WELCOME]);
        }

        return Inertia::render('onboarding/welcome', [
            'user' => $user->only(['id', 'first_name', 'last_name', 'email', 'onboarding_status', 'onboarding_step']),
            'businessTypes' => collect(OrganizationBusinessType::cases())->map(fn ($type) => [
                'value' => $type->value,
                'label' => $type->label(),
            ]),
        ]);
    }

    /**
     * Display the organization setup page
     */
    public function organization(Request $request): Response|RedirectResponse
    {
        Gate::authorize('view', Auth::user());

        if ($redirect = $this->checkStepAccess(OnboardingStep::ORGANIZATION)) {
            return $redirect;
        }

        $user = Auth::user();

        return Inertia::render('onboarding/organization', [
            'user' => $user->only(['id', 'first_name', 'last_name', 'email', 'onboarding_status', 'onboarding_step']),
            'action' => $request->get('action', 'create'), // create or join
            'businessTypes' => collect(OrganizationBusinessType::cases())->map(fn ($type) => [
                'value' => $type->value,
                'label' => $type->label(),
            ]),
        ]);
    }

    /**
     * Display the invite members page
     */
    public function invite(): Response|RedirectResponse
    {
        Gate::authorize('view', Auth::user());

        if ($redirect = $this->checkStepAccess(OnboardingStep::INVITE)) {
            return $redirect;
        }

        $user = Auth::user();

        // Available roles for invitations
        $availableRoles = [
            ['value' => 'admin', 'label' => 'Admin'],
            ['value' => 'ceo', 'label' => 'CEO'],
            ['value' => 'manager', 'label' => 'Manager'],
            ['value' => 'operations', 'label' => 'Operations'],
            ['value' => 'finance', 'label' => 'Finance'],
            ['value' => 'viewer', 'label' => 'Viewer'],
        ];

        return Inertia::render('onboarding/invite', [
            'user' => $user->only(['id', 'first_name', 'last_name', 'email', 'onboarding_status', 'onboarding_step']),
            'currentOrganization' => $user->currentOrganization ? [
                'id' => $user->currentOrganization->id,
                'name' => $user->currentOrganization->name,
            ] : null,
            'availableRoles' => $availableRoles,
        ]);
    }

    /**
     * Display the completion page
     */
    public function complete(): Response|RedirectResponse
    {
        Gate::authorize('view', Auth::user());

        if ($redirect = $this->checkStepAccess(OnboardingStep::COMPLETE)) {
            return $redirect;
        }

        $user = Auth::user();

        $pendingInvitation = session('pending_invitation');

        return Inertia::render('onboarding/complete', [
            'user' => $user->only(['id', 'first_name', 'last_name', 'email', 'onboarding_status', 'onboarding_step']),
            'currentOrganization' => $user->currentOrganization ? [
                'id' => $user->currentOrganization->id,
                'name' => $user->currentOrganization->name,
            ] : null,
            'pendingInvitation' => $pendingInvitation ? [
                'organization_id' => $pendingInvitation['organization_id'],
                'role' => $pendingInvitation['role'],
            ] : null,
        ]);
    }

    /**
     * Update user's onboarding step
     */
    public function updateStep(Request $request): RedirectResponse
    {
        Gate::authorize('update', Auth::user());

        $validated = $request->validate([
            'step' => ['required', 'string', 'in:organization,invite,complete'],
            'action' => ['nullable', 'string', 'in:create,join'],
        ]);

        $user = Auth::user();
        $step = OnboardingStep::from($validated['step']);

        // Update user's current step
        $user->update(['onboarding_step' => $step]);

        // Build redirect URL
        $route = 'onboarding.'.strtolower($step->value);
        $params = [];

        if (isset($validated['action'])) {
            $params['action'] = $validated['action'];
        }

        return redirect()->route($route, $params);
    }

    /**
     * Update user's onboarding progress (legacy method for completion)
     */
    public function update(Request $request): RedirectResponse
    {
        Gate::authorize('update', Auth::user());

        $validated = $request->validate([
            'onboarding_status' => ['required', 'string', 'in:in_progress,completed'],
        ]);

        $user = Auth::user();

        // If completing onboarding, clear the step and set status
        if ($validated['onboarding_status'] === 'completed') {
            // Handle invitation acceptance if there's a pending invitation
            $pendingInvitation = session('pending_invitation');
            if ($pendingInvitation) {
                // Find the invitation and accept it
                $invitation = Invitation::find($pendingInvitation['invitation_id']);

                if ($invitation && $invitation->status === InvitationStatus::PENDING) {
                    // Attach user to organization with the specified role
                    $user->organizations()->attach($invitation->organization_id, [
                        'role' => UserRoles::from($pendingInvitation['role']),
                    ]);

                    // Set the organization as user's current organization
                    $user->update(['current_organization_id' => $invitation->organization_id]);

                    // Update invitation status
                    $invitation->update([
                        'status' => InvitationStatus::ACCEPTED,
                        'accepted_at' => now(),
                    ]);

                    // Clear the session
                    session()->forget('pending_invitation');
                }
            }

            $user->update([
                'onboarding_status' => OnboardingStatus::COMPLETED,
                'onboarding_step' => null,
            ]);

            $organizationName = $user->currentOrganization->name ?? 'your organization';
            $welcomeMessage = "Welcome to PortzApp! You're all set up with {$organizationName}.";

            return redirect()->route('dashboard')->with([
                'success' => $welcomeMessage,
                'onboarding_completed' => true,
            ]);
        }

        // Otherwise update to in progress and redirect to current step
        $user->update([
            'onboarding_status' => OnboardingStatus::IN_PROGRESS,
        ]);

        $currentStep = $user->onboarding_step ?? OnboardingStep::WELCOME;

        return redirect()->route('onboarding.'.strtolower($currentStep->value));
    }

    /**
     * Display a specific onboarding step (legacy method for backward compatibility)
     */
    public function show(string $step): RedirectResponse
    {
        // Redirect old step URLs to new routes
        $stepMap = [
            'welcome' => 'onboarding.welcome',
            'organization-setup' => 'onboarding.organization',
            'complete' => 'onboarding.complete',
        ];

        if (isset($stepMap[$step])) {
            return redirect()->route($stepMap[$step]);
        }

        return redirect()->route('onboarding.welcome');
    }
}
