<?php

namespace App\Policies;

use App\Enums\OnboardingStatus;
use App\Enums\OrganizationBusinessType;
use App\Enums\UserRoles;
use App\Models\Organization;
use App\Models\User;

class OrganizationPolicy
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
        // Allow users to create organizations during onboarding
        if ($user->onboarding_status === OnboardingStatus::PENDING) {
            return true;
        }

        // For completed users, only PORTZAPP_TEAM admins can create organizations
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
     * Determine whether the user can update their current organization.
     */
    public function updateCurrent(User $user): bool
    {
        // Allow admins to update their current organization
        if ($user->current_organization_id &&
            $user->isInOrganizationWithUserRole(UserRoles::ADMIN)) {
            return true;
        }

        // Also allow PORTZAPP_TEAM admins
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
     * Determine whether the user can update member roles in their current organization.
     */
    public function updateMemberRole(User $user): bool
    {
        // Allow admins in their current organization to update member roles
        if ($user->current_organization_id &&
            $user->isInOrganizationWithUserRole(UserRoles::ADMIN)) {
            return true;
        }

        // Also allow PORTZAPP_TEAM admins
        return $user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)
            && $user->isInOrganizationWithUserRole(UserRoles::ADMIN);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Organization $organization): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Organization $organization): bool
    {
        return false;
    }
}
