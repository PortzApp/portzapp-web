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
        // Call seeders in correct dependency order
        $this->call([
            UserSeeder::class,
            VesselSeeder::class,
            PortSeeder::class,
            ServiceCategorySeeder::class,
            ServiceSubCategorySeeder::class,
            ServiceSeeder::class,
            OrderSeeder::class,
            ChatSeeder::class,
        ]);
    }
}
