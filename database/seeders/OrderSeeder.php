<?php

namespace Database\Seeders;

use App\Enums\OrganizationBusinessType;
use App\Enums\ServiceStatus;
use App\Models\Order;
use App\Models\Organization;
use App\Models\Port;
use App\Models\Service;
use App\Models\Vessel;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get vessel owner organizations (requesting services)
        $vesselOwnerOrganizations = Organization::where('business_type', OrganizationBusinessType::VESSEL_OWNER)->get();

        // Get shipping agency organizations (providing services)
        $shippingAgencyOrganizations = Organization::where('business_type', OrganizationBusinessType::SHIPPING_AGENCY)->get();

        // Get all active services
        $activeServices = Service::where('status', ServiceStatus::ACTIVE)->get();

        if ($activeServices->isEmpty()) {
            if ($this->command) {
                $this->command->warn('No active services found. Skipping order creation.');
            }

            return;
        }

        // Each vessel owner organization places orders
        $MAX_ORDER_COUNT_PER_ORGANIZATION = 5;

        $vesselOwnerOrganizations->each(function ($requestingOrg) use ($activeServices, $MAX_ORDER_COUNT_PER_ORGANIZATION) {
            // Get vessels for this organization
            $orgVessels = Vessel::where('organization_id', $requestingOrg->id)->get();

            if ($orgVessels->isEmpty()) {
                if ($this->command) {
                    $this->command->warn("No vessels found for organization {$requestingOrg->name}. Skipping orders for this organization.");
                }

                return;
            }

            for ($i = 0; $i < $MAX_ORDER_COUNT_PER_ORGANIZATION; $i++) {
                // Pick 1-3 random services for this order
                $chosenServices = $activeServices->random(rand(1, min(3, $activeServices->count())));
                $chosenServicesIds = $chosenServices instanceof Collection ? $chosenServices->pluck('id')->all() : [$chosenServices->id];

                // Pick 1 random vessel for this order
                $chosenVessel = $orgVessels->random();

                // Get an existing port or use the first one
                $port = Port::inRandomOrder()->first() ?? Port::factory()->create();

                $order = Order::factory()->create([
                    'vessel_id' => $chosenVessel->id,
                    'port_id' => $port->id,
                    'placed_by_user_id' => $requestingOrg->users->random()->id,
                    'placed_by_organization_id' => $requestingOrg->id,
                ]);

                $order->services()->attach($chosenServicesIds);

                if ($this->command) {
                    $this->command->info("Created order {$order->id} for organization {$requestingOrg->name}");
                }
            }
        });

        $totalOrders = $vesselOwnerOrganizations->count() * $MAX_ORDER_COUNT_PER_ORGANIZATION;
        if ($this->command) {
            $this->command->info("Created {$totalOrders} orders between {$vesselOwnerOrganizations->count()} vessel owner organizations and {$shippingAgencyOrganizations->count()} shipping agency organizations");
        }
    }
}
