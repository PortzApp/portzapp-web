<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Enums\OrganizationBusinessType;
use App\Enums\ServiceStatus;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Models\Order;
use App\Models\Organization;
use App\Models\Port;
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
        $user = auth()->user();
        $query = Order::with([
            'vessel',
            'port',
            'placedByUser',
            'placedByOrganization',
        ]);

        // PORTZAPP_TEAM can see all orders
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
            // No filtering needed - show all orders
        } else {
            // Filter orders based on user's organization involvement
            $query->where(function ($q) use ($user): void {
                // VESSEL_OWNER: Show orders placed by their organization
                if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::VESSEL_OWNER)) {
                    $q->where('placed_by_organization_id', $user->current_organization_id);
                }

                // SHIPPING_AGENCY: Show orders where they are providing services
                if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::SHIPPING_AGENCY)) {
                    $q->orWhereHas('services', function ($serviceQuery) use ($user): void {
                        $serviceQuery->whereHas('organization', function ($orgQuery) use ($user): void {
                            $orgQuery->where('id', $user->current_organization_id);
                        });
                    });
                }
            });
        }

        $orders = $query->latest()->get();

        return Inertia::render('orders/orders-index-page', [
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

        // Get the user's first vessel owner organization (for simplicity)
        /** @var Organization|null $vesselOwnerOrg */
        $vesselOwnerOrg = auth()->user()->organizations()
            ->where('business_type', OrganizationBusinessType::VESSEL_OWNER)
            ->first();

        if (! $vesselOwnerOrg) {
            abort(403, 'You must belong to a vessel owner organization to place orders.');
        }

        $order = Order::create([
            'order_number' => 'ORD-'.strtoupper(uniqid()),
            'vessel_id' => $validated['vessel_id'],
            'port_id' => $validated['port_id'],
            'placed_by_user_id' => auth()->id(),
            'placed_by_organization_id' => $vesselOwnerOrg->id,
            'notes' => $validated['notes'] ?? null,
            'status' => OrderStatus::PENDING,
        ]);

        // Attach services via pivot table (many-to-many)
        // Handle both single service ID and arrays of service IDs
        $serviceIds = is_array($validated['service_ids'])
            ? $validated['service_ids']
            : [$validated['service_ids']];

        $order->services()->attach($serviceIds);

        return to_route('orders.index')->with('message', 'Order created successfully!');
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
        $services = Service::where('status', ServiceStatus::ACTIVE)
            ->with('organization:id,name')
            ->get();

        // Get all ports ordered by name
        $ports = Port::orderBy('name')->get();

        return Inertia::render('orders/create-order-page', [
            'vessels' => $vessels,
            'services' => $services,
            'ports' => $ports,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        Gate::authorize('view', $order);

        $order->load([
            'vessel',
            'port',
            'placedByUser',
            'placedByOrganization',
            'services.organization',
        ]);

        return Inertia::render('orders/show-order-page', [
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
        $services = Service::where('status', ServiceStatus::ACTIVE)
            ->with('organization:id,name')
            ->get();

        $order->load(['services', 'vessel']);

        return Inertia::render('orders/edit-order-page', [
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

        // Handle vessel updates
        if (isset($validated['vessel_id'])) {
            // No need to unset, vessel_id will be updated directly in $order->update()
        }

        // Handle service updates
        if (isset($validated['service_ids'])) {
            $order->services()->sync($validated['service_ids']);
            unset($validated['service_ids']);
        }

        $order->update($validated);

        return to_route('orders.index')->with('message', 'Order updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        Gate::authorize('delete', $order);

        $order->delete();

        return to_route('orders.index')->with('message', 'Order deleted successfully!');
    }
}
