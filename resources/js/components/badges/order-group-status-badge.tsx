import React from 'react';

import { CheckCircle, CheckCircle2, Clock, Play, XCircle } from 'lucide-react';

import { OrderGroupStatus } from '@/types/enums';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';

const orderGroupStatusStyles: Record<OrderGroupStatus, string> = {
    pending: 'bg-amber-200 text-amber-950 dark:bg-amber-900 dark:text-amber-50',
    accepted: 'bg-blue-200 text-blue-950 dark:bg-blue-900 dark:text-blue-50',
    rejected: 'bg-red-200 text-red-950 dark:bg-red-900 dark:text-red-50',
    in_progress: 'bg-blue-200 text-blue-950 dark:bg-blue-900 dark:text-blue-50',
    completed: 'bg-green-200 text-green-950 dark:bg-green-900 dark:text-green-50',
};

const orderGroupStatusIcons: Record<OrderGroupStatus, React.ComponentType<{ className?: string }>> = {
    pending: Clock,
    accepted: CheckCircle2,
    rejected: XCircle,
    in_progress: Play,
    completed: CheckCircle,
};

interface OrderGroupStatusBadgeProps {
    status: OrderGroupStatus;
    className?: string;
}

export function OrderGroupStatusBadge({ status, className }: OrderGroupStatusBadgeProps) {
    const Icon = orderGroupStatusIcons[status];

    return (
        <Badge className={cn(orderGroupStatusStyles[status], 'inline-flex items-center gap-1 uppercase', className)}>
            <Icon className="size-3" />
            {status.replace(/_/g, ' ')}
        </Badge>
    );
}