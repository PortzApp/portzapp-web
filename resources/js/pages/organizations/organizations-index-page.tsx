import { Head, Link, usePage } from '@inertiajs/react';

import type { BreadcrumbItem, SharedData } from '@/types';
import { Organization } from '@/types/models';

import AppLayout from '@/layouts/app-layout';

import { buttonVariants } from '@/components/ui/button';

import { columns } from './components/data-table/columns';
import { OrganizationsPageDataTable } from './components/data-table/data-table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Organizations',
        href: route('organizations.index'),
    },
];

export default function OrganizationsIndexPage({ organizations }: { organizations: Array<Organization> }) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Organizations Page" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Organizations</h1>
                    {auth.permissions.organization.create && (
                        <Link href={route('organizations.create')} className={buttonVariants({ variant: 'default' })}>
                            Create organization
                        </Link>
                    )}
                </div>

                <OrganizationsPageDataTable columns={columns} data={organizations} />

                {organizations.length === 0 && (
                    <div className="py-8 text-center">
                        <p className="text-muted-foreground">No organizations found</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
