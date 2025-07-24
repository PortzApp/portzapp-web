<?php

namespace Database\Seeders;

use App\Enums\UserRoles;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all 2 users with shipping agency role
        $agencies = User::where('role', UserRoles::SHIPPING_AGENCY)->get();

        // Create 10 services for each agency (20 total services)
        $agencies->each(function ($agency) {
            Service::factory()
                ->count(10)
                ->create([
                    'user_id' => $agency->id,
                ]);
        });

        $totalServices = $agencies->count() * 10;
        $this->command->info("Created {$totalServices} services for {$agencies->count()}");
    }
}
