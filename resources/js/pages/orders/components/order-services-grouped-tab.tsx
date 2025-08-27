import { router } from '@inertiajs/react';
import { Building2, Copy, DollarSign, Eye, MoreHorizontal, Package, Tag, Users } from 'lucide-react';
import { toast } from 'sonner';

import { OrderGroup } from '@/types/models';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

import { OrderGroupServiceStatusBadge } from '@/components/badges/order-group-service-status-badge';
import { OrderGroupStatusBadge } from '@/components/badges/order-group-status-badge';
import { ServiceCategoryBadge } from '@/components/badges/service-category-badge';

interface OrderServicesGroupedTabProps {
    orderGroups: OrderGroup[];
}

export default function OrderServicesGroupedTab({ orderGroups }: OrderServicesGroupedTabProps) {
    // Copy to clipboard function
    const copyToClipboard = async (text: string, type: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(`${type} copied to clipboard!`);
        } catch {
            toast.error(`Failed to copy ${type.toLowerCase()}`);
        }
    };
    // Helper to get services from either new or old structure
    const getGroupServices = (group: OrderGroup) => {
        if (group.order_group_services && group.order_group_services.length > 0) {
            return group.order_group_services;
        }
        // Fallback to old structure
        return (
            group.services?.map((service) => ({
                id: `${group.id}-${service.id}`, // temporary ID
                service_id: service.id,
                order_group_id: group.id,
                status: 'pending' as const,
                price_snapshot: parseFloat(service.price || '0'),
                notes: null,
                service,
                created_at: service.created_at,
                updated_at: service.updated_at,
            })) || []
        );
    };

    // Calculate total services count
    const totalServicesCount = orderGroups.reduce((count, group) => count + getGroupServices(group).length, 0);

    // Calculate total price from all OrderGroupServices
    const totalPrice = orderGroups.reduce((total, group) => {
        const groupServices = getGroupServices(group);
        return total + groupServices.reduce((sum, ogs) => sum + parseFloat(ogs.price_snapshot?.toString() || '0'), 0);
    }, 0);

    if (orderGroups.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Services
                    </CardTitle>
                    <CardDescription>This order has no services yet.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            {/* Overview Section */}
            <div>
                <h2 className="mb-4 text-xl font-semibold">Overview</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Total Services Card */}
                    <Card>
                        <CardContent className="flex items-center p-4">
                            <div className="flex items-center justify-center rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
                                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="ml-4 space-y-1">
                                <p className="text-2xl font-bold">{totalServicesCount}</p>
                                <p className="text-sm text-muted-foreground">Total Services</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Service Providers Card */}
                    <Card>
                        <CardContent className="flex items-center p-4">
                            <div className="flex items-center justify-center rounded-lg bg-green-100 p-3 dark:bg-green-900">
                                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="ml-4 space-y-1">
                                <p className="text-2xl font-bold">{orderGroups.length}</p>
                                <p className="text-sm text-muted-foreground">Service Providers</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Value Card */}
                    <Card>
                        <CardContent className="flex items-center p-4">
                            <div className="flex items-center justify-center rounded-lg bg-amber-100 p-3 dark:bg-amber-900">
                                <DollarSign className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="ml-4 space-y-1">
                                <p className="text-2xl font-bold tabular-nums">
                                    ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                <p className="text-sm text-muted-foreground">Total Value</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Service Details Section */}
            <div>
                <h2 className="mb-4 text-xl font-semibold">Service Details</h2>
                <div className="space-y-4">
                    {orderGroups.map((group) => {
                        const groupServices = getGroupServices(group);
                        const groupTotalPrice = groupServices.reduce((sum, ogs) => sum + parseFloat(ogs.price_snapshot?.toString() || '0'), 0);

                        if (groupServices.length === 0) return null;

                        return (
                            <Card key={group.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Building2 className="h-5 w-5" />
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    {group.fulfilling_organization.name}
                                                    <OrderGroupStatusBadge status={group.status} />
                                                </CardTitle>
                                                <CardDescription>
                                                    {groupServices.length} service{groupServices.length !== 1 ? 's' : ''}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <div className="text-lg font-semibold tabular-nums">
                                                    ${groupTotalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                                <div className="text-sm text-muted-foreground">Group Total</div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Open menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => copyToClipboard(group.id, 'Group ID')}>
                                                        <Copy className="mr-2 h-4 w-4" />
                                                        Copy group ID
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {groupServices.map((orderGroupService) => {
                                            const service =
                                                'service' in orderGroupService && orderGroupService.service
                                                    ? orderGroupService.service
                                                    : orderGroupService;

                                            const serviceTitle = 'sub_category' in service ? service.sub_category?.name || 'Service' : 'Service';

                                            const categoryName = 'sub_category' in service ? service.sub_category?.category?.name : undefined;

                                            return (
                                                <div key={orderGroupService.id} className="flex items-start justify-between rounded-lg border p-4">
                                                    <div className="flex-1">
                                                        <div className="mb-2 flex items-center gap-2">
                                                            <Tag className="h-4 w-4" />
                                                            <h4 className="font-medium">{serviceTitle}</h4>
                                                            {categoryName && <ServiceCategoryBadge categoryName={categoryName} />}
                                                            <OrderGroupServiceStatusBadge status={orderGroupService.status} />
                                                        </div>
                                                        {'description' in service && service.description && (
                                                            <p className="mb-2 text-sm text-muted-foreground">{service.description}</p>
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
                                                                {parseFloat(orderGroupService.price_snapshot?.toString() || '0').toLocaleString(
                                                                    'en-US',
                                                                    {
                                                                        minimumFractionDigits: 2,
                                                                        maximumFractionDigits: 2,
                                                                    },
                                                                )}
                                                            </div>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="h-4 w-4" />
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
                                                                <DropdownMenuItem
                                                                    onClick={() => copyToClipboard(orderGroupService.service_id, 'Service ID')}
                                                                >
                                                                    <Copy className="mr-2 h-4 w-4" />
                                                                    Copy service ID
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {group.notes && (
                                        <>
                                            <Separator className="my-4" />
                                            <div>
                                                <h4 className="mb-1 text-sm font-medium text-muted-foreground">Group Notes:</h4>
                                                <p className="text-sm">{group.notes}</p>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
