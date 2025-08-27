import { router } from '@inertiajs/react';
import { ArrowRight, Clock, Package, Plus, Ship } from 'lucide-react';

import type { VesselOwnerDashboardData } from '@/types/dashboard';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { KPICard } from './kpi-card';
import { OrderTrendsChart } from './order-trends-chart';
import { RecentOrdersTable } from './recent-orders-table';

interface VesselOwnerDashboardProps {
    data: VesselOwnerDashboardData;
}

export function VesselOwnerDashboard({ data }: VesselOwnerDashboardProps) {
    const handlePlaceOrder = () => {
        router.visit(route('order-wizard.dashboard'));
    };

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Welcome back!</h1>
                    <p className="text-muted-foreground">Here's what's happening with your fleet</p>
                </div>
                <Button onClick={handlePlaceOrder} size="lg" className="md:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Place New Order
                </Button>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {data.kpis.map((kpi, index) => (
                    <KPICard key={index} label={kpi.label} value={kpi.value} icon={kpi.icon} />
                ))}
            </div>

            {/* Charts and Tables */}
            <div className="grid gap-4 lg:grid-cols-2">
                <OrderTrendsChart data={data.orderTrends} title="Your Order Activity" description="Orders placed over the last 6 months" />

                <Card className="h-full bg-card">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks for vessel management</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col">
                        <div className="grid flex-1 grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                className="group h-full justify-between p-4 transition-colors hover:bg-muted/50"
                                onClick={() => router.visit(route('vessels.index'))}
                            >
                                <div className="flex items-center">
                                    <Ship className="mr-3 h-5 w-5" />
                                    <span className="font-medium transition-all group-hover:underline">Manage Vessels</span>
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
                                    <span className="font-medium transition-all group-hover:underline">View All Orders</span>
                                </div>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="group h-full justify-between p-4 transition-colors hover:bg-muted/50"
                                onClick={() => router.visit(route('orders.index', { status: 'pending' }))}
                            >
                                <div className="flex items-center">
                                    <Clock className="mr-3 h-5 w-5" />
                                    <span className="font-medium transition-all group-hover:underline">Pending Orders</span>
                                </div>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="group h-full justify-between p-4 transition-colors hover:bg-muted/50"
                                onClick={handlePlaceOrder}
                            >
                                <div className="flex items-center">
                                    <Plus className="mr-3 h-5 w-5" />
                                    <span className="font-medium transition-all group-hover:underline">Place New Order</span>
                                </div>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <RecentOrdersTable orders={data.recentOrders} title="Your Recent Orders" description="Latest orders you've placed" />
        </div>
    );
}
