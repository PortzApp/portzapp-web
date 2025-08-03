<?php

namespace Database\Seeders;

use App\Enums\OrganizationBusinessType;
use App\Models\Organization;
use App\Models\Port;
use App\Models\Service;
use App\Models\ServiceCategory;
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

        // Get all service categories
        $serviceCategories = ServiceCategory::query()->latest()->get();

        // Create 10 services for each shipping agency organization
        $shippingAgencyOrganizations->each(function ($organization) use ($ports, $serviceCategories) {
            // Shuffle the categories and take 10 unique ones (or less if not enough categories)
            $categories = $serviceCategories->shuffle()->take(10)->values();

            foreach ($categories as $category) {
                Service::factory()
                    ->create([
                        'organization_id' => $organization->id,
                        'port_id' => fake()->randomElement($ports->pluck('id')),
                        'service_category_id' => $category->id,
                    ]);
            }
        });

        $totalServices = $shippingAgencyOrganizations->count() * 10;
        $this->command->info("Created {$totalServices} services for {$shippingAgencyOrganizations->count()} shipping agency organizations");
    }
}
