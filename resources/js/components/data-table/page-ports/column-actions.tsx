import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Link, router, usePage } from '@inertiajs/react';
import { Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';

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
import type { SharedData } from '@/types';
import { Port } from '@/types/core';
import { toast } from 'sonner';

export function PortsPageColumnActions({ port }: { port: Port }) {
    const [openDropdown, setOpenDropdown] = useState(false);
    const [openDeletePortDialog, setOpenDeletePortDialog] = useState(false);
    const { auth } = usePage<SharedData>().props;

    function handleDeletePort() {
        router.delete(route('ports.destroy', port.id), {
            onSuccess: () => {
                setOpenDeletePortDialog(false);
                setOpenDropdown(false);
                toast(`Port #${port.id} deleted successfully!`);
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
                    <Link href={route('ports.show', port.id)} className="flex">
                        <Eye />
                        View port
                    </Link>
                </DropdownMenuItem>

                {auth.can.ports.edit && (
                    <DropdownMenuItem asChild>
                        <Link href={route('ports.edit', port.id)} className="flex">
                            <Edit />
                            Edit port
                        </Link>
                    </DropdownMenuItem>
                )}

                {auth.can.ports.delete && (
                    <Dialog open={openDeletePortDialog} onOpenChange={setOpenDeletePortDialog}>
                        <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 />
                                Delete port
                            </DropdownMenuItem>
                        </DialogTrigger>

                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete port</DialogTitle>
                                <DialogDescription>Are you sure you want to delete this port?</DialogDescription>
                            </DialogHeader>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" onClick={handleDeletePort}>
                                    Delete port
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
