'use client';

import { useState } from 'react';

import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    RowSelectionState,
    SortingState,
    useReactTable,
    VisibilityState,
} from '@tanstack/react-table';

import { OrderGroup } from '@/types/models';

import { DataTablePaginationControls } from '@/components/ui/data-table/data-table-pagination-controls';
import { DataTableViewOptions } from '@/components/ui/data-table/data-table-view-options';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import type { ColumnDef } from '@tanstack/react-table';

interface OrderGroupsPageDataTableProps {
    columns: ColumnDef<OrderGroup>[];
    data: OrderGroup[];
}

export function OrderGroupsPageDataTable({ columns, data }: OrderGroupsPageDataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <div>
            <div className="flex items-center py-4">
                <Input
                    placeholder="Search by group number..."
                    value={(table.getColumn('group_number')?.getFilterValue() as string) ?? ''}
                    onChange={(event) => table.getColumn('group_number')?.setFilterValue(event.target.value)}
                    className="max-w-sm"
                />

                <DataTableViewOptions table={table} />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="pt-4">
                <DataTablePaginationControls table={table} />
            </div>
        </div>
    );
}
