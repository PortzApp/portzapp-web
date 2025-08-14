import { Port, Service, ServiceCategory, Vessel } from '@/types/models';

export type WizardStep = 'vessel_port' | 'categories' | 'services' | 'review';

export interface OrderWizardSession {
    id: string;
    user_id: string;
    organization_id: string;
    session_name: string;
    vessel_id: string | null;
    port_id: string | null;
    selected_categories: string[] | null;
    selected_services: ServiceSelection[] | null;
    current_step: WizardStep;
    status: 'draft' | 'completed' | 'abandoned';
    completed_at: string | null;
    expires_at: string | null;
    created_at: string;
    updated_at: string;
    vessel?: Vessel;
    port?: Port;
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
