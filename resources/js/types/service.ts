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
