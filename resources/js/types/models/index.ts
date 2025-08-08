import { OrderStatus, OrganizationBusinessType, ServiceStatus, VesselStatus, VesselType } from '@/types/enums';

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
}

export interface Service extends BaseModel {
    name: string;
    description: string | null;
    price: string;
    status: ServiceStatus;
    organization_id: number;
    port_id: number;
    service_category_id: number;
}

export interface ServiceCategory extends BaseModel {
    name: string;
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
    services: {
        id: string;
        organization_id: string;
        port_id: string;
        service_category_id: string;
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
    }[];
}
