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
import { OrderWithFullRelations } from '@/types/core';
import { Head, Link, router } from '@inertiajs/react';
import { Dot, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function OrderShowPage({ order }: { order: OrderWithFullRelations }) {
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Orders',
            href: route('orders'),
        },
        {
            title: `Order #${order.id}`,
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

            <div className="flex flex-col gap-8 p-8">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold">Order #{order.id}</h1>
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

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Information</CardTitle>
                            <CardDescription>Core order details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Order ID:</span>
                                <span className="text-sm font-medium">#{order.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Service:</span>
                                <span className="text-sm font-medium">{order.service.name}</span>
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
                                        order.status === 'completed' && 'bg-green-200 text-green-950 uppercase dark:bg-green-900 dark:text-green-50',
                                        order.status === 'cancelled' && 'bg-red-200 text-red-950 uppercase dark:bg-red-900 dark:text-red-50',
                                    )}
                                >
                                    <Dot />
                                    {order.status.replace('_', ' ')}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Vessel Information</CardTitle>
                            <CardDescription>Associated vessel details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Vessel Name:</span>
                                <span className="text-sm font-medium">{order.vessel.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">IMO Number:</span>
                                <span className="font-mono text-sm font-medium">{order.vessel.imo_number}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Organizations</CardTitle>
                            <CardDescription>Requesting and providing organizations</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Requesting:</span>
                                <span className="text-sm font-medium">{order.requesting_organization.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Providing:</span>
                                <span className="text-sm font-medium">{order.providing_organization.name}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>System Information</CardTitle>
                            <CardDescription>Record metadata</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Created:</span>
                                <span className="text-sm font-medium tabular-nums">
                                    {new Date(order.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false,
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Last Updated:</span>
                                <span className="text-sm font-medium tabular-nums">
                                    {new Date(order.updated_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false,
                                    })}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {order.notes && (
                        <Card className="md:col-span-2">
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
            </div>
        </AppLayout>
    );
}
