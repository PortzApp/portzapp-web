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
        // Get existing shipping agency organizations (from UserSeeder)
        $existingShippingAgencies = Organization::where('business_type', OrganizationBusinessType::SHIPPING_AGENCY)->get();

        // Create additional shipping agency organizations for better service coverage
        $additionalAgencies = [];
        $agencyNames = [
            'Maritime Solutions Ltd',
            'Ocean Connect Services',
            'Port Pro Agency',
            'SeaLink Logistics',
            'Harbor Master Services',
            'Coastal Marine Agency',
            'Blue Ocean Shipping',
            'Maritime Express Co',
            'Port Authority Services',
            'Ocean Bridge Agency',
            'Seaport Solutions',
            'Maritime Hub Services',
            'Anchor Point Agency',
            'Tidewater Logistics',
            'Deep Water Services',
            'Marine Gateway Co',
            'Port Elite Agency',
            'Ocean Dynamics Ltd',
            'Maritime Specialists',
            'Harbor Connect Services',
            'Seaside Logistics',
            'Port Navigator Agency',
            'Ocean Current Services',
            'Maritime Bridge Co',
            'Harborfront Solutions',
        ];

        foreach ($agencyNames as $name) {
            $additionalAgencies[] = Organization::factory()->shippingAgency()->create([
                'name' => $name,
            ]);
        }

        // Combine existing and new agencies
        $allShippingAgencies = $existingShippingAgencies->merge(collect($additionalAgencies));

        // Get all ports and service sub-categories
        $ports = Port::query()->get();
        $serviceSubCategories = ServiceSubCategory::query()->get();

        // Define service popularity weights (higher = more agencies offer this service)
        $servicePopularity = [
            // High demand services (6-8 agencies)
            'high' => [
                'Fresh Water Supply', 'Crew Handling', 'Launch Charges', 'Port of Call',
                'FO', 'MGO', 'LSFO', 'Provision', 'Stores', 'Cash To Master',
                'Crew Ferry -Boat Service', 'Agency Charges',
            ],
            // Medium demand services (4-6 agencies)
            'medium' => [
                'Bunkering', 'Anchorage Call', 'Gate Pass', 'Spare Delivery',
                'Visa Services', 'Entry/Exit Submission', 'Customs Clearance',
                'Boat Services', 'Item delivery', 'Ship work', 'Others',
            ],
            // Specialized services (3-5 agencies)
            'specialized' => [
                'Hull Cleaning', 'Under Water Inspection', 'Diving', 'MedCare',
                'Marine Survey & Inspection', 'Flag/Class Attendance', 'Main Engine',
                'AUX Engine', 'Navigation Equip', 'Safety Equipments',
            ],
        ];

        // Create a mapping of sub-category names to their popularity
        $popularityMap = [];
        foreach ($servicePopularity as $level => $subcategories) {
            foreach ($subcategories as $subcategory) {
                $popularityMap[$subcategory] = $level;
            }
        }

        $totalServicesCreated = 0;

        // For each service sub-category, create services from multiple agencies
        foreach ($serviceSubCategories as $subCategory) {
            $popularity = $popularityMap[$subCategory->name] ?? 'medium';

            // Determine number of agencies based on popularity
            $agencyCount = match ($popularity) {
                'high' => fake()->numberBetween(6, 8),
                'medium' => fake()->numberBetween(4, 6),
                'specialized' => fake()->numberBetween(3, 5),
                default => fake()->numberBetween(4, 6)
            };

            // Select random agencies for this service
            $selectedAgencies = $allShippingAgencies->random(min($agencyCount, $allShippingAgencies->count()));

            foreach ($selectedAgencies as $agency) {
                // Each agency offers this service at 2-4 different ports
                $servicePorts = $ports->random(fake()->numberBetween(2, 4));

                foreach ($servicePorts as $port) {
                    // Check if this agency already offers this service at this port
                    $existingService = Service::where([
                        'organization_id' => $agency->id,
                        'port_id' => $port->id,
                        'service_sub_category_id' => $subCategory->id,
                    ])->first();

                    if (! $existingService) {
                        Service::factory()->create([
                            'organization_id' => $agency->id,
                            'port_id' => $port->id,
                            'service_sub_category_id' => $subCategory->id,
                        ]);
                        $totalServicesCreated++;
                    }
                }
            }
        }

        // Ensure every port has comprehensive coverage
        foreach ($ports as $port) {
            $portServices = Service::where('port_id', $port->id)->count();
            if ($portServices < 15) {
                // Add more services to reach at least 15 per port
                $neededServices = 15 - $portServices;
                $availableSubCategories = $serviceSubCategories->shuffle();
                $availableAgencies = $allShippingAgencies->shuffle();

                for ($i = 0; $i < $neededServices && $i < $availableSubCategories->count(); $i++) {
                    $subCategory = $availableSubCategories[$i];
                    $agency = $availableAgencies[$i % $availableAgencies->count()];

                    // Check if this combination already exists
                    $existingService = Service::where([
                        'organization_id' => $agency->id,
                        'port_id' => $port->id,
                        'service_sub_category_id' => $subCategory->id,
                    ])->first();

                    if (! $existingService) {
                        Service::factory()->create([
                            'organization_id' => $agency->id,
                            'port_id' => $port->id,
                            'service_sub_category_id' => $subCategory->id,
                        ]);
                        $totalServicesCreated++;
                    }
                }
            }
        }

        $this->command->info("Created {$totalServicesCreated} services across ".$allShippingAgencies->count().' shipping agencies');
        $this->command->info("Total agencies: {$allShippingAgencies->count()} (existing: {$existingShippingAgencies->count()}, new: ".count($additionalAgencies).')');

        // Display coverage statistics
        foreach ($ports as $port) {
            $portServiceCount = Service::where('port_id', $port->id)->count();
            $this->command->info("Port {$port->name}: {$portServiceCount} services");
        }
    }
}
