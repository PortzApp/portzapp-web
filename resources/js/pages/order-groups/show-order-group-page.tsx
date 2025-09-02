import { useEffect, useState } from 'react';

import { Head, router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { Copy, Eye, MessageSquare, MoreVertical, Package, Ship, Tag } from 'lucide-react';
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
import { ServiceCategoryBadge } from '@/components/badges/service-category-badge';

import { ChatTab } from '@/components/chat/chat-tab';

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
    orderGroup: OrderGroup & {
        order_id: string;
    };
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
    const [orderGroup, setOrderGroup] = useState(initialOrderGroup);
    const [parentOrder, setParentOrder] = useState(initialParentOrder);
    const [siblingOrderGroups, setSiblingOrderGroups] = useState(initialSiblingOrderGroups);
    const { auth } = usePage<SharedData>().props;

    // Sync new props back to local state after server refetch
    useEffect(() => {
        setOrderGroup(initialOrderGroup);
        setParentOrder(initialParentOrder);
        setSiblingOrderGroups(initialSiblingOrderGroups);
    }, [initialOrderGroup, initialParentOrder, initialSiblingOrderGroups]);

    const breadcrumbs = getBreadcrumbs(orderGroup);

    // Copy to clipboard function
    const copyToClipboard = async (text: string, type: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(`${type} copied to clipboard!`);
        } catch {
            toast.error(`Failed to copy ${type.toLowerCase()}`);
        }
    };

    // Listen for order group updated events on static channel
    useEcho<OrderGroupUpdatedEvent>('order-groups.updated', 'OrderGroupUpdated', ({ orderGroup: updatedOrderGroup }) => {
        // Update main order group if it's the current one
        if (updatedOrderGroup.id === orderGroup.id) {
            setOrderGroup((prevOrderGroup) => ({
                ...prevOrderGroup,
                status: updatedOrderGroup.status,
                updated_at: updatedOrderGroup.updated_at,
            }));

            toast('Order updated', {
                description: `Order #${updatedOrderGroup.group_number} status changed to ${updatedOrderGroup.status?.replace(/_/g, ' ')}`,
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

            toast('Related order updated', {
                description: `Order #${updatedOrderGroup.group_number} status changed to ${updatedOrderGroup.status?.replace(/_/g, ' ')}`,
                classNames: {
                    description: '!text-muted-foreground',
                },
                action: {
                    label: 'View Order',
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
            <Head title={`Order ${orderGroup.group_number}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{orderGroup.group_number}</h1>
                        <p className="text-muted-foreground">Order assigned to your agency</p>
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
                                <DropdownMenuItem onClick={() => copyToClipboard(orderGroup.id, 'Order ID')}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy Order ID
                                </DropdownMenuItem>
                                {getValidOrderGroupStatusTransitions(orderGroup.status).length > 0 && (
                                    <>
                                        <Separator />
                                        {getValidOrderGroupStatusTransitions(orderGroup.status).map((status) => (
                                            <DropdownMenuItem key={status} onClick={() => handleOrderGroupStatusChange(status)}>
                                                Mark as {getOrderGroupStatusLabel(status)}
                                            </DropdownMenuItem>
                                        ))}
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                    {canAccept && (
                        <Button onClick={handleAccept} variant="default" className="bg-green-600 hover:bg-green-700">
                            Accept Order
                        </Button>
                    )}
                    {canReject && (
                        <Button onClick={handleReject} variant="destructive">
                            Reject Order
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

                {/* Vessel & Port Information */}
                <div>
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                        <Ship className="h-5 w-5" />
                        Vessel & Port Information
                    </h2>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Vessel Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Vessel Information</CardTitle>
                                <CardDescription>Details about the vessel</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
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
                            </CardContent>
                        </Card>

                        {/* Port Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Port Information</CardTitle>
                                <CardDescription>Details about the destination port</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
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
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Service Details */}
                <div>
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                        <Package className="h-5 w-5" />
                        Service Details
                    </h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>Services ({orderGroup.order_group_services?.length || 0})</CardTitle>
                            <CardDescription>Services assigned to your agency for this order</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {orderGroup.order_group_services?.map((orderGroupService) => (
                                    <div key={orderGroupService.id} className="flex items-start justify-between rounded-lg border p-4">
                                        <div className="flex-1">
                                            <div className="mb-2 flex items-center gap-2">
                                                <Tag className="h-4 w-4" />
                                                <h4 className="font-medium">{orderGroupService.service?.sub_category?.name || 'Service'}</h4>
                                                {orderGroupService.service?.sub_category?.category?.name && (
                                                    <ServiceCategoryBadge categoryName={orderGroupService.service.sub_category.category.name} />
                                                )}
                                                <OrderGroupServiceStatusBadge status={orderGroupService.status} />
                                            </div>
                                            {orderGroupService.service?.description && (
                                                <p className="mb-2 text-sm text-muted-foreground">{orderGroupService.service.description}</p>
                                            )}
                                            {orderGroupService.notes && (
                                                <div className="mt-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        <strong>Notes:</strong> {orderGroupService.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <div className="text-lg font-semibold tabular-nums">
                                                    $
                                                    {parseFloat(orderGroupService.price_snapshot.toString()).toLocaleString('en-US', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                        <span className="sr-only">Open menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => router.visit(route('services.show', orderGroupService.service_id))}
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => copyToClipboard(orderGroupService.service_id, 'Service ID')}>
                                                        <Copy className="mr-2 h-4 w-4" />
                                                        Copy service ID
                                                    </DropdownMenuItem>
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
                                    <span className="tabular-nums">
                                        ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Chat Section */}
                <div>
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                        <MessageSquare className="h-5 w-5" />
                        Chat with Vessel Owner
                    </h2>
                    <ChatTab orderGroupId={orderGroup.id} currentUserId={auth.user.id} />
                </div>

                {/* Notes */}
                {orderGroup.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{orderGroup.notes}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
