import { Head, Link, usePage } from '@inertiajs/react';

import type { BreadcrumbItem, SharedData } from '@/types';
import { ServiceCategory } from '@/types/models';

import AppLayout from '@/layouts/app-layout';

import { buttonVariants } from '@/components/ui/button';

import { columns } from './components/data-table/columns';
import { CategoriesPageDataTable } from './components/data-table/data-table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: route('categories.index'),
    },
];

export default function CategoriesIndexPage({ categories }: { categories: Array<ServiceCategory> }) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Categories</h1>
                    {auth.permissions.serviceCategory?.create && (
                        <Link href={route('categories.create')} className={buttonVariants({ variant: 'default' })}>
                            Create Category
                        </Link>
                    )}
                </div>

                <CategoriesPageDataTable columns={columns} data={categories} />

                {categories.length === 0 && (
                    <div className="py-8 text-center">
                        <p className="text-muted-foreground">No categories found. Create your first category!</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}