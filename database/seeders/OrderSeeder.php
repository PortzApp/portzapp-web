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
use App\Models\User;
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
        // Disable events during seeding to prevent broadcasting errors
        \Illuminate\Support\Facades\Event::fake();

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

        // Create specific test orders for admin@vessels1.com
        $this->createTestOrdersForVessels1($servicesByOrg);

        // Create historical orders for shipping agencies to populate revenue charts
        $this->createHistoricalOrdersForShippingAgencies($servicesByOrg);

        // Each vessel owner organization places additional orders
        $MAX_ORDER_COUNT_PER_ORGANIZATION = 3; // Reduced to make testing easier

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

            // Create OrderGroupService records for this order group
            foreach ($chosenServices as $service) {
                \App\Models\OrderGroupService::create([
                    'order_group_id' => $orderGroup->id,
                    'service_id' => $service->id,
                    'status' => 'pending',
                    'price_snapshot' => $service->price,
                    'notes' => null,
                ]);
            }

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
     * Create specific test orders for admin@vessels1.com that will be distributed to known agencies.
     */
    private function createTestOrdersForVessels1(Collection $servicesByOrg): void
    {
        // Get admin@vessels1.com user and organization
        $vessels1User = User::where('email', 'admin@vessels1.com')->first();
        if (! $vessels1User) {
            if ($this->command) {
                $this->command->warn('admin@vessels1.com user not found. Skipping specific test orders.');
            }

            return;
        }

        // Get vessels1 organization
        $vessels1Org = Organization::whereHas('users', function ($q) use ($vessels1User) {
            $q->where('user_id', $vessels1User->id);
        })->where('business_type', OrganizationBusinessType::VESSEL_OWNER)->first();

        if (! $vessels1Org) {
            if ($this->command) {
                $this->command->warn('Vessels1 organization not found. Skipping specific test orders.');
            }

            return;
        }

        // Get a vessel from vessels1 organization
        $vessel = Vessel::where('organization_id', $vessels1Org->id)->first();
        if (! $vessel) {
            if ($this->command) {
                $this->command->warn('No vessels found for vessels1 organization. Skipping specific test orders.');
            }

            return;
        }

        $port = Port::first();

        // Create 3 specific test orders with different agency combinations
        $this->createTestOrder($vessels1User, $vessels1Org, $vessel, $port, $servicesByOrg, 'Multi-Agency Order #1', 2);
        $this->createTestOrder($vessels1User, $vessels1Org, $vessel, $port, $servicesByOrg, 'Single Agency Order', 1);
        $this->createTestOrder($vessels1User, $vessels1Org, $vessel, $port, $servicesByOrg, 'Multi-Agency Order #2', 2);

        if ($this->command) {
            $this->command->info('Created 3 specific test orders for admin@vessels1.com');
        }
    }

    /**
     * Create a specific test order with controlled agency distribution.
     */
    private function createTestOrder(User $user, Organization $org, Vessel $vessel, Port $port, Collection $servicesByOrg, string $notes, int $agencyCount): void
    {
        // Create the parent order
        $order = Order::create([
            'order_number' => 'TEST-'.strtoupper(uniqid()),
            'vessel_id' => $vessel->id,
            'port_id' => $port->id,
            'placed_by_user_id' => $user->id,
            'placed_by_organization_id' => $org->id,
            'status' => OrderStatus::PENDING_AGENCY_CONFIRMATION,
            'notes' => $notes,
        ]);

        // Select specific agencies for predictable testing
        $agencyIds = $servicesByOrg->keys()->take($agencyCount);

        foreach ($agencyIds as $agencyId) {
            $agencyServices = $servicesByOrg[$agencyId];

            // Pick 2-3 services from this agency for better testing
            $chosenServices = $agencyServices->random(rand(2, min(3, $agencyServices->count())));
            if (! $chosenServices instanceof Collection) {
                $chosenServices = collect([$chosenServices]);
            }

            // Create order group with different statuses for testing
            $status = match ($order->order_number) {
                default => $this->getTestOrderGroupStatus($agencyId),
            };

            $orderGroup = OrderGroup::create([
                'group_number' => 'TEST-GRP-'.strtoupper(uniqid()),
                'order_id' => $order->id,
                'fulfilling_organization_id' => $agencyId,
                'status' => $status,
                'notes' => "Test order group for {$notes}",
            ]);

            // Create OrderGroupService records for this order group
            foreach ($chosenServices as $service) {
                \App\Models\OrderGroupService::create([
                    'order_group_id' => $orderGroup->id,
                    'service_id' => $service->id,
                    'status' => 'pending',
                    'price_snapshot' => $service->price,
                    'notes' => null,
                ]);
            }

            if ($this->command) {
                $agency = Organization::find($agencyId);
                $this->command->info("  - Created test order group for {$agency->name} with {$chosenServices->count()} services (Status: {$status->label()})");
            }
        }
    }

    /**
     * Get test-specific order group status for predictable testing.
     */
    private function getTestOrderGroupStatus(string $agencyId): OrderGroupStatus
    {
        // Alternate statuses for different agencies to test various scenarios
        $agency = Organization::find($agencyId);

        if (str_contains($agency->name, 'Shipping1') || str_contains($agency->name, 'shipping1')) {
            return OrderGroupStatus::PENDING; // admin@shipping1.com will see pending requests
        }

        if (str_contains($agency->name, 'Shipping2') || str_contains($agency->name, 'shipping2')) {
            return OrderGroupStatus::ACCEPTED; // admin@shipping2.com will see accepted requests
        }

        // For other agencies, use random status
        return $this->randomOrderGroupStatus();
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

    /**
     * Create historical orders for shipping agencies to populate revenue charts.
     * These orders will be spread across the last 6 months with completed status.
     */
    private function createHistoricalOrdersForShippingAgencies(Collection $servicesByOrg): void
    {
        // Get the shipping agency organization for admin@shipping1.com
        $shipping1User = User::where('email', 'admin@shipping1.com')->first();
        if (! $shipping1User) {
            if ($this->command) {
                $this->command->warn('admin@shipping1.com user not found. Skipping historical orders.');
            }

            return;
        }

        // Get shipping1 organization
        $shipping1Org = Organization::whereHas('users', function ($q) use ($shipping1User) {
            $q->where('user_id', $shipping1User->id);
        })->where('business_type', OrganizationBusinessType::SHIPPING_AGENCY)->first();

        if (! $shipping1Org || ! $servicesByOrg->has($shipping1Org->id)) {
            if ($this->command) {
                $this->command->warn('Shipping1 organization or services not found. Skipping historical orders.');
            }

            return;
        }

        // Get all vessel owner organizations
        $vesselOwnerOrgs = Organization::where('business_type', OrganizationBusinessType::VESSEL_OWNER)->get();

        if ($vesselOwnerOrgs->isEmpty()) {
            if ($this->command) {
                $this->command->warn('No vessel owner organizations found. Skipping historical orders.');
            }

            return;
        }

        // Get services from shipping1 organization
        $shipping1Services = $servicesByOrg[$shipping1Org->id];

        // Create orders for each month in the last 6 months
        for ($monthsAgo = 5; $monthsAgo >= 0; $monthsAgo--) {
            $startOfMonth = now()->subMonths($monthsAgo)->startOfMonth();
            $endOfMonth = now()->subMonths($monthsAgo)->endOfMonth();

            // Create 3-8 orders per month with varying completion rates
            $ordersPerMonth = rand(3, 8);

            for ($i = 0; $i < $ordersPerMonth; $i++) {
                // Pick a random vessel owner organization
                $vesselOwnerOrg = $vesselOwnerOrgs->random();

                // Get a vessel from this organization
                $vessel = Vessel::where('organization_id', $vesselOwnerOrg->id)->first();
                if (! $vessel) {
                    continue;
                }

                // Get a random port
                $port = Port::inRandomOrder()->first() ?? Port::factory()->create();

                // Generate a random date within the month
                $orderDate = fake()->dateTimeBetween($startOfMonth, $endOfMonth);

                // Create the order
                $order = Order::create([
                    'order_number' => 'HIST-'.$orderDate->format('ymdHis').'-'.fake()->unique()->numberBetween(100, 999),
                    'vessel_id' => $vessel->id,
                    'port_id' => $port->id,
                    'placed_by_user_id' => $vesselOwnerOrg->users->random()->id,
                    'placed_by_organization_id' => $vesselOwnerOrg->id,
                    'status' => fake()->randomElement([
                        OrderStatus::CONFIRMED,
                        OrderStatus::COMPLETED,
                        OrderStatus::COMPLETED, // More completed orders for revenue
                        OrderStatus::COMPLETED,
                        OrderStatus::IN_PROGRESS,
                        OrderStatus::PARTIALLY_COMPLETED,
                    ]),
                    'notes' => 'Historical order for '.$startOfMonth->format('F Y'),
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate,
                ]);

                // Pick 2-5 services for this order
                $chosenServices = $shipping1Services->random(rand(2, min(5, $shipping1Services->count())));
                if (! $chosenServices instanceof Collection) {
                    $chosenServices = collect([$chosenServices]);
                }

                // Create order group with completed status (for revenue tracking)
                $orderGroupStatus = fake()->randomElement([
                    OrderGroupStatus::COMPLETED,
                    OrderGroupStatus::COMPLETED,
                    OrderGroupStatus::COMPLETED, // 60% completed
                    OrderGroupStatus::IN_PROGRESS,
                    OrderGroupStatus::IN_PROGRESS, // 40% in progress
                ]);

                $orderGroup = OrderGroup::create([
                    'group_number' => 'HIST-GRP-'.strtoupper(uniqid()),
                    'order_id' => $order->id,
                    'fulfilling_organization_id' => $shipping1Org->id,
                    'status' => $orderGroupStatus,
                    'notes' => 'Historical order group for revenue tracking',
                    'created_at' => $orderDate,
                    'updated_at' => $orderDate,
                ]);

                // Create OrderGroupService records
                foreach ($chosenServices as $service) {
                    $servicePrice = fake()->randomFloat(2, 500, 5000);
                    \App\Models\OrderGroupService::create([
                        'order_group_id' => $orderGroup->id,
                        'service_id' => $service->id,
                        'status' => $orderGroupStatus === OrderGroupStatus::COMPLETED ? 'completed' : 'in_progress',
                        'price_snapshot' => $servicePrice,
                        'notes' => null,
                        'created_at' => $orderDate,
                        'updated_at' => $orderDate,
                    ]);
                }
            }
        }

        if ($this->command) {
            $this->command->info('Created historical orders for shipping agency revenue charts (last 6 months)');
        }
    }
}
