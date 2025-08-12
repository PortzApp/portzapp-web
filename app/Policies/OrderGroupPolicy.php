<?php

namespace App\Policies;

use App\Enums\OrganizationBusinessType;
use App\Models\OrderGroup;
use App\Models\User;

class OrderGroupPolicy
{
    /**
     * Determine whether the user can view any order groups.
     */
    public function viewAny(User $user): bool
    {
        // Users with shipping agency organizations can view order groups
        return $user->organizations()
            ->where('business_type', OrganizationBusinessType::SHIPPING_AGENCY)
            ->exists();
    }

    /**
     * Determine whether the user can view the order group.
     */
    public function view(User $user, OrderGroup $orderGroup): bool
    {
        // Vessel owners can view order groups from their orders
        if ($user->organizations()
            ->where('business_type', OrganizationBusinessType::VESSEL_OWNER)
            ->whereHas('placedOrders', function ($query) use ($orderGroup) {
                $query->where('id', $orderGroup->order_id);
            })->exists()) {
            return true;
        }

        // Shipping agencies can view their assigned order groups
        return $user->organizations()
            ->where('business_type', OrganizationBusinessType::SHIPPING_AGENCY)
            ->where('id', $orderGroup->agency_organization_id)
            ->exists();
    }

    /**
     * Determine whether the user can create order groups.
     */
    public function create(User $user): bool
    {
        // Only vessel owners can create orders (and thus order groups)
        return $user->organizations()
            ->where('business_type', OrganizationBusinessType::VESSEL_OWNER)
            ->exists();
    }

    /**
     * Determine whether the user can update the order group.
     */
    public function update(User $user, OrderGroup $orderGroup): bool
    {
        // Only shipping agencies can update (accept/reject) their assigned order groups
        return $user->organizations()
            ->where('business_type', OrganizationBusinessType::SHIPPING_AGENCY)
            ->where('id', $orderGroup->agency_organization_id)
            ->exists();
    }

    /**
     * Determine whether the user can delete the order group.
     */
    public function delete(User $user, OrderGroup $orderGroup): bool
    {
        // Only vessel owners can delete order groups from their orders
        // And only if the order group is still pending
        if ($orderGroup->status !== \App\Enums\OrderGroupStatus::PENDING) {
            return false;
        }

        return $user->organizations()
            ->where('business_type', OrganizationBusinessType::VESSEL_OWNER)
            ->whereHas('placedOrders', function ($query) use ($orderGroup) {
                $query->where('id', $orderGroup->order_id);
            })->exists();
    }
}
