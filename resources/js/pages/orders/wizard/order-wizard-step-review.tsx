import { Head, router } from '@inertiajs/react';

import type { BreadcrumbItem } from '@/types';
import type { OrderWizardSession } from '@/types/wizard';

import AppLayout from '@/layouts/app-layout';

import { Button } from '@/components/ui/button';

import { StepReview } from './components/step-review';
import { WizardProgressBar } from './components/wizard-progress-bar';

interface ReviewStepPageProps {
    session: OrderWizardSession;
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
        title: 'Review Order',
        href: route('order-wizard.step.review', { session: 'current' }),
    },
];

export default function OrderWizardStepReview({ session }: ReviewStepPageProps) {
    const handleBackToDashboard = () => {
        router.visit(route('order-wizard.dashboard'));
    };

    const handlePreviousStep = () => {
        router.visit(route('order-wizard.step.services', { session: session.id }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Review Order - Order Wizard" />

            <div className="mx-auto flex h-full w-full max-w-6xl flex-1 flex-col gap-8 rounded-xl p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Create New Order</h1>
                        <p className="text-muted-foreground">Step 4: Review your order and place it</p>
                    </div>
                    <Button variant="outline" onClick={handleBackToDashboard}>
                        Back to Dashboard
                    </Button>
                </div>

                {/* Progress Bar */}
                <WizardProgressBar currentStep="review" />

                {/* Step Content */}
                <div className="flex-1">
                    <StepReview session={session} />
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between border-t pt-6">
                    <Button variant="outline" onClick={handlePreviousStep}>
                        ← Back to Services
                    </Button>
                    <div className="text-sm text-muted-foreground">Ready to place your order</div>
                </div>
            </div>
        </AppLayout>
    );
}
