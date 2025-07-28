import { OrdersPageColumnActions } from '@/components/data-table/page-orders/column-actions';
import { DataTableColumnHeader } from '@/components/data-table/primitives/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Order, OrderWithFullRelations } from '@/types/core';
import { ColumnDef } from '@tanstack/react-table';

export const ordersPageColumnsAsVesselOwnerRole: ColumnDef<Order>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value: boolean) => row.toggleSelected(value)} aria-label="Select row" />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Order ID" />,
    },
    {
        accessorKey: 'service.name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Service" />,
    },
    {
        accessorKey: 'providing_organization.name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Agency" />,
    },
    {
        accessorKey: 'price',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('price'));
            const formatted = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(amount);

            return <div className="text-left font-medium tabular-nums">{formatted}</div>;
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const order = row.original;

            return (
                <Badge
                    className={cn(
                        order.status === 'pending' && 'bg-neutral-500 text-neutral-950 uppercase',
                        order.status === 'accepted' && 'bg-blue-500 text-blue-950 uppercase',
                        order.status === 'in_progress' && 'bg-amber-500 text-amber-950 uppercase',
                        order.status === 'completed' && 'bg-green-500 text-green-950 uppercase',
                        order.status === 'cancelled' && 'bg-red-500 text-red-950 uppercase',
                    )}
                >
                    {order.status}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ordered on" />,
        cell: ({ row }) => {
            const order = row.original;

            return (
                <p className="tabular-nums">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
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

export const ordersPageColumnsAsShippingAgencyRole: ColumnDef<Order>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value: boolean) => row.toggleSelected(value)} aria-label="Select row" />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Order ID" />,
    },
    {
        accessorKey: 'service.name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Service" />,
    },
    {
        accessorKey: `vessel_owner_id`,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
        cell: ({ row }) => {
            const order = row.original as OrderWithFullRelations;

            return <div>{order.requesting_organization.name}</div>;
        },
    },
    {
        accessorKey: 'price',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('price'));
            const formatted = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(amount);

            return <div className="text-left font-medium tabular-nums">{formatted}</div>;
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const order = row.original;

            return (
                <Badge
                    className={cn(
                        order.status === 'pending' && 'bg-neutral-500 text-neutral-950 uppercase',
                        order.status === 'accepted' && 'bg-blue-500 text-blue-950 uppercase',
                        order.status === 'in_progress' && 'bg-amber-500 text-amber-950 uppercase',
                        order.status === 'completed' && 'bg-green-500 text-green-950 uppercase',
                        order.status === 'cancelled' && 'bg-red-500 text-red-950 uppercase',
                    )}
                >
                    {order.status}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Requested on" />,
        cell: ({ row }) => {
            const order = row.original;

            return (
                <p className="tabular-nums">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
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
