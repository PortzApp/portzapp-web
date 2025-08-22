<?php

namespace App\Policies;

use App\Enums\OrganizationBusinessType;
use App\Enums\UserRoles;
use App\Models\OrganizationJoinRequest;
use App\Models\User;

class OrganizationJoinRequestPolicy
{
    /**
     * Determine whether the user can view any join requests.
     */
    public function viewAny(User $user): bool
    {
        // PORTZAPP_TEAM can view all join requests across organizations
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
            return true;
        }

        // Organization admins can view join requests for their own organization
        $role = $user->getRoleInCurrentOrganization();

        return in_array($role, [UserRoles::ADMIN, UserRoles::CEO, UserRoles::MANAGER]);
    }

    /**
     * Determine whether the user can view the join request.
     */
    public function view(User $user, OrganizationJoinRequest $joinRequest): bool
    {
        // PORTZAPP_TEAM can view any join request
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
            return true;
        }

        // Users can view their own join requests
        if ($joinRequest->user_id === $user->id) {
            return true;
        }

        // Organization admins can view join requests for their organization
        if ($joinRequest->organization_id === $user->current_organization_id) {
            $role = $user->getRoleInCurrentOrganization();

            return in_array($role, [UserRoles::ADMIN, UserRoles::CEO, UserRoles::MANAGER]);
        }

        return false;
    }

    /**
     * Determine whether the user can create join requests.
     */
    public function create(User $user): bool
    {
        // Any authenticated user can create join requests
        return true;
    }

    /**
     * Determine whether the user can update the join request.
     */
    public function update(User $user, OrganizationJoinRequest $joinRequest): bool
    {
        // Users can only update (withdraw) their own pending requests
        return $joinRequest->user_id === $user->id &&
               $joinRequest->status->value === 'pending';
    }

    /**
     * Determine whether the user can delete the join request.
     */
    public function delete(User $user, OrganizationJoinRequest $joinRequest): bool
    {
        // Users can only delete (withdraw) their own pending requests
        return $joinRequest->user_id === $user->id &&
               $joinRequest->status->value === 'pending';
    }

    /**
     * Determine whether the user can approve join requests.
     */
    public function approve(User $user, OrganizationJoinRequest $joinRequest): bool
    {
        // PORTZAPP_TEAM can approve any join request
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
            return true;
        }

        // Organization admins can approve join requests for their organization
        if ($joinRequest->organization_id === $user->current_organization_id) {
            $role = $user->getRoleInCurrentOrganization();

            return in_array($role, [UserRoles::ADMIN, UserRoles::CEO, UserRoles::MANAGER])
                && $joinRequest->status->value === 'pending';
        }

        return false;
    }

    /**
     * Determine whether the user can reject join requests.
     */
    public function reject(User $user, OrganizationJoinRequest $joinRequest): bool
    {
        // PORTZAPP_TEAM can reject any join request
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
            return true;
        }

        // Organization admins can reject join requests for their organization
        if ($joinRequest->organization_id === $user->current_organization_id) {
            $role = $user->getRoleInCurrentOrganization();

            return in_array($role, [UserRoles::ADMIN, UserRoles::CEO, UserRoles::MANAGER])
                && $joinRequest->status->value === 'pending';
        }

        return false;
    }

    /**
     * Determine whether the user can manage join requests (approve/reject) for an organization.
     */
    public function manage(User $user, ?string $organizationId = null): bool
    {
        $targetOrgId = $organizationId ?? $user->current_organization_id;

        // PORTZAPP_TEAM can manage join requests for any organization
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
            return true;
        }

        // Organization admins can manage join requests for their organization
        $role = $user->getRoleInCurrentOrganization();

        return in_array($role, [UserRoles::ADMIN, UserRoles::CEO, UserRoles::MANAGER]);
    }

    /**
     * Determine whether the user can view join request statistics.
     */
    public function viewStatistics(User $user): bool
    {
        // PORTZAPP_TEAM can view statistics for all organizations
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
            return true;
        }

        // Organization admins can view statistics for their organization
        $role = $user->getRoleInCurrentOrganization();

        return in_array($role, [UserRoles::ADMIN, UserRoles::CEO, UserRoles::MANAGER]);
    }
}
