export const OrderStatus = {
    DRAFT: 'draft',
    PENDING_AGENCY_CONFIRMATION: 'pending_agency_confirmation',
    PARTIALLY_CONFIRMED: 'partially_confirmed',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

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
