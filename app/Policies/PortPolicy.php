<?php

namespace App\Policies;

use App\Enums\OrganizationBusinessType;
use App\Enums\UserRoles;
use App\Models\Port;
use App\Models\User;

class PortPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user): bool
    {
        return $user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)
            && $user->isInOrganizationWithUserRole(UserRoles::ADMIN);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user): bool
    {
        return $user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)
            && $user->isInOrganizationWithUserRole(UserRoles::ADMIN);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user): bool
    {
        return $user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)
            && $user->isInOrganizationWithUserRole(UserRoles::ADMIN);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Port $port): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Port $port): bool
    {
        return false;
    }
}
