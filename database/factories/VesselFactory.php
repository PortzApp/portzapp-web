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
     * Realistic vessel names commonly used in shipping industry.
     */
    private const VESSEL_NAMES = [
        'MV Ocean Pioneer',
        'MSC Mediterranean',
        'Ever Given',
        'COSCO Fortune',
        'Maersk Alabama',
        'CMA CGM Marco Polo',
        'OOCL Hong Kong',
        'NYK Delphinus',
        'Evergreen Marine',
        'Hamburg Express',
        'APL Merlion',
        'MOL Triumph',
        'Yang Ming Utmost',
        'Hanjin Harmony',
        'Pacific Voyager',
        'Atlantic Star',
        'Nordic Spirit',
        'Global Trader',
        'Sea Eagle',
        'Blue Marlin',
    ];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(self::VESSEL_NAMES),
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
