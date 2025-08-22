import { Dot, MapPin, Package, Ship, User } from 'lucide-react';

import { OrderWithRelations } from '@/types/models';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface OrderOverviewTabProps {
    order: OrderWithRelations;
}

export default function OrderOverviewTab({ order }: OrderOverviewTabProps) {
    // Use total_price from order if available, otherwise calculate from all_services or services
    const totalServicePrice =
        order.total_price ||
        order.all_services?.reduce((sum, service) => sum + parseFloat(service.price), 0) ||
        order.services?.reduce((sum, service) => sum + parseFloat(service.price), 0) ||
        0;

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Order Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Order Information</CardTitle>
                    <CardDescription>Core order details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Order Number:</span>
                        <span className="font-mono text-sm font-medium">{order.order_number}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Total Services Value:</span>
                        <span className="font-mono text-sm font-medium">${totalServicePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Status:</span>
                        <Badge
                            className={cn(
                                order.status === 'draft' && 'bg-yellow-200 text-yellow-950 uppercase dark:bg-yellow-900 dark:text-yellow-50',
                                order.status === 'pending_agency_confirmation' &&
                                    'bg-orange-200 text-orange-950 uppercase dark:bg-orange-900 dark:text-orange-50',
                                order.status === 'partially_confirmed' && 'bg-blue-200 text-blue-950 uppercase dark:bg-blue-900 dark:text-blue-50',
                                order.status === 'confirmed' && 'bg-green-200 text-green-950 uppercase dark:bg-green-900 dark:text-green-50',
                                order.status === 'cancelled' && 'bg-red-200 text-red-950 uppercase dark:bg-red-900 dark:text-red-50',
                            )}
                        >
                            <Dot />
                            {order.status.replace('_', ' ')}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
                <CardHeader>
                    <CardTitle>Summary</CardTitle>
                    <CardDescription>Quick overview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Services:</span>
                        <Badge variant="outline" className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {order.all_services?.length || order.services?.length || 0}
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Vessel:</span>
                        <Badge variant="outline" className="flex items-center gap-1">
                            <Ship className="h-3 w-3" />1
                        </Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Port:</span>
                        <Badge variant="outline" className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {order.port.code}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Vessel Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Ship className="h-5 w-5" />
                        Vessel
                    </CardTitle>
                    <CardDescription>Vessel summary</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Name:</span>
                            <span className="text-sm font-medium">{order.vessel.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">IMO:</span>
                            <span className="font-mono text-sm">{order.vessel.imo_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Type:</span>
                            <Badge variant="outline" className="capitalize">
                                {order.vessel.vessel_type.replace('_', ' ')}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Port Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Port
                    </CardTitle>
                    <CardDescription>Destination port summary</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Name:</span>
                            <span className="text-sm font-medium">{order.port.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Code:</span>
                            <span className="font-mono text-sm">{order.port.code}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Location:</span>
                            <span className="text-sm">
                                {order.port.city}, {order.port.country}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Organization Summary */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Order Placed By
                    </CardTitle>
                    <CardDescription>User and organization summary</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <span className="text-sm font-medium text-muted-foreground">User:</span>
                            <div className="mt-1">
                                <span className="text-sm font-medium">
                                    {order.placed_by_user.first_name} {order.placed_by_user.last_name}
                                </span>
                                <div className="text-xs text-muted-foreground">{order.placed_by_user.email}</div>
                            </div>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-muted-foreground">Organization:</span>
                            <div className="mt-1">
                                <span className="text-sm font-medium">{order.placed_by_organization.name}</span>
                                <div className="text-xs text-muted-foreground">
                                    {order.placed_by_organization.business_type.replace('_', ' ')} • {order.placed_by_organization.registration_code}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notes if available */}
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
    );
}
