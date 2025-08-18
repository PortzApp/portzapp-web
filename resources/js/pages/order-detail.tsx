import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

import { OrderWithFullRelations } from '@/types/core';

import AppLayout from '@/layouts/app-layout';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function OrderDetail({ order }: { order: OrderWithFullRelations }) {
    console.log(order);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Orders',
            href: route('orders.index'),
        },
        {
            title: `Order ${order.id}`,
            href: `/orders/${order.id}`,
        },
    ];

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'pending':
                return 'secondary';
            case 'accepted':
                return 'default';
            case 'in_progress':
                return 'outline';
            case 'completed':
                return 'default';
            case 'cancelled':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order #${order.id}`} />

            <div className="container mx-auto max-w-4xl px-4 py-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Order #{order.id}</h1>
                    <Badge variant={getStatusVariant(order.status)}>{order.status.toUpperCase()}</Badge>
                </div>

                {/* Order Summary Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                        <CardDescription>Placed on {formatDate(order.created_at)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/*<div>*/}
                            {/*    <p className="text-sm text-muted-foreground">Total Price</p>*/}
                            {/*    <p className="text-2xl font-bold">${order.price.toFixed(2)}</p>*/}
                            {/*</div>*/}
                            <div>
                                <p className="text-sm text-muted-foreground">Last Updated</p>
                                <p className="text-sm">{formatDate(order.updated_at)}</p>
                            </div>
                        </div>
                        {order.notes && (
                            <div className="mt-4">
                                <p className="mb-1 text-sm text-muted-foreground">Notes</p>
                                <p className="text-sm">{order.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Service Details Card */}
                {order.services.map((service) => (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Service Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold">{service?.sub_category?.name}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Service Price</p>
                                    <p className="font-medium">${parseFloat(service.price).toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Service Status</p>
                                    <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>{service.status}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Agency Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Agency Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Contact Person */}
                            {order.services.map((service) => (
                                <div>
                                    <h4 className="mb-2 font-semibold">Contact Person</h4>
                                    <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                                        <div>
                                            <p className="text-muted-foreground">Name</p>
                                            <p>{service.organization.name}</p>
                                        </div>
                                        {/*<div>*/}
                                        {/*    <p className="text-muted-foreground">Email</p>*/}
                                        {/*    <p>{service.user.email}</p>*/}
                                        {/*</div>*/}
                                        {/*<div>*/}
                                        {/*    <p className="text-muted-foreground">Phone</p>*/}
                                        {/*    <p>{service.user.phone_number}</p>*/}
                                        {/*</div>*/}
                                        {/*<div>*/}
                                        {/*    <p className="text-muted-foreground">Role</p>*/}
                                        {/*    <p className="capitalize">{service.organization.role.replace('_', ' ')}</p>*/}
                                        {/*</div>*/}
                                    </div>
                                </div>
                            ))}

                            <Separator />

                            {/* Organization */}
                            <div>
                                <h4 className="mb-2 font-semibold">Organization</h4>
                                <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                                    <div>
                                        <p className="text-muted-foreground">Company Name</p>
                                        <p>{order.services[0].organization.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Registration Code</p>
                                        <p className="font-mono">{order.services[0].organization.name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
