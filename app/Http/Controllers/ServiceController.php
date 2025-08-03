<?php

namespace App\Http\Controllers;

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
        Gate::authorize('view-any', Service::class);

        $query = Service::query()->with(['organization', 'port', 'category']);

        // Filter by port if provided
        if (request()->has('port') && request()->get('port') !== '') {
            $portFilter = request()->get('port');

            // Filter by port name
            $query->whereHas('port', function ($q) use ($portFilter) {
                $q->where('name', 'like', '%' . $portFilter . '%');
            });
        }

        // Filter by category if provided
        if (request()->has('category') && request()->get('category') !== '') {
            $categoryFilter = request()->get('category');

            // Filter by category name
            $query->whereHas('category', function ($q) use ($categoryFilter) {
                $q->where('name', 'like', '%' . $categoryFilter . '%');
            });

            dd($query);
        }

        $services = $query->latest()->get();

        return Inertia::render('services/index', [
            'services' => Inertia::always($services),
            'ports' => Port::query()->orderBy('name')->get(),
            'service_categories' => ServiceCategory::query()->orderBy('service_categories.name')->get(),
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
            'organization_id' => $request->user()->organizations->first()?->id,
            'name' => $validated['name'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'status' => $validated['status'],
            'port_id' => $validated['port_id'],
        ]);

        // Load relationships for the created service
        $service->load(['organization:id,name', 'port:id,name', 'category:id,name']);

        ServiceCreated::dispatch($request->user(), $service);

        return to_route('services.index')->with('message', 'Service created successfully!');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        Gate::authorize('create', Service::class);

        return Inertia::render('services/create', [
            'ports' => Port::query()->get(),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Service $service)
    {
        Gate::authorize('view', $service);

        $service->load(['organization:id,name', 'port:id,name', 'category:id,name']);

        return Inertia::render('services/show', [
            'service' => $service,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Service $service)
    {
        Gate::authorize('update', $service);

        $service->load(['organization:id,name', 'port:id,name']);

        return Inertia::render('services/edit', [
            'service' => $service,
            'ports' => Port::query()->get(),
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
            'name' => $validated['name'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'status' => $validated['status'],
            'port_id' => $validated['port_id'],
        ]);

        // Refresh the service with relationships to get the latest data
        $service->refresh()->load(['organization:id,name', 'port:id,name']);

        ServiceUpdated::dispatch($request->user(), $service);

        return to_route('services.index')->with('message', 'Service updated successfully!');
    }

    /**
     * Remove the specified service from storage.
     */
    public function destroy(Service $service): RedirectResponse
    {
        Gate::authorize('delete', $service);

        $serviceId = $service->id;
        $serviceName = $service->name;

        $service->delete();

        ServiceDeleted::dispatch(request()->user(), $serviceId, $serviceName);

        return to_route('services.index')->with('message', 'Service deleted successfully!');
    }
}
