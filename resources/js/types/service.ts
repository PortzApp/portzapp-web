import { User, UserWithOrganization } from '@/types/index';

export type Service = {
    id: number;
    name: string;
    description: string | null;
    price: string;
    status: 'active' | 'inactive';
    user_id: number;
    user: {
        id: number;
        name: string;
        email: string;
    };
    created_at: string;
    updated_at: string;
};

export type ServiceWithUser = {
    id: number;
    name: string;
    description: string | null;
    price: string;
    status: 'active' | 'inactive';
    user_id: number;
    user: UserWithOrganization;
    created_at: string;
    updated_at: string;
}
