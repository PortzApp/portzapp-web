import BulkCarrierIcon from '@/components/icons/vessel-type-bulk-carrier-icon';
import ContainerShipIcon from '@/components/icons/vessel-type-container-ship-icon';
import TankerShipIcon from '@/components/icons/vessel-type-tanker-ship-icon';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { VesselType } from '@/types/vessel';

const vesselTypeStyles: Record<VesselType, string> = {
    cargo: 'bg-neutral-100 text-neutral-800',
    tanker: 'bg-neutral-100 text-neutral-800',
    container: 'bg-neutral-100 text-neutral-800',
};

const vesselTypeIcons: Record<VesselType, React.ComponentType<{ className?: string }>> = {
    cargo: BulkCarrierIcon,
    tanker: TankerShipIcon,
    container: ContainerShipIcon,
};

interface VesselTypeBadgeProps {
    type: VesselType;
    iconOnly?: boolean;
    className?: string;
}

export function VesselTypeBadge({ type, iconOnly = false, className }: VesselTypeBadgeProps) {
    const Icon = vesselTypeIcons[type] || vesselTypeIcons.cargo;

    if (iconOnly) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <Icon className={cn('h-15 w-15 text-neutral-600', className)} />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="capitalize">{type} Vessel</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return <Badge className={cn(vesselTypeStyles[type], 'uppercase', className)}>{type}</Badge>;
}
