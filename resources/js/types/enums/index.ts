export const OrderStatus = {
    DRAFT: 'draft',
    PENDING_AGENCY_CONFIRMATION: 'pending_agency_confirmation',
    PARTIALLY_ACCEPTED: 'partially_accepted',
    PARTIALLY_REJECTED: 'partially_rejected',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    PARTIALLY_COMPLETED: 'partially_completed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const OrderGroupStatus = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
} as const;
export type OrderGroupStatus = (typeof OrderGroupStatus)[keyof typeof OrderGroupStatus];

export const OrderGroupServiceStatus = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
} as const;
export type OrderGroupServiceStatus = (typeof OrderGroupServiceStatus)[keyof typeof OrderGroupServiceStatus];

export const OrganizationBusinessType = {
    VESSEL_OWNER: 'vessel_owner',
    SHIPPING_AGENCY: 'shipping_agency',
    PORTZAPP_TEAM: 'portzapp_team',
} as const;
export type OrganizationBusinessType = (typeof OrganizationBusinessType)[keyof typeof OrganizationBusinessType];

export const ServiceStatus = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
} as const;
export type ServiceStatus = (typeof ServiceStatus)[keyof typeof ServiceStatus];

export const UserRoles = {
    ADMIN: 'admin',
    CEO: 'ceo',
    MANAGER: 'manager',
    OPERATIONS: 'operations',
    FINANCE: 'finance',
    VIEWER: 'viewer',
} as const;
export type UserRoles = (typeof UserRoles)[keyof typeof UserRoles];

export const VesselStatus = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    MAINTENANCE: 'maintenance',
} as const;
export type VesselStatus = (typeof VesselStatus)[keyof typeof VesselStatus];

export const VesselType = {
    CARGO: 'cargo',
    TANKER: 'tanker',
    CONTAINER: 'container',
} as const;
export type VesselType = (typeof VesselType)[keyof typeof VesselType];

export const JoinRequestStatus = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    WITHDRAWN: 'withdrawn',
} as const;
export type JoinRequestStatus = (typeof JoinRequestStatus)[keyof typeof JoinRequestStatus];

export const OnboardingStatus = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
} as const;
export type OnboardingStatus = (typeof OnboardingStatus)[keyof typeof OnboardingStatus];
