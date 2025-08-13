import { OrdersPageDataTable } from '@/pages/orders/components/data-table/data-table';
import { ColumnDef } from '@tanstack/react-table';

import { OrderGroup } from '@/types/models';

import { columns } from './columns';

interface OrderGroupsPageDataTableProps {
    columns: ColumnDef<OrderGroup>[];
    data: OrderGroup[];
}

export function OrderGroupsPageDataTable({ data }: OrderGroupsPageDataTableProps) {
    return (
        <>
            <OrdersPageDataTable columns={columns} data={data} />
        </>
    );
}
