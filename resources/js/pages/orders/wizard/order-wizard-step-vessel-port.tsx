import { Head, router } from '@inertiajs/react';

import type { BreadcrumbItem } from '@/types';
import type { Port, Vessel } from '@/types/models';
import type { OrderWizardSession } from '@/types/wizard';

import AppLayout from '@/layouts/app-layout';

import { Button } from '@/components/ui/button';

import { StepVesselPort } from './components/step-vessel-port';
import { WizardProgressBar } from './components/wizard-progress-bar';

interface VesselPortStepPageProps {
    session: OrderWizardSession;
    vessels: Vessel[];
    ports: Port[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Orders',
        href: route('orders.index'),
    },
    {
        title: 'Order Wizard',
        href: route('order-wizard.dashboard'),
    },
    {
        title: 'Select Vessel & Port',
        href: route('order-wizard.step.vessel-port', { session: 'current' }),
    },
];

export default function OrderWizardStepVesselPort({ session, vessels, ports }: VesselPortStepPageProps) {
    const handleBackToDashboard = () => {
        router.visit(route('order-wizard.dashboard'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Select Vessel & Port - Order Wizard" />

            <div className="mx-auto flex h-full w-full max-w-6xl flex-1 flex-col gap-8 rounded-xl p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Create New Order</h1>
                        <p className="text-muted-foreground">Step 1: Select your vessel and destination port</p>
                    </div>
                    <Button variant="outline" onClick={handleBackToDashboard}>
                        Back to Dashboard
                    </Button>
                </div>

                {/* Progress Bar */}
                <WizardProgressBar currentStep="vessel_port" />

                {/* Step Content */}
                <div className="flex-1">
                    <StepVesselPort vessels={vessels} ports={ports} session={session} />
                </div>
            </div>
        </AppLayout>
    );
}
