import { VesselTypeBadge } from '@/components/badges';
import { OrdersPageColumnActions } from '@/components/data-table/page-orders/column-actions';
import { DataTableColumnHeader } from '@/components/data-table/primitives/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { OrderWithFullRelations } from '@/types/core';
import { VesselType } from '@/types/vessel';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<OrderWithFullRelations>[] = [
    {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const order = row.original;

            return (
                <Badge
                    className={cn(
                        order.status === 'pending' && 'bg-yellow-200 text-yellow-950 uppercase dark:bg-yellow-900 dark:text-yellow-50',
                        order.status === 'accepted' && 'bg-blue-200 text-blue-950 uppercase dark:bg-blue-900 dark:text-blue-50',
                        order.status === 'in_progress' && 'bg-purple-200 text-purple-950 uppercase dark:bg-purple-900 dark:text-purple-50',
                        order.status === 'completed' && 'bg-green-200 text-green-950 uppercase dark:bg-green-900 dark:text-green-50',
                        order.status === 'cancelled' && 'bg-red-200 text-red-950 uppercase dark:bg-red-900 dark:text-red-50',
                    )}
                >
                    {order.status.replace('_', ' ')}
                </Badge>
            );
        },
    },
    // {
    //     accessorKey: 'price',
    //     header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
    //     cell: ({ row }) => {
    //         const order = row.original;

    //         return <span className="font-mono">${order.price.toLocaleString()}</span>;
    //     },
    // },
    {
        accessorKey: 'vessel',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Vessel" />,
        cell: ({ row }) => {
            const order = row.original;

            return (
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <VesselTypeBadge type={order.vessel.vessel_type as VesselType} iconOnly />
                        <p>{order.vessel.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">IMO Number: {order.vessel.imo_number}</p>
                </div>
            );
        },
    },
    {
        accessorKey: 'port',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Port" />,
        cell: ({ row }) => {
            const order = row.original;

            return (
                <div className="flex flex-col">
                    <p>{order.port.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {order.port.city}, {order.port.country}
                    </p>
                </div>
            );
        },
    },
    {
        accessorKey: 'placed_by_organization.name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Placed by" />,
        cell: ({ row }) => {
            const order = row.original;

            return (
                <div className="">
                    <p>
                        {order.placed_by_user.first_name} {order.placed_by_user.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{order.placed_by_organization.name}</p>
                </div>
            );
        },
    },
    // {
    //     accessorKey: 'providing_organization.name',
    //     header: ({ column }) => <DataTableColumnHeader column={column} title="Providing Org" />,
    //     cell: ({ row }) => {
    //         const order = row.original;

    //         return <span className="text-sm">{order.providing_organization.name}</span>;
    //     },
    // },
    {
        accessorKey: 'created_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created on" />,
        cell: ({ row }) => {
            const order = row.original;

            return (
                <p className="text-sm tabular-nums">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                    })}
                </p>
            );
        },
    },
    {
        id: 'actions',
        header: () => null,
        cell: ({ row }) => {
            const order = row.original;

            return (
                <>
                    <OrdersPageColumnActions order={order} />
                </>
            );
        },
    },
];
