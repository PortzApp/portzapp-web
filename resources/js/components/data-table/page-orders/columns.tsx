import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../primitives/data-table-column-header';
import { OrdersPageColumnActions } from './column-actions';

import { Order } from '@/types/order';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const ordersPageColumns: ColumnDef<Order>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value: boolean) => row.toggleSelected(!!value)} aria-label="Select row" />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    },
    {
        accessorKey: 'service.name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Service Name" />,
    },
    {
        accessorKey: 'service.user.organization.name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Agency Name" />,
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
        accessorKey: 'notes',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Notes" />,
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const order = row.original;

            return (
                <Badge className={cn(
                    order.status === 'pending' && 'bg-neutral-500 text-neutral-950 uppercase',
                    order.status === 'accepted' && 'bg-blue-500 text-blue-950 uppercase',
                    order.status === 'in_progress' && 'bg-amber-500 text-amber-950 uppercase',
                    order.status === 'completed' && 'bg-green-500 text-green-950 uppercase',
                    order.status === 'cancelled' && 'bg-red-500 text-red-950 uppercase',
                )}>
                    {order.status}
                </Badge>
            );
        }
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
