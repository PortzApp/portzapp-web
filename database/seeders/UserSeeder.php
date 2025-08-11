<?php

namespace Database\Seeders;

use App\Enums\UserRoles;
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
        // Create PORTZAPP_TEAM organization
        $portzappOrg = Organization::factory()->portzappTeam()->create([
            'name' => 'PortzApp Team',
        ]);

        // Create shipping agency organizations
        $shippingOrg1 = Organization::factory()->shippingAgency()->create();
        $shippingOrg2 = Organization::factory()->shippingAgency()->create();

        // Create vessel owner organizations
        $vesselOrg1 = Organization::factory()->vesselOwner()->create();
        $vesselOrg2 = Organization::factory()->vesselOwner()->create();

        // Create users for shipping agencies
        $shippingAdmin1 = User::factory()->create([
            'first_name' => 'Admin',
            'last_name' => 'Shipping1',
            'email' => 'admin@shipping1.com',
        ]);
        $shippingAdmin1->organizations()->attach($shippingOrg1, ['role' => UserRoles::ADMIN]);

        $shippingMember1 = User::factory()->create([
            'first_name' => 'Viewer',
            'last_name' => 'Shipping1',
            'email' => 'viewer@shipping1.com',
        ]);
        $shippingMember1->organizations()->attach($shippingOrg1, ['role' => UserRoles::VIEWER]);

        $shippingAdmin2 = User::factory()->create([
            'first_name' => 'Admin',
            'last_name' => 'Shipping2',
            'email' => 'admin@shipping2.com',
        ]);
        $shippingAdmin2->organizations()->attach($shippingOrg2, ['role' => UserRoles::ADMIN]);

        // Create users for vessel owners
        $vesselAdmin1 = User::factory()->create([
            'first_name' => 'Admin',
            'last_name' => 'Vessel1',
            'email' => 'admin@vessels1.com',
        ]);
        $vesselAdmin1->organizations()->attach($vesselOrg1, ['role' => UserRoles::ADMIN]);

        $vesselMember1 = User::factory()->create([
            'first_name' => 'Viewer',
            'last_name' => 'Vessel1',
            'email' => 'viewer@vessels1.com',
        ]);
        $vesselMember1->organizations()->attach($vesselOrg1, ['role' => UserRoles::VIEWER]);

        $vesselAdmin2 = User::factory()->create([
            'first_name' => 'Admin',
            'last_name' => 'Vessel2',
            'email' => 'admin@vessels2.com',
        ]);
        $vesselAdmin2->organizations()->attach($vesselOrg2, ['role' => UserRoles::ADMIN]);

        // Create admin users for PORTZAPP_TEAM
        $portzappAdmin1 = User::factory()->create([
            'first_name' => 'Admin',
            'last_name' => 'PortzApp',
            'email' => 'admin@portzapp.com',
        ]);
        $portzappAdmin1->organizations()->attach($portzappOrg, ['role' => UserRoles::ADMIN]);

        $portzappAdmin2 = User::factory()->create([
            'first_name' => 'Viewer',
            'last_name' => 'PortzApp',
            'email' => 'viewer@portzapp.com',
        ]);
        $portzappAdmin2->organizations()->attach($portzappOrg, ['role' => UserRoles::VIEWER]);

        $this->command->info('Created 8 users across 5 organizations (2 shipping agencies, 2 vessel owners, 1 PORTZAPP_TEAM)');
    }
}
