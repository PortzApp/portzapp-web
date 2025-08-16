<?php

namespace App\Policies;

use App\Enums\OrganizationBusinessType;
use App\Models\OrderWizardSession;
use App\Models\User;

class OrderWizardSessionPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Only vessel owners and PortzApp team can view wizard sessions
        return $user->isInOrganizationWithBusinessType(OrganizationBusinessType::VESSEL_OWNER)
            || $user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, OrderWizardSession $orderWizardSession): bool
    {
        // PortzApp team can view all sessions
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
            return true;
        }

        // Vessel owners can only view their own organization's sessions
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::VESSEL_OWNER)) {
            return $orderWizardSession->user_id === $user->id
                && $orderWizardSession->organization_id === $user->current_organization_id;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only vessel owners can create wizard sessions
        return $user->isInOrganizationWithBusinessType(OrganizationBusinessType::VESSEL_OWNER);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, OrderWizardSession $orderWizardSession): bool
    {
        // PortzApp team can update any session
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
            return true;
        }

        // Vessel owners can only update their own sessions
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::VESSEL_OWNER)) {
            return $orderWizardSession->user_id === $user->id
                && $orderWizardSession->organization_id === $user->current_organization_id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, OrderWizardSession $orderWizardSession): bool
    {
        // PortzApp team can delete any session
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
            return true;
        }

        // Vessel owners can only delete their own sessions
        if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::VESSEL_OWNER)) {
            return $orderWizardSession->user_id === $user->id
                && $orderWizardSession->organization_id === $user->current_organization_id;
        }

        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, OrderWizardSession $orderWizardSession): bool
    {
        // Only PortzApp team can restore sessions
        return $user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, OrderWizardSession $orderWizardSession): bool
    {
        // Only PortzApp team can force delete sessions
        return $user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM);
    }
}
