<?php

namespace Database\Factories;

use App\Enums\OrganizationBusinessType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Organization>
 */
class OrganizationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'registration_code' => fake()->regexify('REG-[A-Z0-9]{6}'),
            'business_type' => fake()->randomElement(OrganizationBusinessType::cases()),
        ];
    }

    /**
     * Indicate that the organization is a shipping agency.
     */
    public function shippingAgency(): static
    {
        return $this->state(fn (array $attributes) => [
            'business_type' => OrganizationBusinessType::SHIPPING_AGENCY,
            'name' => fake()->company().' Shipping',
        ]);
    }

    /**
     * Indicate that the organization is a vessel owner.
     */
    public function vesselOwner(): static
    {
        return $this->state(fn (array $attributes) => [
            'business_type' => OrganizationBusinessType::VESSEL_OWNER,
            'name' => fake()->company().' Vessels',
        ]);
    }

    /**
     * Indicate that the organization is a platform admin.
     */
    public function platformAdmin(): static
    {
        return $this->state(fn (array $attributes) => [
            'business_type' => OrganizationBusinessType::PLATFORM_ADMIN,
            'name' => 'PortzApp Admin',
        ]);
    }
}
