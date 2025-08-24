import { Link } from '@inertiajs/react';

import { OrderGroup, OrderGroupService } from '@/types/models';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface OrderGroupsTabProps {
    orderGroups: OrderGroup[];
}

export default function OrderGroupsTab({ orderGroups }: OrderGroupsTabProps) {
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

    // Helper to get services from either new or old structure
    const getGroupServices = (group: OrderGroup) => {
        if (group.order_group_services && group.order_group_services.length > 0) {
            return group.order_group_services;
        }
        // Fallback to old structure
        return group.services?.map(service => ({
            id: `${group.id}-${service.id}`, // temporary ID
            service_id: service.id,
            order_group_id: group.id,
            status: 'pending' as const,
            price_snapshot: parseFloat(service.price || '0'),
            notes: null,
            service,
            created_at: service.created_at,
            updated_at: service.updated_at,
        })) || [];
    };

    // Helper to calculate total price from OrderGroupServices
    const getGroupTotalPrice = (group: OrderGroup) => {
        const groupServices = getGroupServices(group);
        if (groupServices.length > 0 && 'price_snapshot' in groupServices[0]) {
            return groupServices.reduce((sum, ogs) => sum + parseFloat(ogs.price_snapshot || '0'), 0);
        }
        // Fallback to old calculation
        return group.total_price || group.services?.reduce((sum, service) => sum + parseFloat(service.price || '0'), 0) || 0;
    };

    if (orderGroups.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Order Groups</CardTitle>
                    <CardDescription>This order has no order groups yet.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Order Groups ({orderGroups.length})</h3>
                    <p className="text-sm text-muted-foreground">This order has been split into groups by fulfilling agency</p>
                </div>
            </div>

            <div className="grid gap-4">
                {orderGroups.map((group) => (
                    <Card key={group.id}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="font-mono text-base">{group.group_number}</CardTitle>
                                    <CardDescription className="mt-1 flex items-center gap-2">
                                        <span>Assigned to {group.fulfilling_organization.name}</span>
                                        {getStatusBadge(group.status)}
                                    </CardDescription>
                                </div>
                                <Link href={route('order-groups.show', group.id)}>
                                    <Button variant="outline" size="sm">
                                        View Details
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                                <div>
                                    <span className="font-medium text-muted-foreground">Services:</span>
                                    <p className="font-semibold">{getGroupServices(group).length} services</p>
                                </div>
                                <div>
                                    <span className="font-medium text-muted-foreground">Total Price:</span>
                                    <p className="font-semibold tabular-nums">
                                        ${getGroupTotalPrice(group).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div>
                                    <span className="font-medium text-muted-foreground">Created:</span>
                                    <p className="font-semibold">{new Date(group.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {getGroupServices(group).length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <h4 className="mb-2 text-sm font-medium text-muted-foreground">Services in this group:</h4>
                                        <div className="space-y-2">
                                            {getGroupServices(group).map((orderGroupService) => {
                                                const service = orderGroupService.service || orderGroupService;
                                                return (
                                                    <div key={orderGroupService.id} className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span>
                                                                {service.sub_category?.name || 'Service'} - {service.organization?.name || 'Unknown'}
                                                            </span>
                                                            {orderGroupService.status && getStatusBadge(orderGroupService.status)}
                                                        </div>
                                                        <span className="font-mono">
                                                            ${parseFloat(orderGroupService.price_snapshot || service.price || '0').toFixed(2)}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}

                            {group.notes && (
                                <>
                                    <Separator />
                                    <div>
                                        <h4 className="mb-1 text-sm font-medium text-muted-foreground">Notes:</h4>
                                        <p className="text-sm">{group.notes}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
