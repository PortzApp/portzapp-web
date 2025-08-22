<?php

namespace Database\Factories;

use App\Enums\JoinRequestStatus;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrganizationJoinRequest>
 */
class OrganizationJoinRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'organization_id' => Organization::factory(),
            'status' => JoinRequestStatus::PENDING,
            'message' => $this->faker->optional(0.7)->paragraph(),
            'admin_notes' => null,
            'reviewed_by_user_id' => null,
            'reviewed_at' => null,
        ];
    }

    /**
     * Indicate that the join request is approved.
     */
    public function approved(?User $reviewedBy = null): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => JoinRequestStatus::APPROVED,
            'reviewed_by_user_id' => $reviewedBy?->id ?? User::factory(),
            'reviewed_at' => $this->faker->dateTimeBetween('-1 month'),
            'admin_notes' => $this->faker->optional(0.5)->sentence(),
        ]);
    }

    /**
     * Indicate that the join request is rejected.
     */
    public function rejected(?User $reviewedBy = null): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => JoinRequestStatus::REJECTED,
            'reviewed_by_user_id' => $reviewedBy?->id ?? User::factory(),
            'reviewed_at' => $this->faker->dateTimeBetween('-1 month'),
            'admin_notes' => $this->faker->optional(0.8)->sentence(),
        ]);
    }

    /**
     * Indicate that the join request is withdrawn.
     */
    public function withdrawn(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => JoinRequestStatus::WITHDRAWN,
        ]);
    }
}
