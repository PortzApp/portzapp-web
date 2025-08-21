<?php

namespace App\Policies;

use App\Enums\UserRoles;
use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Only admins, CEOs, and managers can view members
        return $user->isInOrganizationWithUserRole(UserRoles::ADMIN)
            || $user->isInOrganizationWithUserRole(UserRoles::CEO)
            || $user->isInOrganizationWithUserRole(UserRoles::MANAGER);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        // Users can view themselves, or admins can view any user in their organization
        if ($user->id === $model->id) {
            return true;
        }

        // Check if both users are in the same organization and requester has admin role
        /** @var \App\Models\Organization|null $organization */
        $organization = $user->currentOrganization;
        if (! $organization) {
            return false;
        }

        return ($user->isInOrganizationWithUserRole(UserRoles::ADMIN)
                || $user->isInOrganizationWithUserRole(UserRoles::CEO)
                || $user->isInOrganizationWithUserRole(UserRoles::MANAGER))
            && $organization->users()->where('users.id', $model->id)->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only admins and CEOs can invite new members
        return $user->isInOrganizationWithUserRole(UserRoles::ADMIN)
            || $user->isInOrganizationWithUserRole(UserRoles::CEO);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        // Users can update themselves
        if ($user->id === $model->id) {
            return true;
        }

        // Admins and CEOs can update any user in their organization
        /** @var \App\Models\Organization|null $organization */
        $organization = $user->currentOrganization;
        if (! $organization) {
            return false;
        }

        return ($user->isInOrganizationWithUserRole(UserRoles::ADMIN)
                || $user->isInOrganizationWithUserRole(UserRoles::CEO))
            && $organization->users()->where('users.id', $model->id)->exists();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        // Users cannot delete themselves through the admin interface
        if ($user->id === $model->id) {
            return false;
        }

        // Only admins and CEOs can remove members
        /** @var \App\Models\Organization|null $organization */
        $organization = $user->currentOrganization;
        if (! $organization) {
            return false;
        }

        return ($user->isInOrganizationWithUserRole(UserRoles::ADMIN)
                || $user->isInOrganizationWithUserRole(UserRoles::CEO))
            && $organization->users()->where('users.id', $model->id)->exists();
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, User $model): bool
    {
        return $this->update($user, $model);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, User $model): bool
    {
        return $this->delete($user, $model);
    }
}
