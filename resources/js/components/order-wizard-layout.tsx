import { ReactNode } from 'react';

import { useOrderWizardStore } from '@/stores/order-wizard-store';
import { BreadcrumbItem } from '@/types';
import { router } from '@inertiajs/react';
import { ArrowLeft, X } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import OrderWizardStepper from '@/components/order-wizard-stepper';

interface OrderWizardLayoutProps {
    children: ReactNode;
    title: string;
    description?: string;
    currentStep: number;
    canGoBack?: boolean;
    onBack?: () => void;
    showCancel?: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Orders',
        href: route('orders.index'),
    },
    {
        title: 'Create Order Wizard',
        href: route('orders.wizard.start'),
    },
];

export default function OrderWizardLayout({
    children,
    title,
    description,
    currentStep,
    canGoBack = false,
    onBack,
    showCancel = true,
}: OrderWizardLayoutProps) {
    const { cancelWizard } = useOrderWizardStore();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.visit(route('orders.index'));
        }
    };

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel the order wizard? All progress will be lost.')) {
            cancelWizard();
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="space-y-6 p-8">
                {/* Header with Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {canGoBack && (
                            <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                        )}
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                            {description && <p className="text-muted-foreground">{description}</p>}
                        </div>
                    </div>

                    {showCancel && (
                        <Button variant="ghost" size="sm" onClick={handleCancel} className="gap-2 text-destructive hover:text-destructive">
                            <X className="h-4 w-4" />
                            Cancel
                        </Button>
                    )}
                </div>

                {/* Progress Stepper */}
                <OrderWizardStepper currentStep={currentStep} className="px-4" />

                {/* Main Content */}
                <Card>
                    <CardHeader className="pb-6">
                        <CardTitle className="text-xl">Step {currentStep}</CardTitle>
                    </CardHeader>
                    <CardContent>{children}</CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
