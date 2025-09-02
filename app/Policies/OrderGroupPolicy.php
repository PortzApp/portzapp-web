<?php

namespace App\Policies;

use App\Enums\OrganizationBusinessType;
use App\Enums\UserRoles;
use App\Models\OrderGroup;
use App\Models\User;

class OrderGroupPolicy
{
    /**
     * Determine whether the user can view any order groups.
     */
    public function viewAny(User $user): bool
    {
        // User must have a current organization
        if (! $user->current_organization_id) {
            return false;
        }

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
        // User must have a current organization
        if (! $user->current_organization_id) {
            return false;
        }

        // PORTZAPP_TEAM can view any order group
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
            return true;
        }

        // VESSEL_OWNER should use orders.index instead - not allowed to view individual order groups
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::VESSEL_OWNER)) {
            return false;
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
        // User must have a current organization
        if (! $user->current_organization_id) {
            return false;
        }

        // PORTZAPP_TEAM can update any order group, but must have admin role
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
            return $user->getRoleInCurrentOrganization() === UserRoles::ADMIN;
        }

        // SHIPPING_AGENCY can update their own order groups, but must have admin role
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::SHIPPING_AGENCY)) {
            return $orderGroup->fulfilling_organization_id === $user->current_organization_id &&
                   $user->getRoleInCurrentOrganization() === UserRoles::ADMIN;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the order group.
     */
    public function delete(User $user, OrderGroup $orderGroup): bool
    {
        // User must have a current organization
        if (! $user->current_organization_id) {
            return false;
        }

        // Only PORTZAPP_TEAM with admin role can delete order groups
        return $user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM) &&
               $user->getRoleInCurrentOrganization() === UserRoles::ADMIN;
    }

    /**
     * Determine whether the user can restore the order group.
     */
    public function restore(User $user, OrderGroup $orderGroup): bool
    {
        // User must have a current organization
        if (! $user->current_organization_id) {
            return false;
        }

        // Only PORTZAPP_TEAM with admin role can restore order groups
        return $user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM) &&
               $user->getRoleInCurrentOrganization() === UserRoles::ADMIN;
    }

    /**
     * Determine whether the user can permanently delete the order group.
     */
    public function forceDelete(User $user, OrderGroup $orderGroup): bool
    {
        // User must have a current organization
        if (! $user->current_organization_id) {
            return false;
        }

        // Only PORTZAPP_TEAM with admin role can permanently delete order groups
        return $user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM) &&
               $user->getRoleInCurrentOrganization() === UserRoles::ADMIN;
    }

    /**
     * Determine whether the user can view chat messages for this order group.
     */
    public function viewChat(User $user, OrderGroup $orderGroup): bool
    {
        // User must have a current organization
        if (! $user->current_organization_id) {
            return false;
        }

        // PORTZAPP_TEAM can view any order group chat
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
            return true;
        }

        // Load order if not already loaded
        $orderGroup->loadMissing('order');

        // Vessel owner (who placed the order) can view chat
        if ($user->id === $orderGroup->order->placed_by_user_id) {
            return true;
        }

        // Agency (fulfilling the order group) can view chat
        if ($user->current_organization_id === $orderGroup->fulfilling_organization_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can send messages to this order group chat.
     */
    public function sendMessage(User $user, OrderGroup $orderGroup): bool
    {
        return $this->viewChat($user, $orderGroup);
    }
}
