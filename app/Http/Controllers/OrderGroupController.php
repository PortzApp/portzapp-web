<?php

namespace App\Http\Controllers;

use App\Enums\OrderGroupStatus;
use App\Enums\OrganizationBusinessType;
use App\Http\Requests\UpdateOrderGroupRequest;
use App\Models\OrderGroup;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class OrderGroupController extends Controller
{
    /**
     * Display a listing of order groups for shipping agencies.
     */
    public function index()
    {
        $user = auth()->user();
        $query = OrderGroup::with([
            'order.vessel',
            'order.port',
            'order.placedByUser',
            'order.placedByOrganization',
            'fulfillingOrganization',
            'orderGroupServices.service.subCategory',
        ]);

        // PORTZAPP_TEAM can see all order groups
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
            // No filtering needed - show all order groups
        } else {
            // SHIPPING_AGENCY: Show only their order groups
            if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::SHIPPING_AGENCY)) {
                $query->where('fulfilling_organization_id', $user->current_organization_id);
            } else {
                // VESSEL_OWNER should use orders.index instead
                abort(403, 'Vessel owners should view full orders, not order groups.');
            }
        }

        $orderGroups = $query->latest()->get();

        return Inertia::render('order-groups/order-groups-index-page', [
            'orderGroups' => $orderGroups,
        ]);
    }

    /**
     * Display the specified order group.
     */
    public function show(OrderGroup $orderGroup)
    {
        Gate::authorize('view', $orderGroup);

        $orderGroup->load([
            'order.vessel',
            'order.port',
            'order.placedByUser',
            'order.placedByOrganization',
            'fulfillingOrganization',
            'orderGroupServices.service.subCategory',
        ]);

        // Load sibling order groups for context (excluding current one)
        $siblingOrderGroups = OrderGroup::where('order_id', $orderGroup->order_id)
            ->where('id', '!=', $orderGroup->id)
            ->with(['fulfillingOrganization', 'orderGroupServices.service.subCategory'])
            ->get();

        return Inertia::render('order-groups/show-order-group-page', [
            'orderGroup' => $orderGroup,
            'parentOrder' => $orderGroup->order,
            'siblingOrderGroups' => $siblingOrderGroups,
        ]);
    }

    /**
     * Update the specified order group (mainly status updates).
     */
    public function update(UpdateOrderGroupRequest $request, OrderGroup $orderGroup)
    {
        Gate::authorize('update', $orderGroup);

        $validated = $request->validated();

        $orderGroup->update($validated);

        return back()->with('message', 'Order group updated successfully!');
    }

    /**
     * Accept the order group.
     */
    public function accept(OrderGroup $orderGroup)
    {
        Gate::authorize('update', $orderGroup);

        $orderGroup->update([
            'status' => OrderGroupStatus::ACCEPTED,
        ]);

        return back()->with('message', 'Order group accepted successfully!');
    }

    /**
     * Reject the order group.
     */
    public function reject(OrderGroup $orderGroup)
    {
        Gate::authorize('update', $orderGroup);

        $orderGroup->update([
            'status' => OrderGroupStatus::REJECTED,
        ]);

        return back()->with('message', 'Order group rejected!');
    }

    /**
     * Mark the order group as in progress.
     */
    public function start(OrderGroup $orderGroup)
    {
        Gate::authorize('update', $orderGroup);

        $orderGroup->update([
            'status' => OrderGroupStatus::IN_PROGRESS,
        ]);

        return back()->with('message', 'Order group started!');
    }

    /**
     * Mark the order group as completed.
     */
    public function complete(OrderGroup $orderGroup)
    {
        Gate::authorize('update', $orderGroup);

        $orderGroup->update([
            'status' => OrderGroupStatus::COMPLETED,
        ]);

        return back()->with('message', 'Order group completed!');
    }
}
