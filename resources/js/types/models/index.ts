import { OrderStatus, OrganizationBusinessType, ServiceStatus, UserRoles, VesselStatus, VesselType } from '@/types/enums';

export interface BaseModel {
    id: string;
    created_at: string;
    updated_at: string;
}

export interface User extends BaseModel {
    first_name: string;
    last_name: string;
    name?: string; // Computed full name
    email: string;
    phone_number: string;
    avatar?: string;
    email_verified_at: string | null;
    current_organization_id: string | null;
}

export interface Organization extends BaseModel {
    name: string;
    registration_code: string;
    business_type: OrganizationBusinessType;
    users_count?: number;
}

// Organization type that includes member count
export interface OrganizationWithMemberCount extends Organization {
    member_count: number;
}

// User with organization role information
export interface UserWithRole extends User {
    pivot: {
        role: UserRoles;
        created_at: string;
        updated_at: string;
    };
}

// Organization with members loaded
export interface OrganizationWithMembers extends Organization {
    users: UserWithRole[];
}

export interface Vessel extends BaseModel {
    organization_id: string;
    name: string;
    imo_number: string;
    vessel_type: VesselType;
    status: VesselStatus;
    organization?: Organization;
}

export interface Port extends BaseModel {
    name: string;
    code: string;
    status: string;
    country: string;
    city: string;
    latitude: number;
    longitude: number;
    timezone: string;
}

export interface Service extends BaseModel {
    name: string;
    description: string | null;
    price: number;
    status: ServiceStatus;
    organization_id: string;
    port_id: string;
    service_category_id: string;
    organization?: Organization;
    category?: ServiceCategory;
    port?: Port;
}

export interface ServiceCategory extends BaseModel {
    name: string;
    services?: Service[];
}

export interface OrderBase extends BaseModel {
    order_number: string;
    vessel_id: string;
    port_id: string;
    placed_by_user_id: string;
    placed_by_organization_id: string;
    notes: string;
    status: OrderStatus;
}

export interface OrderGroup extends BaseModel {
    group_number: number;
    order_id: string;
    agency_organization_id: string;
    status: string;
    subtotal_amount: number;
    accepted_at: string | null;
    rejected_at: string | null;
    accepted_by_user_id: string | null;
    response_notes: string | null;
    rejection_reason: string | null;
    order?: Order;
    shippingAgencyOrganization?: Organization;
    services?: Service[];
    acceptedByUser?: User;
}

export interface WizardSession extends BaseModel {
    user_id: string;
    session_token?: string;
    current_step?: number;
    data: {
        current_step: number;
        vessel_id?: string;
        port_id?: string;
        selected_categories?: string[];
        selected_services?: Record<string, { service_id: string; quantity: number; }[]>;
    };
    expires_at: string;
    user?: User;
}

export interface Order extends OrderBase {
    total_amount?: number;
    vessel?: Vessel;
    port?: Port;
    placedByUser?: User;
    placedByOrganization?: Organization;
    orderGroups?: OrderGroup[];
    services?: Service[];
}

// Legacy interface for backward compatibility
export interface OrderWithRelations extends Order {}
