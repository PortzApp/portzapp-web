<?php

namespace App\Http\Controllers;

use App\Enums\OrderGroupStatus;
use App\Enums\OrganizationBusinessType;
use App\Models\OrderGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class AgencyOrderController extends Controller
{
    /**
     * List order groups for logged-in agency
     */
    public function index(Request $request)
    {
        $this->ensureShippingAgency();

        // Get user's shipping agency organizations
        $agencyOrgs = auth()->user()->organizations()
            ->where('business_type', OrganizationBusinessType::SHIPPING_AGENCY)
            ->pluck('organizations.id');

        $query = OrderGroup::with([
            'order.vessel.organization',
            'order.port',
            'order.placedByUser',
            'order.placedByOrganization',
            'shippingAgencyOrganization',
            'services.category',
            'acceptedByUser',
        ])
            ->whereIn('agency_organization_id', $agencyOrgs);

        // Apply filters
        if ($request->filled('status')) {
            $status = OrderGroupStatus::tryFrom($request->status);
            if ($status) {
                $query->where('status', $status);
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('order', function ($orderQuery) use ($search) {
                $orderQuery->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('vessel', function ($vesselQuery) use ($search) {
                        $vesselQuery->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('port', function ($portQuery) use ($search) {
                        $portQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $orderGroups = $query->latest()->paginate(15);

        // Get summary statistics
        $stats = [
            'pending' => OrderGroup::whereIn('agency_organization_id', $agencyOrgs)
                ->where('status', OrderGroupStatus::PENDING)
                ->count(),
            'accepted' => OrderGroup::whereIn('agency_organization_id', $agencyOrgs)
                ->where('status', OrderGroupStatus::ACCEPTED)
                ->count(),
            'rejected' => OrderGroup::whereIn('agency_organization_id', $agencyOrgs)
                ->where('status', OrderGroupStatus::REJECTED)
                ->count(),
        ];

        return Inertia::render('agency/orders/index', [
            'orderGroups' => $orderGroups,
            'stats' => $stats,
            'filters' => [
                'status' => $request->status,
                'search' => $request->search,
            ],
        ]);
    }

    /**
     * View specific order group details
     */
    public function show(OrderGroup $orderGroup)
    {
        Gate::authorize('view', $orderGroup);

        $orderGroup->load([
            'order.vessel.organization',
            'order.port',
            'order.placedByUser',
            'order.placedByOrganization',
            'order.orderGroups.shippingAgencyOrganization', // Load all groups for context
            'shippingAgencyOrganization',
            'services.category',
            'acceptedByUser',
        ]);

        return Inertia::render('agency/orders/show', [
            'orderGroup' => $orderGroup,
        ]);
    }

    /**
     * Accept the order group
     */
    public function accept(Request $request, OrderGroup $orderGroup)
    {
        Gate::authorize('update', $orderGroup);

        if ($orderGroup->status !== OrderGroupStatus::PENDING) {
            return redirect()->back()
                ->withErrors(['status' => 'Only pending order groups can be accepted.']);
        }

        $validated = $request->validate([
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $orderGroup->update([
            'status' => OrderGroupStatus::ACCEPTED,
            'accepted_at' => now(),
            'accepted_by_user_id' => auth()->id(),
            'response_notes' => $validated['notes'] ?? null,
        ]);

        // Check if all order groups are now accepted to update main order status
        $this->updateMainOrderStatus($orderGroup->order);

        return redirect()->back()
            ->with('message', 'Order group accepted successfully!');
    }

    /**
     * Reject the order group with reason
     */
    public function reject(Request $request, OrderGroup $orderGroup)
    {
        Gate::authorize('update', $orderGroup);

        if ($orderGroup->status !== OrderGroupStatus::PENDING) {
            return redirect()->back()
                ->withErrors(['status' => 'Only pending order groups can be rejected.']);
        }

        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $orderGroup->update([
            'status' => OrderGroupStatus::REJECTED,
            'rejected_at' => now(),
            'rejection_reason' => $validated['rejection_reason'],
            'response_notes' => $validated['notes'] ?? null,
        ]);

        // Update main order status since at least one group is rejected
        $this->updateMainOrderStatus($orderGroup->order);

        return redirect()->back()
            ->with('message', 'Order group rejected.');
    }

    /**
     * Update the main order status based on order group statuses
     */
    private function updateMainOrderStatus($order)
    {
        $order->load('orderGroups');

        $groupStatuses = $order->orderGroups->pluck('status');

        if ($groupStatuses->contains(OrderGroupStatus::REJECTED)) {
            // If any group is rejected, mark order as partially fulfilled or rejected
            $order->update(['status' => \App\Enums\OrderStatus::REJECTED]);
        } elseif ($groupStatuses->every(fn ($status) => $status === OrderGroupStatus::ACCEPTED)) {
            // If all groups are accepted, mark order as confirmed
            $order->update(['status' => \App\Enums\OrderStatus::CONFIRMED]);
        } else {
            // Mixed statuses or all pending - keep as pending
            $order->update(['status' => \App\Enums\OrderStatus::PENDING]);
        }
    }

    /**
     * Ensure user is from shipping agency organization
     */
    private function ensureShippingAgency()
    {
        $hasShippingAgencyOrg = auth()->user()->organizations()
            ->where('business_type', OrganizationBusinessType::SHIPPING_AGENCY)
            ->exists();

        if (! $hasShippingAgencyOrg) {
            abort(403, 'You must belong to a shipping agency organization to manage orders.');
        }
    }
}
