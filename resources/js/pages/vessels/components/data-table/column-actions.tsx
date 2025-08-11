import { useState } from 'react';

import { Link, router, usePage } from '@inertiajs/react';
import { Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import type { SharedData } from '@/types';
import { Vessel } from '@/types/models';

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

export function VesselsPageColumnActions({ vessel }: { vessel: Vessel }) {
    const [openDropdown, setOpenDropdown] = useState(false);
    const [openDeleteVesselDialog, setOpenDeleteVesselDialog] = useState(false);
    const { auth } = usePage<SharedData>().props;

    function handleDeleteVessel() {
        router.delete(route('vessels.destroy', vessel.id), {
            onSuccess: () => {
                setOpenDeleteVesselDialog(false);
                setOpenDropdown(false);
                toast(`Vessel #${vessel.id} deleted successfully!`);
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
                    <Link href={route('vessels.show', vessel.id)} className="flex">
                        <Eye />
                        View vessel
                    </Link>
                </DropdownMenuItem>

                {auth.permissions.vessel.edit && (
                    <DropdownMenuItem asChild>
                        <Link href={route('vessels.edit', vessel.id)} className="flex">
                            <Edit />
                            Edit vessel
                        </Link>
                    </DropdownMenuItem>
                )}

                {auth.permissions.vessel.delete && (
                    <Dialog open={openDeleteVesselDialog} onOpenChange={setOpenDeleteVesselDialog}>
                        <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 />
                                Delete vessel
                            </DropdownMenuItem>
                        </DialogTrigger>

                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete vessel</DialogTitle>
                                <DialogDescription>Are you sure you want to delete this vessel?</DialogDescription>
                            </DialogHeader>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" onClick={handleDeleteVessel}>
                                    Delete vessel
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
