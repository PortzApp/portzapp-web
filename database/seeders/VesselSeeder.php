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
     * Pool of realistic vessel names to randomly select from.
     */
    private const VESSEL_NAMES = [
        'MV Iron Duke',
        'MS Auto Express',
        'Ever Given',
        'Coal Pioneer',
        'LNG Horizon',
        'HMS Defender',
        'Ocean Majesty',
        'Crude Navigator',
        'Lady Serenity',
        'Pacific Guardian',
        'Atlantic Pioneer',
        'Sea Voyager',
        'Nordic Star',
        'Golden Eagle',
        'Blue Horizon',
        'Silver Wave',
        'Ocean Explorer',
        'Maritime Spirit',
        'Coastal Breeze',
        'Deep Waters',
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
                    'name' => self::VESSEL_NAMES[array_rand(self::VESSEL_NAMES)],
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
