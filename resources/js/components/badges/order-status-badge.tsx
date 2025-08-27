import React from 'react';

import { CheckCircle, CheckCircle2, CheckSquare, CircleDot, Clock, FileText, Play, XCircle, XSquare } from 'lucide-react';

import { OrderStatus } from '@/types/enums';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';

const orderStatusStyles: Record<OrderStatus, string> = {
    draft: 'bg-gray-200 text-gray-950 dark:bg-gray-800 dark:text-gray-50',
    pending_agency_confirmation: 'bg-amber-200 text-amber-950 dark:bg-amber-900 dark:text-amber-50',
    partially_accepted: 'bg-orange-200 text-orange-950 dark:bg-orange-900 dark:text-orange-50',
    partially_rejected: 'bg-orange-300 text-orange-950 dark:bg-orange-800 dark:text-orange-50',
    confirmed: 'bg-green-200 text-green-950 dark:bg-green-900 dark:text-green-50',
    in_progress: 'bg-blue-200 text-blue-950 dark:bg-blue-900 dark:text-blue-50',
    partially_completed: 'bg-sky-200 text-sky-950 dark:bg-sky-900 dark:text-sky-50',
    completed: 'bg-green-200 text-green-950 dark:bg-green-900 dark:text-green-50',
    cancelled: 'bg-red-200 text-red-950 dark:bg-red-900 dark:text-red-50',
};

const orderStatusIcons: Record<OrderStatus, React.ComponentType<{ className?: string }>> = {
    draft: FileText,
    pending_agency_confirmation: Clock,
    partially_accepted: CheckSquare,
    partially_rejected: XSquare,
    confirmed: CheckCircle2,
    in_progress: Play,
    partially_completed: CircleDot,
    completed: CheckCircle,
    cancelled: XCircle,
};

interface OrderStatusBadgeProps {
    status: OrderStatus;
    className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
    const Icon = orderStatusIcons[status];

    return (
        <Badge className={cn(orderStatusStyles[status], 'inline-flex items-center gap-1 uppercase', className)}>
            <Icon className="size-3" />
            {status.replace(/_/g, ' ')}
        </Badge>
    );
}
