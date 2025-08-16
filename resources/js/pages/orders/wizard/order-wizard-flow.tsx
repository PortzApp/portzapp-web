import { useState } from 'react';

import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import type { BreadcrumbItem } from '@/types';
import type { WizardPageData, WizardStep } from '@/types/wizard';

import AppLayout from '@/layouts/app-layout';

import { Button } from '@/components/ui/button';

import { StepCategories } from './components/step-categories';
import { StepReview } from './components/step-review';
import { StepServices } from './components/step-services';
import { StepVesselPort } from './components/step-vessel-port';
import { WizardProgressBar } from './components/wizard-progress-bar';

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
        title: 'Create Order',
        href: route('order-wizard.flow'),
    },
];

export default function OrderWizardFlow({ session, vessels, ports, serviceCategories, services }: WizardPageData) {
    const [isSaving, setIsSaving] = useState(false);

    // Get current step from session or default to first step
    const currentStep: WizardStep = session?.current_step || 'vessel_port';

    const handleBackToDashboard = () => {
        router.visit(route('order-wizard.dashboard'));
    };

    const goToPreviousStep = () => {
        if (!session) return;

        const steps: WizardStep[] = ['vessel_port', 'categories', 'services', 'review'];
        const currentIndex = steps.indexOf(currentStep);

        if (currentIndex > 0) {
            const previousStep = steps[currentIndex - 1];
            setIsSaving(true);

            router.patch(
                route('order-wizard-sessions.update', session.id),
                {
                    current_step: previousStep,
                },
                {
                    onFinish: () => setIsSaving(false),
                    only: ['session'],
                },
            );
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 'vessel_port':
                return <StepVesselPort vessels={vessels} ports={ports} session={session} />;

            case 'categories':
                return <StepCategories serviceCategories={serviceCategories} session={session} />;

            case 'services':
                return <StepServices services={services} session={session} />;

            case 'review':
                return <StepReview session={session} />;

            default:
                return null;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Order - Order Wizard" />

            <div className="mx-auto flex h-full w-full max-w-6xl flex-1 flex-col gap-8 rounded-xl p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Create New Order</h1>
                        <p className="text-muted-foreground">Follow the steps below to create your order</p>
                    </div>
                    <Button variant="outline" onClick={handleBackToDashboard}>
                        Back to Dashboard
                    </Button>
                </div>

                {/* Progress Stepper */}
                <WizardProgressBar currentStep={currentStep} />

                {/* Step Content */}
                <div className="flex-1">{renderStepContent()}</div>

                {/* Navigation */}
                <div className="flex items-center justify-between border-t pt-6">
                    <Button variant="outline" onClick={goToPreviousStep} disabled={currentStep === 'vessel_port' || isSaving}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>

                    <div className="text-sm text-muted-foreground">{isSaving && 'Saving...'}</div>

                    {/* Next button is now handled by individual step components */}
                    <div className="text-sm text-muted-foreground">Complete this step to continue</div>
                </div>
            </div>
        </AppLayout>
    );
}
