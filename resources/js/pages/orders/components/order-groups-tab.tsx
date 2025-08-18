import { Link } from '@inertiajs/react';

import { OrderGroup } from '@/types/models';

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
                                    <p className="font-semibold">{group.services?.length || 0} services</p>
                                </div>
                                <div>
                                    <span className="font-medium text-muted-foreground">Total Price:</span>
                                    <p className="font-semibold tabular-nums">${parseFloat(group.total_price?.toString() || '0').toFixed(2)}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-muted-foreground">Created:</span>
                                    <p className="font-semibold">{new Date(group.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {group.services && group.services.length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <h4 className="mb-2 text-sm font-medium text-muted-foreground">Services in this group:</h4>
                                        <div className="space-y-2">
                                            {group.services.map((service) => (
                                                <div key={service.id} className="flex items-center justify-between text-sm">
                                                    <span>{service.sub_category?.name || 'Service'} - {service.organization?.name || 'Unknown'}</span>
                                                    <span className="font-mono">${parseFloat(service.price).toFixed(2)}</span>
                                                </div>
                                            ))}
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
