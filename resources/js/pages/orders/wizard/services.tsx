import { useEffect, useState } from 'react';

import { Head, router } from '@inertiajs/react';
import { LoaderCircle, Building2, Plus, Minus } from 'lucide-react';

import { useOrderWizardStore, WizardSession, ServiceSelection } from '@/stores/order-wizard-store';
import { ServiceCategory, Service, Organization } from '@/types/models';

import OrderWizardLayout from '@/components/order-wizard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

import InputError from '@/components/input-error';

interface WizardServicesPageProps {
    category: ServiceCategory;
    servicesByAgency: Record<string, Service[]>;
    session: WizardSession;
    allCategories: string[];
    currentCategoryIndex: number;
}

export default function WizardServicesPage({ 
    category, 
    servicesByAgency, 
    session, 
    allCategories, 
    currentCategoryIndex 
}: WizardServicesPageProps) {
    const { setCurrentStep, setSelectedServices, selectedServices, initializeFromSession, isSaving } = useOrderWizardStore();
    
    // Manual state management
    const [localSelections, setLocalSelections] = useState<ServiceSelection[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Initialize store and local state from session
    useEffect(() => {
        initializeFromSession(session);
        setCurrentStep(3);
        
        const existingSelections = selectedServices[category.id] || [];
        setLocalSelections(existingSelections);
    }, [session, category.id, selectedServices, initializeFromSession, setCurrentStep]);

    const handleServiceToggle = (serviceId: string) => {
        const existingIndex = localSelections.findIndex(s => s.service_id === serviceId);
        let newSelections: ServiceSelection[];
        
        if (existingIndex >= 0) {
            // Remove service
            newSelections = localSelections.filter(s => s.service_id !== serviceId);
        } else {
            // Add service with default quantity
            newSelections = [...localSelections, { service_id: serviceId, quantity: 1 }];
        }
        
        setLocalSelections(newSelections);
        // Clear any previous validation errors
        setValidationErrors({});
    };

    const handleQuantityChange = (serviceId: string, delta: number) => {
        const newSelections = localSelections.map(selection => {
            if (selection.service_id === serviceId) {
                const newQuantity = Math.max(1, selection.quantity + delta);
                return { ...selection, quantity: newQuantity };
            }
            return selection;
        });
        
        setLocalSelections(newSelections);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Validation
        if (localSelections.length === 0) {
            setValidationErrors({ service_selections: 'Please select at least one service' });
            return;
        }

        // Clear errors and set loading state
        setValidationErrors({});
        setIsSubmitting(true);
        
        // Update store state
        setSelectedServices(category.id, localSelections);
        
        // Prepare data in the exact format expected by the backend
        const requestData = {
            service_selections: localSelections
        };
        
        // Submit to backend using Inertia's router.post
        router.post(route('orders.wizard.store-service', category.id), requestData, {
            onSuccess: () => {
                // Backend will redirect to next category or summary
                setIsSubmitting(false);
            },
            onError: (errors) => {
                // Handle validation errors from backend
                setValidationErrors(errors);
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const goBack = () => {
        router.visit(route('orders.wizard.categories'));
    };

    const getSelectedService = (serviceId: string): ServiceSelection | undefined => {
        return localSelections.find(s => s.service_id === serviceId);
    };

    const calculateCategoryTotal = (): number => {
        return localSelections.reduce((total, selection) => {
            const service = Object.values(servicesByAgency)
                .flat()
                .find(s => s.id === selection.service_id);
            return total + (service ? service.price * selection.quantity : 0);
        }, 0);
    };

    const nextCategoryIndex = currentCategoryIndex + 1;
    const isLastCategory = nextCategoryIndex >= allCategories.length;

    return (
        <>
            <Head title={`Create Order - Select ${category.name} Services`} />
            
            <OrderWizardLayout
                title={`Select ${category.name} Services`}
                description="Choose agencies and services for this category"
                currentStep={3}
                canGoBack={true}
                onBack={goBack}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium">{category.name}</h3>
                            <p className="text-sm text-muted-foreground">
                                Category {currentCategoryIndex + 1} of {allCategories.length}
                            </p>
                        </div>
                        <Badge variant="outline">
                            Step {currentCategoryIndex + 1}/{allCategories.length}
                        </Badge>
                    </div>

                    {validationErrors.service_selections && <InputError message={validationErrors.service_selections} />}

                    <div className="space-y-6">
                        {Object.entries(servicesByAgency).map(([agencyId, services]) => {
                            if (services.length === 0) return null;
                            
                            const agency = services[0]?.organization;
                            const selectedServicesForAgency = services.filter(s => 
                                localSelections.some(sel => sel.service_id === s.id)
                            );

                            return (
                                <Card key={agencyId} className="overflow-hidden">
                                    <CardHeader className="bg-muted/30">
                                        <CardTitle className="flex items-center gap-2">
                                            <Building2 className="h-5 w-5" />
                                            {agency?.name}
                                        </CardTitle>
                                        <CardDescription>
                                            {services.length} service{services.length !== 1 ? 's' : ''} available
                                            {selectedServicesForAgency.length > 0 && (
                                                <span className="ml-2 text-primary">
                                                    • {selectedServicesForAgency.length} selected
                                                </span>
                                            )}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y">
                                            {services.map((service) => {
                                                const selection = getSelectedService(service.id);
                                                const isSelected = !!selection;

                                                return (
                                                    <div 
                                                        key={service.id} 
                                                        className={`p-4 transition-colors ${
                                                            isSelected ? 'bg-primary/5' : 'hover:bg-muted/30'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <Label 
                                                                        htmlFor={`service-${service.id}`}
                                                                        className="font-medium cursor-pointer"
                                                                    >
                                                                        {service.name}
                                                                    </Label>
                                                                    {isSelected && (
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            Selected
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                {service.description && (
                                                                    <p className="text-sm text-muted-foreground mt-1">
                                                                        {service.description}
                                                                    </p>
                                                                )}
                                                <div className="mt-2 text-sm font-medium">
                                                    ${service.price.toFixed(2)} per unit
                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-3">
                                                                {isSelected && (
                                                                    <div className="flex items-center gap-2">
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleQuantityChange(service.id, -1)}
                                                                            disabled={selection!.quantity <= 1}
                                                                        >
                                                                            <Minus className="h-3 w-3" />
                                                                        </Button>
                                                                        <span className="min-w-[2rem] text-center">
                                                                            {selection!.quantity}
                                                                        </span>
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleQuantityChange(service.id, 1)}
                                                                        >
                                                                            <Plus className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                )}

                                                                <Button
                                                                    type="button"
                                                                    variant={isSelected ? "secondary" : "outline"}
                                                                    onClick={() => handleServiceToggle(service.id)}
                                                                >
                                                                    {isSelected ? 'Remove' : 'Add Service'}
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {isSelected && selection && (
                                                            <div className="mt-3 p-3 bg-muted/50 rounded-md">
                                                                <div className="text-sm">
                                                                    <span className="text-muted-foreground">Subtotal: </span>
                                                                    <span className="font-medium">
                                                                        ${(service.price * selection.quantity).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {Object.keys(servicesByAgency).length === 0 && (
                            <div className="text-center py-8">
                                <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <p className="mt-2 text-muted-foreground">
                                    No agencies offer services in this category for the selected port.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Category Total */}
                    {localSelections.length > 0 && (
                        <div className="rounded-lg bg-muted/50 p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-medium">
                                        {category.name} - {localSelections.length} service{localSelections.length !== 1 ? 's' : ''} selected
                                    </h3>
                                </div>
                                <div className="text-lg font-semibold">
                                    Total: ${calculateCategoryTotal().toFixed(2)}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={goBack}>
                            Back: Categories
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting || isSaving || localSelections.length === 0}
                        >
                            {(isSubmitting || isSaving) && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            {isLastCategory ? 'Review Order' : 'Next Category'}
                        </Button>
                    </div>
                </form>
            </OrderWizardLayout>
        </>
    );
}
