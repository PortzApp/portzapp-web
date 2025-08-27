import { router } from '@inertiajs/react';
import { ArrowRight, BarChart3, Clock, Package, Plus, Settings } from 'lucide-react';

import type { ShippingAgencyDashboardData } from '@/types/dashboard';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { KPICard } from './kpi-card';
import { RecentOrdersTable } from './recent-orders-table';
import { RevenueChart } from './revenue-chart';

interface ShippingAgencyDashboardProps {
    data: ShippingAgencyDashboardData;
}

export function ShippingAgencyDashboard({ data }: ShippingAgencyDashboardProps) {
    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Agency Dashboard</h1>
                    <p className="text-muted-foreground">Monitor your services and order fulfillment</p>
                </div>
                <Button onClick={() => router.visit(route('services.create'))} size="lg" className="md:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Service
                </Button>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {data.kpis.map((kpi, index) => (
                    <KPICard key={index} label={kpi.label} value={kpi.value} icon={kpi.icon} />
                ))}
            </div>

            {/* Charts and Actions */}
            <div className="grid gap-4 lg:grid-cols-2">
                <RevenueChart data={data.revenueTrends} title="Revenue Performance" description="Revenue from completed orders over 6 months" />

                <Card className="h-full bg-card">
                    <CardHeader>
                        <CardTitle>Service Management</CardTitle>
                        <CardDescription>Manage your services and orders</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col">
                        <div className="grid flex-1 grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                className="group h-full justify-between p-4 transition-colors hover:bg-muted/50"
                                onClick={() => router.visit(route('services.index'))}
                            >
                                <div className="flex items-center">
                                    <Settings className="mr-3 h-5 w-5" />
                                    <span className="font-medium transition-all group-hover:underline">Manage Services</span>
                                </div>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="group h-full justify-between p-4 transition-colors hover:bg-muted/50"
                                onClick={() => router.visit(route('orders.index', { filter: 'pending' }))}
                            >
                                <div className="flex items-center">
                                    <Clock className="mr-3 h-5 w-5" />
                                    <span className="font-medium transition-all group-hover:underline">Pending Requests</span>
                                </div>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="group h-full justify-between p-4 transition-colors hover:bg-muted/50"
                                onClick={() => router.visit(route('orders.index'))}
                            >
                                <div className="flex items-center">
                                    <Package className="mr-3 h-5 w-5" />
                                    <span className="font-medium transition-all group-hover:underline">All Order Requests</span>
                                </div>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="group h-full justify-between p-4 transition-colors hover:bg-muted/50"
                                onClick={() => router.visit(route('analytics.index'))}
                            >
                                <div className="flex items-center">
                                    <BarChart3 className="mr-3 h-5 w-5" />
                                    <span className="font-medium transition-all group-hover:underline">View Analytics</span>
                                </div>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Order Requests */}
            <RecentOrdersTable
                orders={data.recentOrderRequests}
                title="Recent Order Requests"
                description="Latest orders from clients"
                showClientName={true}
                showViewAllLink={true}
                viewAllRoute={route('orders.index')}
                onRowClick={(order) => router.visit(route('orders.show', { order: order.id }))}
            />
        </div>
    );
}
