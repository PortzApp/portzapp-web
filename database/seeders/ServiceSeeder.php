<?php

namespace Database\Seeders;

use App\Enums\OrganizationBusinessType;
use App\Models\Organization;
use App\Models\Port;
use App\Models\Service;
use App\Models\ServiceSubCategory;
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

        // Get all service sub-categories
        $serviceSubCategories = ServiceSubCategory::query()->latest()->get();

        // Create 10 services for each shipping agency organization
        $shippingAgencyOrganizations->each(function ($organization) use ($ports, $serviceSubCategories) {
            // Shuffle the sub-categories and take 10 unique ones (or less if not enough sub-categories)
            $subCategories = $serviceSubCategories->shuffle()->take(10)->values();

            foreach ($subCategories as $subCategory) {
                Service::factory()
                    ->create([
                        'organization_id' => $organization->id,
                        'port_id' => fake()->randomElement($ports->pluck('id')),
                        'service_sub_category_id' => $subCategory->id,
                    ]);
            }
        });

        $totalServices = $shippingAgencyOrganizations->count() * 10;
        $this->command->info("Created {$totalServices} services for {$shippingAgencyOrganizations->count()} shipping agency organizations");
    }
}
