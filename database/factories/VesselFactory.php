<?php

namespace Database\Factories;

use App\Enums\VesselStatus;
use App\Enums\VesselType;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Vessel>
 */
class VesselFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true).' '.fake()->randomElement(['Vessel', 'Ship', 'Carrier', 'Express']),
            'organization_id' => Organization::factory(),
            'imo_number' => fake()->unique()->randomNumber(7, true),
            'vessel_type' => fake()->randomElement(VesselType::cases()),
            'status' => fake()->randomElement([
                VesselStatus::ACTIVE,
                VesselStatus::ACTIVE,
                VesselStatus::ACTIVE,
                VesselStatus::ACTIVE,
                VesselStatus::ACTIVE,
                VesselStatus::ACTIVE,
                VesselStatus::ACTIVE,
                VesselStatus::ACTIVE,
                VesselStatus::INACTIVE,
                VesselStatus::MAINTENANCE,
            ]),
        ];
    }
}
