<?php

namespace Database\Seeders;

use App\Models\ServiceCategory;
use Illuminate\Database\Seeder;

class ServiceCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Bunker Supply',
            'Diving service',
            'Diving services',
            'Documentation & Shipment',
            'Freight Forwarding services',
            'GENERAL',
            'General Purpose Container',
            'Husbandry Services',
            'Immigration Services',
            'Launch & Anchorage',
            'Marine Services',
            'Ports/Ship Agency',
            'Provision/ Store Supply',
            'Ship Repair',
            'Ship working',
            'Ship- item delivery',
            'Spare Parts Supply',
            'Spare Supply',
        ];

        foreach ($categories as $category) {
            ServiceCategory::firstOrCreate(['name' => $category]);
        }
    }
}
