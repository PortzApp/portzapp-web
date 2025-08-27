import { Anchor, Building2, Calendar, Ship } from 'lucide-react';

import { cn } from '@/lib/utils';

import { VesselType } from '@/types/enums';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { VesselTypeBadge } from '@/components/badges';

type Vessel = {
    id: string;
    organization_id: string;
    name: string;
    imo_number: string;
    vessel_type: VesselType;
    status: string;
    created_at: string;
    updated_at: string;
};

interface OrderVesselTabProps {
    vessel: Vessel;
}

export default function OrderVesselTab({ vessel }: OrderVesselTabProps) {
    return (
        <div className="space-y-6">
            {/* Vessel Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Ship className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span>{vessel.name}</span>
                                <Badge
                                    className={cn(
                                        vessel.status === 'active' && 'bg-green-200 text-green-950 dark:bg-green-900 dark:text-green-50',
                                        vessel.status === 'inactive' && 'bg-red-200 text-red-950 dark:bg-red-900 dark:text-red-50',
                                    )}
                                >
                                    {vessel.status}
                                </Badge>
                            </div>
                            <div className="font-mono text-sm text-muted-foreground">IMO: {vessel.imo_number}</div>
                        </div>
                    </CardTitle>
                    <CardDescription>Vessel assigned to this order</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg bg-muted/50 p-4 text-center">
                            <div className="mb-2">
                                <VesselTypeBadge type={vessel.vessel_type} iconOnly className="size-8" />
                            </div>
                            <div className="text-sm font-medium">Vessel Type</div>
                            <div className="text-xs text-muted-foreground capitalize">{vessel.vessel_type.replace('_', ' ')}</div>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-4 text-center">
                            <Anchor className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                            <div className="text-sm font-medium">IMO Number</div>
                            <div className="font-mono text-xs text-muted-foreground">{vessel.imo_number}</div>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-4 text-center">
                            <div
                                className={cn(
                                    'mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                                    vessel.status === 'active' && 'bg-green-500 text-white',
                                    vessel.status === 'inactive' && 'bg-red-500 text-white',
                                )}
                            >
                                {vessel.status === 'active' ? '✓' : '✗'}
                            </div>
                            <div className="text-sm font-medium">Status</div>
                            <div className="text-xs text-muted-foreground capitalize">{vessel.status}</div>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-4 text-center">
                            <Building2 className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                            <div className="text-sm font-medium">Owner ID</div>
                            <div className="text-xs text-muted-foreground">{vessel.organization_id.slice(0, 8)}...</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Vessel Details */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Vessel Information</CardTitle>
                        <CardDescription>Basic vessel details and specifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Vessel Name:</span>
                            <span className="text-sm font-semibold">{vessel.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">IMO Number:</span>
                            <span className="font-mono text-sm">{vessel.imo_number}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Vessel Type:</span>
                            <div className="flex items-center gap-2">
                                <VesselTypeBadge type={vessel.vessel_type} iconOnly className="size-4" />
                                <VesselTypeBadge type={vessel.vessel_type} />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Current Status:</span>
                            <Badge
                                className={cn(
                                    vessel.status === 'active' && 'bg-green-200 text-green-950 dark:bg-green-900 dark:text-green-50',
                                    vessel.status === 'inactive' && 'bg-red-200 text-red-950 dark:bg-red-900 dark:text-red-50',
                                )}
                            >
                                {vessel.status}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Vessel ID:</span>
                            <span className="font-mono text-xs text-muted-foreground">{vessel.id}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Timeline
                        </CardTitle>
                        <CardDescription>Important dates and milestones</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="mt-2 h-2 w-2 rounded-full bg-blue-500"></div>
                                <div>
                                    <div className="text-sm font-medium">Vessel Added to System</div>
                                    <div className="text-xs text-muted-foreground">
                                        {new Date(vessel.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="mt-2 h-2 w-2 rounded-full bg-green-500"></div>
                                <div>
                                    <div className="text-sm font-medium">Last Updated</div>
                                    <div className="text-xs text-muted-foreground">
                                        {new Date(vessel.updated_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="mt-2 h-2 w-2 rounded-full bg-purple-500"></div>
                                <div>
                                    <div className="text-sm font-medium">Assigned to Order</div>
                                    <div className="text-xs text-muted-foreground">Currently assigned to this order</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Vessel Type Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Vessel Type Information</CardTitle>
                    <CardDescription>Characteristics and typical use cases for this vessel type</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <h4 className="mb-2 flex items-center gap-2 font-medium">
                                <VesselTypeBadge type={vessel.vessel_type} iconOnly className="size-8" />
                                {vessel.vessel_type.replace('_', ' ').toUpperCase()}
                            </h4>
                            <div className="text-sm text-muted-foreground">
                                {vessel.vessel_type === 'container_ship' &&
                                    'Designed to carry containerized cargo in truck-size intermodal containers.'}
                                {vessel.vessel_type === 'tanker_ship' &&
                                    'Specialized for transporting liquid bulk cargo such as crude oil, petroleum products, and chemicals.'}
                                {vessel.vessel_type === 'bulk_carrier' &&
                                    'Designed to transport unpackaged bulk cargo such as grains, coal, ore, and cement.'}
                                {vessel.vessel_type === 'passenger_ships' &&
                                    'Built to carry passengers on voyages, including cruise ships and ferries.'}
                                {vessel.vessel_type === 'gas_carrier' && 'Specialized vessels for transporting liquefied gases such as LNG and LPG.'}
                                {vessel.vessel_type === 'dry_bulk' && 'Carries dry bulk cargo such as coal, iron ore, grain, and other commodities.'}
                                {vessel.vessel_type === 'naval_ships' && 'Military vessels designed for naval warfare and defense operations.'}
                                {vessel.vessel_type === 'yacht' && 'Recreational or luxury vessel used for pleasure cruising and entertainment.'}
                                {vessel.vessel_type === 'car_carrier' && 'Specialized vessels designed to transport automobiles and other vehicles.'}
                            </div>
                        </div>
                        <div>
                            <h4 className="mb-2 font-medium">Typical Characteristics</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                {vessel.vessel_type === 'container_ship' && (
                                    <>
                                        <li>• Standardized container slots</li>
                                        <li>• High cargo capacity</li>
                                        <li>• Efficient loading/unloading</li>
                                        <li>• Regular scheduled routes</li>
                                    </>
                                )}
                                {vessel.vessel_type === 'tanker_ship' && (
                                    <>
                                        <li>• Specialized tank compartments</li>
                                        <li>• Safety systems for liquid cargo</li>
                                        <li>• Pump systems for loading/discharge</li>
                                        <li>• Environmental protection measures</li>
                                    </>
                                )}
                                {vessel.vessel_type === 'bulk_carrier' && (
                                    <>
                                        <li>• Large cargo holds</li>
                                        <li>• Self-unloading systems</li>
                                        <li>• Weather-resistant design</li>
                                        <li>• Efficient cargo handling</li>
                                    </>
                                )}
                                {vessel.vessel_type === 'car_carrier' && (
                                    <>
                                        <li>• Multi-level vehicle decks</li>
                                        <li>• Adjustable ramps and platforms</li>
                                        <li>• Secure vehicle fastening systems</li>
                                        <li>• Weather protection for cargo</li>
                                    </>
                                )}
                                {(vessel.vessel_type === 'passenger_ships' || vessel.vessel_type === 'yacht') && (
                                    <>
                                        <li>• Passenger accommodations</li>
                                        <li>• Safety and comfort features</li>
                                        <li>• Entertainment facilities</li>
                                        <li>• Crew quarters and services</li>
                                    </>
                                )}
                                {(vessel.vessel_type === 'gas_carrier' ||
                                    vessel.vessel_type === 'dry_bulk' ||
                                    vessel.vessel_type === 'naval_ships') && (
                                    <>
                                        <li>• Specialized equipment</li>
                                        <li>• Advanced safety systems</li>
                                        <li>• Professional crew requirements</li>
                                        <li>• Regulatory compliance</li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
