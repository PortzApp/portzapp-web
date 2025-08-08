import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '../primitives/data-table-column-header';
import { ServicesPageColumnActions } from './column-actions';
import { Service } from '@/types/models';

export const servicesPageColumns: ColumnDef<Service>[] = [
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
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    },
    {
        accessorKey: 'description',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
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

            return <div className="text-left font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            return (
                <Badge variant="default" className="text-left font-medium">
                    {status}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'port.name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Port" />,
    },
    {
        accessorKey: 'organization.name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created By" />,
    },
    {
        id: 'actions',
        header: () => null,
        cell: ({ row }) => {
            const service = row.original;

            return (
                <>
                    <ServicesPageColumnActions service={service} />
                </>
            );
        },
    },
];
