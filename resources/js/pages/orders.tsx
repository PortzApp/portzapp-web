import { ordersPageColumnsAsShippingAgencyRole, ordersPageColumnsAsVesselOwnerRole } from '@/components/data-table/page-orders/columns';
import { OrdersPageDataTable } from '@/components/data-table/page-orders/data-table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Order } from '@/types/core';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Orders',
        href: '/orders',
    },
];

export default function OrdersPage({ orders }: { orders: Array<Order> }) {
    const { role: currentRole } = usePage<SharedData>().props.auth.user;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders Page" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="text-2xl font-bold">{currentRole === 'vessel_owner' ? 'My Orders' : 'Incoming Orders'}</h1>

                <OrdersPageDataTable
                    columns={currentRole === 'vessel_owner' ? ordersPageColumnsAsVesselOwnerRole : ordersPageColumnsAsShippingAgencyRole}
                    data={orders}
                />

                {orders.length === 0 && (
                    <div className="py-8 text-center">
                        <p className="text-muted-foreground">No orders found. Place your first order!</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
