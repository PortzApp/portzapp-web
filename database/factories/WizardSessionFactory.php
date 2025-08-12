<?php

namespace Database\Factories;

use App\Models\WizardSession;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WizardSession>
 */
class WizardSessionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $steps = ['vessel_selection', 'service_selection', 'review', 'confirmation'];
        $currentStep = $this->faker->randomElement($steps);

        return [
            'session_token' => $this->generateUniqueToken(),
            'current_step' => $currentStep,
            'data' => $this->generateProgressData($currentStep),
            'expires_at' => $this->faker->boolean(70) ?
                now()->addHours($this->faker->numberBetween(1, 72)) : // 70% active sessions
                now()->subHours($this->faker->numberBetween(1, 48)),  // 30% expired sessions
            'created_at' => now()->subMinutes($this->faker->numberBetween(1, 1440)), // Created within last 24 hours
            'updated_at' => now()->subMinutes($this->faker->numberBetween(1, 60)),   // Updated within last hour
        ];
    }

    /**
     * Generate a unique session token
     */
    private function generateUniqueToken(): string
    {
        do {
            $token = 'wiz_'.Str::random(32);
        } while (WizardSession::where('session_token', $token)->exists());

        return $token;
    }

    /**
     * Generate sample wizard progress data based on current step
     */
    private function generateProgressData(string $currentStep): array
    {
        $progressData = [
            'completed_steps' => [],
            'step_data' => [],
        ];

        // Define step progression
        $stepOrder = ['vessel_selection', 'service_selection', 'review', 'confirmation'];
        $currentStepIndex = array_search($currentStep, $stepOrder);

        // Mark previous steps as completed
        for ($i = 0; $i < $currentStepIndex; $i++) {
            $progressData['completed_steps'][] = $stepOrder[$i];
        }

        // Generate step-specific data based on progress
        if ($currentStepIndex >= 0) {
            // Vessel selection data
            $progressData['step_data']['vessel_selection'] = [
                'selected_vessel_id' => $currentStepIndex >= 0 ? $this->faker->numberBetween(1, 20) : null,
                'vessel_details' => $currentStepIndex >= 0 ? [
                    'name' => $this->faker->randomElement(['Ocean Explorer', 'Sea Voyager', 'Marine Hunter', 'Wave Rider', 'Deep Blue']),
                    'type' => $this->faker->randomElement(['Cargo', 'Tanker', 'Container', 'Bulk Carrier', 'Fishing']),
                    'size' => $this->faker->randomElement(['Small', 'Medium', 'Large', 'Extra Large']),
                ] : null,
            ];
        }

        if ($currentStepIndex >= 1) {
            // Service selection data
            $availableServices = [
                ['id' => 1, 'name' => 'Port Navigation', 'price' => 250.00],
                ['id' => 2, 'name' => 'Cargo Handling', 'price' => 500.00],
                ['id' => 3, 'name' => 'Fuel Supply', 'price' => 1200.00],
                ['id' => 4, 'name' => 'Maintenance Check', 'price' => 800.00],
                ['id' => 5, 'name' => 'Documentation', 'price' => 150.00],
            ];

            $selectedServices = $this->faker->randomElements($availableServices, $this->faker->numberBetween(1, 3));

            $progressData['step_data']['service_selection'] = [
                'selected_services' => array_column($selectedServices, 'id'),
                'service_details' => $selectedServices,
                'estimated_total' => array_sum(array_column($selectedServices, 'price')),
                'special_requirements' => $this->faker->optional(0.3)->text(100),
            ];
        }

        if ($currentStepIndex >= 2) {
            // Review step data
            $progressData['step_data']['review'] = [
                'reviewed_at' => now()->subMinutes($this->faker->numberBetween(1, 30))->toISOString(),
                'customer_notes' => $this->faker->optional(0.4)->text(200),
                'terms_accepted' => true,
                'estimated_completion' => now()->addDays($this->faker->numberBetween(1, 7))->toDateString(),
            ];
        }

        if ($currentStepIndex >= 3) {
            // Confirmation step data
            $progressData['step_data']['confirmation'] = [
                'confirmed_at' => now()->subMinutes($this->faker->numberBetween(1, 15))->toISOString(),
                'confirmation_code' => strtoupper(Str::random(8)),
                'payment_method' => $this->faker->randomElement(['credit_card', 'bank_transfer', 'company_account']),
                'contact_info' => [
                    'email' => $this->faker->email,
                    'phone' => $this->faker->phoneNumber,
                    'contact_person' => $this->faker->name,
                ],
            ];
        }

        // Add metadata
        $progressData['metadata'] = [
            'user_agent' => $this->faker->userAgent,
            'ip_address' => $this->faker->ipv4,
            'started_at' => now()->subMinutes($this->faker->numberBetween(5, 120))->toISOString(),
            'last_activity' => now()->subMinutes($this->faker->numberBetween(1, 30))->toISOString(),
            'completion_percentage' => min(100, ($currentStepIndex + 1) * 25),
        ];

        return $progressData;
    }

    /**
     * Create an expired session
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'expires_at' => now()->subHours($this->faker->numberBetween(1, 168)), // Expired 1 hour to 1 week ago
        ]);
    }

    /**
     * Create an active session
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'expires_at' => now()->addHours($this->faker->numberBetween(1, 72)), // Expires 1-72 hours from now
        ]);
    }

    /**
     * Create a session at a specific step
     */
    public function atStep(string $step): static
    {
        return $this->state(fn (array $attributes) => [
            'current_step' => $step,
            'data' => $this->generateProgressData($step),
        ]);
    }

    /**
     * Create a session with vessel selection completed
     */
    public function withVesselSelected(): static
    {
        return $this->atStep('service_selection');
    }

    /**
     * Create a session with services selected
     */
    public function withServicesSelected(): static
    {
        return $this->atStep('review');
    }

    /**
     * Create a session ready for review
     */
    public function readyForReview(): static
    {
        return $this->atStep('review');
    }

    /**
     * Create a completed session
     */
    public function completed(): static
    {
        return $this->atStep('confirmation');
    }

    /**
     * Create a session that expires soon
     */
    public function expiringSoon(): static
    {
        return $this->state(fn (array $attributes) => [
            'expires_at' => now()->addMinutes($this->faker->numberBetween(1, 30)), // Expires in 1-30 minutes
        ]);
    }
}
