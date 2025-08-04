<?php

namespace App\Http\Controllers;

use App\Enums\OrganizationBusinessType;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Models\Order;
use App\Models\Organization;
use App\Models\Service;
use App\Models\Vessel;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Order::with([
            'services.organization:id,name,business_type',
            'vessel:id,name,imo_number,organization_id',
            'requestingOrganization:id,name,business_type',
            'providingOrganization:id,name,business_type',
        ]);

        // Get user's organization IDs based on business type
        $userVesselOwnerOrgs = auth()->user()->organizations()
            ->where('business_type', OrganizationBusinessType::VESSEL_OWNER)
            ->pluck('organizations.id');

        $userShippingAgencyOrgs = auth()->user()->organizations()
            ->where('business_type', OrganizationBusinessType::SHIPPING_AGENCY)
            ->pluck('organizations.id');

        // Filter orders based on user's organization involvement
        $query->where(function ($q) use ($userVesselOwnerOrgs, $userShippingAgencyOrgs) {
            // Show orders where user's vessel owner org is requesting
            if ($userVesselOwnerOrgs->isNotEmpty()) {
                $q->whereIn('requesting_organization_id', $userVesselOwnerOrgs);
            }

            // Show orders where user's shipping agency org is providing
            if ($userShippingAgencyOrgs->isNotEmpty()) {
                $q->orWhereIn('providing_organization_id', $userShippingAgencyOrgs);
            }
        });

        $orders = $query->latest()->get();

        return Inertia::render('orders/index', [
            'orders' => $orders,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreOrderRequest $request)
    {
        Gate::authorize('create', Order::class);

        $validated = $request->validated();

        $service = Service::findOrFail($validated['service_id']);

        // Get the user's first vessel owner organization (for simplicity)
        /** @var Organization|null $vesselOwnerOrg */
        $vesselOwnerOrg = auth()->user()->organizations()
            ->where('business_type', OrganizationBusinessType::VESSEL_OWNER)
            ->first();

        if (!$vesselOwnerOrg) {
            abort(403, 'You must belong to a vessel owner organization to place orders.');
        }

        $order = Order::create([
            'vessel_id' => $validated['vessel_id'],
            'requesting_organization_id' => $vesselOwnerOrg->id,
            'providing_organization_id' => $service->organization_id,
            'price' => $service->price,
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
        ]);

        // Attach the service using pivot relationship
        $order->services()->attach($validated['service_id']);

        return to_route('orders')->with('message', 'Order created successfully!');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        Gate::authorize('create', Order::class);

        // Get user's vessel owner organizations
        $vesselOwnerOrgs = auth()->user()->organizations()
            ->where('business_type', OrganizationBusinessType::VESSEL_OWNER)
            ->get();

        if ($vesselOwnerOrgs->isEmpty()) {
            abort(403, 'You must belong to a vessel owner organization to create orders.');
        }

        // Get all vessels from user's vessel owner organizations
        $vessels = Vessel::whereIn('organization_id', $vesselOwnerOrgs->pluck('id'))
            ->with('organization:id,name')
            ->get();

        // Get all active services
        $services = Service::where('status', 'active')
            ->with('organization:id,name')
            ->get();

        return Inertia::render('orders/create', [
            'vessels' => $vessels,
            'services' => $services,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        Gate::authorize('view', $order);

        $order->load([
            'services.organization:id,name,business_type',
            'vessel:id,name,imo_number,organization_id',
            'requestingOrganization:id,name,business_type',
            'providingOrganization:id,name,business_type',
        ]);

        return Inertia::render('orders/show', [
            'order' => $order,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Order $order)
    {
        Gate::authorize('update', $order);

        // Get user's vessel owner organizations
        $vesselOwnerOrgs = auth()->user()->organizations()
            ->where('business_type', OrganizationBusinessType::VESSEL_OWNER)
            ->get();

        // Get all vessels from user's vessel owner organizations
        $vessels = Vessel::whereIn('organization_id', $vesselOwnerOrgs->pluck('id'))
            ->with('organization:id,name')
            ->get();

        // Get all active services
        $services = Service::where('status', 'active')
            ->with('organization:id,name')
            ->get();

        $order->load(['services', 'vessel']);

        return Inertia::render('orders/edit', [
            'order' => $order,
            'vessels' => $vessels,
            'services' => $services,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOrderRequest $request, Order $order)
    {
        Gate::authorize('update', $order);

        $validated = $request->validated();

        // Handle service updates if service_id is provided
        if (isset($validated['service_id'])) {
            // Sync to maintain single service functionality
            $order->services()->sync([$validated['service_id']]);

            // Update the order's providing organization based on the new service
            $service = Service::findOrFail($validated['service_id']);
            $validated['providing_organization_id'] = $service->organization_id;
            $validated['price'] = $service->price;

            // Remove service_id from validated data as it's not a direct column
            unset($validated['service_id']);
        }

        $order->update($validated);

        return to_route('orders')->with('message', 'Order updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        Gate::authorize('delete', $order);

        $order->delete();

        return to_route('orders')->with('message', 'Order deleted successfully!');
    }
}
