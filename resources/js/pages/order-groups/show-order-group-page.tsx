import { Head, router } from '@inertiajs/react';

import type { BreadcrumbItem } from '@/types';
import { OrderBase, OrderGroup } from '@/types/models';

import { cn } from '@/lib/utils';

import AppLayout from '@/layouts/app-layout';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { VesselTypeBadge } from '@/components/badges';

const getBreadcrumbs = (orderGroup: OrderGroup): BreadcrumbItem[] => [
    {
        title: 'Order Groups',
        href: route('order-groups.index'),
    },
    {
        title: orderGroup.group_number,
        href: route('order-groups.show', orderGroup.id),
    },
];

export default function ShowOrderGroupPage({
    orderGroup,
    parentOrder,
    siblingOrderGroups,
}: {
    orderGroup: OrderGroup;
    parentOrder: OrderBase;
    siblingOrderGroups: OrderGroup[];
}) {
    const breadcrumbs = getBreadcrumbs(orderGroup);
    
    // Calculate total price from services
    const totalPrice = orderGroup.services?.reduce((sum, service) => sum + parseFloat(service.price), 0) || 0;

    const canAccept = orderGroup.status === 'pending';
    const canReject = orderGroup.status === 'pending';
    const canStart = orderGroup.status === 'accepted';
    const canComplete = orderGroup.status === 'in_progress';

    const handleAccept = () => {
        router.post(route('order-groups.accept', orderGroup.id));
    };

    const handleReject = () => {
        router.post(route('order-groups.reject', orderGroup.id));
    };

    const handleStart = () => {
        router.post(route('order-groups.start', orderGroup.id));
    };

    const handleComplete = () => {
        router.post(route('order-groups.complete', orderGroup.id));
    };

    const getStatusBadge = (status: string) => (
        <Badge
            className={cn(
                status === 'pending' && 'bg-yellow-200 text-yellow-950 dark:bg-yellow-900 dark:text-yellow-50',
                status === 'accepted' && 'bg-blue-200 text-blue-950 dark:bg-blue-900 dark:text-blue-50',
                status === 'rejected' && 'bg-red-200 text-red-950 dark:bg-red-900 dark:text-red-50',
                status === 'in_progress' && 'bg-purple-200 text-purple-950 dark:bg-purple-900 dark:text-purple-50',
                status === 'completed' && 'bg-green-200 text-green-950 dark:bg-green-900 dark:text-green-50',
            )}
        >
            {status.replace(/_/g, ' ')}
        </Badge>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order Group ${orderGroup.group_number}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{orderGroup.group_number}</h1>
                        <p className="text-muted-foreground">Order group assigned to your agency</p>
                    </div>
                    <div className="flex items-center gap-2">{getStatusBadge(orderGroup.status)}</div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                    {canAccept && (
                        <Button onClick={handleAccept} variant="default" className="bg-green-600 hover:bg-green-700">
                            Accept Order Group
                        </Button>
                    )}
                    {canReject && (
                        <Button onClick={handleReject} variant="destructive">
                            Reject Order Group
                        </Button>
                    )}
                    {canStart && (
                        <Button onClick={handleStart} className="bg-blue-600 hover:bg-blue-700">
                            Start Work
                        </Button>
                    )}
                    {canComplete && (
                        <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                            Mark as Completed
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Parent Order Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Parent Order Details</CardTitle>
                            <CardDescription>Information about the main order this group belongs to</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="font-medium">Order Number:</span>
                                <span>{parentOrder.order_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Status:</span>
                                {getStatusBadge(parentOrder.status)}
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="font-medium">Placed by:</span>
                                    <span>
                                        {orderGroup.order.placed_by_user.first_name} {orderGroup.order.placed_by_user.last_name}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Organization:</span>
                                    <span>{orderGroup.order.placed_by_organization.name}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vessel & Port Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Vessel & Port</CardTitle>
                            <CardDescription>Details about the vessel and destination port</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">Vessel:</span>
                                    <div className="flex items-center gap-2">
                                        <VesselTypeBadge type={orderGroup.order.vessel.vessel_type} iconOnly />
                                        <span>{orderGroup.order.vessel.name}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">IMO Number:</span>
                                    <span>{orderGroup.order.vessel.imo_number}</span>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="font-medium">Port:</span>
                                    <span>{orderGroup.order.port.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Location:</span>
                                    <span>
                                        {orderGroup.order.port.city}, {orderGroup.order.port.country}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Services */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Services ({orderGroup.services?.length || 0})</CardTitle>
                            <CardDescription>Services assigned to your agency for this order</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {orderGroup.services?.map((service) => (
                                    <div key={service.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                                        <div>
                                            <h4 className="font-medium">{service.name}</h4>
                                            {service.description && <p className="text-sm text-muted-foreground">{service.description}</p>}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold tabular-nums">${parseFloat(service.price).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}

                                <Separator />

                                <div className="flex items-center justify-between text-lg font-bold">
                                    <span>Total Price:</span>
                                    <span className="tabular-nums">${totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Other Order Groups (for context) */}
                    {siblingOrderGroups.length > 0 && (
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Other Groups in this Order</CardTitle>
                                <CardDescription>Other agencies also working on this order (for your information only)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3">
                                    {siblingOrderGroups.map((group) => (
                                        <div key={group.id} className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                                            <div>
                                                <p className="font-medium">{group.group_number}</p>
                                                <p className="text-sm text-muted-foreground">{group.fulfilling_organization.name}</p>
                                            </div>
                                            <div className="text-right">
                                                {getStatusBadge(group.status)}
                                                <p className="mt-1 text-sm text-muted-foreground">{group.services?.length || 0} services</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Notes */}
                    {orderGroup.notes && (
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>{orderGroup.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
