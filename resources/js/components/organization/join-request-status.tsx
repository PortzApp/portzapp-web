import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface JoinRequestStatusProps {
    status: 'pending' | 'approved' | 'rejected';
    className?: string;
    size?: 'sm' | 'default' | 'lg';
    showIcon?: boolean;
    variant?: 'badge' | 'inline';
}

const statusConfig = {
    pending: {
        label: 'Pending',
        icon: Clock,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        dotColor: 'bg-yellow-500',
    },
    approved: {
        label: 'Approved',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 border-green-200',
        dotColor: 'bg-green-500',
    },
    rejected: {
        label: 'Rejected',
        icon: XCircle,
        className: 'bg-red-100 text-red-800 border-red-200',
        dotColor: 'bg-red-500',
    },
};

export function JoinRequestStatus({
    status,
    className,
    size = 'default',
    showIcon = true,
    variant = 'badge',
}: JoinRequestStatusProps) {
    const config = statusConfig[status];
    const Icon = config.icon;

    const sizeClasses = {
        sm: 'text-xs px-2 py-1',
        default: 'text-sm px-2.5 py-1.5',
        lg: 'text-base px-3 py-2',
    };

    const iconSizes = {
        sm: 'h-3 w-3',
        default: 'h-4 w-4',
        lg: 'h-5 w-5',
    };

    if (variant === 'inline') {
        return (
            <div className={cn('flex items-center gap-2', className)}>
                {showIcon && (
                    <div className={cn('w-2 h-2 rounded-full', config.dotColor)} />
                )}
                <span className={cn(
                    'font-medium',
                    status === 'pending' && 'text-yellow-700',
                    status === 'approved' && 'text-green-700',
                    status === 'rejected' && 'text-red-700'
                )}>
                    {config.label}
                </span>
            </div>
        );
    }

    return (
        <Badge 
            variant="outline" 
            className={cn(
                config.className,
                sizeClasses[size],
                'font-medium border flex items-center gap-1.5',
                className
            )}
        >
            {showIcon && (
                <Icon className={iconSizes[size]} />
            )}
            {config.label}
        </Badge>
    );
}

// Helper component for status with additional context
interface JoinRequestStatusWithDateProps extends JoinRequestStatusProps {
    createdAt: string;
    updatedAt?: string;
    showRelativeTime?: boolean;
}

export function JoinRequestStatusWithDate({
    status,
    createdAt,
    updatedAt,
    showRelativeTime = true,
    ...props
}: JoinRequestStatusWithDateProps) {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getRelativeTime = (date: string) => {
        const now = new Date();
        const then = new Date(date);
        const diffInHours = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;
        
        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
        
        const diffInMonths = Math.floor(diffInDays / 30);
        return `${diffInMonths}mo ago`;
    };

    const relevantDate = status === 'pending' ? createdAt : (updatedAt || createdAt);
    const dateText = showRelativeTime ? getRelativeTime(relevantDate) : formatDate(relevantDate);
    
    return (
        <div className="flex items-center gap-3">
            <JoinRequestStatus status={status} {...props} />
            <span className="text-sm text-muted-foreground">
                {status === 'pending' ? 'Requested' : 'Updated'} {dateText}
            </span>
        </div>
    );
}