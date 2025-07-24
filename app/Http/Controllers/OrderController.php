<?php

namespace App\Http\Controllers;

use App\Enums\UserRoles;
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
            'service.user.organization',
            'vesselOwner.organization.members',
        ]);

        if (auth()->user()->role === UserRoles::VESSEL_OWNER) {
            $query->where('vessel_owner_id', auth()->id());
        }

        if (auth()->user()->role === UserRoles::SHIPPING_AGENCY) {
            $query->whereHas('service', function ($q): void {
                $q->where('user_id', auth()->id());
            });
        }

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

        $order = Order::create([
            'service_id' => $validated['service_id'],
            'vessel_owner_id' => auth()->id(),
            'price' => $service->price,
            'notes' => $validated['notes'],
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

        $order->load(['service.user.organization']);

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
        $validated = $request->validated();

        $order->update($validated);

        return back()->with('message', 'Order updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        //
    }
}
