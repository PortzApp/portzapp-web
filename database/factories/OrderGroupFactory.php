<?php

namespace Database\Factories;

use App\Enums\OrderGroupStatus;
use App\Models\Order;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\OrderGroup>
 */
class OrderGroupFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $createdAt = fake()->dateTimeBetween('-1 month', 'now');

        // Generate unique group number using timestamp + random suffix (format: GRP-YYMMDDHHMMSS-XXX)
        // This ensures uniqueness and allows for unlimited scaling
        $groupNumber = 'GRP-'.$createdAt->format('ymdHis').'-'.fake()->unique()->numberBetween(100, 999);

        // Generate realistic subtotal amounts between $200 and $25,000
        // with common pricing patterns in maritime industry
        $subtotalAmount = fake()->randomFloat(2, 200, 25000);

        // Round to common pricing increments (ends in .00, .50, or .99)
        $roundingType = fake()->randomElement(['round', 'half', 'psychological']);
        switch ($roundingType) {
            case 'round':
                $subtotalAmount = round($subtotalAmount / 100) * 100; // Round to nearest 100
                break;
            case 'half':
                $subtotalAmount = round($subtotalAmount / 50) * 50; // Round to nearest 50
                break;
            case 'psychological':
                $subtotalAmount = floor($subtotalAmount) + 0.99; // End in .99
                break;
        }

        // Weighted status distribution (more pending and accepted than rejected)
        $status = fake()->randomElement([
            OrderGroupStatus::PENDING,   // 50%
            OrderGroupStatus::PENDING,
            OrderGroupStatus::PENDING,
            OrderGroupStatus::PENDING,
            OrderGroupStatus::PENDING,
            OrderGroupStatus::ACCEPTED,  // 35%
            OrderGroupStatus::ACCEPTED,
            OrderGroupStatus::ACCEPTED,
            OrderGroupStatus::ACCEPTED,
            OrderGroupStatus::REJECTED,  // 15%
            OrderGroupStatus::REJECTED,
        ]);

        $acceptedAt = null;
        $rejectedAt = null;
        $acceptedByUserId = null;

        // Set dates and user based on status
        if ($status === OrderGroupStatus::ACCEPTED) {
            $acceptedAt = fake()->dateTimeBetween($createdAt, 'now');
            $acceptedByUserId = User::factory();
        } elseif ($status === OrderGroupStatus::REJECTED) {
            $rejectedAt = fake()->dateTimeBetween($createdAt, 'now');
        }

        return [
            'group_number' => $groupNumber,
            'order_id' => Order::factory(),
            'agency_organization_id' => Organization::factory()->shippingAgency(),
            'status' => $status,
            'subtotal_amount' => $subtotalAmount,
            'accepted_at' => $acceptedAt,
            'rejected_at' => $rejectedAt,
            'accepted_by_user_id' => $acceptedByUserId,
            'created_at' => $createdAt,
        ];
    }

    /**
     * Create an order group with a specific status.
     */
    public function withStatus(OrderGroupStatus $status): static
    {
        return $this->state(function (array $attributes) use ($status) {
            $createdAt = $attributes['created_at'] ?? now();

            $acceptedAt = null;
            $rejectedAt = null;
            $acceptedByUserId = null;

            if ($status === OrderGroupStatus::ACCEPTED) {
                $acceptedAt = fake()->dateTimeBetween($createdAt, 'now');
                $acceptedByUserId = User::factory();
            } elseif ($status === OrderGroupStatus::REJECTED) {
                $rejectedAt = fake()->dateTimeBetween($createdAt, 'now');
            }

            return [
                'status' => $status,
                'accepted_at' => $acceptedAt,
                'rejected_at' => $rejectedAt,
                'accepted_by_user_id' => $acceptedByUserId,
            ];
        });
    }

    /**
     * Create an order group with a specific subtotal amount.
     */
    public function withSubtotalAmount(float $amount): static
    {
        return $this->state([
            'subtotal_amount' => $amount,
        ]);
    }

    /**
     * Create a pending order group.
     */
    public function pending(): static
    {
        return $this->withStatus(OrderGroupStatus::PENDING);
    }

    /**
     * Create an accepted order group.
     */
    public function accepted(): static
    {
        return $this->withStatus(OrderGroupStatus::ACCEPTED);
    }

    /**
     * Create a rejected order group.
     */
    public function rejected(): static
    {
        return $this->withStatus(OrderGroupStatus::REJECTED);
    }

    /**
     * Create a high-value order group (above $5,000).
     */
    public function highValue(): static
    {
        return $this->state([
            'subtotal_amount' => fake()->randomFloat(2, 5000, 50000),
        ]);
    }

    /**
     * Create a low-value order group (below $1,000).
     */
    public function lowValue(): static
    {
        return $this->state([
            'subtotal_amount' => fake()->randomFloat(2, 50, 1000),
        ]);
    }

    /**
     * Create an order group with a specific accepting user.
     */
    public function acceptedBy(User $user): static
    {
        return $this->state(function (array $attributes) use ($user) {
            $createdAt = $attributes['created_at'] ?? now();

            return [
                'status' => OrderGroupStatus::ACCEPTED,
                'accepted_at' => fake()->dateTimeBetween($createdAt, 'now'),
                'rejected_at' => null,
                'accepted_by_user_id' => $user->id,
            ];
        });
    }

    /**
     * Create an order group associated with a specific order.
     */
    public function forOrder(Order $order): static
    {
        return $this->state([
            'order_id' => $order->id,
        ]);
    }

    /**
     * Create an order group for a specific agency organization.
     */
    public function forAgency(Organization $organization): static
    {
        return $this->state([
            'agency_organization_id' => $organization->id,
        ]);
    }
}
