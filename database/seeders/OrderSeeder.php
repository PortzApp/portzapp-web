<?php

namespace Database\Seeders;

use App\Enums\UserRoles;
use App\Models\Order;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all services
        $vessel_owners = User::where('role', UserRoles::VESSEL_OWNER)->get();
        $active_services = Service::where('status', 'active')->get();

        // Each vessel owner places 5 orders
        $MAX_ORDER_COUNT_PER_VESSEL_OWNER = 5;

        $vessel_owners->each(function ($owner) use ($active_services, $MAX_ORDER_COUNT_PER_VESSEL_OWNER) {
            for ($i = 0; $i < $MAX_ORDER_COUNT_PER_VESSEL_OWNER; $i++) {
                $chosen_service = $active_services->random();

                Order::factory()
                    ->count($MAX_ORDER_COUNT_PER_VESSEL_OWNER)
                    ->create([
                        'vessel_owner_id' => $owner->id,
                        'service_id' => fn () => $chosen_service->id,
                        'price' => fn () => $chosen_service->price,
                    ]);
            }
        });

        $total_orders = $vessel_owners->count() * $MAX_ORDER_COUNT_PER_VESSEL_OWNER;
        $this->command->info("Created $total_orders orders for {$vessel_owners->count()}");
    }
}
