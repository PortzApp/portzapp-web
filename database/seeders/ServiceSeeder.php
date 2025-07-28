<?php

namespace Database\Seeders;

use App\Enums\OrganizationBusinessType;
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
        // Get all users who belong to shipping agency organizations
        $shippingUsers = User::whereHas('organizations', function ($query) {
            $query->where('business_type', OrganizationBusinessType::SHIPPING_AGENCY);
        })->get();

        // Create 10 services for each shipping user
        $shippingUsers->each(function ($user) {
            Service::factory()
                ->count(10)
                ->create([
                    'user_id' => $user->id,
                ]);
        });

        $totalServices = $shippingUsers->count() * 10;
        $this->command->info("Created {$totalServices} services for {$shippingUsers->count()} shipping agency users");
    }
}
