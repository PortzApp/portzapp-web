import { LucideIcon } from 'lucide-react';

import type { Config } from 'ziggy-js';
import { OrganizationBusinessType, UserRoles } from '@/types/enums';

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;

    [key: string]: unknown;
}

interface Auth {
    user: User;
    can: {
        create_services: boolean;
        orders: PolicyRules;
        vessels: PolicyRules;
        ports: PolicyRules;
    };
}

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    email_verified_at: string | null;
    current_organization: Organization | null;
    organizations: Organization[] | null;
    avatar: string | null;
    created_at: string;
    updated_at: string;

    [key: string]: unknown; // This allows for additional properties...
}

interface Organization {
    id: number;
    name: string;
    business_type: OrganizationBusinessType;
    registration_code: string;
    role: UserRoles;
    created_at: string;
    updated_at: string;
}

interface PolicyRules {
    view_any: boolean;
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}
