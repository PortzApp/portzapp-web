import { useEffect, useState } from 'react';

import { Head, router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { toast } from 'sonner';

import type { BreadcrumbItem, SharedData } from '@/types';
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

interface OrderGroupEvent {
    message: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    timestamp: string;
}

interface OrderGroupUpdatedEvent extends OrderGroupEvent {
    orderGroup: OrderGroup;
}

export default function OrderGroupsIndexPage({ orderGroups: initialOrderGroups }: { orderGroups: Array<OrderGroup> }) {
    const { auth } = usePage<SharedData>().props;
    const [orderGroups, setOrderGroups] = useState(initialOrderGroups);

    // Sync new props back to local state after server refetch
    useEffect(() => {
        setOrderGroups(initialOrderGroups);
    }, [initialOrderGroups]);

    // Listen for order group updated events on organization-scoped channel
    useEcho<OrderGroupUpdatedEvent>(
        `order-groups.organization.${auth.user.current_organization?.id}`,
        'OrderGroupUpdated',
        ({ orderGroup: updatedOrderGroup }) => {
            setOrderGroups((prevOrderGroups) =>
                prevOrderGroups.map((prevOrderGroup) =>
                    prevOrderGroup.id === updatedOrderGroup.id
                        ? {
                              ...prevOrderGroup,
                              status: updatedOrderGroup.status,
                              updated_at: updatedOrderGroup.updated_at,
                          }
                        : prevOrderGroup,
                ),
            );

            toast('Order group updated', {
                description: `Order group #${updatedOrderGroup.group_number} status changed to ${updatedOrderGroup.status?.replace(/_/g, ' ')}`,
                classNames: {
                    description: '!text-muted-foreground',
                },
                action: {
                    label: 'View Order Group',
                    onClick: () => {
                        router.visit(route('order-groups.show', updatedOrderGroup.id));
                    },
                },
            });
        },
    );
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
