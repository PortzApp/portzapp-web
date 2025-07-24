<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create 2 Shipping Agencies
        User::factory()
            ->isShippingAgency()
            ->count(2)
            ->create([
                'organization_id' => fn () => Organization::factory()->create([
                    'name' => fake()->company().' Shipping',
                ]),
            ]);

        //  Create 2 Vessel Owners
        User::factory()
            ->isVesselOwner()
            ->count(2)
            ->create([
                'organization_id' => fn () => Organization::factory()->create([
                    'name' => fake()->company().' Vessels',
                ]),
            ]);
    }
}
