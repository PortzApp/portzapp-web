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
use App\Models\WizardSession;
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

        // Get all active services grouped by agency
        $servicesByAgency = Service::where('status', ServiceStatus::ACTIVE)
            ->with('organization')
            ->get()
            ->groupBy('organization_id');

        if ($servicesByAgency->isEmpty()) {
            if ($this->command) {
                $this->command->warn('No active services found. Skipping order creation.');
            }

            return;
        }

        // Each vessel owner organization places orders
        $MAX_ORDER_COUNT_PER_ORGANIZATION = 8;
        $totalOrdersCreated = 0;
        $totalOrderGroupsCreated = 0;
        $totalWizardSessionsCreated = 0;

        $vesselOwnerOrganizations->each(function ($requestingOrg) use ($servicesByAgency, $MAX_ORDER_COUNT_PER_ORGANIZATION, &$totalOrdersCreated, &$totalOrderGroupsCreated, &$totalWizardSessionsCreated) {
            // Get vessels for this organization
            $orgVessels = Vessel::where('organization_id', $requestingOrg->id)->get();
            $orgUsers = $requestingOrg->users;

            if ($orgVessels->isEmpty() || $orgUsers->isEmpty()) {
                if ($this->command) {
                    $this->command->warn("No vessels or users found for organization {$requestingOrg->name}. Skipping orders for this organization.");
                }

                return;
            }

            for ($i = 0; $i < $MAX_ORDER_COUNT_PER_ORGANIZATION; $i++) {
                // Pick 1 random vessel for this order
                $chosenVessel = $orgVessels->random();

                // Get an existing port or use the first one
                $port = Port::inRandomOrder()->first() ?? Port::factory()->create();

                // Random user from the organization
                $placedByUser = $orgUsers->random();

                // Determine order status distribution with realistic scenarios
                $orderStatuses = [
                    OrderStatus::DRAFT->value,
                    OrderStatus::PENDING_AGENCY_CONFIRMATION->value,
                    OrderStatus::PENDING_AGENCY_CONFIRMATION->value, // More likely
                    OrderStatus::PARTIALLY_CONFIRMED->value,
                    OrderStatus::PARTIALLY_CONFIRMED->value, // More likely
                    OrderStatus::CONFIRMED->value,
                    OrderStatus::CANCELLED->value,
                ];
                $orderStatus = fake()->randomElement($orderStatuses);

                // Create the order
                $order = Order::factory()->create([
                    'vessel_id' => $chosenVessel->id,
                    'port_id' => $port->id,
                    'placed_by_user_id' => $placedByUser->id,
                    'placed_by_organization_id' => $requestingOrg->id,
                    'status' => $orderStatus,
                    'total_amount' => 0, // Will be calculated later
                ]);

                $totalOrdersCreated++;

                // Create 2-4 order groups per order (different agencies)
                $numOrderGroups = fake()->numberBetween(2, 4);
                $availableAgencies = $servicesByAgency->keys()->toArray();
                $selectedAgencies = fake()->randomElements($availableAgencies, min($numOrderGroups, count($availableAgencies)));

                $orderTotalAmount = 0;

                foreach ($selectedAgencies as $agencyId) {
                    $agencyServices = $servicesByAgency[$agencyId];

                    // Create order group
                    $orderGroup = OrderGroup::factory()->create([
                        'order_id' => $order->id,
                        'agency_organization_id' => $agencyId,
                        'status' => $this->getOrderGroupStatus($orderStatus),
                        'subtotal_amount' => 0, // Will be calculated later
                    ]);

                    $totalOrderGroupsCreated++;

                    // Attach 3-5 services to this order group
                    $numServices = fake()->numberBetween(3, min(5, $agencyServices->count()));
                    $selectedServices = $agencyServices->random($numServices);

                    $groupSubtotal = 0;

                    foreach ($selectedServices as $service) {
                        $quantity = fake()->numberBetween(1, 3);
                        $unitPrice = (float) $service->price;
                        $totalPrice = $unitPrice * $quantity;
                        $groupSubtotal += $totalPrice;

                        // Attach service to order with pivot data
                        $order->services()->attach($service->id, [
                            'order_group_id' => $orderGroup->id,
                            'quantity' => $quantity,
                            'unit_price' => $unitPrice,
                            'total_price' => $totalPrice,
                        ]);
                    }

                    // Update order group subtotal
                    $orderGroup->update(['subtotal_amount' => $groupSubtotal]);
                    $orderTotalAmount += $groupSubtotal;
                }

                // Update order total amount
                $order->update(['total_amount' => $orderTotalAmount]);

                if ($this->command) {
                    $this->command->info("Created order {$order->order_number} with {$numOrderGroups} order groups for organization {$requestingOrg->name} (Total: $".number_format($orderTotalAmount, 2).')');
                }
            }

            // Create some wizard sessions showing orders in progress
            $this->createWizardSessions($orgUsers, $totalWizardSessionsCreated);
        });

        if ($this->command) {
            $this->command->info("\n=== ORDER SEEDING SUMMARY ===");
            $this->command->info("Total Orders Created: {$totalOrdersCreated}");
            $this->command->info("Total Order Groups Created: {$totalOrderGroupsCreated}");
            $this->command->info("Total Wizard Sessions Created: {$totalWizardSessionsCreated}");
            $this->command->info('Average Order Groups per Order: '.number_format($totalOrderGroupsCreated / max(1, $totalOrdersCreated), 1));
            $this->command->info("Vessel Owner Organizations: {$vesselOwnerOrganizations->count()}");
            $this->command->info("Shipping Agency Organizations: {$shippingAgencyOrganizations->count()}");
            $this->command->info("\nRealistic multi-agency order data created successfully!");
        }
    }

    /**
     * Determine order group status based on order status
     */
    private function getOrderGroupStatus(string $orderStatus): OrderGroupStatus
    {
        return match ($orderStatus) {
            OrderStatus::DRAFT->value => OrderGroupStatus::PENDING,
            OrderStatus::PENDING_AGENCY_CONFIRMATION->value => fake()->randomElement([
                OrderGroupStatus::PENDING,
                OrderGroupStatus::PENDING,
                OrderGroupStatus::PENDING, // More likely to be pending
                OrderGroupStatus::ACCEPTED,
            ]),
            OrderStatus::PARTIALLY_CONFIRMED->value => fake()->randomElement([
                OrderGroupStatus::PENDING,
                OrderGroupStatus::ACCEPTED,
                OrderGroupStatus::ACCEPTED, // More likely to have some accepted
                OrderGroupStatus::REJECTED,
            ]),
            OrderStatus::CONFIRMED->value => fake()->randomElement([
                OrderGroupStatus::ACCEPTED,
                OrderGroupStatus::ACCEPTED,
                OrderGroupStatus::ACCEPTED, // Most likely to be accepted
            ]),
            OrderStatus::CANCELLED->value => fake()->randomElement([
                OrderGroupStatus::REJECTED,
                OrderGroupStatus::PENDING, // Some might still be pending when cancelled
            ]),
            default => OrderGroupStatus::PENDING,
        };
    }

    /**
     * Create wizard sessions for users showing orders in progress
     */
    private function createWizardSessions(Collection $users, int &$totalWizardSessionsCreated): void
    {
        // Create 15-25% of users to have active wizard sessions
        $numSessions = (int) ceil($users->count() * fake()->randomFloat(2, 0.15, 0.25));

        $selectedUsers = $users->random(min($numSessions, $users->count()));

        foreach ($selectedUsers as $user) {
            // Create wizard session at different steps
            $steps = ['vessel_selection', 'service_selection', 'review', 'confirmation'];
            $currentStep = fake()->randomElement($steps);

            // 70% active sessions, 30% expired
            $isExpired = fake()->boolean(30);

            if ($isExpired) {
                WizardSession::factory()->expired()->create([
                    'user_id' => $user->id,
                    'current_step' => $currentStep,
                ]);
            } else {
                WizardSession::factory()->active()->atStep($currentStep)->create([
                    'user_id' => $user->id,
                ]);
            }

            $totalWizardSessionsCreated++;
        }
    }
}
