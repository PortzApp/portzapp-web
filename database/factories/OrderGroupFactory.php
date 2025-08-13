<?php

namespace Database\Factories;

use App\Enums\OrderGroupStatus;
use App\Models\Order;
use App\Models\OrderGroup;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrderGroup>
 */
class OrderGroupFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = OrderGroup::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'group_number' => 'GRP-'.strtoupper($this->faker->bothify('######')),
            'order_id' => Order::factory(),
            'fulfilling_organization_id' => Organization::factory(),
            'status' => $this->faker->randomElement(OrderGroupStatus::cases())->value,
            'notes' => $this->faker->optional(0.3)->sentence(),
        ];
    }

    /**
     * Indicate that the order group is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderGroupStatus::PENDING,
        ]);
    }

    /**
     * Indicate that the order group is accepted.
     */
    public function accepted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderGroupStatus::ACCEPTED,
        ]);
    }

    /**
     * Indicate that the order group is rejected.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderGroupStatus::REJECTED,
        ]);
    }

    /**
     * Indicate that the order group is in progress.
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderGroupStatus::IN_PROGRESS,
        ]);
    }

    /**
     * Indicate that the order group is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderGroupStatus::COMPLETED,
        ]);
    }

    /**
     * Configure the factory for a specific order.
     */
    public function forOrder(Order $order): static
    {
        return $this->state(fn (array $attributes) => [
            'order_id' => $order->id,
        ]);
    }

    /**
     * Configure the factory for a specific fulfilling organization.
     */
    public function forOrganization(Organization $organization): static
    {
        return $this->state(fn (array $attributes) => [
            'fulfilling_organization_id' => $organization->id,
        ]);
    }
}
