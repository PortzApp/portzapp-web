import { Head, Link, usePage } from '@inertiajs/react';

import type { BreadcrumbItem, SharedData } from '@/types';
import { Vessel } from '@/types/models';

import AppLayout from '@/layouts/app-layout';

import { buttonVariants } from '@/components/ui/button';

import { columns } from './components/data-table/columns';
import { VesselsPageDataTable } from './components/data-table/data-table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Vessels',
        href: route('vessels.index'),
    },
];

export default function VesselsIndexPage({ vessels }: { vessels: Array<Vessel> }) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vessels Page" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">My Vessels</h1>
                    {auth.permissions.vessel.create && (
                        <Link href={route('vessels.create')} className={buttonVariants({ variant: 'default' })}>
                            Create vessel
                        </Link>
                    )}
                </div>

                <VesselsPageDataTable columns={columns} data={vessels} />

                {vessels.length === 0 && (
                    <div className="py-8 text-center">
                        <p className="text-muted-foreground">No vessels found. Create your first vessel!</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
