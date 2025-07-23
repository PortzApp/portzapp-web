export type Order = {
    id: number;
    service_id: number;
    vessel_owner_id: number;
    price: number;
    notes?: string;
    status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
    created_at: string;
    updated_at: string;
}
