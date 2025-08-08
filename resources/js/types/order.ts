export type Order = {
    id: string;
    order_number: string;
    vessel_id: string;
    port_id: string;
    placed_by_user_id: string;
    placed_by_organization_id: string;
    notes: string;
    status: string;
    created_at: string;
    updated_at: string;
    vessel: {
        id: string;
        organization_id: string;
        name: string;
        imo_number: string;
        vessel_type: string;
        status: string;
        created_at: string;
        updated_at: string;
    };
    port: {
        id: string;
        name: string;
        code: string;
        status: string;
        country: string;
        city: string;
        latitude: string;
        longitude: string;
        timezone: string;
        created_at: string;
        updated_at: string;
    };
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
    placed_by_organization: {
        id: string;
        name: string;
        registration_code: string;
        business_type: string;
        created_at: string;
        updated_at: string;
    };
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
        organization: {
            id: string;
            name: string;
            registration_code: string;
            business_type: string;
            created_at: string;
            updated_at: string;
        };
    }[];
};
