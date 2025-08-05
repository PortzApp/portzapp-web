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
        return [
            'order_id' => Order::factory(),
            'service_id' => Service::factory(),
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
}
