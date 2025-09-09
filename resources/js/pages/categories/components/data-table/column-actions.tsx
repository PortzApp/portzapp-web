import { useState } from 'react';

import { Link, router, usePage } from '@inertiajs/react';
import { Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import type { SharedData } from '@/types';
import { ServiceCategory } from '@/types/models';

import { Button } from '@/components/ui/button';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExpandableCategoryRow extends ServiceCategory {
    isSubCategory?: boolean;
    parentId?: string;
}

interface CategoriesPageColumnActionsProps {
    category: ExpandableCategoryRow;
}

export function CategoriesPageColumnActions({ category }: CategoriesPageColumnActionsProps) {
    const [openDropdown, setOpenDropdown] = useState(false);
    const [openDeleteCategoryDialog, setOpenDeleteCategoryDialog] = useState(false);
    const { auth } = usePage<SharedData>().props;

    // Don't show actions for sub-category rows
    if (category.isSubCategory) {
        return <div className="w-8" />;
    }

    function handleDeleteCategory() {
        router.delete(route('categories.destroy', category.id), {
            onSuccess: () => {
                setOpenDeleteCategoryDialog(false);
                setOpenDropdown(false);
                toast(`Category "${category.name}" deleted successfully!`);
            },
        });
    }

    return (
        <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {auth.permissions.serviceCategory?.view && (
                    <DropdownMenuItem asChild>
                        <Link href={route('categories.show', category.id)} className="flex">
                            <Eye />
                            View category
                        </Link>
                    </DropdownMenuItem>
                )}

                {auth.permissions.serviceCategory?.update && (
                    <DropdownMenuItem asChild>
                        <Link href={route('categories.edit', category.id)} className="flex">
                            <Edit />
                            Edit category
                        </Link>
                    </DropdownMenuItem>
                )}

                {auth.permissions.serviceCategory?.delete && (
                    <Dialog open={openDeleteCategoryDialog} onOpenChange={setOpenDeleteCategoryDialog}>
                        <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 />
                                Delete category
                            </DropdownMenuItem>
                        </DialogTrigger>

                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete category</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete the category "{category.name}"? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" onClick={handleDeleteCategory}>
                                    Delete category
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}