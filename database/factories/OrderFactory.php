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

        // Generate realistic total amounts between $500 and $50,000
        // with common pricing patterns in maritime industry
        $totalAmount = fake()->randomFloat(2, 500, 50000);

        // Round to common pricing increments (ends in .00, .50, or .99)
        $roundingType = fake()->randomElement(['round', 'half', 'psychological']);
        switch ($roundingType) {
            case 'round':
                $totalAmount = round($totalAmount / 100) * 100; // Round to nearest 100
                break;
            case 'half':
                $totalAmount = round($totalAmount / 50) * 50; // Round to nearest 50
                break;
            case 'psychological':
                $totalAmount = floor($totalAmount) + 0.99; // End in .99
                break;
        }

        return [
            // Generate unique order number using timestamp + random suffix (format: ORD-YYMMDDHHMMSS-XXX)
            // This ensures uniqueness and allows for unlimited scaling
            'order_number' => 'ORD-'.$createdAt->format('ymdHis').'-'.fake()->unique()->numberBetween(100, 999),
            'vessel_id' => Vessel::factory(),
            'port_id' => Port::factory(),
            'placed_by_user_id' => User::factory(),
            'placed_by_organization_id' => Organization::factory(),
            'notes' => fake()->optional(0.7)->sentence(),
            'total_amount' => $totalAmount,
            'status' => fake()->randomElement([
                OrderStatus::DRAFT,                        // 15%
                OrderStatus::DRAFT,
                OrderStatus::PENDING_AGENCY_CONFIRMATION,  // 30%
                OrderStatus::PENDING_AGENCY_CONFIRMATION,
                OrderStatus::PENDING_AGENCY_CONFIRMATION,
                OrderStatus::PENDING_AGENCY_CONFIRMATION,
                OrderStatus::PARTIALLY_CONFIRMED,          // 20%
                OrderStatus::PARTIALLY_CONFIRMED,
                OrderStatus::PARTIALLY_CONFIRMED,
                OrderStatus::CONFIRMED,                    // 25%
                OrderStatus::CONFIRMED,
                OrderStatus::CONFIRMED,
                OrderStatus::CONFIRMED,
                OrderStatus::CANCELLED,                    // 10%
            ]),
            'created_at' => $createdAt,
        ];
    }

    /**
     * Create an order with a specific status.
     */
    public function withStatus(OrderStatus $status): static
    {
        return $this->state([
            'status' => $status,
        ]);
    }

    /**
     * Create an order with a specific total amount.
     */
    public function withAmount(float $amount): static
    {
        return $this->state([
            'total_amount' => $amount,
        ]);
    }

    /**
     * Create a draft order.
     */
    public function draft(): static
    {
        return $this->withStatus(OrderStatus::DRAFT);
    }

    /**
     * Create a pending order.
     */
    public function pending(): static
    {
        return $this->withStatus(OrderStatus::PENDING_AGENCY_CONFIRMATION);
    }

    /**
     * Create a partially confirmed order.
     */
    public function partiallyConfirmed(): static
    {
        return $this->withStatus(OrderStatus::PARTIALLY_CONFIRMED);
    }

    /**
     * Create a confirmed order.
     */
    public function confirmed(): static
    {
        return $this->withStatus(OrderStatus::CONFIRMED);
    }

    /**
     * Create a cancelled order.
     */
    public function cancelled(): static
    {
        return $this->withStatus(OrderStatus::CANCELLED);
    }

    /**
     * Create a high-value order (above $10,000).
     */
    public function highValue(): static
    {
        return $this->state([
            'total_amount' => fake()->randomFloat(2, 10000, 100000),
        ]);
    }

    /**
     * Create a low-value order (below $2,000).
     */
    public function lowValue(): static
    {
        return $this->state([
            'total_amount' => fake()->randomFloat(2, 100, 2000),
        ]);
    }
}
