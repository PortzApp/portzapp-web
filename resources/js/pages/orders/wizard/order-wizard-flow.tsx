import { useEffect } from 'react';

import { Head, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import type { BreadcrumbItem } from '@/types';
import type { WizardPageData } from '@/types/wizard';

import AppLayout from '@/layouts/app-layout';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { StepVesselPort } from './components/step-vessel-port';
import { WizardProgressBar } from './components/wizard-progress-bar';
import { useOrderWizardStore } from './stores/order-wizard-store';

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

export default function OrderWizardFlow({ session, vessels, ports, serviceCategories }: WizardPageData) {
    const { 
        currentStep, 
        initSession, 
        canGoToNextStep, 
        goToNextStep, 
        goToPreviousStep,
        isSaving 
    } = useOrderWizardStore();

    // Initialize the session when the component mounts
    useEffect(() => {
        initSession(session);
    }, [session, initSession]);

    const handleNext = async () => {
        if (canGoToNextStep()) {
            await goToNextStep();
        }
    };

    const handleBack = async () => {
        await goToPreviousStep();
    };

    const handleBackToDashboard = () => {
        router.visit(route('order-wizard.dashboard'));
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 'vessel_port':
                return <StepVesselPort vessels={vessels} ports={ports} />;

            case 'categories':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Service Categories</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className=\"space-y-4\">
                                <div>
                                    <h3 className=\"text-sm font-medium mb-2\">Available Categories</h3>
                                    <p className=\"text-sm text-muted-foreground\">
                                        {serviceCategories.length} categor{serviceCategories.length === 1 ? 'y' : 'ies'} available
                                    </p>
                                </div>
                                <div className=\"p-4 bg-muted rounded-md\">
                                    <p className=\"text-sm text-center text-muted-foreground\">
                                        Step 2 component will be implemented next
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );

            case 'services':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Services</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className=\"space-y-4\">
                                <div className=\"p-4 bg-muted rounded-md\">
                                    <p className=\"text-sm text-center text-muted-foreground\">
                                        Step 3 component will be implemented next
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );

            case 'review':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Review & Confirm</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className=\"space-y-4\">
                                <div className=\"p-4 bg-muted rounded-md\">
                                    <p className=\"text-sm text-center text-muted-foreground\">
                                        Step 4 component will be implemented next
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );

            default:
                return null;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title=\"Create Order - Order Wizard\" />
            
            <div className=\"mx-auto flex h-full w-full max-w-4xl flex-1 flex-col gap-8 rounded-xl p-8\">
                {/* Header */}
                <div className=\"flex items-center justify-between\">
                    <div>
                        <h1 className=\"text-2xl font-bold\">Create New Order</h1>
                        <p className=\"text-muted-foreground\">
                            Follow the steps below to create your order
                        </p>
                    </div>
                    <Button variant=\"outline\" onClick={handleBackToDashboard}>
                        Back to Dashboard
                    </Button>
                </div>

                {/* Progress Bar */}
                <WizardProgressBar currentStep={currentStep} />

                {/* Step Content */}
                <div className=\"flex-1\">
                    {renderStepContent()}
                </div>

                {/* Navigation */}
                <div className=\"flex items-center justify-between pt-6 border-t\">
                    <Button
                        variant=\"outline\"
                        onClick={handleBack}
                        disabled={currentStep === 'vessel_port' || isSaving}
                    >
                        <ArrowLeft className=\"mr-2 h-4 w-4\" />
                        Back
                    </Button>

                    <div className=\"text-sm text-muted-foreground\">
                        {isSaving && 'Saving...'}
                    </div>

                    <Button
                        onClick={handleNext}
                        disabled={!canGoToNextStep() || isSaving}
                    >
                        {currentStep === 'review' ? 'Place Order' : 'Next'}
                        {currentStep !== 'review' && <ArrowRight className=\"ml-2 h-4 w-4\" />}
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}