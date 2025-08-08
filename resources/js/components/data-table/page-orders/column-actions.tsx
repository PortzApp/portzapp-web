import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Link, router } from '@inertiajs/react';
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
import { OrderWithRelations } from '@/types/models';
import { toast } from 'sonner';

export function OrdersPageColumnActions({ order }: { order: OrderWithRelations }) {
    const [openDropdown, setOpenDropdown] = useState(false);
    const [openDeleteOrderDialog, setOpenDeleteOrderDialog] = useState(false);

    function handleDeleteOrder() {
        router.delete(route('orders.destroy', order.id), {
            onSuccess: () => {
                setOpenDeleteOrderDialog(false);
                setOpenDropdown(false);
                toast(`Order #${order.id} deleted successfully!`);
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
                    <Link href={route('orders.show', order.id)} className="flex">
                        <Eye />
                        View order
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link href={route('orders.edit', order.id)} className="flex">
                        <Edit />
                        Edit order
                    </Link>
                </DropdownMenuItem>

                <Dialog open={openDeleteOrderDialog} onOpenChange={setOpenDeleteOrderDialog}>
                    <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 />
                            Delete order
                        </DropdownMenuItem>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete order</DialogTitle>
                            <DialogDescription>Are you sure you want to delete this order?</DialogDescription>
                        </DialogHeader>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" variant="destructive" onClick={handleDeleteOrder}>
                                Delete order
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
