import { LucideIcon } from 'lucide-react';

import type { Config } from 'ziggy-js';
import { OnboardingStatus, OrganizationBusinessType, UserRoles } from '@/types/enums';

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
    permissions: {
        service: PolicyAbilities;
        order: PolicyAbilities;
        order_group: PolicyAbilities;
        vessel: PolicyAbilities;
        port: PolicyAbilities;
        organization: PolicyAbilities;
    };
}

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    email_verified_at: string | null;
    onboarding_status: OnboardingStatus;
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

interface PolicyAbilities {
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
    badge?: string;
}

// Organization Search Types
export interface SearchableOrganization {
    id: string;
    name: string;
    slug: string;
    business_type: OrganizationBusinessType;
    description?: string;
    member_count: number;
    created_at: string;
    updated_at: string;
}

export interface OrganizationSearchFilters {
    query?: string;
    business_type?: OrganizationBusinessType;
    location?: string;
}

export interface OrganizationSearchResponse {
    data: SearchableOrganization[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
}

export interface JoinRequest {
    id: string;
    user_id: string;
    organization_id: string;
    message?: string;
    status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
    admin_notes?: string;
    approved_by?: string;
    approved_at?: string;
    rejected_by?: string;
    rejected_at?: string;
    created_at: string;
    updated_at: string;
    user?: Pick<User, 'id' | 'first_name' | 'last_name' | 'email'>;
    organization?: Pick<SearchableOrganization, 'id' | 'name' | 'business_type'>;
}

export interface Invitation {
    id: string;
    type: 'user_invitation' | 'organization_invitation';
    email: string;
    invited_by_user_id: string;
    organization_id: string;
    role: UserRoles;
    status: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';
    token: string;
    expires_at: string;
    created_at: string;
    updated_at: string;
    metadata?: Record<string, unknown>;
    invited_by_user?: Pick<User, 'id' | 'first_name' | 'last_name' | 'email'>;
    organization?: Pick<SearchableOrganization, 'id' | 'name' | 'business_type'>;
}

export interface InvitationStatistics {
    total: number;
    pending: number;
    accepted: number;
    declined: number;
    expired: number;
    cancelled: number;
    pending_expired: number;
}

// Generic pagination interface for Laravel paginated responses
export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}
