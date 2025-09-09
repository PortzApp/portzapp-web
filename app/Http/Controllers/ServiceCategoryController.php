<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreServiceCategoryRequest;
use App\Http\Requests\UpdateServiceCategoryRequest;
use App\Models\ServiceCategory;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ServiceCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        Gate::authorize('viewAny', ServiceCategory::class);

        $categories = ServiceCategory::with(['subCategories' => function ($query) {
            $query->orderBy('sort_order')->withCount('services');
        }])
        ->withCount(['subCategories', 'services'])
        ->orderBy('name')
        ->get();

        return Inertia::render('categories/categories-index-page', [
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        Gate::authorize('create', ServiceCategory::class);

        return Inertia::render('categories/create-category-page');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreServiceCategoryRequest $request)
    {
        Gate::authorize('create', ServiceCategory::class);

        $category = ServiceCategory::create($request->validated());

        // Create sub-categories if provided
        if ($request->has('sub_categories')) {
            foreach ($request->sub_categories as $index => $subCategoryData) {
                $category->subCategories()->create([
                    'name' => $subCategoryData['name'],
                    'description' => $subCategoryData['description'] ?? null,
                    'sort_order' => $index + 1,
                ]);
            }
        }

        return to_route('categories.index')->with('message', 'Category created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(ServiceCategory $category)
    {
        Gate::authorize('view', $category);

        $category->load([
            'subCategories' => function ($query) {
                $query->orderBy('sort_order')->withCount('services');
            }
        ])->loadCount(['subCategories', 'services']);

        return Inertia::render('categories/show-category-page', [
            'category' => $category,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ServiceCategory $category)
    {
        Gate::authorize('update', $category);

        $category->load([
            'subCategories' => function ($query) {
                $query->orderBy('sort_order');
            }
        ]);

        return Inertia::render('categories/edit-category-page', [
            'category' => $category,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateServiceCategoryRequest $request, ServiceCategory $category)
    {
        Gate::authorize('update', $category);

        $category->update($request->validated());

        // Handle sub-categories updates
        if ($request->has('sub_categories')) {
            // Get existing sub-category IDs
            $existingSubCategoryIds = $category->subCategories()->pluck('id')->toArray();
            $updatedSubCategoryIds = [];

            foreach ($request->sub_categories as $index => $subCategoryData) {
                if (isset($subCategoryData['id']) && in_array($subCategoryData['id'], $existingSubCategoryIds)) {
                    // Update existing sub-category
                    $category->subCategories()->where('id', $subCategoryData['id'])->update([
                        'name' => $subCategoryData['name'],
                        'description' => $subCategoryData['description'] ?? null,
                        'sort_order' => $index + 1,
                    ]);
                    $updatedSubCategoryIds[] = $subCategoryData['id'];
                } else {
                    // Create new sub-category
                    $newSubCategory = $category->subCategories()->create([
                        'name' => $subCategoryData['name'],
                        'description' => $subCategoryData['description'] ?? null,
                        'sort_order' => $index + 1,
                    ]);
                    $updatedSubCategoryIds[] = $newSubCategory->id;
                }
            }

            // Delete sub-categories that were removed
            $subCategoriesToDelete = array_diff($existingSubCategoryIds, $updatedSubCategoryIds);
            if (!empty($subCategoriesToDelete)) {
                $category->subCategories()->whereIn('id', $subCategoriesToDelete)->delete();
            }
        }

        return to_route('categories.index')->with('message', 'Category updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ServiceCategory $category)
    {
        Gate::authorize('delete', $category);

        // Check if category has services through sub-categories
        $servicesCount = $category->services()->count();
        if ($servicesCount > 0) {
            return back()->withErrors(['category' => 'Cannot delete category that has services associated with it.']);
        }

        $category->delete();

        return to_route('categories.index')->with('message', 'Category deleted successfully!');
    }
}
