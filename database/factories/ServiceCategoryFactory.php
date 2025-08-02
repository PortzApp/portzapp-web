<?php

namespace Database\Factories;

use App\Models\ServiceCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ServiceCategory>
 */
class ServiceCategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement([
                'Bunker Supply',
                'Diving Service',
                'Documentation & Shipment',
                'Freight Forwarding',
                'Fresh Water Supply',
                'Hull Cleaning',
                'Underwater Inspection',
                'Provision Supply',
                'Waste Disposal',
                'Medical Assistance',
                'Spare Parts Delivery',
                'Crew Change',
            ])
        ];
    }
}
