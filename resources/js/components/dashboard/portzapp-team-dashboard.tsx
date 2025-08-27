import { router } from '@inertiajs/react';
import { Anchor, Building, Plus, Users } from 'lucide-react';

import type { PortzAppTeamDashboardData } from '@/types/dashboard';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { KPICard } from './kpi-card';
import { OrderTrendsChart } from './order-trends-chart';
import { OrganizationDistributionChart } from './organization-distribution-chart';

interface PortzAppTeamDashboardProps {
    data: PortzAppTeamDashboardData;
}

export function PortzAppTeamDashboard({ data }: PortzAppTeamDashboardProps) {
    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">PortzApp Admin</h1>
                    <p className="text-muted-foreground">System overview and platform management</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.visit(route('admin.organizations.create'))}>
                        <Building className="mr-2 h-4 w-4" />
                        Add Organization
                    </Button>
                    <Button onClick={() => router.visit(route('admin.ports.create'))} size="default">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Port
                    </Button>
                </div>
            </div>

            {/* System KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {data.kpis.map((kpi, index) => (
                    <KPICard key={index} label={kpi.label} value={kpi.value} icon={kpi.icon} />
                ))}
            </div>

            {/* System Charts */}
            <div className="grid gap-4 lg:grid-cols-2">
                <OrderTrendsChart data={data.systemActivity} title="Platform Activity" description="System-wide order volume over 6 months" />

                <OrganizationDistributionChart data={data.orgDistribution} />
            </div>

            {/* Admin Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="flex items-center text-lg font-medium">
                                    <Users className="mr-2 h-5 w-5" />
                                    User Management
                                </h3>
                                <p className="text-sm text-muted-foreground">Manage platform users and permissions</p>
                            </div>
                            <div className="grid gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="justify-start"
                                    onClick={() => router.visit(route('admin.users.index'))}
                                >
                                    View All Users
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="justify-start"
                                    onClick={() => router.visit(route('admin.invitations.index'))}
                                >
                                    Manage Invitations
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="flex items-center text-lg font-medium">
                                    <Building className="mr-2 h-5 w-5" />
                                    Organizations
                                </h3>
                                <p className="text-sm text-muted-foreground">Manage organizations and their settings</p>
                            </div>
                            <div className="grid gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="justify-start"
                                    onClick={() => router.visit(route('admin.organizations.index'))}
                                >
                                    All Organizations
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="justify-start"
                                    onClick={() => router.visit(route('admin.join-requests.index'))}
                                >
                                    Join Requests
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="flex items-center text-lg font-medium">
                                    <Anchor className="mr-2 h-5 w-5" />
                                    Platform Settings
                                </h3>
                                <p className="text-sm text-muted-foreground">Manage ports and system configuration</p>
                            </div>
                            <div className="grid gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="justify-start"
                                    onClick={() => router.visit(route('admin.ports.index'))}
                                >
                                    Manage Ports
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="justify-start"
                                    onClick={() => router.visit(route('admin.settings.index'))}
                                >
                                    System Settings
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
