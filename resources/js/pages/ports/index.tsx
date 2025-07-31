import { columns } from '@/components/data-table/page-ports/columns';
import { PortsPageDataTable } from '@/components/data-table/page-ports/data-table';
import { buttonVariants } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Port } from '@/types/core';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Ports',
        href: '/ports',
    },
];

export default function PortsIndexPage({ ports }: { ports: Array<Port> }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ports Page" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Ports</h1>
                    <Link href={route('ports.create')} className={buttonVariants({ variant: 'default' })}>
                        Create port
                    </Link>
                </div>

                <PortsPageDataTable columns={columns} data={ports} />

                {ports.length === 0 && (
                    <div className="py-8 text-center">
                        <p className="text-muted-foreground">No ports found. Create your first port!</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
