<?php

namespace App\Policies;

use App\Enums\OrganizationBusinessType;
use App\Enums\UserRoles;
use App\Models\Order;
use App\Models\User;

class OrderPolicy
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
    public function view(User $user, Order $order): bool
    {
        // Check if user belongs to the requesting organization (vessel owner)
        $userVesselOwnerOrgs = $user->organizations()
            ->where('business_type', OrganizationBusinessType::VESSEL_OWNER)
            ->pluck('organizations.id');

        if ($userVesselOwnerOrgs->contains($order->requesting_organization_id)) {
            return true;
        }

        // Check if user belongs to the providing organization (shipping agency)
        $userShippingAgencyOrgs = $user->organizations()
            ->where('business_type', OrganizationBusinessType::SHIPPING_AGENCY)
            ->pluck('organizations.id');

        if ($userShippingAgencyOrgs->contains($order->providing_organization_id)) {
            return true;
        }

        // Check if user is platform admin
        $userPlatformAdminOrgs = $user->organizations()
            ->where('business_type', OrganizationBusinessType::PLATFORM_ADMIN)
            ->exists();

        return $userPlatformAdminOrgs;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only users belonging to vessel owner organizations can create orders
        return $user->organizations()
            ->where('business_type', OrganizationBusinessType::VESSEL_OWNER)
            ->exists();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Order $order): bool
    {
        // Check if user belongs to the requesting organization with appropriate role
        $requestingOrgMembership = $user->organizations()
            ->where('organizations.id', $order->requesting_organization_id)
            ->where('business_type', OrganizationBusinessType::VESSEL_OWNER)
            ->first();

        if ($requestingOrgMembership) {
            $userRoleInOrg = $requestingOrgMembership->pivot->role;
            // Both admins and members of requesting org can update orders
            if (in_array($userRoleInOrg, [UserRoles::ADMIN->value, UserRoles::MEMBER->value])) {
                return true;
            }
        }

        // Check if user belongs to the providing organization with admin role
        $providingOrgMembership = $user->organizations()
            ->where('organizations.id', $order->providing_organization_id)
            ->where('business_type', OrganizationBusinessType::SHIPPING_AGENCY)
            ->first();

        if ($providingOrgMembership) {
            $userRoleInOrg = $providingOrgMembership->pivot->role;
            // Only admins of providing org can update orders (e.g., change status)
            if ($userRoleInOrg === UserRoles::ADMIN->value) {
                return true;
            }
        }

        // Check if user is platform admin
        $userPlatformAdminOrgs = $user->organizations()
            ->where('business_type', OrganizationBusinessType::PLATFORM_ADMIN)
            ->exists();

        return $userPlatformAdminOrgs;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Order $order): bool
    {
        // Check if user belongs to the requesting organization with admin role
        $requestingOrgMembership = $user->organizations()
            ->where('organizations.id', $order->requesting_organization_id)
            ->where('business_type', OrganizationBusinessType::VESSEL_OWNER)
            ->first();

        if ($requestingOrgMembership) {
            $userRoleInOrg = $requestingOrgMembership->pivot->role;
            // Only admins of requesting org can delete orders
            if ($userRoleInOrg === UserRoles::ADMIN->value) {
                return true;
            }
        }

        // Check if user is platform admin
        $userPlatformAdminOrgs = $user->organizations()
            ->where('business_type', OrganizationBusinessType::PLATFORM_ADMIN)
            ->exists();

        return $userPlatformAdminOrgs;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Order $order): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Order $order): bool
    {
        return false;
    }
}
