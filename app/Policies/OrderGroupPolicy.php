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
        // PORTZAPP_TEAM can view all order groups
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
            return true;
        }

        // SHIPPING_AGENCY can view their own order groups
        return $user->isInOrganizationWithBusinessType(OrganizationBusinessType::SHIPPING_AGENCY);
    }

    /**
     * Determine whether the user can view the order group.
     */
    public function view(User $user, OrderGroup $orderGroup): bool
    {
        // PORTZAPP_TEAM can view any order group
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
            return true;
        }

        // VESSEL_OWNER can view order groups for their orders
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::VESSEL_OWNER)) {
            return $orderGroup->order->placed_by_organization_id === $user->current_organization_id;
        }

        // SHIPPING_AGENCY can view their own order groups
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::SHIPPING_AGENCY)) {
            return $orderGroup->fulfilling_organization_id === $user->current_organization_id;
        }

        return false;
    }

    /**
     * Determine whether the user can create order groups.
     */
    public function create(User $user): bool
    {
        // Order groups are created automatically when orders are placed
        // Only vessel owners place orders, but order groups are created by the system
        return false;
    }

    /**
     * Determine whether the user can update the order group.
     */
    public function update(User $user, OrderGroup $orderGroup): bool
    {
        // PORTZAPP_TEAM can update any order group
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
            return true;
        }

        // SHIPPING_AGENCY can update their own order groups (accept/reject/progress)
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::SHIPPING_AGENCY)) {
            return $orderGroup->fulfilling_organization_id === $user->current_organization_id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the order group.
     */
    public function delete(User $user, OrderGroup $orderGroup): bool
    {
        // Only PORTZAPP_TEAM can delete order groups
        return $user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM);
    }

    /**
     * Determine whether the user can restore the order group.
     */
    public function restore(User $user, OrderGroup $orderGroup): bool
    {
        // Only PORTZAPP_TEAM can restore order groups
        return $user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM);
    }

    /**
     * Determine whether the user can permanently delete the order group.
     */
    public function forceDelete(User $user, OrderGroup $orderGroup): bool
    {
        // Only PORTZAPP_TEAM can permanently delete order groups
        return $user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM);
    }
}
