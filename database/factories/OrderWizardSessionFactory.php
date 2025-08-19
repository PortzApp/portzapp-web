<?php

namespace Database\Factories;

use App\Enums\WizardStep;
use App\Models\OrderWizardSession;
use App\Models\Organization;
use App\Models\Port;
use App\Models\User;
use App\Models\Vessel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderWizardSession>
 */
class OrderWizardSessionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $createdAt = fake()->dateTimeBetween('-1 week', 'now');

        return [
            'user_id' => User::factory(),
            'organization_id' => Organization::factory(),
            'session_name' => fake()->words(3, true).' Order Session',
            'vessel_id' => Vessel::factory(),
            'port_id' => Port::factory(),
            'current_step' => fake()->randomElement(WizardStep::cases()),
            'current_category_index' => fake()->numberBetween(0, 5),
            'status' => fake()->randomElement(['draft', 'completed']),
            'completed_at' => fake()->optional(0.3)->dateTimeBetween($createdAt, 'now'),
            'expires_at' => fake()->optional(0.8)->dateTimeBetween('now', '+1 week'),
            'created_at' => $createdAt,
        ];
    }

    /**
     * Indicate that the session is a draft.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
            'completed_at' => null,
        ]);
    }

    /**
     * Indicate that the session is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'completed_at' => fake()->dateTimeBetween($attributes['created_at'] ?? '-1 week', 'now'),
        ]);
    }

    /**
     * Indicate that the session is expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'expires_at' => fake()->dateTimeBetween('-1 week', '-1 day'),
        ]);
    }

    /**
     * Indicate that the session is active (not expired).
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
            'expires_at' => fake()->dateTimeBetween('now', '+1 week'),
            'completed_at' => null,
        ]);
    }

    /**
     * Set the session at a specific wizard step.
     */
    public function atStep(WizardStep $step): static
    {
        return $this->state(fn (array $attributes) => [
            'current_step' => $step,
        ]);
    }

    /**
     * Configure the factory for a specific user and organization.
     */
    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
            'organization_id' => $user->current_organization_id,
        ]);
    }

    /**
     * Configure the factory for a specific organization.
     */
    public function forOrganization(Organization $organization): static
    {
        return $this->state(fn (array $attributes) => [
            'organization_id' => $organization->id,
        ]);
    }
}
