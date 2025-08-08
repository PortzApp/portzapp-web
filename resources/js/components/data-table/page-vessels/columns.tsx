import { VesselStatusBadge, VesselTypeBadge } from '@/components/badges';
import { VesselsPageColumnActions } from '@/components/data-table/page-vessels/column-actions';
import { DataTableColumnHeader } from '@/components/data-table/primitives/data-table-column-header';
import { Checkbox } from '@/components/ui/checkbox';
import { Vessel } from '@/types/models';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<Vessel>[] = [
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
        accessorKey: 'imo_number',
        header: ({ column }) => <DataTableColumnHeader column={column} title="IMO Number" />,
        cell: ({ row }) => {
            const vessel = row.original;

            return <p className="tabular-nums">{vessel.imo_number}</p>;
        },
    },
    {
        accessorKey: 'vessel_type',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
        cell: ({ row }) => {
            const vessel = row.original;
            return <VesselTypeBadge type={vessel.vessel_type} iconOnly />;
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const vessel = row.original;

            return <VesselStatusBadge status={vessel.status} className="capitalize" />;
        },
    },
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
            const vessel = row.original;

            return (
                <>
                    <VesselsPageColumnActions vessel={vessel} />
                </>
            );
        },
    },
];
