<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Service;
use App\Models\User;
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
            'service_id' => Service::factory(),
            //            'vessel_owner_id' => User::factory()->isVesselOwner(),
            'price' => fake()->randomFloat(2, 500, 50000),
            'status' => fake()->randomElement(['pending', 'accepted', 'in_progress', 'completed', 'cancelled']),
        ];
    }
}
