<?php

namespace App\Http\Controllers;

use App\Enums\OrganizationBusinessType;
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

        $services_query = Service::query()->with(['organization:id,name,business_type', 'port:id,name'])->latest();

        // Check if user belongs to shipping agency organizations
        $userShippingAgencyOrgs = auth()->user()->organizations()
            ->where('business_type', OrganizationBusinessType::SHIPPING_AGENCY)
            ->pluck('organizations.id');

        if ($userShippingAgencyOrgs->isNotEmpty()) {
            $services_query->whereIn('organization_id', $userShippingAgencyOrgs);
        }

        return Inertia::render('services/index', [
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

        // Get the user's first shipping agency organization (for simplicity)
        // In a more complex scenario, you might want to let the user choose which organization
        $shippingAgencyOrg = auth()->user()->organizations()
            ->where('business_type', OrganizationBusinessType::SHIPPING_AGENCY)
            ->first();

        if (! $shippingAgencyOrg) {
            abort(403, 'You must belong to a shipping agency organization to create services.');
        }

        Service::create(
            array_merge(
                $request->validated(),
                ['organization_id' => $shippingAgencyOrg->id],
            )
        );

        return to_route('services.index')->with('message', 'Service created successfully!');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('services/create', [
            'ports' => Port::query()->get(),
        ]);
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

        return to_route('services.index')->with('message', 'Service updated successfully!');
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

        return to_route('services.index')->with('message', 'Service deleted successfully!');
    }
}
