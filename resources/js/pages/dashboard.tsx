import { Head } from '@inertiajs/react';

import type { BreadcrumbItem } from '@/types';
import type { 
    VesselOwnerDashboardData, 
    ShippingAgencyDashboardData, 
    PortzAppTeamDashboardData 
} from '@/types/dashboard';

import AppLayout from '@/layouts/app-layout';
import { VesselOwnerDashboard } from '@/components/dashboard/vessel-owner-dashboard';
import { ShippingAgencyDashboard } from '@/components/dashboard/shipping-agency-dashboard';
import { PortzAppTeamDashboard } from '@/components/dashboard/portzapp-team-dashboard';
import { Card, CardContent } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
];

interface DashboardProps {
    dashboardData: VesselOwnerDashboardData | ShippingAgencyDashboardData | PortzAppTeamDashboardData | null;
    organizationType: 'vessel_owner' | 'shipping_agency' | 'portzapp_team' | null;
}

export default function Dashboard({ dashboardData, organizationType }: DashboardProps) {
    const renderDashboard = () => {
        if (!dashboardData || !organizationType) {
            return (
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">
                            Please select an organization to view your dashboard.
                        </p>
                    </CardContent>
                </Card>
            );
        }

        switch (organizationType) {
            case 'vessel_owner':
                return <VesselOwnerDashboard data={dashboardData as VesselOwnerDashboardData} />;
            case 'shipping_agency':
                return <ShippingAgencyDashboard data={dashboardData as ShippingAgencyDashboardData} />;
            case 'portzapp_team':
                return <PortzAppTeamDashboard data={dashboardData as PortzAppTeamDashboardData} />;
            default:
                return (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <p className="text-muted-foreground">
                                Unknown organization type: {organizationType}
                            </p>
                        </CardContent>
                    </Card>
                );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="max-w-7xl mx-auto w-full">
                    {renderDashboard()}
                </div>
            </div>
        </AppLayout>
    );
}
