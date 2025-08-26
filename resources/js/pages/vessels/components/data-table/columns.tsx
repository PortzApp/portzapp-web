import { VesselsPageColumnActions } from '@/pages/vessels/components/data-table/column-actions';
import { ColumnDef } from '@tanstack/react-table';
import { Info } from 'lucide-react';

import { Vessel } from '@/types/models';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { VesselStatusBadge, VesselTypeBadge } from '@/components/badges';

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
        accessorKey: 'grt',
        header: ({ column }) => (
            <div className="flex items-center gap-1">
                <DataTableColumnHeader column={column} title="GRT" />
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Gross Register Tonnage - Total internal volume</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        ),
        cell: ({ row }) => {
            const vessel = row.original;
            return vessel.grt ? (
                <p className="tabular-nums">{new Intl.NumberFormat().format(vessel.grt)}</p>
            ) : (
                <span className="text-muted-foreground">—</span>
            );
        },
    },
    {
        accessorKey: 'nrt',
        header: ({ column }) => (
            <div className="flex items-center gap-1">
                <DataTableColumnHeader column={column} title="NRT" />
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Net Register Tonnage - Cargo carrying capacity</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        ),
        cell: ({ row }) => {
            const vessel = row.original;
            return vessel.nrt ? (
                <p className="tabular-nums">{new Intl.NumberFormat().format(vessel.nrt)}</p>
            ) : (
                <span className="text-muted-foreground">—</span>
            );
        },
    },
    {
        accessorKey: 'dwt',
        header: ({ column }) => (
            <div className="flex items-center gap-1">
                <DataTableColumnHeader column={column} title="DWT" />
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Deadweight Tonnage - Maximum cargo weight capacity</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        ),
        cell: ({ row }) => {
            const vessel = row.original;
            const dwtInTons = vessel.dwt ? vessel.dwt / 1000 : null;
            return dwtInTons ? (
                <p className="tabular-nums">{new Intl.NumberFormat().format(Math.round(dwtInTons))} t</p>
            ) : (
                <span className="text-muted-foreground">—</span>
            );
        },
    },
    {
        accessorKey: 'loa',
        header: ({ column }) => (
            <div className="flex items-center gap-1">
                <DataTableColumnHeader column={column} title="LOA" />
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Length Overall - Total length of vessel</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        ),
        cell: ({ row }) => {
            const vessel = row.original;
            const loaInMeters = vessel.loa ? vessel.loa / 1000 : null;
            return loaInMeters ? <p className="tabular-nums">{loaInMeters} m</p> : <span className="text-muted-foreground">—</span>;
        },
    },
    {
        accessorKey: 'flag_state',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Flag" />,
        cell: ({ row }) => {
            const vessel = row.original;
            return vessel.flag_state ? <p className="text-sm">{vessel.flag_state}</p> : <span className="text-muted-foreground">—</span>;
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
