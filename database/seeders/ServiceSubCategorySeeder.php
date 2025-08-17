<?php

namespace Database\Seeders;

use App\Models\ServiceCategory;
use App\Models\ServiceSubCategory;
use Illuminate\Database\Seeder;

class ServiceSubCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subCategories = [
            'Bunker Supply' => [
                'FO',
                'LSFO',
                'LSMGO',
                'MGO',
                'ULSFO',
            ],
            'Diving service' => [
                'Diving',
                'MedCare',
                'Medical service',
            ],
            'Diving services' => [
                'Hull Cleaning',
                'Under Water Inspection',
            ],
            'Documentation & Shipment' => [
                'Clearing consignment',
                'Entry/Exit Submission',
                'port & custom charge',
            ],
            'Freight Forwarding services' => [
                'Customs Clearance',
            ],
            'GENERAL' => [
                'Agency Charges',
                'Others',
            ],
            'General Purpose Container' => [
                'Luggage transport',
                'Tank Container Shipping',
            ],
            'Husbandry Services' => [
                'Boat Services',
                'Cash To Master',
                'Crew Ferry -Boat Service',
                'Crew Handling',
                'Crew Medical Attendance',
                'Fresh Water Supply',
                'Spare Delivery',
                'Visa Services',
            ],
            'Immigration Services' => [
                'PassportVerification',
            ],
            'Launch & Anchorage' => [
                'Additional Miles',
                'additional waiting',
                'Anchorage Pass',
                'Combined Trip',
                'Gate Pass',
                'Launch Charges',
            ],
            'Marine Services' => [
                'Flag/Class Attendance',
                'Marine Survey & Inspection',
            ],
            'Ports/Ship Agency' => [
                'Anchorage Call',
                'Bunkering',
                'Dry Docking',
                'Lay up call',
                'Port of Call',
            ],
            'Provision/ Store Supply' => [
                'Provision',
                'Stores',
            ],
            'Ship Repair' => [
                'AUX Engine',
                'Main Engine',
                'Navigation Equip',
                'Safety Equipments',
            ],
            'Ship working' => [
                'Ship work',
            ],
            'Ship- item delivery' => [
                'Item delivery',
            ],
            'Spare Parts Supply' => [
                'Alloy Supply',
            ],
            'Spare Supply' => [
                'AUX Engine Parts',
                'Main Engine Parts',
                'Navigation Equipment',
                'Safety Items',
            ],
        ];

        foreach ($subCategories as $categoryName => $subCategoryList) {
            $category = ServiceCategory::where('name', $categoryName)->first();

            if ($category) {
                foreach ($subCategoryList as $index => $subCategoryName) {
                    ServiceSubCategory::firstOrCreate([
                        'service_category_id' => $category->id,
                        'name' => $subCategoryName,
                    ], [
                        'description' => null,
                        'sort_order' => $index,
                    ]);
                }
            }
        }
    }
}
