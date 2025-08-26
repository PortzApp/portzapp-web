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
     * Realistic flag states commonly used in international shipping.
     */
    private const FLAG_STATES = [
        'Panama',
        'Liberia',
        'Marshall Islands',
        'Hong Kong',
        'Singapore',
        'Bahamas',
        'Malta',
        'Cyprus',
        'Norway',
        'United Kingdom',
        'Germany',
        'Denmark',
        'Netherlands',
        'Japan',
        'South Korea',
    ];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $vesselType = fake()->randomElement(VesselType::cases());

        return [
            'name' => fake()->randomElement(self::VESSEL_NAMES),
            'organization_id' => Organization::factory(),
            'imo_number' => fake()->unique()->randomNumber(7, true),
            'vessel_type' => $vesselType,
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
            'grt' => $this->generateRealisticGrt($vesselType),
            'nrt' => function (array $attributes) {
                // NRT is typically 60-90% of GRT
                return $attributes['grt'] ? round($attributes['grt'] * fake()->randomFloat(2, 0.6, 0.9), 2) : null;
            },
            'dwt' => $this->generateRealisticDwt($vesselType),
            'loa' => $this->generateRealisticLoa($vesselType),
            'beam' => function (array $attributes) {
                // Beam is typically 12-18% of LOA
                return $attributes['loa'] ? round($attributes['loa'] * fake()->randomFloat(3, 0.12, 0.18)) : null;
            },
            'draft' => function (array $attributes) {
                // Draft is typically 3-8% of LOA
                return $attributes['loa'] ? round($attributes['loa'] * fake()->randomFloat(3, 0.03, 0.08)) : null;
            },
            'build_year' => fake()->numberBetween(1995, 2024),
            'mmsi' => fake()->regexify('[0-9]{9}'),
            'call_sign' => fake()->regexify('[A-Z0-9]{4,8}'),
            'flag_state' => fake()->randomElement(self::FLAG_STATES),
            'remarks' => fake()->paragraph(2),
        ];
    }

    /**
     * Generate realistic GRT values based on vessel type.
     */
    private function generateRealisticGrt(VesselType $vesselType): ?float
    {
        return match ($vesselType) {
            VesselType::CONTAINER_SHIP => fake()->randomFloat(2, 50000, 220000),
            VesselType::BULK_CARRIER => fake()->randomFloat(2, 20000, 180000),
            VesselType::TANKER_SHIP => fake()->randomFloat(2, 30000, 160000),
            VesselType::CAR_CARRIER => fake()->randomFloat(2, 40000, 75000),
            VesselType::GAS_CARRIER => fake()->randomFloat(2, 80000, 140000),
            VesselType::DRY_BULK => fake()->randomFloat(2, 15000, 120000),
            VesselType::PASSENGER_SHIPS => fake()->randomFloat(2, 20000, 230000),
            VesselType::NAVAL_SHIPS => fake()->randomFloat(2, 5000, 50000),
            VesselType::YACHT => fake()->randomFloat(2, 500, 15000),
            default => fake()->randomFloat(2, 10000, 100000),
        };
    }

    /**
     * Generate realistic DWT values (in kg) based on vessel type.
     */
    private function generateRealisticDwt(VesselType $vesselType): ?int
    {
        return match ($vesselType) {
            VesselType::CONTAINER_SHIP => fake()->numberBetween(50000, 240000) * 1000, // Convert tons to kg
            VesselType::BULK_CARRIER => fake()->numberBetween(30000, 400000) * 1000,
            VesselType::TANKER_SHIP => fake()->numberBetween(50000, 320000) * 1000,
            VesselType::CAR_CARRIER => fake()->numberBetween(15000, 25000) * 1000,
            VesselType::GAS_CARRIER => fake()->numberBetween(70000, 270000) * 1000,
            VesselType::DRY_BULK => fake()->numberBetween(20000, 200000) * 1000,
            VesselType::PASSENGER_SHIPS => fake()->numberBetween(5000, 15000) * 1000,
            VesselType::NAVAL_SHIPS => fake()->numberBetween(3000, 12000) * 1000,
            VesselType::YACHT => fake()->numberBetween(100, 5000) * 1000,
            default => fake()->numberBetween(10000, 150000) * 1000,
        };
    }

    /**
     * Generate realistic LOA values (in mm) based on vessel type.
     */
    private function generateRealisticLoa(VesselType $vesselType): ?int
    {
        return match ($vesselType) {
            VesselType::CONTAINER_SHIP => fake()->numberBetween(250, 400) * 1000, // Convert meters to mm
            VesselType::BULK_CARRIER => fake()->numberBetween(180, 340) * 1000,
            VesselType::TANKER_SHIP => fake()->numberBetween(200, 380) * 1000,
            VesselType::CAR_CARRIER => fake()->numberBetween(160, 265) * 1000,
            VesselType::GAS_CARRIER => fake()->numberBetween(280, 345) * 1000,
            VesselType::DRY_BULK => fake()->numberBetween(140, 300) * 1000,
            VesselType::PASSENGER_SHIPS => fake()->numberBetween(200, 360) * 1000,
            VesselType::NAVAL_SHIPS => fake()->numberBetween(100, 250) * 1000,
            VesselType::YACHT => fake()->numberBetween(30, 180) * 1000,
            default => fake()->numberBetween(100, 250) * 1000,
        };
    }
}
