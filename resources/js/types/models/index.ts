import { OrderGroupStatus, OrderStatus, OrganizationBusinessType, ServiceStatus, UserRoles, VesselStatus, VesselType } from '@/types/enums';

export interface BaseModel {
    id: string;
    created_at: string;
    updated_at: string;
}

export interface User extends BaseModel {
    first_name: string;
    last_name: string;
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
    services_count?: number;
}

export interface Service extends BaseModel {
    description: string | null;
    price: string;
    status: ServiceStatus;
    organization_id: string;
    port_id: string;
    service_sub_category_id: string;
    organization?: Organization;
    port?: Port;
    sub_category?: ServiceSubCategory;
    category?: ServiceCategory; // Computed accessor from sub_category.category
    order_service?: {
        order_id: string;
        service_id: string;
        created_at: string;
        updated_at: string;
    };
}

export interface ServiceCategory extends BaseModel {
    name: string;
    services_count?: number;
    sub_categories?: ServiceSubCategory[];
}

export interface ServiceSubCategory extends BaseModel {
    name: string;
    description?: string | null;
    sort_order?: number;
    service_category_id: string;
    category?: ServiceCategory;
    services_count?: number;
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

export interface OrderGroupBase extends BaseModel {
    group_number: string;
    order_id: string;
    fulfilling_organization_id: string;
    status: OrderGroupStatus;
    notes: string | null;
}

export interface OrderGroup extends OrderGroupBase {
    order: OrderWithRelations;
    fulfilling_organization: Organization;
    services: Service[];
    total_price: number;
}

export interface OrderWithRelations extends OrderBase {
    vessel: Vessel;
    port: Port;
    placed_by_user: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        phone_number: string;
        email_verified_at: string;
        created_at: string;
        updated_at: string;
        current_organization_id: string | null;
    };
    placed_by_organization: Organization;
    order_groups?: OrderGroup[];
    all_services?: Service[];
    total_price?: number;
    aggregated_status?: OrderStatus;
    services: {
        id: string;
        organization_id: string;
        port_id: string;
        service_sub_category_id: string;
        name: string;
        description: string;
        price: string;
        status: string;
        created_at: string;
        updated_at: string;
        order_service: {
            order_id: string;
            service_id: string;
            created_at: string;
            updated_at: string;
        };
        organization: Organization;
        sub_category?: ServiceSubCategory;
        category?: ServiceCategory;
    }[];
}
