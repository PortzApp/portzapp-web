<?php

namespace Database\Seeders;

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
        // Create 2 test users
        $user1 = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        $user2 = User::factory()->create([
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
        ]);

        // Create 10 services for user 1
        Service::factory(10)->create([
            'user_id' => $user1->id,
        ]);

        // Create 10 services for user 2
        Service::factory(10)->create([
            'user_id' => $user2->id,
        ]);

        $this->command->info('Created 2 users and 20 services (10 per user)');
    }
}
