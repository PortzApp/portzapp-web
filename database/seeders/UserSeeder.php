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
        // Create shipping agency organizations
        $shippingOrg1 = Organization::factory()->shippingAgency()->create();
        $shippingOrg2 = Organization::factory()->shippingAgency()->create();

        // Create vessel owner organizations
        $vesselOrg1 = Organization::factory()->vesselOwner()->create();
        $vesselOrg2 = Organization::factory()->vesselOwner()->create();

        // Create users for shipping agencies
        $shippingAdmin1 = User::factory()->create([
            'first_name' => 'John',
            'last_name' => 'Smith',
            'email' => 'john.smith@shipping1.com',
        ]);
        $shippingAdmin1->organizations()->attach($shippingOrg1, ['role' => UserRoles::ADMIN->value]);

        $shippingMember1 = User::factory()->create([
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'email' => 'jane.doe@shipping1.com',
        ]);
        $shippingMember1->organizations()->attach($shippingOrg1, ['role' => UserRoles::MEMBER->value]);

        $shippingAdmin2 = User::factory()->create([
            'first_name' => 'Mike',
            'last_name' => 'Johnson',
            'email' => 'mike.johnson@shipping2.com',
        ]);
        $shippingAdmin2->organizations()->attach($shippingOrg2, ['role' => UserRoles::ADMIN->value]);

        // Create users for vessel owners
        $vesselAdmin1 = User::factory()->create([
            'first_name' => 'Sarah',
            'last_name' => 'Wilson',
            'email' => 'sarah.wilson@vessels1.com',
        ]);
        $vesselAdmin1->organizations()->attach($vesselOrg1, ['role' => UserRoles::ADMIN->value]);

        $vesselMember1 = User::factory()->create([
            'first_name' => 'Tom',
            'last_name' => 'Brown',
            'email' => 'tom.brown@vessels1.com',
        ]);
        $vesselMember1->organizations()->attach($vesselOrg1, ['role' => UserRoles::MEMBER->value]);

        $vesselAdmin2 = User::factory()->create([
            'first_name' => 'Lisa',
            'last_name' => 'Davis',
            'email' => 'lisa.davis@vessels2.com',
        ]);
        $vesselAdmin2->organizations()->attach($vesselOrg2, ['role' => UserRoles::ADMIN->value]);

        $this->command->info('Created 6 users across 4 organizations (2 shipping agencies, 2 vessel owners)');
    }
}
