import { OrdersPageColumnActions } from '@/pages/orders/components/data-table/column-actions';
import { ColumnDef } from '@tanstack/react-table';

import { VesselType } from '@/types/enums';
import { OrderWithRelations } from '@/types/models';

import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';

import { VesselTypeBadge } from '@/components/badges';
import { OrderStatusBadge } from '@/components/badges/order-status-badge';

export const columns: ColumnDef<OrderWithRelations>[] = [
    {
        accessorKey: 'order_number',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Order Number" />,
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const order = row.original;

            return <OrderStatusBadge status={order.status} />;
        },
    },
    {
        accessorKey: 'order_groups',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Groups" />,
        cell: ({ row }) => {
            const order = row.original;
            const groupCount = order.order_groups?.length || 0;

            return (
                <div className="flex flex-col">
                    <span className="font-medium">{groupCount}</span>
                    <span className="text-xs text-muted-foreground">{groupCount === 1 ? 'group' : 'groups'}</span>
                </div>
            );
        },
    },
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
    {
        accessorKey: 'created_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created on" />,
        cell: ({ row }) => {
            const order = row.original;

            return (
                <p className="text-sm tabular-nums">
                    {(() => {
                        const now = new Date();
                        const created = new Date(order.created_at);
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
            const order = row.original;

            return (
                <>
                    <OrdersPageColumnActions order={order} />
                </>
            );
        },
    },
];
