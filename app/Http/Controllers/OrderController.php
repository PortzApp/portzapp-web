<?php

namespace App\Http\Controllers;

use App\Enums\OrganizationBusinessType;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Models\Order;
use App\Models\Service;
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
            'service.organization:id,name,business_type',
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

        return Inertia::render('orders', [
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
        $vesselOwnerOrg = auth()->user()->organizations()
            ->where('business_type', OrganizationBusinessType::VESSEL_OWNER)
            ->first();

        if (!$vesselOwnerOrg) {
            abort(403, 'You must belong to a vessel owner organization to place orders.');
        }

        $order = Order::create([
            'service_id' => $validated['service_id'],
            'requesting_organization_id' => $vesselOwnerOrg->id,
            'providing_organization_id' => $service->organization_id,
            'price' => $service->price,
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
        ]);

        return back()->with('message', 'Order placed successfully');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        Gate::authorize('view', $order);

        $order->load([
            'service.organization:id,name,business_type',
            'requestingOrganization:id,name,business_type',
            'providingOrganization:id,name,business_type',
        ]);

        return Inertia::render('order-detail', [
            'order' => $order,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Order $order)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateOrderRequest $request, Order $order)
    {
        Gate::authorize('update', $order);

        $validated = $request->validated();

        $order->update($validated);

        return back()->with('message', 'Order updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        Gate::authorize('delete', $order);

        $order->delete();

        return back()->with('message', 'Order deleted successfully!');
    }
}
