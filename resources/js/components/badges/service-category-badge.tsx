import React from 'react';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';

interface ServiceCategoryBadgeProps {
    categoryName: string;
    className?: string;
    variant?: 'default' | 'secondary' | 'outline';
}

export function ServiceCategoryBadge({ categoryName, className, variant = 'secondary' }: ServiceCategoryBadgeProps) {
    return (
        <Badge variant={variant} className={cn('text-xs', className)}>
            {categoryName}
        </Badge>
    );
}
