import { servicesPageColumns } from '@/components/data-table/page-services/columns';
import { ServicesPageDataTable } from '@/components/data-table/page-services/data-table';
import { buttonVariants } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Service } from '@/types/core';
import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Services',
        href: '/services',
    },
];

export default function Services({ services }: { services: Service[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Services Page" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Services</h1>

                    <Link href={'/services/create'} className={buttonVariants({ variant: 'default' })}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Service
                    </Link>
                </div>

                <ServicesPageDataTable columns={servicesPageColumns} data={services} />

                {services.length === 0 && (
                    <div className="py-8 text-center">
                        <p className="text-muted-foreground">No services found. Create your first service!</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
