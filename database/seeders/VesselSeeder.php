<?php

namespace Database\Seeders;

use App\Enums\OrganizationBusinessType;
use App\Models\Organization;
use App\Models\Vessel;
use Illuminate\Database\Seeder;

class VesselSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all vessel owner organizations
        $vesselOwnerOrganizations = Organization::where('business_type', OrganizationBusinessType::VESSEL_OWNER)->get();

        $vesselOwnerOrganizations->each(function ($organization) {
            Vessel::factory()
                ->count(5)
                ->create([
                    'organization_id' => $organization->id,
                ]);
        });

        $totalVessels = $vesselOwnerOrganizations->count() * 5;
        $this->command->info("Created {$totalVessels} vessels for {$vesselOwnerOrganizations->count()} vessel owner organizations");
    }
}
