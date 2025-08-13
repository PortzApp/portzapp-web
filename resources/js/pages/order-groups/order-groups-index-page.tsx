import { Head } from '@inertiajs/react';

import type { BreadcrumbItem } from '@/types';
import { OrderGroup } from '@/types/models';

import AppLayout from '@/layouts/app-layout';

import { columns } from './components/data-table/columns';
import { OrderGroupsPageDataTable } from './components/data-table/data-table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Order Groups',
        href: route('order-groups.index'),
    },
];

export default function OrderGroupsIndexPage({ orderGroups }: { orderGroups: Array<OrderGroup> }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Order Groups" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Order Groups</h1>
                        <p className="text-muted-foreground">Manage service requests assigned to your agency</p>
                    </div>
                </div>

                <OrderGroupsPageDataTable columns={columns} data={orderGroups} />

                {orderGroups.length === 0 && (
                    <div className="py-8 text-center">
                        <p className="text-muted-foreground">No order groups found. No service requests have been assigned to your agency yet.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
