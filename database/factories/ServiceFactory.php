<?php

namespace Database\Factories;

use App\Enums\ServiceStatus;
use App\Models\Organization;
use App\Models\Port;
use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $serviceTypes = [
            'Port Agency Services',
            'Ship Chandling',
            'Crew Management',
            'Cargo Handling',
            'Vessel Documentation',
            'Maritime Consulting',
            'Port Clearance',
            'Bunkering Services',
            'Ship Supply',
            'Maritime Logistics',
            'Freight Forwarding',
            'Container Services',
            'Stevedoring',
            'Pilotage Services',
            'Tugboat Services',
            'Ship Repair & Maintenance',
            'Maritime Security',
            'Customs Clearance',
            'Waste Management',
            'Fresh Water Supply',
        ];

        $descriptions = [
            'Professional maritime services with 24/7 support and experienced crew.',
            'Comprehensive port services tailored to your vessel requirements.',
            'Reliable shipping solutions with competitive rates and timely delivery.',
            'Expert maritime consulting to optimize your shipping operations.',
            'Full-service port agency with local expertise and global reach.',
            'Efficient cargo handling with modern equipment and skilled personnel.',
            'Complete vessel support services from arrival to departure.',
            'Trusted maritime partner with proven track record in the industry.',
            'Streamlined port operations to minimize vessel turnaround time.',
            'Professional shipping services designed to reduce operational costs.',
        ];

        return [
            'organization_id' => Organization::factory(),
            'port_id' => Port::factory(),
            'service_category_id' => ServiceCategory::factory(),
            'name' => fake()->randomElement($serviceTypes),
            'description' => fake()->randomElement($descriptions),
            'price' => fake()->randomFloat(2, 500, 50000), // Between $500 and $50,000 for maritime services
            'status' => fake()->randomElement([
                ServiceStatus::ACTIVE,
                ServiceStatus::ACTIVE,
                ServiceStatus::ACTIVE,
                ServiceStatus::INACTIVE
            ]), // 75% active, 25% inactive
        ];
    }
}
