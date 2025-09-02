import { useEffect, useState } from 'react';

import OrderOverviewTab from '@/pages/orders/components/order-overview-tab';
import OrderServicesGroupedTab from '@/pages/orders/components/order-services-grouped-tab';
// import OrderSystemTab from '@/pages/orders/components/order-system-tab';
import OrderVesselTab from '@/pages/orders/components/order-vessel-tab';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { Edit, LayoutGrid, MapPin, MessageSquare, Package, Ship, Trash2 } from 'lucide-react';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { toast } from 'sonner';

import type { BreadcrumbItem, SharedData } from '@/types';
import { OrderGroup, OrderGroupService, OrderWithRelations } from '@/types/models';

import AppLayout from '@/layouts/app-layout';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ChatConversation } from '@/components/chat/chat-conversation';
import { ChatSelector } from '@/components/chat/chat-selector';

interface OrderEvent {
    message: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    timestamp: string;
}

interface OrderUpdatedEvent extends OrderEvent {
    order: OrderWithRelations;
}

interface OrderGroupUpdatedEvent extends OrderEvent {
    orderGroup: OrderGroup & {
        order_id: string;
    };
}

interface OrderGroupServiceUpdatedEvent extends OrderEvent {
    orderGroupService: OrderGroupService & {
        order_id?: string;
        order_group_id: string;
    };
}

const tabValues = ['overview', 'services', 'vessel', 'chat'] as const;

