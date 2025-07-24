export enum UserRoles {
    VESSEL_OWNER = 'vessel_owner',
    SHIPPING_AGENCY = 'shipping_agency',
    ADMIN = 'admin',
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
    role: UserRoles;

    [key: string]: unknown;
}

export interface Organization extends BaseModel {
    name: string;
    registration_code: string;
}

export interface Service extends BaseModel {
    name: string;
    description: string | null;
    price: string;
    status: 'active' | 'inactive';
    user_id: number;
}

export interface Order extends BaseModel {
    service_id: number;
    vessel_owner_id: number;
    price: number;
    notes?: string;
    status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
}

// Generic type for adding relationships
export type WithRelation<T, K extends string, R> = T & Record<K, R>;

// Specific relationship types
export type UserWithOrganization = WithRelation<User, 'organization', Organization>;
export type ServiceWithUser<U = User> = WithRelation<Service, 'user', U>;
export type OrderWithService<S = Service> = WithRelation<Order, 'service', S>;
export type OrderWithVesselOwner<U = User> = WithRelation<Order, 'vessel_owner', U>;

// Complex compositions
export type ServiceWithUserAndOrganization = ServiceWithUser<UserWithOrganization>;
export type OrderWithFullService = OrderWithService<ServiceWithUserAndOrganization>;
export type OrderWithFullRelations = OrderWithFullService & OrderWithVesselOwner<UserWithOrganization>;
