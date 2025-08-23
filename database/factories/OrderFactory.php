<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Organization;
use App\Models\Port;
use App\Models\User;
use App\Models\Vessel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $createdAt = fake()->dateTimeBetween('-1 month', 'now');

        return [
            // Generate unique order number using timestamp + random suffix (format: ORD-YYMMDDHHMMSS-XXX)
            // This ensures uniqueness and allows for unlimited scaling
            'order_number' => 'ORD-'.$createdAt->format('ymdHis').'-'.fake()->unique()->numberBetween(100, 999),
            'vessel_id' => Vessel::factory(),
            'port_id' => Port::factory(),
            'placed_by_user_id' => User::factory(),
            'placed_by_organization_id' => Organization::factory(),
            'notes' => fake()->optional(0.7)->sentence(),
            'status' => fake()->randomElement([
                OrderStatus::DRAFT,                        // 10%
                OrderStatus::PENDING_AGENCY_CONFIRMATION,  // 30%
                OrderStatus::PENDING_AGENCY_CONFIRMATION,
                OrderStatus::PENDING_AGENCY_CONFIRMATION,
                OrderStatus::PARTIALLY_ACCEPTED,          // 20%
                OrderStatus::PARTIALLY_ACCEPTED,
                OrderStatus::CONFIRMED,                     // 30%
                OrderStatus::CONFIRMED,
                OrderStatus::CONFIRMED,
                OrderStatus::CANCELLED,                     // 10%
            ]),
            'created_at' => $createdAt,
        ];
    }

    /**
     * Indicate that the order is a draft.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderStatus::DRAFT,
        ]);
    }

    /**
     * Indicate that the order is pending agency confirmation.
     */
    public function pendingAgencyConfirmation(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderStatus::PENDING_AGENCY_CONFIRMATION,
        ]);
    }

    /**
     * Indicate that the order is partially accepted.
     */
    public function partiallyAccepted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderStatus::PARTIALLY_ACCEPTED,
        ]);
    }

    /**
     * Indicate that the order is partially rejected.
     */
    public function partiallyRejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderStatus::PARTIALLY_REJECTED,
        ]);
    }

    /**
     * Indicate that the order is in progress.
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderStatus::IN_PROGRESS,
        ]);
    }

    /**
     * Indicate that the order is partially completed.
     */
    public function partiallyCompleted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderStatus::PARTIALLY_COMPLETED,
        ]);
    }

    /**
     * Indicate that the order is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderStatus::COMPLETED,
        ]);
    }

    /**
     * Indicate that the order is confirmed.
     */
    public function confirmed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderStatus::CONFIRMED,
        ]);
    }

    /**
     * Indicate that the order is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderStatus::CANCELLED,
        ]);
    }

    /**
     * Configure the factory for a specific vessel owner organization.
     */
    public function forVesselOwner(Organization $organization): static
    {
        return $this->state(fn (array $attributes) => [
            'placed_by_organization_id' => $organization->id,
        ]);
    }
}
