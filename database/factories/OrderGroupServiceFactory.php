<?php

namespace Database\Factories;

use App\Enums\OrderGroupServiceStatus;
use App\Models\OrderGroup;
use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrderGroupService>
 */
class OrderGroupServiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $service = Service::factory()->create();

        return [
            'order_group_id' => OrderGroup::factory(),
            'service_id' => $service->id,
            'status' => OrderGroupServiceStatus::PENDING,
            'notes' => $this->faker->optional()->sentence(),
            'price_snapshot' => $service->price, // Use the service's current price as snapshot
        ];
    }

    /**
     * Set the status to ACCEPTED.
     */
    public function accepted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderGroupServiceStatus::ACCEPTED,
        ]);
    }

    /**
     * Set the status to REJECTED.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderGroupServiceStatus::REJECTED,
        ]);
    }

    /**
     * Set the status to IN_PROGRESS.
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderGroupServiceStatus::IN_PROGRESS,
        ]);
    }

    /**
     * Set the status to COMPLETED.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderGroupServiceStatus::COMPLETED,
        ]);
    }
}
