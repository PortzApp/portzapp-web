<?php

namespace Database\Seeders;

use App\Enums\OrganizationBusinessType;
use App\Models\Organization;
use App\Models\Port;
use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all shipping agency organizations
        $shippingAgencyOrganizations = Organization::where('business_type', OrganizationBusinessType::SHIPPING_AGENCY)->get();

        // Get all ports
        $ports = Port::query()->latest()->get();

        // Create 10 services for each shipping agency organization
        $shippingAgencyOrganizations->each(function ($organization) use ($ports) {
            Service::factory()
                ->count(10)
                ->create([
                    'organization_id' => $organization->id,
                    'port_id' => fake()->randomElement($ports->pluck('id')),
                ]);
        });

        $totalServices = $shippingAgencyOrganizations->count() * 10;
        $this->command->info("Created {$totalServices} services for {$shippingAgencyOrganizations->count()} shipping agency organizations");
    }
}
