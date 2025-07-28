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
        // Create organizations first
        $shippingOrg1 = Organization::factory()->create([
            'name' => fake()->company().' Shipping',
        ]);
        $shippingOrg2 = Organization::factory()->create([
            'name' => fake()->company().' Shipping',
        ]);
        $vesselOrg1 = Organization::factory()->create([
            'name' => fake()->company().' Vessels',
        ]);
        $vesselOrg2 = Organization::factory()->create([
            'name' => fake()->company().' Vessels',
        ]);

        // Create 2 Shipping Agency users and attach to organizations
        $shippingUser1 = User::factory()
            ->isShippingAgency()
            ->create();
        $shippingUser1->organizations()->attach($shippingOrg1);

        $shippingUser2 = User::factory()
            ->isShippingAgency()
            ->create();
        $shippingUser2->organizations()->attach($shippingOrg2);

        // Create 2 Vessel Owner users and attach to organizations
        $vesselUser1 = User::factory()
            ->isVesselOwner()
            ->create();
        $vesselUser1->organizations()->attach($vesselOrg1);

        $vesselUser2 = User::factory()
            ->isVesselOwner()
            ->create();
        $vesselUser2->organizations()->attach($vesselOrg2);
    }
}
