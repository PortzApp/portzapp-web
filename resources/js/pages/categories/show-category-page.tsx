import { useState } from 'react';

import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Trash2 } from 'lucide-react';

import type { BreadcrumbItem, SharedData } from '@/types';
import { ServiceCategory } from '@/types/models';

import AppLayout from '@/layouts/app-layout';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface ShowCategoryPageProps {
    category: ServiceCategory;
}

export default function ShowCategoryPage({ category }: ShowCategoryPageProps) {
    const { auth } = usePage<SharedData>().props;
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Categories',
            href: route('categories.index'),
        },
        {
            title: category.name,
            href: route('categories.show', category.id),
        },
    ];

    const handleDelete = () => {
        setOpenDeleteDialog(false);

        router.delete(route('categories.destroy', category.id), {
            onSuccess: () => {
                router.visit(route('categories.index'));
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Category: ${category.name}`} />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{category.name}</h1>
                        <p className="text-muted-foreground">
                            Created on {new Date(category.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    
                    <div className="flex gap-2">
                        {auth.permissions.serviceCategory?.update && (
                            <Button asChild>
                                <Link href={route('categories.edit', category.id)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Category
                                </Link>
                            </Button>
                        )}
                        
                        {auth.permissions.serviceCategory?.delete && (
                            <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                                <DialogTrigger asChild>
                                    <Button variant="destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Delete Category</DialogTitle>
                                        <DialogDescription>
                                            Are you sure you want to delete "{category.name}"? This action cannot be undone.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button variant="destructive" onClick={handleDelete}>
                                            Delete Category
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sub-Categories</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{category.sub_categories_count || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {category.sub_categories_count === 1 ? 'sub-category' : 'sub-categories'} in this category
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{category.services_count || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {category.services_count === 1 ? 'service' : 'services'} across all sub-categories
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Sub-Categories */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Sub-Categories</h2>
                        {auth.permissions.serviceCategory?.update && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={route('categories.edit', category.id)}>
                                    Manage Sub-Categories
                                </Link>
                            </Button>
                        )}
                    </div>

                    {category.sub_categories && category.sub_categories.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {category.sub_categories.map((subCategory) => (
                                <Card key={subCategory.id}>
                                    <CardHeader>
                                        <CardTitle className="text-base">{subCategory.name}</CardTitle>
                                        {subCategory.description && (
                                            <CardDescription>{subCategory.description}</CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Services</span>
                                            <Badge variant={subCategory.services_count && subCategory.services_count > 0 ? 'default' : 'secondary'}>
                                                {subCategory.services_count || 0}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-8">
                                <p className="text-muted-foreground mb-4">No sub-categories found</p>
                                {auth.permissions.serviceCategory?.update && (
                                    <Button asChild>
                                        <Link href={route('categories.edit', category.id)}>
                                            Add Sub-Categories
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}