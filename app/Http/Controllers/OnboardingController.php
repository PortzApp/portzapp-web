<?php

namespace App\Http\Controllers;

use App\Enums\OnboardingStatus;
use App\Enums\OrganizationBusinessType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    /**
     * Display the onboarding dashboard.
     */
    public function index(): Response|RedirectResponse
    {
        Gate::authorize('view', Auth::user(), Auth::user());

        $user = Auth::user();

        // If user has completed onboarding, redirect to dashboard
        if ($user->onboarding_status === OnboardingStatus::COMPLETED) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Onboarding/Index', [
            'user' => $user->only(['id', 'first_name', 'last_name', 'email', 'onboarding_status']),
            'onboardingStatus' => $user->onboarding_status->value,
            'businessTypes' => collect(OrganizationBusinessType::cases())->map(fn ($type) => [
                'value' => $type->value,
                'label' => $type->label(),
            ]),
        ]);
    }

    /**
     * Display a specific onboarding step.
     */
    public function show(string $step): Response|RedirectResponse
    {
        Gate::authorize('view', Auth::user(), Auth::user());

        $user = Auth::user();

        // If user has completed onboarding, redirect to dashboard
        if ($user->onboarding_status === OnboardingStatus::COMPLETED) {
            return redirect()->route('dashboard');
        }

        // Validate step exists
        $validSteps = ['welcome', 'organization-setup', 'complete'];
        if (! in_array($step, $validSteps)) {
            return redirect()->route('onboarding.index');
        }

        return Inertia::render("Onboarding/{$step}", [
            'user' => $user->only(['id', 'first_name', 'last_name', 'email', 'onboarding_status']),
            'currentStep' => $step,
            'onboardingStatus' => $user->onboarding_status->value,
        ]);
    }

    /**
     * Update user's onboarding progress.
     */
    public function update(Request $request): RedirectResponse
    {
        Gate::authorize('update', Auth::user(), Auth::user());

        $validated = $request->validate([
            'onboarding_status' => ['required', 'string', 'in:in_progress,completed'],
            'step' => ['nullable', 'string'],
            'redirect_to' => ['nullable', 'string', 'in:dashboard,onboarding'],
        ]);

        $user = Auth::user();
        $user->update([
            'onboarding_status' => OnboardingStatus::from($validated['onboarding_status']),
        ]);

        // If completed, redirect to dashboard with welcome message
        if ($validated['onboarding_status'] === 'completed') {
            $organizationName = $user->currentOrganization?->name ?? 'your organization';
            $welcomeMessage = "Welcome to PortzApp! You're all set up with {$organizationName}.";

            return redirect()->route('dashboard')->with([
                'success' => $welcomeMessage,
                'onboarding_completed' => true,
            ]);
        }

        // Handle specific redirect requests
        if (isset($validated['redirect_to'])) {
            switch ($validated['redirect_to']) {
                case 'dashboard':
                    return redirect()->route('dashboard');
                case 'onboarding':
                    return redirect()->route('onboarding.index');
            }
        }

        // Otherwise redirect to next step or back to onboarding index
        $nextStep = $validated['step'] ?? null;
        if ($nextStep) {
            return redirect()->route('onboarding.show', $nextStep);
        }

        return redirect()->route('onboarding.index');
    }
}
