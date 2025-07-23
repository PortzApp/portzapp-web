import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { OrdersPageDataTable } from '@/components/data-table/page-orders/data-table';
import { ordersPageColumns } from '@/components/data-table/page-orders/columns';
import { Order } from '@/types/order';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Orders',
        href: '/orders'
    }
];

export default function OrdersPage({ orders }: { orders: Array<Order> }) {
    console.log(orders);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders Page" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-2xl font-bold">My Orders</h1>

                <OrdersPageDataTable columns={ordersPageColumns} data={orders} />

                {orders.length === 0 && (
                    <div className="py-8 text-center">
                        <p className="text-muted-foreground">No orders found. Place your first order!</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
