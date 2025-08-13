<?php

namespace Database\Seeders;

use App\Enums\OrderGroupStatus;
use App\Enums\OrderStatus;
use App\Enums\OrganizationBusinessType;
use App\Enums\ServiceStatus;
use App\Models\Order;
use App\Models\OrderGroup;
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

        // Get all active services grouped by organization
        $servicesByOrg = Service::where('status', ServiceStatus::ACTIVE)
            ->with('organization')
            ->get()
            ->groupBy('organization_id');

        if ($servicesByOrg->isEmpty()) {
            if ($this->command) {
                $this->command->warn('No active services found. Skipping order creation.');
            }

            return;
        }

        // Each vessel owner organization places orders
        $MAX_ORDER_COUNT_PER_ORGANIZATION = 5;

        $vesselOwnerOrganizations->each(function ($requestingOrg) use ($servicesByOrg, $MAX_ORDER_COUNT_PER_ORGANIZATION) {
            // Get vessels for this organization
            $orgVessels = Vessel::where('organization_id', $requestingOrg->id)->get();

            if ($orgVessels->isEmpty()) {
                if ($this->command) {
                    $this->command->warn("No vessels found for organization {$requestingOrg->name}. Skipping orders for this organization.");
                }

                return;
            }

            for ($i = 0; $i < $MAX_ORDER_COUNT_PER_ORGANIZATION; $i++) {
                $this->createMultiAgencyOrder($requestingOrg, $orgVessels, $servicesByOrg);
            }
        });

        $totalOrders = Order::count();
        $totalOrderGroups = OrderGroup::count();

        if ($this->command) {
            $this->command->info("Created {$totalOrders} orders with {$totalOrderGroups} order groups across {$vesselOwnerOrganizations->count()} vessel owner organizations and {$shippingAgencyOrganizations->count()} shipping agency organizations");
        }
    }

    /**
     * Create an order with services from multiple agencies (order groups).
     */
    private function createMultiAgencyOrder(Organization $requestingOrg, Collection $vessels, Collection $servicesByOrg): void
    {
        // Pick a random vessel
        $chosenVessel = $vessels->random();

        // Get an existing port or use the first one
        $port = Port::inRandomOrder()->first() ?? Port::factory()->create();

        // Create the parent order
        $order = Order::factory()->create([
            'vessel_id' => $chosenVessel->id,
            'port_id' => $port->id,
            'placed_by_user_id' => $requestingOrg->users->random()->id,
            'placed_by_organization_id' => $requestingOrg->id,
            'status' => OrderStatus::PENDING_AGENCY_CONFIRMATION,
        ]);

        // Decide how many agencies will be involved (1-3)
        $agencyCount = rand(1, min(3, $servicesByOrg->count()));
        $chosenAgencies = $servicesByOrg->keys()->random($agencyCount);

        $totalOrderGroups = 0;

        foreach ($chosenAgencies as $agencyId) {
            $agencyServices = $servicesByOrg[$agencyId];

            // Pick 1-3 services from this agency
            $chosenServices = $agencyServices->random(rand(1, min(3, $agencyServices->count())));
            if (! $chosenServices instanceof Collection) {
                $chosenServices = collect([$chosenServices]);
            }

            // Create order group for this agency
            $orderGroup = OrderGroup::create([
                'group_number' => 'GRP-'.strtoupper(uniqid()),
                'order_id' => $order->id,
                'fulfilling_organization_id' => $agencyId,
                'status' => $this->randomOrderGroupStatus(),
                'notes' => fake()->optional(0.3)->sentence(),
            ]);

            // Attach services to this order group
            $orderGroup->services()->attach($chosenServices->pluck('id')->toArray());

            $totalOrderGroups++;

            if ($this->command) {
                $agency = Organization::find($agencyId);
                $this->command->info("  - Order group {$orderGroup->group_number} assigned to {$agency->name} with {$chosenServices->count()} services");
            }
        }

        if ($this->command) {
            $this->command->info("Created order {$order->order_number} for {$requestingOrg->name} with {$totalOrderGroups} order groups");
        }
    }

    /**
     * Generate a random order group status with realistic distribution.
     */
    private function randomOrderGroupStatus(): OrderGroupStatus
    {
        return fake()->randomElement([
            OrderGroupStatus::PENDING,      // 30%
            OrderGroupStatus::PENDING,
            OrderGroupStatus::PENDING,
            OrderGroupStatus::ACCEPTED,     // 25%
            OrderGroupStatus::ACCEPTED,
            OrderGroupStatus::ACCEPTED,
            OrderGroupStatus::IN_PROGRESS,  // 25%
            OrderGroupStatus::IN_PROGRESS,
            OrderGroupStatus::IN_PROGRESS,
            OrderGroupStatus::COMPLETED,    // 15%
            OrderGroupStatus::COMPLETED,
            OrderGroupStatus::REJECTED,     // 5%
        ]);
    }
}
