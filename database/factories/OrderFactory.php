<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Organization;
use App\Models\User;
use App\Models\Vessel;
use App\Models\Port;
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
            'order_number' => 'ORD-' . $createdAt->format('ymdHis') . '-' . fake()->unique()->numberBetween(100, 999),
            'vessel_id' => Vessel::factory(),
            'port_id' => Port::factory(),
            'placed_by_user_id' => User::factory(),
            'placed_by_organization_id' => Organization::factory(),
            'notes' => fake()->optional(0.7)->sentence(),
            'status' => fake()->randomElement([
                OrderStatus::PENDING,      // 30%
                OrderStatus::PENDING,
                OrderStatus::PENDING,
                OrderStatus::ACCEPTED,     // 20%
                OrderStatus::ACCEPTED,
                OrderStatus::IN_PROGRESS,  // 20%
                OrderStatus::IN_PROGRESS,
                OrderStatus::COMPLETED,    // 20%
                OrderStatus::COMPLETED,
                OrderStatus::CANCELLED,     // 10%
            ]),
            'created_at' => $createdAt,
        ];
    }
}
