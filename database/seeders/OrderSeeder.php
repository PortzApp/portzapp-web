<?php

namespace Database\Seeders;

use App\Enums\OrganizationBusinessType;
use App\Enums\ServiceStatus;
use App\Models\Order;
use App\Models\Organization;
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
            $this->command->warn('No active services found. Skipping order creation.');

            return;
        }

        // Each vessel owner organization places orders
        $MAX_ORDER_COUNT_PER_ORGANIZATION = 5;

        $vesselOwnerOrganizations->each(function ($requestingOrg) use ($shippingAgencyOrganizations, $activeServices, $MAX_ORDER_COUNT_PER_ORGANIZATION) {
            // Get vessels for this organization
            $orgVessels = Vessel::where('organization_id', $requestingOrg->id)->get();

            if ($orgVessels->isEmpty()) {
                $this->command->warn("No vessels found for organization {$requestingOrg->name}. Skipping orders for this organization.");

                return;
            }

            for ($i = 0; $i < $MAX_ORDER_COUNT_PER_ORGANIZATION; $i++) {
                $chosenService = $activeServices->random();
                $providingOrg = $shippingAgencyOrganizations->random();
                // Pick 1-3 random vessels for this order
                $chosenVessels = $orgVessels->random(rand(1, min(3, $orgVessels->count())));
                $chosenVesselsIds = $chosenVessels instanceof Collection ? $chosenVessels->pluck('id')->all() : [$chosenVessels->id];

                $order = Order::factory()->create([
                    'requesting_organization_id' => $requestingOrg->id,
                    'providing_organization_id' => $providingOrg->id,
                    'price' => $chosenService->price,
                ]);

                $order->services()->attach($chosenService->id);
                $order->vessels()->attach($chosenVesselsIds);
            }
        });

        $totalOrders = $vesselOwnerOrganizations->count() * $MAX_ORDER_COUNT_PER_ORGANIZATION;
        $this->command->info("Created {$totalOrders} orders between {$vesselOwnerOrganizations->count()} vessel owner organizations and {$shippingAgencyOrganizations->count()} shipping agency organizations");
    }
}
