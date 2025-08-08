export enum UserRoles {
    MEMBER = 'member',
    ADMIN = 'admin',
}

export enum OrganizationBusinessType {
    VESSEL_OWNER = 'vessel_owner',
    SHIPPING_AGENCY = 'shipping_agency',
    PLATFORM_ADMIN = 'platform_admin',
}

export interface BaseModel {
    id: number;
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

    [key: string]: unknown;
}

export interface Organization extends BaseModel {
    name: string;
    registration_code: string;
    business_type: OrganizationBusinessType;
}

export interface OrganizationUser {
    user_id: number;
    organization_id: number;
    role: UserRoles;
    created_at: string;
    updated_at: string;
}

export interface Service extends BaseModel {
    name: string;
    description: string | null;
    price: string;
    status: 'active' | 'inactive';
    organization_id: number;
    port_id: number;
    service_category_id: number;
}

export interface Order extends BaseModel {
    requesting_organization_id: number;
    providing_organization_id: number;
    price: number;
    notes?: string;
    status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
}

export interface Vessel extends BaseModel {
    organization_id: number;
    name: string;
    imo_number: string;
    vessel_type: 'cargo' | 'tanker' | 'container';
    status: 'active' | 'inactive' | 'maintenance';
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

export interface ServiceCategory extends BaseModel {
    name: string;
}

// Generic type for adding relationships
export type WithRelation<T, K extends string, R> = T & Record<K, R>;

// Specific relationship types
export type UserWithOrganizations = WithRelation<User, 'organizations', Organization[]>;
export type UserWithPivot = User & { pivot: { role: UserRoles } };
export type OrganizationWithUsers = WithRelation<Organization, 'users', UserWithPivot[]>;
export type ServiceWithOrganization = WithRelation<Service, 'organization', Organization>;
export type ServiceWithPort = WithRelation<Service, 'port', Port>;
export type ServiceWithCategory = WithRelation<Service, 'category', ServiceCategory>;
export type ServiceWithRelations = ServiceWithOrganization & ServiceWithPort & ServiceWithCategory;
export type OrderWithServices<S = Service> = WithRelation<Order, 'services', S[]>;
export type OrderWithVessels<V = Vessel> = WithRelation<Order, 'vessels', V[]>;
export type OrderWithRequestingOrganization = WithRelation<Order, 'requesting_organization', Organization>;
export type OrderWithProvidingOrganization = WithRelation<Order, 'providing_organization', Organization>;
export type VesselWithOrganization = WithRelation<Vessel, 'organization', Organization>;

// Complex compositions
export type ServiceWithFullOrganization = ServiceWithOrganization;
export type VesselWithFullOrganization = VesselWithOrganization;
export type OrderWithFullRelations = OrderWithServices<ServiceWithFullOrganization> &
    OrderWithVessels<VesselWithFullOrganization> &
    OrderWithRequestingOrganization &
    OrderWithProvidingOrganization;
