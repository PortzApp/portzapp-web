import { Head, Link, usePage } from '@inertiajs/react';

import type { BreadcrumbItem, SharedData } from '@/types';
import { OrderWithRelations } from '@/types/models';

import AppLayout from '@/layouts/app-layout';

import { buttonVariants } from '@/components/ui/button';

import { columns } from './components/data-table/columns';
import { OrdersPageDataTable } from './components/data-table/data-table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Orders',
        href: route('orders.index'),
    },
];

export default function OrdersIndexPage({ orders }: { orders: Array<OrderWithRelations> }) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders Page" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Orders</h1>
                    {auth.user.current_organization?.business_type === 'vessel_owner' && (
                        <Link href={route('orders.create')} className={buttonVariants({ variant: 'default' })}>
                            Create order
                        </Link>
                    )}
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
