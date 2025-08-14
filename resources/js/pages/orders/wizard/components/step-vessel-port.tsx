import { useState } from 'react';

import { MapPin, Search, Ship } from 'lucide-react';

import type { Port, Vessel } from '@/types/models';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { useOrderWizardStore } from '../stores/order-wizard-store';

interface StepVesselPortProps {
    vessels: Vessel[];
    ports: Port[];
}

export function StepVesselPort({ vessels, ports }: StepVesselPortProps) {
    const { vessel, port, setVesselAndPort, isSaving } = useOrderWizardStore();
    const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(vessel);
    const [selectedPort, setSelectedPort] = useState<Port | null>(port);
    const [vesselSearch, setVesselSearch] = useState('');
    const [portSearch, setPortSearch] = useState('');

    const filteredVessels = vessels.filter(v =>
        v.name.toLowerCase().includes(vesselSearch.toLowerCase()) ||
        v.imo_number.toLowerCase().includes(vesselSearch.toLowerCase())
    );

    const filteredPorts = ports.filter(p =>
        p.name.toLowerCase().includes(portSearch.toLowerCase()) ||
        p.city.toLowerCase().includes(portSearch.toLowerCase()) ||
        p.country.toLowerCase().includes(portSearch.toLowerCase()) ||
        p.code.toLowerCase().includes(portSearch.toLowerCase())
    );

    const handleContinue = async () => {
        if (selectedVessel && selectedPort) {
            await setVesselAndPort(selectedVessel, selectedPort);
        }
    };

    const canContinue = selectedVessel && selectedPort && !isSaving;

    return (
        <div className=\"space-y-6\">
            <div className=\"grid gap-6 lg:grid-cols-2\">
                {/* Vessel Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle className=\"flex items-center gap-2\">
                            <Ship className=\"h-5 w-5\" />
                            Select Vessel
                        </CardTitle>
                        <CardDescription>
                            Choose the vessel that will receive the services
                        </CardDescription>
                    </CardHeader>
                    <CardContent className=\"space-y-4\">
                        {/* Search */}
                        <div className=\"relative\">
                            <Search className=\"absolute left-3 top-3 h-4 w-4 text-muted-foreground\" />
                            <Input
                                placeholder=\"Search vessels by name or IMO...\"
                                value={vesselSearch}
                                onChange={(e) => setVesselSearch(e.target.value)}
                                className=\"pl-9\"
                            />
                        </div>

                        {/* Vessel List */}
                        <div className=\"max-h-64 overflow-y-auto space-y-2\">
                            <RadioGroup
                                value={selectedVessel?.id || ''}
                                onValueChange={(value) => {
                                    const vessel = vessels.find(v => v.id === value);
                                    setSelectedVessel(vessel || null);
                                }}
                            >
                                {filteredVessels.map((vesselItem) => (
                                    <div key={vesselItem.id} className=\"flex items-center space-x-2\">
                                        <RadioGroupItem value={vesselItem.id} id={vesselItem.id} />
                                        <Label htmlFor={vesselItem.id} className=\"flex-1 cursor-pointer\">
                                            <div className=\"flex flex-col\">
                                                <span className=\"font-medium\">{vesselItem.name}</span>
                                                <span className=\"text-sm text-muted-foreground\">
                                                    IMO: {vesselItem.imo_number}
                                                </span>
                                            </div>
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        {filteredVessels.length === 0 && (
                            <div className=\"py-8 text-center text-sm text-muted-foreground\">
                                No vessels found. Try adjusting your search.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Port Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle className=\"flex items-center gap-2\">
                            <MapPin className=\"h-5 w-5\" />
                            Select Port
                        </CardTitle>
                        <CardDescription>
                            Choose the destination port for your services
                        </CardDescription>
                    </CardHeader>
                    <CardContent className=\"space-y-4\">
                        {/* Search */}
                        <div className=\"relative\">
                            <Search className=\"absolute left-3 top-3 h-4 w-4 text-muted-foreground\" />
                            <Input
                                placeholder=\"Search ports by name, city, or code...\"
                                value={portSearch}
                                onChange={(e) => setPortSearch(e.target.value)}
                                className=\"pl-9\"
                            />
                        </div>

                        {/* Port List */}
                        <div className=\"max-h-64 overflow-y-auto space-y-2\">
                            <RadioGroup
                                value={selectedPort?.id || ''}
                                onValueChange={(value) => {
                                    const port = ports.find(p => p.id === value);
                                    setSelectedPort(port || null);
                                }}
                            >
                                {filteredPorts.map((portItem) => (
                                    <div key={portItem.id} className=\"flex items-center space-x-2\">
                                        <RadioGroupItem value={portItem.id} id={portItem.id} />
                                        <Label htmlFor={portItem.id} className=\"flex-1 cursor-pointer\">
                                            <div className=\"flex flex-col\">
                                                <div className=\"flex items-center gap-2\">
                                                    <span className=\"font-medium\">{portItem.name}</span>
                                                    <span className=\"text-xs bg-muted px-2 py-1 rounded\">
                                                        {portItem.code}
                                                    </span>
                                                </div>
                                                <span className=\"text-sm text-muted-foreground\">
                                                    {portItem.city}, {portItem.country}
                                                </span>
                                            </div>
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        {filteredPorts.length === 0 && (
                            <div className=\"py-8 text-center text-sm text-muted-foreground\">
                                No ports found. Try adjusting your search.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Selection Summary */}
            {(selectedVessel || selectedPort) && (
                <Card className=\"bg-muted/50\">
                    <CardHeader>
                        <CardTitle className=\"text-lg\">Selection Summary</CardTitle>
                    </CardHeader>
                    <CardContent className=\"space-y-3\">
                        {selectedVessel && (
                            <div className=\"flex items-center gap-3\">
                                <Ship className=\"h-5 w-5 text-muted-foreground\" />
                                <div>
                                    <div className=\"font-medium\">{selectedVessel.name}</div>
                                    <div className=\"text-sm text-muted-foreground\">
                                        IMO: {selectedVessel.imo_number}
                                    </div>
                                </div>
                            </div>
                        )}
                        {selectedPort && (
                            <div className=\"flex items-center gap-3\">
                                <MapPin className=\"h-5 w-5 text-muted-foreground\" />
                                <div>
                                    <div className=\"font-medium\">{selectedPort.name} ({selectedPort.code})</div>
                                    <div className=\"text-sm text-muted-foreground\">
                                        {selectedPort.city}, {selectedPort.country}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {canContinue && (
                            <div className=\"pt-4 border-t\">
                                <Button onClick={handleContinue} disabled={isSaving} className=\"w-full\">
                                    {isSaving ? 'Saving...' : 'Continue to Service Categories'}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Help Text */}
            <div className=\"text-sm text-muted-foreground text-center\">
                Select both a vessel and a port to continue to the next step
            </div>
        </div>
    );
}