<?php

namespace Database\Seeders;

use App\Enums\UserRoles;
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
        $owners = User::where('role', UserRoles::VESSEL_OWNER)->get();

        $owners->each(function ($owner) {
            Vessel::factory()
                ->count(5)
                ->create([
                    'owner_id' => $owner->id,
                ]);
        });
    }
}
