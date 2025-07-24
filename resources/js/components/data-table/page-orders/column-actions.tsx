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
import { Ban, Eye, MoreHorizontal } from 'lucide-react';
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
import { Order } from '@/types/core';
import { toast } from 'sonner';

export function OrdersPageColumnActions({ order }: { order: Order }) {
    const [openDropdown, setOpenDropdown] = useState(false);
    const [openCancelOrderDialog, setOpenCancelOrderDialog] = useState(false);

    function handleCancelOrder() {
        setOpenCancelOrderDialog(false);
        setOpenDropdown(false);

        router.put(
            route('orders.update', order.id),
            {
                status: 'cancelled',
            },
            {
                onSuccess: () => {
                    toast(`Order #${order.id} cancelled successfully!`);
                },
            },
        );
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
                    <Link href={`/orders/${order.id}`} className="flex">
                        <Eye />
                        View details
                    </Link>
                </DropdownMenuItem>

                <Dialog open={openCancelOrderDialog} onOpenChange={setOpenCancelOrderDialog}>
                    <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Ban />
                            Cancel order
                        </DropdownMenuItem>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Cancel order</DialogTitle>
                            <DialogDescription>Are you sure you want to cancel this order?</DialogDescription>
                        </DialogHeader>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" onClick={handleCancelOrder}>
                                Cancel order
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
