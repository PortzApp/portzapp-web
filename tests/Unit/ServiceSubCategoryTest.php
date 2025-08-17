<?php

use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\ServiceSubCategory;

test('service sub-category belongs to a category', function (): void {
    $category = ServiceCategory::factory()->create();
    $subCategory = ServiceSubCategory::factory()->create([
        'service_category_id' => $category->id,
    ]);

    expect($subCategory->category)->toBeInstanceOf(ServiceCategory::class);
    expect($subCategory->category->id)->toBe($category->id);
});

test('service sub-category has many services', function (): void {
    $subCategory = ServiceSubCategory::factory()->create();
    $services = Service::factory()->count(3)->create([
        'service_sub_category_id' => $subCategory->id,
    ]);

    expect($subCategory->services)->toHaveCount(3);
    expect($subCategory->services->first())->toBeInstanceOf(Service::class);
});

test('service category has many sub-categories', function (): void {
    $category = ServiceCategory::factory()->create();
    $subCategories = ServiceSubCategory::factory()->count(3)->create([
        'service_category_id' => $category->id,
    ]);

    expect($category->subCategories)->toHaveCount(3);
    expect($category->subCategories->first())->toBeInstanceOf(ServiceSubCategory::class);
});

test('service category has many services through sub-categories', function (): void {
    $category = ServiceCategory::factory()->create();
    $subCategory1 = ServiceSubCategory::factory()->create([
        'service_category_id' => $category->id,
    ]);
    $subCategory2 = ServiceSubCategory::factory()->create([
        'service_category_id' => $category->id,
    ]);

    Service::factory()->count(2)->create([
        'service_sub_category_id' => $subCategory1->id,
    ]);
    Service::factory()->count(3)->create([
        'service_sub_category_id' => $subCategory2->id,
    ]);

    expect($category->services)->toHaveCount(5);
    expect($category->services->first())->toBeInstanceOf(Service::class);
});

test('service belongs to sub-category', function (): void {
    $subCategory = ServiceSubCategory::factory()->create();
    $service = Service::factory()->create([
        'service_sub_category_id' => $subCategory->id,
    ]);

    expect($service->subCategory)->toBeInstanceOf(ServiceSubCategory::class);
    expect($service->subCategory->id)->toBe($subCategory->id);
});

test('service can access parent category through sub-category', function (): void {
    $category = ServiceCategory::factory()->create();
    $subCategory = ServiceSubCategory::factory()->create([
        'service_category_id' => $category->id,
    ]);
    $service = Service::factory()->create([
        'service_sub_category_id' => $subCategory->id,
    ]);

    expect($service->category)->toBeInstanceOf(ServiceCategory::class);
    expect($service->category->id)->toBe($category->id);
});
