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
            'Diving Service',
            'Documentation & Shipment',
            'Freight Forwarding',
            'Fresh Water Supply',
            'Hull Cleaning',
            'Underwater Inspection',
            'Provision Supply',
            'Waste Disposal',
            'Medical Assistance',
            'Spare Parts Delivery',
            'Crew Change',
        ];

        foreach ($categories as $category) {
            ServiceCategory::firstOrCreate(['name' => $category]);
        }
    }
}