export default function ShowOrderPage({ order: initialOrder }: { order: OrderWithRelations }) {
    const [order, setOrder] = useState(initialOrder);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedOrderGroupId, setSelectedOrderGroupId] = useState<string | null>(null);
    const { auth } = usePage<SharedData>().props;

    const [activeTab, setActiveTab] = useQueryState(
        'tab',
        parseAsStringLiteral(tabValues).withDefault('overview').withOptions({
            history: 'replace',
            shallow: false,
        }),
    );

    // Sync new props back to local state after server refetch
    useEffect(() => {
        setOrder(initialOrder);
    }, [initialOrder]);

    // Auto-select first order group when chat tab is opened
    useEffect(() => {
        if (activeTab === 'chat' && order.order_groups && order.order_groups.length > 0 && !selectedOrderGroupId) {
            setSelectedOrderGroupId(order.order_groups[0].id);
        }
    }, [activeTab, order.order_groups, selectedOrderGroupId]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Orders',
            href: route('orders.index'),
        },
        {
            title: `Order ID: ${order.id}`,
            href: `/orders/${order.id}`,
        },
    ];

    // Listen for order updated events on static channel
    useEcho<OrderUpdatedEvent>('orders.updated', 'OrderUpdated', ({ order: updatedOrder }) => {
        if (updatedOrder.id === order.id) {
            setOrder((prevOrder) => ({
                ...prevOrder,
                status: updatedOrder.status,
                updated_at: updatedOrder.updated_at,
            }));

            toast('Order updated', {
                description: `Order #${updatedOrder.order_number} status changed to ${updatedOrder.status?.replace(/_/g, ' ')}`,
                classNames: {
                    description: '!text-muted-foreground',
                },
            });
        }
    });

    // Listen for order group updated events on static channel
    useEcho<OrderGroupUpdatedEvent>('order-groups.updated', 'OrderGroupUpdated', ({ orderGroup: updatedOrderGroup }) => {
        // Check if this order group belongs to the current order by checking both order_id and group ID
        const belongsToCurrentOrder = updatedOrderGroup.order_id === order.id || order.order_groups?.some((og) => og.id === updatedOrderGroup.id);

        if (belongsToCurrentOrder) {
            setOrder((prevOrder) => ({
                ...prevOrder,
                order_groups: prevOrder.order_groups?.map((orderGroup) =>
                    orderGroup.id === updatedOrderGroup.id
                        ? {
                              ...orderGroup,
                              status: updatedOrderGroup.status,
                              updated_at: updatedOrderGroup.updated_at,
                          }
                        : orderGroup,
                ),
            }));

            toast('Order group updated', {
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
            // Check if this service belongs to the current order by checking both order_id and service ID
            const belongsToCurrentOrder =
                updatedOrderGroupService.order_id === order.id ||
                order.order_groups?.some((og) => og.order_group_services?.some((ogs) => ogs.id === updatedOrderGroupService.id));

            if (belongsToCurrentOrder) {
                setOrder((prevOrder) => ({
                    ...prevOrder,
                    order_groups: prevOrder.order_groups?.map((orderGroup) => ({
                        ...orderGroup,
                        order_group_services: orderGroup.order_group_services?.map((service) =>
                            service.id === updatedOrderGroupService.id
                                ? {
                                      ...service,
                                      status: updatedOrderGroupService.status,
                                      updated_at: updatedOrderGroupService.updated_at,
                                  }
                                : service,
                        ),
                    })),
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

    function handleDeleteOrder() {
        setOpenDeleteDialog(false);

        router.delete(route('orders.destroy', order.id), {
            onSuccess: () => {
                toast(`Order #${order.id} deleted successfully!`);
            },
        });
    }
    // const totalServicePrice = order.services.reduce((sum, service) => sum + parseFloat(service.price), 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order ${order.order_number}`} />

            <div className="flex min-h-screen flex-col gap-8 bg-neutral-50 p-8 dark:bg-neutral-950">
                <div className="flex flex-shrink-0 items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold">
                            Order: <span className="font-mono text-xl text-muted-foreground">{order.order_number}</span>
                        </h1>
                        <p className="text-base text-muted-foreground">Order details and information</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('orders.edit', order.id)} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Link>
                        <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                            <DialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Delete Order</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to delete order {order.order_number}? This action cannot be undone.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button variant="destructive" onClick={handleDeleteOrder}>
                                        Delete Order
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Tabs
                    value={activeTab}
                    onValueChange={(value) => {
                        if (tabValues.includes(value as (typeof tabValues)[number])) {
                            setActiveTab(value as (typeof tabValues)[number]);
                        }
                    }}
                    className="flex w-full flex-1 flex-col"
                >
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <LayoutGrid className="h-4 w-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="services" className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Services
                            <Badge variant="secondary" className="ml-1">
                                {order.order_groups?.reduce(
                                    (count, group) => count + (group.order_group_services?.length || group.services?.length || 0),
                                    0,
                                ) || 0}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="vessel" className="flex items-center gap-2">
                            <Ship className="h-4 w-4" />
                            Vessel & Port
                            <Badge variant="secondary" className="ml-1">
                                1
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="chat" className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Chat
                            <Badge variant="secondary" className="ml-1">
                                {order.order_groups?.length || 0}
                            </Badge>
                        </TabsTrigger>
                        {/* <TabsTrigger value="system" className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            System Info
                        </TabsTrigger> */}
                    </TabsList>

                    <div className="mt-6 flex flex-1 flex-col">
                        <TabsContent value="overview" className="space-y-4">
                            <OrderOverviewTab order={order} />
                        </TabsContent>

                        <TabsContent value="services" className="space-y-4">
                            <OrderServicesGroupedTab orderGroups={order.order_groups || []} />
                        </TabsContent>

                        <TabsContent value="vessel" className="space-y-4">
                            <OrderVesselTab vessel={order.vessel} />
                            <div className="mt-6">
                                {/* Port Information Card */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-lg font-semibold">
                                        <MapPin className="h-5 w-5" />
                                        Port Information
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        {/* Port Details Card */}
                                        <div className="rounded-lg border p-6 dark:border-neutral-800">
                                            <div className="space-y-4">
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-medium text-muted-foreground">Port Name:</span>
                                                    <span className="text-sm font-semibold">{order.port.name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-medium text-muted-foreground">Port Code:</span>
                                                    <span className="font-mono text-sm">{order.port.code}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-medium text-muted-foreground">Location:</span>
                                                    <span className="text-sm">
                                                        {order.port.city}, {order.port.country}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-medium text-muted-foreground">Status:</span>
                                                    <Badge
                                                        className={
                                                            order.port.status === 'active'
                                                                ? 'bg-green-200 text-green-950 dark:bg-green-900 dark:text-green-50'
                                                                : 'bg-red-200 text-red-950 dark:bg-red-900 dark:text-red-50'
                                                        }
                                                    >
                                                        {order.port.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Port Coordinates */}
                                        <div className="rounded-lg border p-6 dark:border-neutral-800">
                                            <div className="space-y-4">
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-medium text-muted-foreground">Latitude:</span>
                                                    <span className="font-mono text-sm">{order.port.latitude}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-medium text-muted-foreground">Longitude:</span>
                                                    <span className="font-mono text-sm">{order.port.longitude}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-medium text-muted-foreground">Timezone:</span>
                                                    <span className="text-sm">{order.port.timezone}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-medium text-muted-foreground">Port ID:</span>
                                                    <span className="font-mono text-xs text-muted-foreground">{order.port.id}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="chat" className="flex flex-1 flex-col">
                            {order.order_groups && order.order_groups.length > 0 ? (
                                <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-3">
                                    <div className="lg:col-span-1">
                                        <ChatSelector
                                            orderGroups={order.order_groups}
                                            selectedOrderGroupId={selectedOrderGroupId}
                                            onSelectOrderGroup={setSelectedOrderGroupId}
                                        />
                                    </div>
                                    <div className="lg:col-span-2">
                                        {selectedOrderGroupId ? (
                                            <ChatConversation
                                                orderGroup={order.order_groups.find((og) => og.id === selectedOrderGroupId)!}
                                                currentUserId={auth.user.id}
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center rounded-lg border bg-muted/20">
                                                <div className="text-center text-muted-foreground">
                                                    <MessageSquare className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                                    <p className="mb-2 text-lg font-medium">Select a chat</p>
                                                    <p className="text-sm">Choose an agency from the left to start messaging</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8 text-center text-muted-foreground">No order groups available for chat.</div>
                            )}
                        </TabsContent>

                        {/* <TabsContent value="system" className="space-y-4">
                            <OrderSystemTab order={order} />
                        </TabsContent> */}
                    </div>
                </Tabs>
            </div>
        </AppLayout>
    );
}
