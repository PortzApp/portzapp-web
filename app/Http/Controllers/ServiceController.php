<?php

namespace App\Http\Controllers;


use App\Http\Requests\ServiceCreateRequest;
use App\Http\Requests\ServiceUpdateRequest;
use App\Models\Port;
use App\Models\Service;
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

        $services = Service::query()->with(['organization:id,name', 'port:id,name'])->latest()->get();

        return Inertia::render('services/index', [
            'services' => $services,
        ]);
    }

    /**
     * Store a newly created service in storage.
     */
    public function store(ServiceCreateRequest $request): RedirectResponse
    {
        Gate::authorize('create', Service::class);

        $validated = $request->validated();

        Service::create([
            'organization_id' => $request->user()->organizations->first()?->id,
            'name' => $validated['name'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'status' => $validated['status'],
            'port_id' => $validated['port_id'],
        ]);

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

        $service->load(['organization:id,name', 'port:id,name']);

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

        return to_route('services.index')->with('message', 'Service updated successfully!');
    }

    /**
     * Remove the specified service from storage.
     */
    public function destroy(Service $service): RedirectResponse
    {
        Gate::authorize('delete', $service);

        $service->delete();

        return to_route('services.index')->with('message', 'Service deleted successfully!');
    }
}
