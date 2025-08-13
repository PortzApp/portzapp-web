<?php

namespace App\Policies;

use App\Enums\OrganizationBusinessType;
use App\Enums\UserRoles;
use App\Models\Service;
use App\Models\User;

class ServicePolicy
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
    public function view(User $user, ?Service $service = null): bool
    {
        // If no specific service is provided, check general view permission
        if ($service === null) {
            return true; // Allow viewing the service list page
        }

        // PORTZAPP_TEAM can view all services
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
            return true;
        }

        // VESSEL_OWNER can view all services
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::VESSEL_OWNER)) {
            return true;
        }

        // SHIPPING_AGENCY can only view services from their own organization
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::SHIPPING_AGENCY)) {
            return $service->organization_id === $user->current_organization_id;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only SHIPPING_AGENCY users with ADMIN role can create services
        return $user->isInOrganizationWithBusinessType(OrganizationBusinessType::SHIPPING_AGENCY) &&
               $user->isInOrganizationWithUserRole(UserRoles::ADMIN);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ?Service $service = null): bool
    {
        // If no specific service is provided, check general update permission
        if ($service === null) {
            return $user->isInOrganizationWithBusinessType(OrganizationBusinessType::SHIPPING_AGENCY) &&
                   $user->isInOrganizationWithUserRole(UserRoles::ADMIN);
        }

        // Only SHIPPING_AGENCY users with ADMIN role can update services
        // And they can only update services from their own organization
        return $user->isInOrganizationWithBusinessType(OrganizationBusinessType::SHIPPING_AGENCY) &&
               $user->isInOrganizationWithUserRole(UserRoles::ADMIN) &&
               $service->organization_id === $user->current_organization_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ?Service $service = null): bool
    {
        // If no specific service is provided, check general delete permission
        if ($service === null) {
            return $user->isInOrganizationWithBusinessType(OrganizationBusinessType::SHIPPING_AGENCY) &&
                   $user->isInOrganizationWithUserRole(UserRoles::ADMIN);
        }

        // Only SHIPPING_AGENCY users with ADMIN role can delete services
        // And they can only delete services from their own organization
        return $user->isInOrganizationWithBusinessType(OrganizationBusinessType::SHIPPING_AGENCY) &&
               $user->isInOrganizationWithUserRole(UserRoles::ADMIN) &&
               $service->organization_id === $user->current_organization_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ?Service $service = null): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ?Service $service = null): bool
    {
        return false;
    }
}
