import { Order, OrderWithServiceUserOrganization } from '@/types/order';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

export default function OrderDetail({ order }: { order: OrderWithServiceUserOrganization }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Orders',
            href: '/orders'
        },
        {
            title: `Order ${order.id}`,
            href: `/orders/${order.id}`
        }
    ];

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'pending': return 'secondary';
            case 'accepted': return 'default';
            case 'in_progress': return 'outline';
            case 'completed': return 'default';
            case 'cancelled': return 'destructive';
            default: return 'secondary';
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order #${order.id}`} />

            <div className="container mx-auto py-8 px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Order #{order.id}</h1>
                    <Badge variant={getStatusVariant(order.status)}>
                        {order.status.toUpperCase()}
                    </Badge>
                </div>

                {/* Order Summary Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                        <CardDescription>Placed on {formatDate(order.created_at)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Price</p>
                                <p className="text-2xl font-bold">${order.price.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Last Updated</p>
                                <p className="text-sm">{formatDate(order.updated_at)}</p>
                            </div>
                        </div>
                        {order.notes && (
                            <div className="mt-4">
                                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                                <p className="text-sm">{order.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Service Details Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Service Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-lg">{order.service.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{order.service.description}</p>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Service Price</p>
                                <p className="font-medium">${parseFloat(order.service.price).toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Service Status</p>
                                <Badge variant={order.service.status === 'active' ? 'default' : 'secondary'}>
                                    {order.service.status}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Agency Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Agency Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Contact Person */}
                            <div>
                                <h4 className="font-semibold mb-2">Contact Person</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Name</p>
                                        <p>{order.service.user.first_name} {order.service.user.last_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Email</p>
                                        <p>{order.service.user.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Phone</p>
                                        <p>{order.service.user.phone_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Role</p>
                                        <p className="capitalize">{order.service.user.role.replace('_', ' ')}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Organization */}
                            <div>
                                <h4 className="font-semibold mb-2">Organization</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Company Name</p>
                                        <p>{order.service.user.organization.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Registration Code</p>
                                        <p className="font-mono">{order.service.user.organization.registration_code}</p>
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
