import { Head } from '@inertiajs/react';
import { Ship, MapPin, Building2, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

import { BreadcrumbItem } from '@/types';
import { Order } from '@/types/models';

import AppLayout from '@/layouts/app-layout';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface OrderProgress {
    total: number;
    accepted: number;
    rejected: number;
    pending: number;
    completion_percentage: number;
}

interface TrackOrderPageProps {
    order: Order;
    progress: OrderProgress;
}

export default function TrackOrderPage({ order, progress }: TrackOrderPageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Orders',
            href: route('orders.index'),
        },
        {
            title: `Order ${order.order_number}`,
            href: route('orders.show', order.id),
        },
        {
            title: 'Track Order',
            href: route('orders.track', order.id),
        },
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'accepted':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-600" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-600" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'accepted':
                return <Badge variant="default" className="bg-green-100 text-green-800">Accepted</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>;
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    const getOverallStatus = () => {
        if (progress.rejected > 0) {
            return progress.accepted > 0 ? 'Partially Accepted' : 'Rejected';
        } else if (progress.accepted === progress.total) {
            return 'Fully Accepted';
        } else if (progress.accepted > 0) {
            return 'Partially Accepted';
        } else {
            return 'Pending Review';
        }
    };

    const getOverallStatusColor = () => {
        if (progress.rejected > 0) {
            return progress.accepted > 0 ? 'text-yellow-600' : 'text-red-600';
        } else if (progress.accepted === progress.total) {
            return 'text-green-600';
        } else if (progress.accepted > 0) {
            return 'text-yellow-600';
        } else {
            return 'text-gray-600';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Track Order ${order.order_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Track Order</h1>
                    <p className="text-muted-foreground">Real-time status updates for {order.order_number}</p>
                </div>

                {/* Order Overview */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Ship className="h-4 w-4" />
                                Vessel
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                            <div className="font-medium">{order.vessel?.name}</div>
                            <div className="text-muted-foreground">IMO: {order.vessel?.imo_number}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <MapPin className="h-4 w-4" />
                                Port
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                            <div className="font-medium">{order.port?.name}</div>
                            <div className="text-muted-foreground">{order.port?.city}, {order.port?.country}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Overall Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-lg font-semibold ${getOverallStatusColor()}`}>
                                {getOverallStatus()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {progress.accepted}/{progress.total} agencies responded
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Progress Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Progress Overview</CardTitle>
                        <CardDescription>
                            Track approval status across all {progress.total} shipping agencies
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="mb-2 flex justify-between text-sm">
                                <span>Completion Progress</span>
                                <span>{progress.completion_percentage}%</span>
                            </div>
                            <Progress value={progress.completion_percentage} className="h-3" />
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm">
                                    <span className="font-medium text-green-600">{progress.accepted}</span> Accepted
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm">
                                    <span className="font-medium text-yellow-600">{progress.pending}</span> Pending
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-600" />
                                <span className="text-sm">
                                    <span className="font-medium text-red-600">{progress.rejected}</span> Rejected
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Agency Status Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Agency Status</CardTitle>
                        <CardDescription>
                            Detailed status for each shipping agency group
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {order.orderGroups?.map((group, index) => (
                            <div key={group.id}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <div className="font-medium">
                                                {group.shippingAgencyOrganization?.name}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Group {group.group_number} • {group.services?.length} services • 
                                                ${(group.subtotal_amount / 100).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(group.status)}
                                        {getStatusBadge(group.status)}
                                    </div>
                                </div>

                                {/* Status Details */}
                                <div className="ml-8 mt-2 space-y-2">
                                    {group.status === 'accepted' && group.accepted_at && (
                                        <div className="text-sm text-muted-foreground">
                                            Accepted on {new Date(group.accepted_at).toLocaleDateString()} by {group.acceptedByUser?.name}
                                        </div>
                                    )}
                                    {group.status === 'rejected' && group.rejected_at && (
                                        <div className="text-sm text-muted-foreground">
                                            Rejected on {new Date(group.rejected_at).toLocaleDateString()}
                                            {group.rejection_reason && (
                                                <div className="mt-1 text-red-600">Reason: {group.rejection_reason}</div>
                                            )}
                                        </div>
                                    )}
                                    {group.response_notes && (
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">Notes: </span>
                                            {group.response_notes}
                                        </div>
                                    )}

                                    {/* Services in this group */}
                                    <div className="text-sm">
                                        <div className="text-muted-foreground mb-1">Services:</div>
                                        <div className="space-y-1">
                                            {group.services?.map((service) => (
                                                <div key={service.id} className="flex justify-between">
                                                    <span>{service.name}</span>
                                                    <span className="text-muted-foreground">
                                                        {service.category?.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {index < (order.orderGroups?.length || 0) - 1 && (
                                    <Separator className="mt-4" />
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Order Notes */}
                {order.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">{order.notes}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
