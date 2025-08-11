import { useState } from 'react';

import { Link, router, usePage } from '@inertiajs/react';
import { Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import type { SharedData } from '@/types';
import { Organization } from '@/types/models';

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

export function OrganizationsPageColumnActions({ organization }: { organization: Organization }) {
    const [openDropdown, setOpenDropdown] = useState(false);
    const [openDeleteOrganizationDialog, setOpenDeleteOrganizationDialog] = useState(false);
    const { auth } = usePage<SharedData>().props;

    function handleDeleteOrganization() {
        router.delete(route('organizations.destroy', organization.id), {
            onSuccess: () => {
                setOpenDeleteOrganizationDialog(false);
                setOpenDropdown(false);
                toast(`Organization "${organization.name}" deleted successfully!`);
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

                <DropdownMenuItem asChild>
                    <Link href={route('organizations.show', organization.id)} className="flex">
                        <Eye />
                        View organization
                    </Link>
                </DropdownMenuItem>

                {auth.permissions.organization.edit && (
                    <DropdownMenuItem asChild>
                        <Link href={route('organizations.edit', organization.id)} className="flex">
                            <Edit />
                            Edit organization
                        </Link>
                    </DropdownMenuItem>
                )}

                {auth.permissions.organization.delete && (
                    <Dialog open={openDeleteOrganizationDialog} onOpenChange={setOpenDeleteOrganizationDialog}>
                        <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 />
                                Delete organization
                            </DropdownMenuItem>
                        </DialogTrigger>

                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete organization</DialogTitle>
                                <DialogDescription>Are you sure you want to delete this organization?</DialogDescription>
                            </DialogHeader>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" onClick={handleDeleteOrganization}>
                                    Delete organization
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
