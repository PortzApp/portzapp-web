<?php

namespace App\Policies;

use App\Enums\OrganizationBusinessType;
use App\Enums\UserRoles;
use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Order $order): bool
    {
        // PORTZAPP_TEAM can view all orders
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
            return true;
        }

        // VESSEL_OWNER can view orders placed by their organization
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::VESSEL_OWNER)) {
            return $order->placed_by_organization_id === $user->current_organization_id;
        }

        // SHIPPING_AGENCY users should view order groups instead of full orders
        // But allow them to view orders if they have order groups for this order
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::SHIPPING_AGENCY)) {
            return $order->orderGroups()->where('fulfilling_organization_id', $user->current_organization_id)->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only VESSEL_OWNER users with ADMIN role can create orders
        return $user->isInOrganizationWithBusinessType(OrganizationBusinessType::VESSEL_OWNER) &&
               $user->isInOrganizationWithUserRole(UserRoles::ADMIN);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Order $order): bool
    {
        // PORTZAPP_TEAM can update all orders
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
            return true;
        }

        // VESSEL_OWNER users with ADMIN role can update orders placed by their organization
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::VESSEL_OWNER) &&
            $user->isInOrganizationWithUserRole(UserRoles::ADMIN)) {
            return $order->placed_by_organization_id === $user->current_organization_id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Order $order): bool
    {
        // PORTZAPP_TEAM can delete all orders
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
            return true;
        }

        // VESSEL_OWNER users with ADMIN role can delete orders placed by their organization
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::VESSEL_OWNER) &&
            $user->isInOrganizationWithUserRole(UserRoles::ADMIN)) {
            return $order->placed_by_organization_id === $user->current_organization_id;
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Order $order): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Order $order): bool
    {
        return false;
    }
}
