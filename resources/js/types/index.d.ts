import { UserRoles } from '@/types/core';
import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
    can: {
        create_services: boolean;
    };
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

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;

    [key: string]: unknown;
}

export interface Organization {
    id: number;
    name: string;
    business_type: string;
    registration_code: string;
    role: UserRoles;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    current_organization: Organization | null;
    organizations: Organization[] | null;

    [key: string]: unknown; // This allows for additional properties...
}
