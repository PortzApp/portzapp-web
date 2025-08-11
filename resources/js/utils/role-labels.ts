import { UserRoles } from '@/types/enums';

/**
 * Converts UserRoles enum values to human-readable display labels.
 * This mirrors the PHP UserRoles enum label() method.
 */
export function getRoleLabel(role: UserRoles): string {
    switch (role) {
        case UserRoles.ADMIN:
            return 'Admin';
        case UserRoles.CEO:
            return 'CEO';
        case UserRoles.MANAGER:
            return 'Manager';
        case UserRoles.OPERATIONS:
            return 'Operations';
        case UserRoles.FINANCE:
            return 'Finance';
        case UserRoles.VIEWER:
            return 'Viewer';
        default:
            return role; // Fallback to the enum value itself
    }
}

/**
 * Alternative implementation using an object map for better performance
 */
export const ROLE_LABELS: Record<UserRoles, string> = {
    [UserRoles.ADMIN]: 'Admin',
    [UserRoles.CEO]: 'CEO',
    [UserRoles.MANAGER]: 'Manager',
    [UserRoles.OPERATIONS]: 'Operations',
    [UserRoles.FINANCE]: 'Finance',
    [UserRoles.VIEWER]: 'Viewer',
} as const;

/**
 * Gets the display label for a role using the object map approach
 */
export function getRoleLabelFromMap(role: UserRoles): string {
    return ROLE_LABELS[role] || role;
}
