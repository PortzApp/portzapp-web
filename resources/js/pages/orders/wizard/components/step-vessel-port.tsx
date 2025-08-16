import { useState } from 'react';

import { router } from '@inertiajs/react';
import { MapPin, Ship } from 'lucide-react';

import type { Port, Vessel } from '@/types/models';
import type { OrderWizardSession } from '@/types/wizard';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { SearchableSelect } from '@/components/searchable-select';

interface StepVesselPortProps {
    vessels: Vessel[];
    ports: Port[];
    session: OrderWizardSession | null;
}

export function StepVesselPort({ vessels, ports, session }: StepVesselPortProps) {
    const [isSaving, setIsSaving] = useState(false);

    // Initialize with session data or find selected vessels/ports
    const initialVesselId = session?.vessel_id || '';
    const initialPortId = session?.port_id || '';

    const [selectedVesselId, setSelectedVesselId] = useState<string>(initialVesselId);
    const [selectedPortId, setSelectedPortId] = useState<string>(initialPortId);

    // Convert vessels and ports to searchable select format
    const vesselItems = vessels.map((vessel) => ({
        value: vessel.id,
        label: vessel.name,
        subtitle: `IMO: ${vessel.imo_number}`,
        icon: Ship,
    }));

    const portItems = ports.map((port) => ({
        value: port.id,
        label: port.name,
        subtitle: `${port.city}, ${port.country} (${port.code})`,
        icon: MapPin,
    }));

    const selectedVessel = vessels.find((v) => v.id === selectedVesselId);
    const selectedPort = ports.find((p) => p.id === selectedPortId);

    const handleContinue = () => {
        if (selectedVesselId && selectedPortId && session) {
            setIsSaving(true);

            router.patch(
                route('order-wizard-sessions.set-vessel-port', session.id),
                {
                    vessel_id: selectedVesselId,
                    port_id: selectedPortId,
                },
                {
                    onSuccess: () => {
                        // Navigate to categories step
                        router.visit(route('order-wizard.step.categories', { session: session.id }));
                    },
                    onFinish: () => setIsSaving(false),
                },
            );
        }
    };

    const canContinue = selectedVesselId && selectedPortId && !isSaving;

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left: Selectors */}
            <div className="flex max-w-lg flex-col gap-4 lg:col-span-2">
                {/* Vessel Selection */}
                <SearchableSelect
                    items={vesselItems}
                    value={selectedVesselId}
                    onValueChange={setSelectedVesselId}
                    placeholder="Select a vessel"
                    searchPlaceholder="Search vessels by name or IMO..."
                    emptyMessage="No vessels found."
                    label="Select Vessel"
                    groupLabel="Vessels"
                />

                {/* Port Selection */}
                <SearchableSelect
                    items={portItems}
                    value={selectedPortId}
                    onValueChange={setSelectedPortId}
                    placeholder="Select a port"
                    searchPlaceholder="Search ports by name, city, or code..."
                    emptyMessage="No ports found."
                    label="Select Port"
                    groupLabel="Ports"
                />
            </div>

            {/* Right: Selection Summary */}
            <div className="lg:col-span-1">
                <Card className="sticky top-6 bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-lg">Selection Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Vessel Selection */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Ship className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-muted-foreground">Vessel</span>
                            </div>
                            {selectedVessel ? (
                                <div className="pl-6">
                                    <div className="font-semibold text-foreground">{selectedVessel.name}</div>
                                    <div className="text-xs text-muted-foreground">IMO: {selectedVessel.imo_number}</div>
                                </div>
                            ) : (
                                <div className="pl-6">
                                    <div className="text-sm text-muted-foreground italic">No vessel selected</div>
                                </div>
                            )}
                        </div>

                        {/* Port Selection */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-muted-foreground">Destination Port</span>
                            </div>
                            {selectedPort ? (
                                <div className="pl-6">
                                    <div className="font-semibold text-foreground">
                                        {selectedPort.name} ({selectedPort.code})
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {selectedPort.city}, {selectedPort.country}
                                    </div>
                                </div>
                            ) : (
                                <div className="pl-6">
                                    <div className="text-sm text-muted-foreground italic">No port selected</div>
                                </div>
                            )}
                        </div>

                        {/* Action Button or Help Text */}
                        <div className="border-t pt-4">
                            {canContinue ? (
                                <Button onClick={handleContinue} disabled={isSaving} className="w-full">
                                    {isSaving ? 'Saving...' : 'Continue to Service Categories'}
                                </Button>
                            ) : (
                                <div className="text-center text-sm text-muted-foreground">
                                    Select both a vessel and a port to continue to the next step
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
