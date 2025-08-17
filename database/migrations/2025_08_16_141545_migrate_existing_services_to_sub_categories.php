<?php

use App\Models\Service;
use App\Models\ServiceSubCategory;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get all existing services that have a category but no sub-category
        $services = Service::whereNotNull('service_category_id')
            ->whereNull('service_sub_category_id')
            ->get();

        foreach ($services as $service) {
            if (! $service->service_category_id) {
                continue;
            }

            // Find the first sub-category for this category
            $firstSubCategory = ServiceSubCategory::where('service_category_id', $service->service_category_id)
                ->orderBy('sort_order')
                ->first();

            if ($firstSubCategory) {
                // Assign the service to the first sub-category
                $service->update([
                    'service_sub_category_id' => $firstSubCategory->id,
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Set all service_sub_category_id back to null
        Service::whereNotNull('service_sub_category_id')
            ->update(['service_sub_category_id' => null]);
    }
};
