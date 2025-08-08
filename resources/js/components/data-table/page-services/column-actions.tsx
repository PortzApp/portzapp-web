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

import { Service } from '@/types/models';
import { Link, router } from '@inertiajs/react';
import { Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';

export function ServicesPageColumnActions({ service }: { service: Service }) {
    const [openDropdown, setOpenDropdown] = useState(false);
    const [openDeleteServiceDialog, setOpenDeleteServiceDialog] = useState(false);

    function handleDeleteService() {
        router.delete(route('services.destroy', service.id), {
            onSuccess: () => {
                setOpenDeleteServiceDialog(false);
                setOpenDropdown(false);
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
                    <Link href={route('services.show', service.id)} className="flex">
                        <Eye />
                        View service
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link href={route('services.edit', service.id)} className="flex">
                        <Edit />
                        Edit service
                    </Link>
                </DropdownMenuItem>

                <Dialog open={openDeleteServiceDialog} onOpenChange={setOpenDeleteServiceDialog}>
                    <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 />
                            Delete service
                        </DropdownMenuItem>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete service</DialogTitle>
                            <DialogDescription>Are you sure you want to delete this service?</DialogDescription>
                        </DialogHeader>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" onClick={handleDeleteService}>
                                Delete service
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
