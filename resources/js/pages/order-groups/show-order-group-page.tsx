import { useEffect, useState } from 'react';

import { Head, router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

import type { BreadcrumbItem, SharedData } from '@/types';
import { OrderGroupServiceStatus, OrderGroupStatus } from '@/types/enums';
import { OrderBase, OrderGroup, OrderGroupService, OrderWithRelations } from '@/types/models';

import AppLayout from '@/layouts/app-layout';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

import { VesselTypeBadge } from '@/components/badges';
import { OrderGroupServiceStatusBadge } from '@/components/badges/order-group-service-status-badge';
import { OrderGroupStatusBadge } from '@/components/badges/order-group-status-badge';
import { OrderStatusBadge } from '@/components/badges/order-status-badge';

interface OrderGroupEvent {
    message: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    timestamp: string;
}

interface OrderGroupUpdatedEvent extends OrderGroupEvent {
    orderGroup: OrderGroup;
}

interface OrderGroupServiceUpdatedEvent extends OrderGroupEvent {
    orderGroupService: OrderGroupService & {
        order_id?: string;
        order_group_id: string;
    };
}

interface OrderUpdatedEvent extends OrderGroupEvent {
    order: OrderWithRelations;
}

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
    orderGroup: initialOrderGroup,
    parentOrder: initialParentOrder,
    siblingOrderGroups: initialSiblingOrderGroups,
}: {
    orderGroup: OrderGroup;
    parentOrder: OrderBase;
    siblingOrderGroups: OrderGroup[];
}) {
    const { auth } = usePage<SharedData>().props;
    const [orderGroup, setOrderGroup] = useState(initialOrderGroup);
    const [parentOrder, setParentOrder] = useState(initialParentOrder);
    const [siblingOrderGroups, setSiblingOrderGroups] = useState(initialSiblingOrderGroups);

    // Sync new props back to local state after server refetch
    useEffect(() => {
        setOrderGroup(initialOrderGroup);
        setParentOrder(initialParentOrder);
        setSiblingOrderGroups(initialSiblingOrderGroups);
    }, [initialOrderGroup, initialParentOrder, initialSiblingOrderGroups]);

    const breadcrumbs = getBreadcrumbs(orderGroup);

    // Listen for order group updated events on static channel
    useEcho<OrderGroupUpdatedEvent>('order-groups.updated', 'OrderGroupUpdated', ({ orderGroup: updatedOrderGroup }) => {
        // Update main order group if it's the current one
        if (updatedOrderGroup.id === orderGroup.id) {
            setOrderGroup((prevOrderGroup) => ({
                ...prevOrderGroup,
                status: updatedOrderGroup.status,
                updated_at: updatedOrderGroup.updated_at,
            }));

            toast('Order group updated', {
                description: `Order group #${updatedOrderGroup.group_number} status changed to ${updatedOrderGroup.status?.replace(/_/g, ' ')}`,
                classNames: {
                    description: '!text-muted-foreground',
                },
            });
        }

        // Update sibling order groups if one of them updated
        const isSibling = siblingOrderGroups.some((og) => og.id === updatedOrderGroup.id);
        if (isSibling) {
            setSiblingOrderGroups((prevSiblings) =>
                prevSiblings.map((sibling) =>
                    sibling.id === updatedOrderGroup.id
                        ? {
                              ...sibling,
                              status: updatedOrderGroup.status,
                              updated_at: updatedOrderGroup.updated_at,
                          }
                        : sibling,
                ),
            );

            toast('Related order group updated', {
                description: `Order group #${updatedOrderGroup.group_number} status changed to ${updatedOrderGroup.status?.replace(/_/g, ' ')}`,
                classNames: {
                    description: '!text-muted-foreground',
                },
                action: {
                    label: 'View Order Group',
                    onClick: () => {
                        router.visit(route('order-groups.show', updatedOrderGroup.id));
                    },
                },
            });
        }
    });

    // Listen for order group service updated events on static channel
    useEcho<OrderGroupServiceUpdatedEvent>(
        'order-group-services.updated',
        'OrderGroupServiceUpdated',
        ({ orderGroupService: updatedOrderGroupService }) => {
            // Check if this service belongs to the current order group
            const belongsToCurrentOrderGroup = orderGroup.order_group_services?.some((ogs) => ogs.id === updatedOrderGroupService.id);

            if (belongsToCurrentOrderGroup) {
                setOrderGroup((prevOrderGroup) => ({
                    ...prevOrderGroup,
                    order_group_services: prevOrderGroup.order_group_services?.map((service) =>
                        service.id === updatedOrderGroupService.id
                            ? {
                                  ...service,
                                  status: updatedOrderGroupService.status,
                                  updated_at: updatedOrderGroupService.updated_at,
                              }
                            : service,
                    ),
                }));

                toast('Service updated', {
                    description: `Service status changed to ${updatedOrderGroupService.status?.replace(/_/g, ' ')}`,
                    classNames: {
                        description: '!text-muted-foreground',
                    },
                });
            }
        },
    );

    // Listen for parent order updated events on static channel
    useEcho<OrderUpdatedEvent>('orders.updated', 'OrderUpdated', ({ order: updatedOrder }) => {
        if (updatedOrder.id === parentOrder.id) {
            setParentOrder((prevParentOrder) => ({
                ...prevParentOrder,
                status: updatedOrder.status,
                updated_at: updatedOrder.updated_at,
            }));

            toast('Parent order updated', {
                description: `Order #${updatedOrder.order_number} status changed to ${updatedOrder.status?.replace(/_/g, ' ')}`,
                classNames: {
                    description: '!text-muted-foreground',
                },
                action: {
                    label: 'View Order',
                    onClick: () => {
                        router.visit(route('orders.show', updatedOrder.id));
                    },
                },
            });
        }
    });

    // Calculate total price from order_group_services
    const totalPrice = orderGroup.order_group_services?.reduce((sum, ogs) => sum + parseFloat(ogs.price_snapshot.toString()), 0) || 0;

    const canAccept = orderGroup.status === OrderGroupStatus.PENDING;
    const canReject = orderGroup.status === OrderGroupStatus.PENDING;
    const canStart = orderGroup.status === OrderGroupStatus.ACCEPTED;
    const canComplete = orderGroup.status === OrderGroupStatus.IN_PROGRESS;

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

    const handleOrderGroupStatusChange = (status: OrderGroupStatus) => {
        const routes: Record<OrderGroupStatus, string> = {
            [OrderGroupStatus.PENDING]: '', // Not used, but needed for type completeness
            [OrderGroupStatus.ACCEPTED]: route('order-groups.accept', orderGroup.id),
            [OrderGroupStatus.REJECTED]: route('order-groups.reject', orderGroup.id),
            [OrderGroupStatus.IN_PROGRESS]: route('order-groups.start', orderGroup.id),
            [OrderGroupStatus.COMPLETED]: route('order-groups.complete', orderGroup.id),
        };

        const targetRoute = routes[status];
        if (targetRoute) {
            router.post(targetRoute);
        }
    };

    const handleOrderGroupServiceStatusChange = (orderGroupServiceId: string, status: OrderGroupServiceStatus) => {
        router.patch(route('order-group-services.status.update', orderGroupServiceId), {
            status: status,
        });
    };

    const getValidOrderGroupStatusTransitions = (currentStatus: OrderGroupStatus): OrderGroupStatus[] => {
        switch (currentStatus) {
            case OrderGroupStatus.PENDING:
                return [OrderGroupStatus.ACCEPTED, OrderGroupStatus.REJECTED];
            case OrderGroupStatus.ACCEPTED:
                return [OrderGroupStatus.IN_PROGRESS];
            case OrderGroupStatus.IN_PROGRESS:
                return [OrderGroupStatus.COMPLETED];
            default:
                return [];
        }
    };

    const getOrderGroupStatusLabel = (status: OrderGroupStatus): string => {
        switch (status) {
            case OrderGroupStatus.PENDING:
                return 'Pending';
            case OrderGroupStatus.ACCEPTED:
                return 'Accepted';
            case OrderGroupStatus.REJECTED:
                return 'Rejected';
            case OrderGroupStatus.IN_PROGRESS:
                return 'In Progress';
            case OrderGroupStatus.COMPLETED:
                return 'Completed';
            default:
                return status;
        }
    };

    const getOrderGroupServiceStatusLabel = (status: OrderGroupServiceStatus): string => {
        switch (status) {
            case OrderGroupServiceStatus.PENDING:
                return 'Pending';
            case OrderGroupServiceStatus.ACCEPTED:
                return 'Accepted';
            case OrderGroupServiceStatus.REJECTED:
                return 'Rejected';
            case OrderGroupServiceStatus.IN_PROGRESS:
                return 'In Progress';
            case OrderGroupServiceStatus.COMPLETED:
                return 'Completed';
            default:
                return status;
        }
    };

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
                    <div className="flex items-center gap-2">
                        <OrderGroupStatusBadge status={orderGroup.status} />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <MoreVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {getValidOrderGroupStatusTransitions(orderGroup.status).map((status) => (
                                    <DropdownMenuItem key={status} onClick={() => handleOrderGroupStatusChange(status)}>
                                        Mark as {getOrderGroupStatusLabel(status)}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
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
                                <OrderStatusBadge status={parentOrder.status} />
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

                    {/* OrderGroupServices */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Services ({orderGroup.order_group_services?.length || 0})</CardTitle>
                            <CardDescription>Services assigned to your agency for this order</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {orderGroup.order_group_services?.map((orderGroupService) => (
                                    <div key={orderGroupService.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium">
                                                    {orderGroupService.service?.sub_category?.name || orderGroupService.service?.name || 'Service'}
                                                </h4>
                                                <OrderGroupServiceStatusBadge status={orderGroupService.status} />
                                            </div>
                                            {orderGroupService.service?.description && (
                                                <p className="text-sm text-muted-foreground">{orderGroupService.service.description}</p>
                                            )}
                                            {orderGroupService.notes && (
                                                <p className="text-sm text-muted-foreground italic">Notes: {orderGroupService.notes}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-right">
                                                <p className="font-bold tabular-nums">
                                                    ${parseFloat(orderGroupService.price_snapshot.toString()).toFixed(2)}
                                                </p>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger>Update Status</DropdownMenuSubTrigger>
                                                        <DropdownMenuSubContent>
                                                            {Object.values(OrderGroupServiceStatus).map((status) => (
                                                                <DropdownMenuItem
                                                                    key={status}
                                                                    onClick={() => handleOrderGroupServiceStatusChange(orderGroupService.id, status)}
                                                                    disabled={status === orderGroupService.status}
                                                                >
                                                                    {getOrderGroupServiceStatusLabel(status)}
                                                                </DropdownMenuItem>
                                                            ))}
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuSub>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
                                                <OrderGroupStatusBadge status={group.status} />
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {group.order_group_services?.length || 0} services
                                                </p>
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
