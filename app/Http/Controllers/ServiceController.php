<?php

namespace App\Http\Controllers;

use App\Enums\UserRoles;
use App\Http\Requests\ServiceCreateRequest;
use App\Http\Requests\ServiceUpdateRequest;
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

        $services_query = Service::query()->with('user:id,first_name')->latest();

        if (auth()->user()->role === UserRoles::SHIPPING_AGENCY) {
            $services_query->where('user_id', auth()->id());
        }

        return Inertia::render('services', [
            'services' => $services_query->get(),
        ]);
    }

    /**
     * Store a newly created service in storage.
     */
    public function store(ServiceCreateRequest $request): RedirectResponse
    {
        if ($request->user()->cannot('create', Service::class)) {
            abort(403, 'Unauthorized action.');
        }

        auth()->user()->services()->create($request->validated());

        return to_route('services')->with('message', 'Service created successfully!');
    }

    /**
     * Update the specified service in storage.
     */
    public function update(ServiceUpdateRequest $request, Service $service): RedirectResponse
    {
        if ($request->user()->cannot('update', $service)) {
            abort(403, 'Unauthorized action.');
        }

        $service->update($request->validated());

        return to_route('services')->with('message', 'Service updated successfully!');
    }

    /**
     * Remove the specified service from storage.
     */
    public function destroy(Service $service): RedirectResponse
    {
        if (auth()->user()->cannot('delete', $service)) {
            abort(403, 'Unauthorized action.');
        }

        $service->delete();

        return to_route('services')->with('message', 'Service deleted successfully!');
    }
}
