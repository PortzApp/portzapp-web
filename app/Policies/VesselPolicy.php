<?php

namespace App\Policies;

use App\Enums\OrganizationBusinessType;
use App\Enums\UserRoles;
use App\Models\User;
use App\Models\Vessel;

class VesselPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->isInOrganizationWithBusinessType(OrganizationBusinessType::VESSEL_OWNER)
            || $user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Vessel $vessel): bool
    {
        return $user->isInOrganizationWithBusinessType(OrganizationBusinessType::VESSEL_OWNER)
            || $user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::VESSEL_OWNER)
                || $user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM))
            && $user->isInOrganizationWithUserRole(UserRoles::ADMIN);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Vessel $vessel): bool
    {
        return ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::VESSEL_OWNER)
                || $user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM))
            && $user->isInOrganizationWithUserRole(UserRoles::ADMIN);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Vessel $vessel): bool
    {
        return ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::VESSEL_OWNER)
                || $user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM))
            && $user->isInOrganizationWithUserRole(UserRoles::ADMIN);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Vessel $vessel): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Vessel $vessel): bool
    {
        return false;
    }
}
