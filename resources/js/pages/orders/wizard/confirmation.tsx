import { useEffect } from 'react';

import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle, Ship, MapPin, Building2, Package, ExternalLink, ArrowRight, Eye, RefreshCw } from 'lucide-react';

import { OrderWithRelations } from '@/types/models';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface OrderConfirmationPageProps {
    order: OrderWithRelations;
}

export default function OrderConfirmationPage({ order }: OrderConfirmationPageProps) {
    // Clear wizard state on confirmation
    useEffect(() => {
        // Optional: Clear any remaining wizard state in localStorage/sessionStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('wizard-session');
        }
    }, []);

    const totalOrderGroups = order.order_groups?.length || 0;
    const totalServices = order.services?.length || 0;
    const uniqueAgencies = new Set(order.order_groups?.map(g => g.shipping_agency_organization?.id)).size;

    return (
        <>
            <Head title="Order Confirmation - Order Created Successfully" />

            <AppLayout>
                <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
                    <div className="mx-auto max-w-4xl space-y-8">
                        {/* Success Header */}
                        <div className="text-center space-y-4">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-green-800">Order Created Successfully!</h1>
                                <p className="text-lg text-muted-foreground mt-2">
                                    Your order has been submitted and distributed to the agencies
                                </p>
                            </div>
                        </div>

                        {/* Order Overview */}
                        <Card className="border-green-200 bg-green-50/50">
                            <CardHeader className="text-center pb-4">
                                <CardTitle className="text-xl text-green-800">
                                    Order #{order.order_number}
                                </CardTitle>
                                <CardDescription className="text-base">
                                    Created on {new Date(order.created_at).toLocaleDateString()} at{' '}
                                    {new Date(order.created_at).toLocaleTimeString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-4 text-center">
                                    <div className="space-y-2">
                                        <div className="text-2xl font-bold text-green-600">{totalOrderGroups}</div>
                                        <div className="text-sm text-muted-foreground">Order Groups</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-2xl font-bold text-blue-600">{uniqueAgencies}</div>
                                        <div className="text-sm text-muted-foreground">Agencies</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-2xl font-bold text-purple-600">{totalServices}</div>
                                        <div className="text-sm text-muted-foreground">Services</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-2xl font-bold text-orange-600">
                                            ${(order.total_amount || 0).toFixed(2)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Total Value</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Details */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Vessel & Port Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Ship className="h-5 w-5 text-blue-600" />
                                        Vessel & Port Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Vessel</div>
                                        <div className="font-semibold">{order.vessel?.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            IMO: {order.vessel?.imo_number} • {order.vessel?.organization?.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground font-mono mt-1">
                                            ID: {order.vessel_id}
                                        </div>
                                    </div>
                                    <Separator />
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Destination Port</div>
                                        <div className="font-semibold">{order.port?.name} ({order.port?.code})</div>
                                        <div className="text-sm text-muted-foreground">
                                            {order.port?.city}, {order.port?.country}
                                        </div>
                                        <div className="text-xs text-muted-foreground font-mono mt-1">
                                            ID: {order.port_id}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* System Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-purple-600" />
                                        System Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Order ID</div>
                                        <div className="font-mono text-sm bg-muted p-2 rounded">
                                            {order.id}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Status</div>
                                        <Badge variant="secondary" className="mt-1">
                                            {order.status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Placed By</div>
                                        <div className="text-sm">
                                            {order.placed_by_user?.name} ({order.placed_by_organization?.name})
                                        </div>
                                    </div>
                                    {order.notes && (
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Notes</div>
                                            <div className="text-sm bg-muted p-2 rounded">
                                                {order.notes}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Order Groups Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-orange-600" />
                                    Agency Order Groups
                                </CardTitle>
                                <CardDescription>
                                    Your order has been split into {totalOrderGroups} groups for different agencies
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {order.order_groups?.map((group, index) => (
                                        <Card key={group.id} className="border-l-4 border-l-blue-500">
                                            <CardContent className="pt-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <div className="font-semibold">
                                                            Group #{group.group_number} - {group.shipping_agency_organization?.name}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground font-mono">
                                                            Group ID: {group.id}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-semibold">
                                                            ${(group.subtotal_amount || 0).toFixed(2)}
                                                        </div>
                                                        <Badge variant="outline">
                                                            {group.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                
                                                {/* Services in this group */}
                                                <div className="mt-3">
                                                    <div className="text-sm font-medium text-muted-foreground mb-2">
                                                        Services ({group.services?.length || 0}):
                                                    </div>
                                                    <div className="grid gap-2">
                                                        {group.services?.map((service) => (
                                                            <div key={service.id} className="flex justify-between items-center text-sm bg-muted/50 p-2 rounded">
                                                                <div>
                                                                    <span className="font-medium">{service.name}</span>
                                                                    {service.pivot && (
                                                                        <span className="text-muted-foreground ml-2">
                                                                            (Qty: {service.pivot.quantity})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {service.pivot && (
                                                                    <div className="font-medium">
                                                                        ${(service.pivot.total_price || 0).toFixed(2)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* What happens next */}
                        <Card className="border-blue-200 bg-blue-50/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-800">
                                    <ArrowRight className="h-5 w-5" />
                                    What happens next?
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                                            1
                                        </div>
                                        <div>
                                            <div className="font-medium">Agencies Review</div>
                                            <div className="text-sm text-muted-foreground">
                                                Each agency will review and approve/reject their portion of the order
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                                            2
                                        </div>
                                        <div>
                                            <div className="font-medium">Notifications</div>
                                            <div className="text-sm text-muted-foreground">
                                                You'll receive notifications as agencies respond to your order
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                                            3
                                        </div>
                                        <div>
                                            <div className="font-medium">Service Delivery</div>
                                            <div className="text-sm text-muted-foreground">
                                                Once approved, agencies will coordinate service delivery at the port
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href={route('orders.show', order.id)}>
                                <Button size="lg" className="gap-2">
                                    <Eye className="h-4 w-4" />
                                    View Full Order Details
                                </Button>
                            </Link>
                            <Link href={route('orders.track', order.id)}>
                                <Button variant="outline" size="lg" className="gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    Track Order Status
                                </Button>
                            </Link>
                            <Link href={route('orders.index')}>
                                <Button variant="ghost" size="lg" className="gap-2">
                                    <Package className="h-4 w-4" />
                                    View All Orders
                                </Button>
                            </Link>
                        </div>

                        {/* Debug Information (for development) */}
                        <Card className="border-gray-200 bg-gray-50/50">
                            <CardHeader>
                                <CardTitle className="text-sm text-gray-600">
                                    Debug Information (Development Only)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <pre className="text-xs text-gray-600 bg-white p-3 rounded border overflow-auto max-h-64">
                                    {JSON.stringify({
                                        order_id: order.id,
                                        order_number: order.order_number,
                                        total_groups: totalOrderGroups,
                                        total_services: totalServices,
                                        group_details: order.order_groups?.map(g => ({
                                            id: g.id,
                                            group_number: g.group_number,
                                            agency: g.shipping_agency_organization?.name,
                                            status: g.status,
                                            subtotal: g.subtotal_amount,
                                            services_count: g.services?.length || 0
                                        })),
                                        database_verification: {
                                            order_created: !!order.id,
                                            groups_created: totalOrderGroups > 0,
                                            services_attached: totalServices > 0,
                                            pivot_data_present: order.services?.some(s => s.pivot) || false
                                        }
                                    }, null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
