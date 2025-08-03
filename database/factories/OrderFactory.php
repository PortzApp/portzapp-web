<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Organization;
use App\Models\Service;
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
        return [
            'vessel_id' => Vessel::factory(),
            'requesting_organization_id' => Organization::factory(),
            'providing_organization_id' => Organization::factory(),
            'price' => fake()->randomFloat(2, 1000, 100000), // Between $1,000 and $100,000 for maritime services
            'notes' => fake()->optional(0.7)->sentence(),
            'status' => fake()->randomElement([
                'pending',      // 30%
                'pending',
                'pending',
                'accepted',     // 20%
                'accepted',
                'in_progress',  // 20%
                'in_progress',
                'completed',    // 20%
                'completed',
                'cancelled',     // 10%
            ]),
            'created_at' => fake()->dateTimeBetween('-1 month', 'now'),
        ];
    }
}
