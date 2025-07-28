<?php

namespace Database\Seeders;

use App\Enums\OrganizationBusinessType;
use App\Models\User;
use App\Models\Vessel;
use Illuminate\Database\Seeder;

class VesselSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all users who belong to vessel owner organizations
        $vesselOwners = User::whereHas('organizations', function ($query) {
            $query->where('business_type', OrganizationBusinessType::VESSEL_OWNER);
        })->get();

        $vesselOwners->each(function ($owner) {
            Vessel::factory()
                ->count(5)
                ->create([
                    'owner_id' => $owner->id,
                ]);
        });

        $this->command->info("Created vessels for {$vesselOwners->count()} vessel owner users");
    }
}
