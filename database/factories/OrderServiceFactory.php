<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderService;
use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderService>
 */
class OrderServiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $unitPrice = fake()->randomFloat(2, 100, 5000); // Between $100 and $5,000 per unit
        $quantity = fake()->numberBetween(1, 10); // Between 1 and 10 units
        
        return [
            'order_id' => Order::factory(),
            'service_id' => Service::factory(),
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'total_price' => $quantity * $unitPrice, // Calculated total
            'notes' => fake()->optional(0.4)->sentence(), // 40% chance of having notes
        ];
    }

    /**
     * Create a factory state for a specific order.
     */
    public function forOrder(Order $order): static
    {
        return $this->state([
            'order_id' => $order->id,
        ]);
    }

    /**
     * Create a factory state for a specific service.
     */
    public function forService(Service $service): static
    {
        return $this->state([
            'service_id' => $service->id,
        ]);
    }

    /**
     * Create a factory state with specific quantity.
     */
    public function withQuantity(int $quantity): static
    {
        return $this->state(function (array $attributes) use ($quantity) {
            return [
                'quantity' => $quantity,
                'total_price' => $quantity * $attributes['unit_price'],
            ];
        });
    }

    /**
     * Create a factory state with specific unit price.
     */
    public function withUnitPrice(float $unitPrice): static
    {
        return $this->state(function (array $attributes) use ($unitPrice) {
            return [
                'unit_price' => $unitPrice,
                'total_price' => $attributes['quantity'] * $unitPrice,
            ];
        });
    }

    /**
     * Create a factory state with notes.
     */
    public function withNotes(string $notes = null): static
    {
        return $this->state([
            'notes' => $notes ?? fake()->paragraph(),
        ]);
    }
}
