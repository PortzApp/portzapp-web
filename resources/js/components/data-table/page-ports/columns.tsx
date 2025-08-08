import { PortsPageColumnActions } from '@/components/data-table/page-ports/column-actions';
import { DataTableColumnHeader } from '@/components/data-table/primitives/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Port } from '@/types/models';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<Port>[] = [
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
        header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    },
    {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    },
    {
        accessorKey: 'code',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
        cell: ({ row }) => {
            const port = row.original;

            return <p className="font-mono">{port.code}</p>;
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const port = row.original;

            return (
                <Badge
                    className={cn(
                        port.status === 'active' && 'bg-blue-200 text-blue-950 uppercase dark:bg-blue-900 dark:text-blue-50',
                        port.status === 'inactive' && 'bg-red-200 text-red-950 uppercase dark:bg-red-900 dark:text-red-50',
                        port.status === 'maintenance' && 'bg-yellow-200 text-yellow-950 uppercase dark:bg-yellow-900 dark:text-yellow-50',
                    )}
                >
                    {port.status}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'country',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Country" />,
    },
    {
        accessorKey: 'city',
        header: ({ column }) => <DataTableColumnHeader column={column} title="City" />,
    },
    // {
    //     accessorKey: 'latitude',
    //     header: ({ column }) => <DataTableColumnHeader column={column} title="Latitude" />,
    //     cell: ({ row }) => {
    //         const port = row.original;
    //
    //         return <p className="tabular-nums">{port.latitude}</p>;
    //     },
    // },
    // {
    //     accessorKey: 'longitude',
    //     header: ({ column }) => <DataTableColumnHeader column={column} title="Longitude" />,
    //     cell: ({ row }) => {
    //         const port = row.original;
    //
    //         return <p className="tabular-nums">{port.longitude}</p>;
    //     },
    // },
    // {
    //     accessorKey: 'timezone',
    //     header: ({ column }) => <DataTableColumnHeader column={column} title="Timezone" />,
    //     cell: ({ row }) => {
    //         const port = row.original;
    //
    //         return <p className="tabular-nums">{port.timezone}</p>;
    //     },
    // },
    {
        accessorKey: 'created_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created on" />,
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
            const port = row.original;

            return (
                <>
                    <PortsPageColumnActions port={port} />
                </>
            );
        },
    },
];
