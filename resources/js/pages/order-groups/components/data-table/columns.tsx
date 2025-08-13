import { OrderGroupsPageColumnActions } from '@/pages/order-groups/components/data-table/column-actions';
import { ColumnDef } from '@tanstack/react-table';

import { VesselType } from '@/types/enums';
import { OrderGroup } from '@/types/models';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';

import { VesselTypeBadge } from '@/components/badges';

export const columns: ColumnDef<OrderGroup>[] = [
    {
        accessorKey: 'group_number',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Group Number" />,
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const orderGroup = row.original;

            return (
                <Badge
                    className={cn(
                        orderGroup.status === 'pending' && 'bg-yellow-200 text-yellow-950 uppercase dark:bg-yellow-900 dark:text-yellow-50',
                        orderGroup.status === 'accepted' && 'bg-blue-200 text-blue-950 uppercase dark:bg-blue-900 dark:text-blue-50',
                        orderGroup.status === 'rejected' && 'bg-red-200 text-red-950 uppercase dark:bg-red-900 dark:text-red-50',
                        orderGroup.status === 'in_progress' && 'bg-purple-200 text-purple-950 uppercase dark:bg-purple-900 dark:text-purple-50',
                        orderGroup.status === 'completed' && 'bg-green-200 text-green-950 uppercase dark:bg-green-900 dark:text-green-50',
                    )}
                >
                    {orderGroup.status.replace(/_/g, ' ')}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'order',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Parent Order" />,
        cell: ({ row }) => {
            const orderGroup = row.original;

            return (
                <div className="flex flex-col">
                    <p className="font-medium">{orderGroup.order.order_number}</p>
                    <p className="text-xs text-muted-foreground">Status: {orderGroup.order.status.replace(/_/g, ' ')}</p>
                </div>
            );
        },
    },
    {
        accessorKey: 'order.vessel',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Vessel" />,
        cell: ({ row }) => {
            const orderGroup = row.original;

            return (
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <VesselTypeBadge type={orderGroup.order.vessel.vessel_type as VesselType} iconOnly />
                        <p>{orderGroup.order.vessel.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">IMO: {orderGroup.order.vessel.imo_number}</p>
                </div>
            );
        },
    },
    {
        accessorKey: 'order.port',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Port" />,
        cell: ({ row }) => {
            const orderGroup = row.original;

            return (
                <div className="flex flex-col">
                    <p>{orderGroup.order.port.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {orderGroup.order.port.city}, {orderGroup.order.port.country}
                    </p>
                </div>
            );
        },
    },
    {
        accessorKey: 'services',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Services" />,
        cell: ({ row }) => {
            const orderGroup = row.original;
            const serviceCount = orderGroup.services?.length || 0;

            return (
                <div className="flex flex-col">
                    <span className="font-medium">{serviceCount}</span>
                    <span className="text-xs text-muted-foreground">{serviceCount === 1 ? 'service' : 'services'}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'total_price',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Total Price" />,
        cell: ({ row }) => {
            const orderGroup = row.original;
            // Calculate total price from services
            const totalPrice = orderGroup.services?.reduce((sum, service) => sum + parseFloat(service.price), 0) || 0;

            return <p className="font-medium tabular-nums">${totalPrice.toFixed(2)}</p>;
        },
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created on" />,
        cell: ({ row }) => {
            const orderGroup = row.original;

            return (
                <p className="text-sm tabular-nums">
                    {(() => {
                        const now = new Date();
                        const created = new Date(orderGroup.created_at);
                        const diff = Math.floor((now.getTime() - created.getTime()) / 1000);

                        if (diff < 60) return `${diff} seconds ago`;
                        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
                        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
                        if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;

                        // Fallback to date if more than a week ago
                        return created.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        });
                    })()}
                </p>
            );
        },
    },
    {
        id: 'actions',
        header: () => null,
        cell: ({ row }) => {
            const orderGroup = row.original;

            return (
                <>
                    <OrderGroupsPageColumnActions orderGroup={orderGroup} />
                </>
            );
        },
    },
];
