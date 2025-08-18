import { Port, Service, ServiceCategory, ServiceSubCategory, Vessel } from '@/types/models';

export type WizardStep = 'vessel_port' | 'categories' | 'services' | 'review';

export interface OrderWizardCategorySelection {
    id: string;
    session_id: string;
    service_category_id: string;
    service_sub_category_id?: string;
    order_index: number;
    service_category?: ServiceCategory;
    service_sub_category?: ServiceSubCategory;
}

export interface OrderWizardServiceSelection {
    id: string;
    session_id: string;
    service_category_id: string;
    service_id: string;
    organization_id: string;
    price_snapshot: string;
    notes: string | null;
    service?: Service;
}

export interface OrderWizardSession {
    id: string;
    user_id: string;
    organization_id: string;
    session_name: string;
    vessel_id: string | null;
    port_id: string | null;
    current_step: WizardStep;
    status: 'draft' | 'completed' | 'abandoned';
    completed_at: string | null;
    expires_at: string | null;
    created_at: string;
    updated_at: string;
    vessel?: Vessel;
    port?: Port;
    category_selections?: OrderWizardCategorySelection[];
    service_selections?: OrderWizardServiceSelection[];
}

export interface ServiceSelection {
    id: string;
    name: string;
    price: string;
    description: string | null;
    organization_id: string;
    organization_name: string;
    category_id: string;
    category_name: string;
}

export interface WizardPageData {
    session: OrderWizardSession | null;
    vessels: Vessel[];
    ports: Port[];
    serviceCategories: ServiceCategory[];
    services: Service[];
}
