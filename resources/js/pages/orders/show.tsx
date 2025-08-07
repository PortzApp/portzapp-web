import { VesselStatusBadge, VesselTypeBadge } from '@/components/badges';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import { VesselStatus, VesselType } from '@/types/vessel';
import { Head, Link, router } from '@inertiajs/react';
import { Dot, Edit, Package, Ship, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type Order = {
    id: string;
    requesting_organization_id: string;
    providing_organization_id: string;
    price: string;
    notes: string;
    status: string;
    created_at: string;
    updated_at: string;
    services: {
        id: string;
        organization_id: string;
        port_id: string;
        service_category_id: string;
        name: string;
        description: string;
        price: string;
        status: string;
        created_at: string;
        updated_at: string;
        order_service: {
            order_id: string;
            service_id: string;
            created_at: string;
            updated_at: string;
        };
        organization: {
            id: string;
            name: string;
            business_type: string;
        };
    }[];
    vessels: {
        id: string;
        organization_id: string;
        name: string;
        imo_number: string;
        vessel_type: string;
        status: string;
        created_at: string;
        updated_at: string;
        order_vessel: {
            order_id: string;
            vessel_id: string;
            created_at: string;
            updated_at: string;
        };
    }[];
    requesting_organization: {
        id: string;
        name: string;
        business_type: string;
    };
    providing_organization: {
        id: string;
        name: string;
        business_type: string;
    };
};

export default function OrderShowPage({ order }: { order: Order }) {
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Orders',
            href: route('orders'),
        },
        {
            title: `Order ID: ${order.id}`,
            href: `/orders/${order.id}`,
        },
    ];

    function handleDeleteOrder() {
        setOpenDeleteDialog(false);

        router.delete(route('orders.destroy', order.id), {
            onSuccess: () => {
                toast(`Order #${order.id} deleted successfully!`);
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order #${order.id}`} />

            <div className="flex flex-col gap-8 bg-neutral-50 p-8">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold">
                            Order ID: <span className="font-mono text-xl text-muted-foreground">{order.id}</span>
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
                                        Are you sure you want to delete order #{order.id}? This action cannot be undone.
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

                <div className="grid grid-cols-12 gap-8">
                    {/* Main Content - 8 columns */}
                    <div className="col-span-8 space-y-8">
                        {/* Order Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Information</CardTitle>
                                <CardDescription>Core order details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Order ID:</span>
                                    <span className="text-sm font-medium">{order.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Price:</span>
                                    <span className="font-mono text-sm font-medium">${order.price.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Status:</span>
                                    <Badge
                                        className={cn(
                                            order.status === 'pending' &&
                                                'bg-yellow-200 text-yellow-950 uppercase dark:bg-yellow-900 dark:text-yellow-50',
                                            order.status === 'accepted' && 'bg-blue-200 text-blue-950 uppercase dark:bg-blue-900 dark:text-blue-50',
                                            order.status === 'in_progress' &&
                                                'bg-purple-200 text-purple-950 uppercase dark:bg-purple-900 dark:text-purple-50',
                                            order.status === 'completed' &&
                                                'bg-green-200 text-green-950 uppercase dark:bg-green-900 dark:text-green-50',
                                            order.status === 'cancelled' && 'bg-red-200 text-red-950 uppercase dark:bg-red-900 dark:text-red-50',
                                        )}
                                    >
                                        <Dot />
                                        {order.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Services Section */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Services</CardTitle>
                                        <CardDescription>Services included in this order</CardDescription>
                                    </div>
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        <Package className="h-3 w-3" />
                                        {order.services.length}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {order.services.map((service) => (
                                        <div key={service.id} className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium">{service.name}</span>
                                                <span className="text-sm text-muted-foreground">{service.description}</span>
                                                <span className="text-xs text-muted-foreground">Provider: {service.organization.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-mono text-sm font-medium">${service.price}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vessels Section */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Vessels</CardTitle>
                                        <CardDescription>Vessels associated with this order</CardDescription>
                                    </div>
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        <Ship className="h-3 w-3" />
                                        {order.vessels.length}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {order.vessels.map((vessel) => (
                                        <div key={vessel.id} className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex flex-col gap-0">
                                                    <span className="font-medium">{vessel.name}</span>
                                                    <span className="text-sm text-muted-foreground">IMO: {vessel.imo_number}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <VesselTypeBadge type={vessel.vessel_type as VesselType} />
                                                    <VesselStatusBadge status={vessel.status as VesselStatus} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes Section */}
                        {order.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notes</CardTitle>
                                    <CardDescription>Additional order notes and requirements</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm">{order.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar - 4 columns */}
                    <div className="col-span-4 flex flex-col gap-4">
                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                                <CardDescription>Quick overview</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Total Services:</span>
                                    <Badge variant="outline">{order.services.length}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Total Vessels:</span>
                                    <Badge variant="outline">{order.vessels.length}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Total Value:</span>
                                    <span className="font-mono text-sm font-medium">${order.price}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Organizations */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Organizations</CardTitle>
                                <CardDescription>Requesting and providing organizations</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-muted-foreground">Requested by</span>
                                    <div className="rounded-lg p-3">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-full bg-neutral-300" />
                                            <div>
                                                <span className="text-sm font-medium">{order.requesting_organization.name}</span>
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    {order.requesting_organization.business_type.replace('_', ' ')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-muted-foreground">Provided by</span>
                                    <div className="rounded-lg p-3">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-full bg-neutral-300" />
                                            <div>
                                                <span className="text-sm font-medium">{order.providing_organization.name}</span>
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    {order.providing_organization.business_type.replace('_', ' ')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* System Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>System Information</CardTitle>
                                <CardDescription>Record metadata</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <span className="text-sm font-medium text-muted-foreground">Created:</span>
                                    <div className="text-sm">
                                        {new Date(order.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: false,
                                        })}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-sm font-medium text-muted-foreground">Last Updated:</span>
                                    <div className="text-sm">
                                        {new Date(order.updated_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: false,
                                        })}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
