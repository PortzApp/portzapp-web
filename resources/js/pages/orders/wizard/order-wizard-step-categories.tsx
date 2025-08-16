import { Head, router } from '@inertiajs/react';

import type { BreadcrumbItem } from '@/types';
import type { ServiceCategory } from '@/types/models';
import type { OrderWizardSession } from '@/types/wizard';

import AppLayout from '@/layouts/app-layout';

import { Button } from '@/components/ui/button';

import { StepCategories } from './components/step-categories';
import { WizardProgressBar } from './components/wizard-progress-bar';

interface CategoriesStepPageProps {
    session: OrderWizardSession;
    serviceCategories: ServiceCategory[];
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
        title: 'Select Categories',
        href: route('order-wizard.step.categories', { session: 'current' }),
    },
];

export default function OrderWizardStepCategories({ session, serviceCategories }: CategoriesStepPageProps) {
    const handleBackToDashboard = () => {
        router.visit(route('order-wizard.dashboard'));
    };

    const handlePreviousStep = () => {
        router.visit(route('order-wizard.step.vessel-port', { session: session.id }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Select Categories - Order Wizard" />

            <div className="mx-auto flex h-full w-full max-w-6xl flex-1 flex-col gap-8 rounded-xl p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Create New Order</h1>
                        <p className="text-muted-foreground">Step 2: Choose service categories for your order</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Selected: {session.vessel?.name} → {session.port?.name}
                        </p>
                    </div>
                    <Button variant="outline" onClick={handleBackToDashboard}>
                        Back to Dashboard
                    </Button>
                </div>

                {/* Progress Bar */}
                <WizardProgressBar currentStep="categories" />

                {/* Step Content */}
                <div className="flex-1">
                    <StepCategories serviceCategories={serviceCategories} session={session} />
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between border-t pt-6">
                    <Button variant="outline" onClick={handlePreviousStep}>
                        ← Back to Vessel & Port
                    </Button>
                    <div className="text-sm text-muted-foreground">Complete this step to continue</div>
                </div>
            </div>
        </AppLayout>
    );
}
