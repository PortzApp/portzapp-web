import type { IconName } from '@/lib/icons';

export interface KPIItem {
    label: string;
    value: string | number;
    icon: IconName;
}

export interface Order {
    id: string;
    vessel_name?: string;
    port_name?: string;
    client_name?: string;
    status: string;
    total_price: number;
    created_at: string;
}

export interface ChartDataPoint {
    month: string;
    orders: number;
}

export interface RevenueDataPoint {
    month: string;
    revenue: number;
}

export interface OrganizationDistributionPoint {
    type: string;
    count: number;
}

export interface VesselOwnerDashboardData {
    kpis: KPIItem[];
    recentOrders: Order[];
    orderTrends: ChartDataPoint[];
}

export interface ShippingAgencyDashboardData {
    kpis: KPIItem[];
    recentOrderRequests: Order[];
    revenueTrends: RevenueDataPoint[];
}

export interface PortzAppTeamDashboardData {
    kpis: KPIItem[];
    systemActivity: ChartDataPoint[];
    orgDistribution: OrganizationDistributionPoint[];
}