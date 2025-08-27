import { useEffect, useState } from 'react';

import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { toast } from 'sonner';

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

interface OrderEvent {
    message: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    timestamp: string;
}

interface OrderUpdatedEvent extends OrderEvent {
    order: OrderWithRelations;
}

export default function OrdersIndexPage({ orders: initialOrders }: { orders: Array<OrderWithRelations> }) {
    const { auth } = usePage<SharedData>().props;
    const [orders, setOrders] = useState(initialOrders);

    // Sync new props back to local state after server refetch
    useEffect(() => {
        setOrders(initialOrders);
    }, [initialOrders]);

    // Listen for order updated events on static channel
    useEcho<OrderUpdatedEvent>('orders', 'OrderUpdated', ({ order: updatedOrder }) => {
        setOrders((prevOrders) =>
            prevOrders.map((prevOrder) =>
                prevOrder.id === updatedOrder.id
                    ? {
                          ...prevOrder,
                          status: updatedOrder.status,
                          updated_at: updatedOrder.updated_at,
                      }
                    : prevOrder,
            ),
        );

        toast('Order updated', {
            description: `Order #${updatedOrder.order_number} status changed to ${updatedOrder.status?.replace(/_/g, ' ')}`,
            classNames: {
                description: '!text-muted-foreground',
            },
            action: {
                label: 'View Order',
                onClick: () => {
                    router.visit(route('orders.show', updatedOrder.id));
                },
            },
        });
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders Page" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Orders</h1>
                    {auth.user.current_organization?.business_type === 'vessel_owner' && (
                        <Link href={route('order-wizard.dashboard')} className={buttonVariants({ variant: 'default' })}>
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

// export default function Page() {
//     return <p>Hello world</p>;
// }
