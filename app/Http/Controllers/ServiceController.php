<?php

namespace App\Http\Controllers;

use App\Enums\OrganizationBusinessType;
use App\Events\ServiceCreated;
use App\Events\ServiceDeleted;
use App\Events\ServiceUpdated;
use App\Http\Requests\ServiceCreateRequest;
use App\Http\Requests\ServiceUpdateRequest;
use App\Models\Port;
use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    /**
     * Display a listing of the services.
     */
    public function index(): Response
    {
        Gate::authorize('viewAny', Service::class);

        $user = request()->user();
        $query = Service::query()->with(['organization', 'port', 'subCategory.category']);

        // Apply organization-based filtering
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::SHIPPING_AGENCY)) {
            // SHIPPING_AGENCY users can only see services from their own organization
            $query->where('organization_id', $user->current_organization_id);
        }
        // VESSEL_OWNER and PORTZAPP_TEAM users can see all services (no additional filter)

        // Filter by port if provided
        if (request()->has('port') && request()->get('port') !== '') {
            $portFilter = request()->get('port');

            // Filter by port name
            $query->whereHas('port', function ($q) use ($portFilter): void {
                $q->where('name', 'like', '%'.$portFilter.'%');
            });
        }

        // Filter by sub-category if provided
        if (request()->has('sub_category') && request()->get('sub_category') !== '') {
            $subCategoryFilter = request()->get('sub_category');

            // Filter by sub-category ID
            $query->where('service_sub_category_id', $subCategoryFilter);
        }

        // Filter by status if provided
        if (request()->has('status') && request()->get('status') !== '') {
            $statusFilter = request()->get('status');
            $query->where('status', $statusFilter);
        }

        $services = $query->latest()->paginate(10);

        // Build base query for counts (same organization filtering as main query)
        $countQuery = Service::query();
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::SHIPPING_AGENCY)) {
            $countQuery->where('organization_id', $user->current_organization_id);
        }

        // Get ports with service counts
        $portsWithCounts = Port::query()
            ->withCount(['services' => function ($query) use ($countQuery): void {
                $query->whereIn('id', $countQuery->pluck('id'));
            }])
            ->orderBy('name')
            ->get();

        // Get categories with sub-categories and service counts
        $categoriesWithSubCategories = ServiceCategory::query()
            ->with(['subCategories' => function ($q) use ($countQuery): void {
                $q->withCount(['services' => function ($sq) use ($countQuery): void {
                    $sq->whereIn('services.id', $countQuery->pluck('id'));
                }])->orderBy('sort_order');
            }])
            ->orderBy('name')
            ->get();

        // Get status counts
        $statusCounts = [
            'active' => (clone $countQuery)->where('status', 'active')->count(),
            'inactive' => (clone $countQuery)->where('status', 'inactive')->count(),
        ];

        return Inertia::render('services/services-index-page', [
            'services' => Inertia::always($services),
            'ports' => $portsWithCounts,
            'categories_with_subcategories' => $categoriesWithSubCategories,
            'status_counts' => $statusCounts,
        ]);
    }

    /**
     * Store a newly created service in storage.
     */
    public function store(ServiceCreateRequest $request): RedirectResponse
    {
        Gate::authorize('create', Service::class);

        $validated = $request->validated();

        $service = Service::create([
            'organization_id' => $request->user()->current_organization_id,
            'description' => $validated['description'],
            'price' => $validated['price'],
            'status' => $validated['status'],
            'port_id' => $validated['port_id'],
            'service_sub_category_id' => $validated['service_sub_category_id'],
        ]);

        // Load relationships for the created service
        $service->load(['organization:id,name', 'port:id,name', 'subCategory.category:id,name']);

        ServiceCreated::dispatch($request->user(), $service);

        return to_route('services.index')->with('message', 'Service created successfully!');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        Gate::authorize('create', Service::class);

        return Inertia::render('services/create-service-page', [
            'ports' => Port::query()->get(),
            'serviceCategories' => ServiceCategory::query()->with('subCategories')->get(),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Service $service)
    {
        Gate::authorize('view', $service);

        $service->load(['organization:id,name', 'port:id,name', 'subCategory.category:id,name']);

        return Inertia::render('services/show-service-page', [
            'service' => $service,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Service $service)
    {
        Gate::authorize('update', $service);

        $service->load(['organization:id,name', 'port:id,name', 'subCategory.category:id,name']);

        return Inertia::render('services/edit-service-page', [
            'service' => $service,
            'ports' => Port::query()->get(),
            'serviceCategories' => ServiceCategory::query()->with('subCategories')->get(),
        ]);
    }

    /**
     * Update the specified service in storage.
     */
    public function update(ServiceUpdateRequest $request, Service $service): RedirectResponse
    {
        Gate::authorize('update', $service);

        $validated = $request->validated();

        $service->update([
            'description' => $validated['description'],
            'price' => $validated['price'],
            'status' => $validated['status'],
            'port_id' => $validated['port_id'],
            'service_sub_category_id' => $validated['service_sub_category_id'],
        ]);

        // Refresh the service with relationships to get the latest data
        $service->refresh()->load(['organization:id,name', 'port:id,name', 'subCategory.category:id,name']);

        ServiceUpdated::dispatch($request->user(), $service);

        return to_route('services.index')->with('message', 'Service updated successfully!');
    }

    /**
     * Remove the specified service from storage.
     */
    public function destroy(Service $service): RedirectResponse
    {
        Gate::authorize('delete', $service);

        $serviceId = (string) $service->id;

        $service->delete();

        ServiceDeleted::dispatch(request()->user(), $serviceId);

        return to_route('services.index')->with('message', 'Service deleted successfully!');
    }
}
