import { Link, router } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';

import { OrderGroup } from '@/types/models';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface OrderGroupsPageColumnActionsProps {
    orderGroup: OrderGroup;
}

export function OrderGroupsPageColumnActions({ orderGroup }: OrderGroupsPageColumnActionsProps) {
    const canAccept = orderGroup.status === 'pending';
    const canReject = orderGroup.status === 'pending';
    const canStart = orderGroup.status === 'accepted';
    const canComplete = orderGroup.status === 'in_progress';

    const handleAccept = () => {
        router.post(route('order-groups.accept', orderGroup.id));
    };

    const handleReject = () => {
        router.post(route('order-groups.reject', orderGroup.id));
    };

    const handleStart = () => {
        router.post(route('order-groups.start', orderGroup.id));
    };

    const handleComplete = () => {
        router.post(route('order-groups.complete', orderGroup.id));
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                <Link href={route('order-groups.show', orderGroup.id)}>
                    <DropdownMenuItem>View details</DropdownMenuItem>
                </Link>

                <DropdownMenuSeparator />

                {canAccept && (
                    <DropdownMenuItem onClick={handleAccept} className="text-green-600">
                        Accept order group
                    </DropdownMenuItem>
                )}

                {canReject && (
                    <DropdownMenuItem onClick={handleReject} className="text-red-600">
                        Reject order group
                    </DropdownMenuItem>
                )}

                {canStart && (
                    <DropdownMenuItem onClick={handleStart} className="text-blue-600">
                        Start work
                    </DropdownMenuItem>
                )}

                {canComplete && (
                    <DropdownMenuItem onClick={handleComplete} className="text-green-600">
                        Mark as completed
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
