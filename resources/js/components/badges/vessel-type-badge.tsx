import React from 'react';

import { VesselType } from '@/types/enums';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import BulkCarrierIcon from '@/components/icons/vessel-type-bulk-carrier-icon';
import CarCarrierIcon from '@/components/icons/vessel-type-car-carrier-icon';
import ContainerShipIcon from '@/components/icons/vessel-type-container-ship-icon';
import DryBulkIcon from '@/components/icons/vessel-type-dry-bulk-icon';
import GasCarrierIcon from '@/components/icons/vessel-type-gas-carrier-icon';
import NavalShipIcon from '@/components/icons/vessel-type-naval-ship-icon';
import PassengerShipIcon from '@/components/icons/vessel-type-passenger-ship-icon';
import TankerShipIcon from '@/components/icons/vessel-type-tanker-ship-icon';
import YachtIcon from '@/components/icons/vessel-type-yacht-icon';

const vesselTypeStyles: Record<VesselType, string> = {
    bulk_carrier: 'bg-neutral-100 text-neutral-800',
    car_carrier: 'bg-orange-100 text-orange-800',
    container_ship: 'bg-blue-100 text-blue-800',
    dry_bulk: 'bg-amber-100 text-amber-800',
    gas_carrier: 'bg-purple-100 text-purple-800',
    naval_ships: 'bg-gray-100 text-gray-800',
    passenger_ships: 'bg-green-100 text-green-800',
    tanker_ship: 'bg-red-100 text-red-800',
    yacht: 'bg-indigo-100 text-indigo-800',
};

const vesselTypeIcons: Record<VesselType, React.ComponentType<{ className?: string }>> = {
    bulk_carrier: BulkCarrierIcon,
    car_carrier: CarCarrierIcon,
    container_ship: ContainerShipIcon,
    dry_bulk: DryBulkIcon,
    gas_carrier: GasCarrierIcon,
    naval_ships: NavalShipIcon,
    passenger_ships: PassengerShipIcon,
    tanker_ship: TankerShipIcon,
    yacht: YachtIcon,
};

interface VesselTypeBadgeProps {
    type: VesselType;
    iconOnly?: boolean;
    className?: string;
}

export function VesselTypeBadge({ type, iconOnly = false, className }: VesselTypeBadgeProps) {
    const Icon = vesselTypeIcons[type] || vesselTypeIcons.bulk_carrier;

    if (iconOnly) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <Icon className={cn('size-8 text-neutral-600', className)} />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="capitalize">{type.replace('_', ' ')} Vessel</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return <Badge className={cn(vesselTypeStyles[type], 'uppercase', className)}>{type.replace('_', ' ')}</Badge>;
}
