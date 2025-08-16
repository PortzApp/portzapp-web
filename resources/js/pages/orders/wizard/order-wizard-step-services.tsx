import { Head, router } from '@inertiajs/react';

import type { BreadcrumbItem } from '@/types';
import type { Service } from '@/types/models';
import type { OrderWizardSession } from '@/types/wizard';

import AppLayout from '@/layouts/app-layout';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { StepServices } from './components/step-services';
import { WizardProgressBar } from './components/wizard-progress-bar';

interface ServicesStepPageProps {
    session: OrderWizardSession;
    services: Service[];
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
        title: 'Select Services',
        href: route('order-wizard.step.services', { session: 'current' }),
    },
];

export default function OrderWizardStepServices({ session, services }: ServicesStepPageProps) {
    const handleBackToDashboard = () => {
        router.visit(route('order-wizard.dashboard'));
    };

    const handlePreviousStep = () => {
        router.visit(route('order-wizard.step.categories', { session: session.id }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Select Services - Order Wizard" />

            <div className="mx-auto flex h-full w-full max-w-6xl flex-1 flex-col gap-8 rounded-xl p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Create New Order</h1>
                        <p className="text-muted-foreground">Step 3: Select services from available providers</p>
                        <div className="mt-2 flex flex-col gap-2">
                            <p className="text-left text-sm text-muted-foreground">
                                {session.vessel?.name} → {session.port?.name}
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {session.category_selections?.map((selection, index) => (
                                    <Badge key={selection.service_category_id || index} variant="secondary" className="text-xs">
                                        {selection.service_category?.name || `Category ${selection.service_category_id}`}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <p className="mt-1 text-sm font-medium text-green-600">{services.length} services available for your selection</p>
                    </div>
                    <Button variant="outline" onClick={handleBackToDashboard}>
                        Back to Dashboard
                    </Button>
                </div>

                {/* Progress Bar */}
                <WizardProgressBar currentStep="services" />

                {/* Step Content */}
                <div className="flex-1">
                    <StepServices services={services} session={session} />
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between border-t pt-6">
                    <Button variant="outline" onClick={handlePreviousStep}>
                        ← Back to Categories
                    </Button>
                    <div className="text-sm text-muted-foreground">Select services to continue</div>
                </div>
            </div>
        </AppLayout>
    );
}
