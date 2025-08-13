import { FormEventHandler, useEffect } from 'react';

import { useOrderWizardStore, WizardSession } from '@/stores/order-wizard-store';
import { Head, router, useForm } from '@inertiajs/react';
import { LoaderCircle, MapPin, Ship } from 'lucide-react';

import { Port, Vessel } from '@/types/models';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import InputError from '@/components/input-error';
import OrderWizardLayout from '@/components/order-wizard-layout';

interface WizardStartPageProps {
    vessels: Vessel[];
    ports: Port[];
    existingSession: WizardSession | null;
}

export default function WizardStartPage({ vessels, ports, existingSession }: WizardStartPageProps) {
    const { setCurrentStep, setVesselAndPort, initializeFromSession, vesselId, portId, isSaving } = useOrderWizardStore();

    const { data, setData, post, processing, errors } = useForm({
        vessel_id: vesselId || '',
        port_id: portId || '',
    });

    // Initialize store from existing session
    useEffect(() => {
        initializeFromSession(existingSession);
        setCurrentStep(1);

        if (existingSession?.data.vessel_id && existingSession?.data.port_id) {
            setData('vessel_id', existingSession.data.vessel_id);
            setData('port_id', existingSession.data.port_id);
        }
    }, [existingSession, initializeFromSession, setCurrentStep, setData]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!data.vessel_id || !data.port_id) {
            return;
        }

        // Update store state
        setVesselAndPort(data.vessel_id, data.port_id);

        // Submit to backend
        post(route('orders.wizard.store-start'), {
            onSuccess: () => {
                router.visit(route('orders.wizard.categories'));
            },
        });
    };

    const selectedVessel = vessels.find((v) => v.id === data.vessel_id);
    const selectedPort = ports.find((p) => p.id === data.port_id);

    return (
        <>
            <Head title="Create Order - Select Port & Vessel" />

            <OrderWizardLayout
                title="Select Port & Vessel"
                description="Choose the destination port and vessel for your order"
                currentStep={1}
                canGoBack={true}
                onBack={() => router.visit(route('orders.index'))}
            >
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Port Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="port_id" className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Destination Port
                            </Label>
                            <Select value={data.port_id} onValueChange={(value) => setData('port_id', value)} disabled={processing || isSaving}>
                                <SelectTrigger className="h-auto text-left [&>span]:flex [&>span]:items-start [&>span]:gap-2" id="port_id">
                                    <SelectValue placeholder="Select destination port" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ports.map((port) => (
                                        <SelectItem key={port.id} value={port.id}>
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium">
                                                    {port.name} <span className="text-xs text-muted-foreground">({port.code})</span>
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {port.city}, {port.country}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.port_id} />

                            {selectedPort && (
                                <div className="rounded-md border p-3 text-sm">
                                    <div className="font-medium">{selectedPort.name}</div>
                                    <div className="text-muted-foreground">
                                        {selectedPort.city}, {selectedPort.country}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Vessel Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="vessel_id" className="flex items-center gap-2">
                                <Ship className="h-4 w-4" />
                                Vessel
                            </Label>
                            <Select value={data.vessel_id} onValueChange={(value) => setData('vessel_id', value)} disabled={processing || isSaving}>
                                <SelectTrigger className="h-auto text-left [&>span]:flex [&>span]:items-start [&>span]:gap-2" id="vessel_id">
                                    <SelectValue placeholder="Select vessel" />
                                </SelectTrigger>
                                <SelectContent>
                                    {vessels.map((vessel) => (
                                        <SelectItem key={vessel.id} value={vessel.id}>
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium">{vessel.name}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    IMO: {vessel.imo_number} • {vessel.organization?.name}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.vessel_id} />

                            {selectedVessel && (
                                <div className="rounded-md border p-3 text-sm">
                                    <div className="font-medium">{selectedVessel.name}</div>
                                    <div className="text-muted-foreground">IMO: {selectedVessel.imo_number}</div>
                                    <div className="text-muted-foreground">Owner: {selectedVessel.organization?.name}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Summary */}
                    {data.vessel_id && data.port_id && (
                        <div className="rounded-lg bg-muted/50 p-4">
                            <h3 className="font-medium">Order Summary</h3>
                            <p className="text-sm text-muted-foreground">
                                Vessel <strong>{selectedVessel?.name}</strong> requesting services at <strong>{selectedPort?.name}</strong>
                            </p>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={() => router.visit(route('orders.index'))}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing || isSaving || !data.vessel_id || !data.port_id}>
                            {(processing || isSaving) && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Next: Select Categories
                        </Button>
                    </div>
                </form>
            </OrderWizardLayout>
        </>
    );
}
