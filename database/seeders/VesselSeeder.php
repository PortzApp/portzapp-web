<?php

namespace Database\Seeders;

use App\Enums\OrganizationBusinessType;
use App\Enums\VesselType;
use App\Models\Organization;
use App\Models\Vessel;
use Illuminate\Database\Seeder;

class VesselSeeder extends Seeder
{
    /**
     * Specific vessel names for each vessel type to make seeded data more realistic.
     */
    private const VESSEL_NAMES_BY_TYPE = [
        'bulk_carrier' => 'MV Iron Duke',
        'car_carrier' => 'MS Auto Express',
        'container_ship' => 'Ever Given',
        'dry_bulk' => 'Coal Pioneer',
        'gas_carrier' => 'LNG Horizon',
        'naval_ships' => 'HMS Defender',
        'passenger_ships' => 'Ocean Majesty',
        'tanker_ship' => 'Crude Navigator',
        'yacht' => 'Lady Serenity',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all vessel owner organizations
        $vesselOwnerOrganizations = Organization::where('business_type', OrganizationBusinessType::VESSEL_OWNER)->get();

        $totalVessels = 0;

        $vesselOwnerOrganizations->each(function ($organization) use (&$totalVessels) {
            // Create one vessel of each type for this organization
            foreach (VesselType::cases() as $vesselType) {
                Vessel::factory()->create([
                    'organization_id' => $organization->id,
                    'vessel_type' => $vesselType,
                    'name' => self::VESSEL_NAMES_BY_TYPE[$vesselType->value].' '.$organization->id,
                ]);
                $totalVessels++;
            }
        });

        $vesselTypeCount = count(VesselType::cases());
        $organizationCount = $vesselOwnerOrganizations->count();

        $this->command->info("Created {$totalVessels} vessels ({$vesselTypeCount} vessel types × {$organizationCount} vessel owner organizations)");
        $this->command->info('Vessel types created: '.implode(', ', array_map(fn ($type) => $type->label(), VesselType::cases())));
    }
}
