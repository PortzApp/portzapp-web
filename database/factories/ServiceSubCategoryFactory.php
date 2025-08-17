<?php

namespace Database\Factories;

use App\Models\ServiceCategory;
use App\Models\ServiceSubCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ServiceSubCategory>
 */
class ServiceSubCategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'service_category_id' => ServiceCategory::factory(),
            'name' => fake()->words(2, true),
            'description' => fake()->sentence(),
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }
}
