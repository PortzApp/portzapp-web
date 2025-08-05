<?php

namespace Database\Seeders;

use App\Enums\ServiceStatus;
use App\Models\Order;
use App\Models\Service;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Starting Order-Service pivot relationship seeding...');

        // Get all orders
        $orders = Order::all();

        if ($orders->isEmpty()) {
            $this->command->warn('No orders found. Please run OrderSeeder first.');

            return;
        }

        // Get all active services
        $activeServices = Service::where('status', ServiceStatus::ACTIVE)->get();

        if ($activeServices->isEmpty()) {
            $this->command->warn('No active services found. Please run ServiceSeeder first.');

            return;
        }

        $createdRelationships = 0;
        $skippedRelationships = 0;

        // Process each order
        $orders->each(function ($order) use ($activeServices, &$createdRelationships, &$skippedRelationships) {
            // Check if this order already has service relationships
            $existingServiceCount = $order->services()->count();

            if ($existingServiceCount > 0) {
                $this->command->info("Order {$order->id} already has {$existingServiceCount} service(s) attached. Skipping...");
                $skippedRelationships++;

                return;
            }

            // Randomly determine how many services to attach (1-3 services per order)
            $servicesToAttach = rand(1, min(3, $activeServices->count()));

            // Get random services for this order
            $selectedServices = $activeServices->random($servicesToAttach);

            // Create pivot relationships
            $serviceIds = [];
            $selectedServices->each(function ($service) use (&$serviceIds) {
                $serviceIds[] = $service->id;
            });

            // Attach services to order
            $order->services()->attach($serviceIds);

            $createdRelationships++;

            $this->command->info("Attached {$servicesToAttach} service(s) to Order {$order->id}");
        });

        $this->command->info('Order-Service seeding completed!');
        $this->command->info("Created relationships for {$createdRelationships} orders");
        $this->command->info("Skipped {$skippedRelationships} orders (already had services)");

        // Display summary statistics
        $this->displaySummary();
    }

    /**
     * Display summary statistics of pivot relationships
     */
    private function displaySummary(): void
    {
        $totalPivotRecords = DB::table('order_service')->count();
        $ordersWithServices = Order::has('services')->count();
        $totalOrders = Order::count();

        $this->command->info('=== Pivot Relationship Summary ===');
        $this->command->info("Total pivot records in order_service table: {$totalPivotRecords}");
        $this->command->info("Orders with services: {$ordersWithServices}/{$totalOrders}");

        if ($totalOrders > 0) {
            $percentageWithServices = round(($ordersWithServices / $totalOrders) * 100, 2);
            $this->command->info("Percentage of orders with services: {$percentageWithServices}%");
        }

        // Show distribution of services per order
        $serviceDistribution = DB::table('order_service')
            ->select('order_id', DB::raw('COUNT(*) as service_count'))
            ->groupBy('order_id')
            ->pluck('service_count')
            ->countBy()
            ->sortKeys();

        if ($serviceDistribution->isNotEmpty()) {
            $this->command->info('=== Services per Order Distribution ===');
            $serviceDistribution->each(function ($count, $servicesPerOrder) {
                $this->command->info("{$servicesPerOrder} service(s): {$count} orders");
            });
        }
    }

    /**
     * Create test pivot relationships for testing purposes
     * This method can be called independently for testing
     */
    public function createTestRelationships(int $orderCount = 10): void
    {
        $this->command->info("Creating test pivot relationships for {$orderCount} orders...");

        $orders = Order::limit($orderCount)->get();
        $activeServices = Service::where('status', ServiceStatus::ACTIVE)->get();

        if ($activeServices->isEmpty()) {
            $this->command->error('No active services available for testing.');

            return;
        }

        $orders->each(function ($order) use ($activeServices) {
            // Clear existing relationships for clean testing
            $order->services()->detach();

            // Attach 1-2 random services
            $servicesToAttach = rand(1, min(2, $activeServices->count()));
            $selectedServices = $activeServices->random($servicesToAttach);

            $order->services()->attach($selectedServices->pluck('id')->toArray());

            $this->command->info("Test: Attached {$servicesToAttach} service(s) to Order {$order->id}");
        });

        $this->command->info('Test pivot relationships created successfully!');
    }

    /**
     * Remove all pivot relationships (useful for testing)
     */
    public function clearAllRelationships(): void
    {
        $this->command->warn('Clearing all order-service pivot relationships...');

        $deletedCount = DB::table('order_service')->delete();

        $this->command->info("Cleared {$deletedCount} pivot relationships.");
    }
}
