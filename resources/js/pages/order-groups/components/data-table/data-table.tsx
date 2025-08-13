import { ColumnDef } from '@tanstack/react-table';

import { OrderGroup } from '@/types/models';

import { DataTable } from '@/components/ui/data-table/data-table';

import { columns } from './columns';

interface OrderGroupsPageDataTableProps {
    columns: ColumnDef<OrderGroup>[];
    data: OrderGroup[];
}

export function OrderGroupsPageDataTable({ data }: OrderGroupsPageDataTableProps) {
    return (
        <>
            <DataTable columns={columns} data={data} />
        </>
    );
}
