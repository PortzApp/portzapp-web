<?php

namespace App\Policies;

use App\Enums\OrganizationBusinessType;
use App\Enums\UserRoles;
use App\Models\Invitation;
use App\Models\User;

class InvitationPolicy
{
    /**
     * Determine whether the user can view any invitations.
     */
    public function viewAny(User $user): bool
    {
        // PortzApp team can view all invitations
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
            return true;
        }

        // Organization admins and managers can view invitations for their organization
        return $user->isInOrganizationWithUserRole([
            UserRoles::ADMIN,
            UserRoles::CEO,
            UserRoles::MANAGER,
        ]);
    }

    /**
     * Determine whether the user can view the invitation.
     */
    public function view(User $user, Invitation $invitation): bool
    {
        // PortzApp team can view all invitations
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
            return true;
        }

        // Users can view invitations for their current organization
        if ($user->current_organization_id === $invitation->organization_id) {
            return $user->isInOrganizationWithUserRole([
                UserRoles::ADMIN,
                UserRoles::CEO,
                UserRoles::MANAGER,
            ]);
        }

        return false;
    }

    /**
     * Determine whether the user can create invitations.
     */
    public function create(User $user): bool
    {
        // PortzApp team can create invitations for any organization
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
            return true;
        }

        // Organization admins and managers can create invitations
        return $user->isInOrganizationWithUserRole([
            UserRoles::ADMIN,
            UserRoles::CEO,
            UserRoles::MANAGER,
        ]);
    }

    /**
     * Determine whether the user can update the invitation.
     */
    public function update(User $user, Invitation $invitation): bool
    {
        // PortzApp team can update all invitations
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
            return true;
        }

        // Users can update invitations for their current organization
        if ($user->current_organization_id === $invitation->organization_id) {
            return $user->isInOrganizationWithUserRole([
                UserRoles::ADMIN,
                UserRoles::CEO,
                UserRoles::MANAGER,
            ]);
        }

        return false;
    }

    /**
     * Determine whether the user can delete the invitation.
     */
    public function delete(User $user, Invitation $invitation): bool
    {
        // PortzApp team can delete all invitations
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
            return true;
        }

        // Organization admins can delete invitations for their organization
        if ($user->current_organization_id === $invitation->organization_id) {
            return $user->isInOrganizationWithUserRole([
                UserRoles::ADMIN,
                UserRoles::CEO,
            ]);
        }

        return false;
    }

    /**
     * Determine whether the user can restore the invitation.
     */
    public function restore(User $user, Invitation $invitation): bool
    {
        return $this->delete($user, $invitation);
    }

    /**
     * Determine whether the user can permanently delete the invitation.
     */
    public function forceDelete(User $user, Invitation $invitation): bool
    {
        return $this->delete($user, $invitation);
    }
}
