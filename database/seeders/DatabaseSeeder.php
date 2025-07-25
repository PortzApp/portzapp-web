<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Call the ServiceSeeder which creates users and services
        $this->call([
            UserSeeder::class,
            VesselSeeder::class,
            ServiceSeeder::class,
            OrderSeeder::class,
        ]);
    }
}
