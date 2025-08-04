import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle2, CircleOff, Wrench } from 'lucide-react';

type VesselStatus = 'active' | 'inactive' | 'maintenance';

const vesselStatusStyles: Record<VesselStatus, string> = {
    active: 'bg-blue-200 text-blue-950',
    inactive: 'bg-red-200 text-red-950',
    maintenance: 'bg-yellow-200 text-yellow-950',
};

const vesselStatusIcons: Record<VesselStatus, React.ComponentType<{ className?: string }>> = {
    active: CheckCircle2,
    inactive: CircleOff,
    maintenance: Wrench,
};

interface VesselStatusBadgeProps {
    status: VesselStatus;
    className?: string;
}

export function VesselStatusBadge({ status, className }: VesselStatusBadgeProps) {
    const Icon = vesselStatusIcons[status];

    return (
        <Badge className={cn(vesselStatusStyles[status], 'inline-flex items-center gap-1 uppercase', className)}>
            <Icon className="h-3 w-3" />
            {status}
        </Badge>
    );
}
