import type { BreadcrumbItem } from '@/types';
import { OrderWithFullRelations } from '@/types/core';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { buttonVariants } from '@/components/ui/button';
import { OrdersPageDataTable } from '@/components/data-table/page-orders/data-table';
import { columns } from '@/components/data-table/page-orders/columns';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Orders',
        href: route('orders'),
    },
];

export default function OrdersIndexPage({ orders }: { orders: Array<OrderWithFullRelations> }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders Page" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Orders</h1>
                    <Link href={route('orders.create')} className={buttonVariants({ variant: 'default' })}>
                        Create order
                    </Link>
                </div>

                <OrdersPageDataTable columns={columns} data={orders} />

                {orders.length === 0 && (
                    <div className="py-8 text-center">
                        <p className="text-muted-foreground">No orders found. Create your first order!</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

// export default function Page() {
//     return <p>Hello world</p>;
// }
