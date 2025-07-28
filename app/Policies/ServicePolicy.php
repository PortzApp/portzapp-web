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
    public function view(User $user, Service $service): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // User must belong to at least one shipping agency organization
        return $user->organizations()
            ->where('business_type', OrganizationBusinessType::SHIPPING_AGENCY)
            ->exists();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Service $service): bool
    {
        // Check if user belongs to the organization that owns this service
        $userOrganizationIds = $user->organizations()
            ->where('business_type', OrganizationBusinessType::SHIPPING_AGENCY)
            ->pluck('organizations.id');

        if (!$userOrganizationIds->contains($service->organization_id)) {
            return false;
        }

        // Check user's role within the organization
        $userRoleInOrg = $user->organizations()
            ->where('organizations.id', $service->organization_id)
            ->first()?->pivot?->role;

        // Admins can update any service in their organization
        // Members can also update services (you might want to restrict this further)
        return in_array($userRoleInOrg, [UserRoles::ADMIN->value, UserRoles::MEMBER->value]);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Service $service): bool
    {
        // Check if user belongs to the organization that owns this service
        $userOrganizationIds = $user->organizations()
            ->where('business_type', OrganizationBusinessType::SHIPPING_AGENCY)
            ->pluck('organizations.id');

        if (!$userOrganizationIds->contains($service->organization_id)) {
            return false;
        }

        // Check user's role within the organization
        $userRoleInOrg = $user->organizations()
            ->where('organizations.id', $service->organization_id)
            ->first()?->pivot?->role;

        // Only admins can delete services
        return $userRoleInOrg === UserRoles::ADMIN->value;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Service $service): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Service $service): bool
    {
        return false;
    }
}
