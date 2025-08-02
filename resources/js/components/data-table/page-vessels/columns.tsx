import { VesselsPageColumnActions } from '@/components/data-table/page-vessels/column-actions';
import { DataTableColumnHeader } from '@/components/data-table/primitives/data-table-column-header';
import BulkCarrierIcon from '@/components/icons/vessel-type-bulk-carrier-icon';
import ContainerShipIcon from '@/components/icons/vessel-type-container-ship-icon';
import TankerShipIcon from '@/components/icons/vessel-type-tanker-ship-icon';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Vessel } from '@/types/core';
import { ColumnDef } from '@tanstack/react-table';
import { Dot } from 'lucide-react';

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

            const IconComponent = {
                cargo: BulkCarrierIcon,
                tanker: TankerShipIcon,
                container: ContainerShipIcon,
            }[vessel.vessel_type] || BulkCarrierIcon;

            return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <IconComponent className="h-15 w-15 text-neutral-600"/>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="capitalize">{vessel.vessel_type} Vessel</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
            );
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const vessel = row.original;

            return (
                <Badge
                    className={cn(
                        vessel.status === 'active' && 'bg-blue-200 text-blue-950 uppercase',
                        vessel.status === 'inactive' && 'bg-red-200 text-red-950 uppercase',
                        vessel.status === 'maintenance' && 'bg-yellow-200 text-yellow-950 uppercase',
                    )}
                >
                    <Dot />
                    {vessel.status}
                </Badge>
            );
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
