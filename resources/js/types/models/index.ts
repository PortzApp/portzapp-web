import {
    InvitationStatus,
    JoinRequestStatus,
    OrderGroupServiceStatus,
    OrderGroupStatus,
    OrderStatus,
    OrganizationBusinessType,
    ServiceStatus,
    UserRoles,
    VesselStatus,
    VesselType,
} from '@/types/enums';

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
    description?: string;
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
    grt: number | null;
    nrt: number | null;
    dwt: number | null; // stored in kg
    loa: number | null; // stored in mm
    beam: number | null; // stored in mm
    draft: number | null; // stored in mm
    build_year: number | null;
    mmsi: string | null;
    call_sign: string | null;
    flag_state: string | null;
    remarks: string | null;
    // Computed accessors for display
    dwt_in_tons?: number | null;
    loa_in_meters?: number | null;
    beam_in_meters?: number | null;
    draft_in_meters?: number | null;
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
    sub_categories_count?: number;
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

// Type for category with sub-categories and counts for filtering UI
export interface ServiceCategoryWithSubCategories extends ServiceCategory {
    sub_categories: ServiceSubCategoryWithCount[];
}

export interface ServiceSubCategoryWithCount extends ServiceSubCategory {
    services_count: number;
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

export interface OrderGroupService extends BaseModel {
    order_group_id: string;
    service_id: string;
    status: OrderGroupServiceStatus;
    notes: string | null;
    price_snapshot: number;
    order_group?: OrderGroup;
    service?: Service;
}

export interface OrderGroup extends OrderGroupBase {
    order: OrderWithRelations;
    fulfilling_organization: Organization;
    order_group_services: OrderGroupService[];
    services: Service[]; // Kept for backward compatibility during transition
    total_price: number;
    chat_conversation?: ChatConversation;
}

// Chat system interfaces
export interface ChatMessageRead extends BaseModel {
    message_id: string;
    user_id: string;
    read_at: string;
}

export interface ChatMessage extends BaseModel {
    conversation_id: string;
    user_id: string;
    parent_message_id: string | null;
    message: string;
    message_type: string;
    delivered_at: string;
    edited_at: string | null;
    deleted_at: string | null;
    user?: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    reads?: ChatMessageRead[];
    parent_message?: ChatMessage;
}

export interface ChatParticipant extends BaseModel {
    conversation_id: string;
    user_id: string;
    organization_id: string;
    joined_at: string;
    left_at: string | null;
    last_read_at: string | null;
    unread_count: number;
    user?: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    organization?: {
        id: string;
        name: string;
    };
}

export interface ChatConversation extends BaseModel {
    order_group_id: string;
    last_message_id: string | null;
    last_message_at: string | null;
    messages?: ChatMessage[];
    participants?: ChatParticipant[];
    last_message?: ChatMessage;
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

export interface OrganizationJoinRequest extends BaseModel {
    user_id: string;
    organization_id: string;
    message: string | null;
    status: JoinRequestStatus;
    admin_notes: string | null;
    approved_by: string | null;
    approved_at: string | null;
    rejected_by: string | null;
    rejected_at: string | null;
    user: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        phone_number: string | null;
    };
}

export interface Invitation extends BaseModel {
    organization_id: string;
    email: string;
    role: UserRoles;
    status: InvitationStatus;
    token: string;
    message: string | null;
    invited_by: string;
    expires_at: string;
    accepted_at: string | null;
    rejected_at: string | null;
}
