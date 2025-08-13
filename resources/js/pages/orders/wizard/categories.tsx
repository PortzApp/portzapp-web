import { FormEventHandler, useEffect, useState } from 'react';

import { Head, router, useForm } from '@inertiajs/react';
import { LoaderCircle, Package } from 'lucide-react';

import { useOrderWizardStore, WizardSession } from '@/stores/order-wizard-store';
import { ServiceCategory } from '@/types/models';

import OrderWizardLayout from '@/components/order-wizard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

import InputError from '@/components/input-error';

interface WizardCategoriesPageProps {
    categories: ServiceCategory[];
    session: WizardSession;
}

export default function WizardCategoriesPage({ categories, session }: WizardCategoriesPageProps) {
    const { setCurrentStep, setSelectedCategories, selectedCategories, initializeFromSession, isSaving } = useOrderWizardStore();
    const [localSelectedCategories, setLocalSelectedCategories] = useState<string[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        category_ids: selectedCategories,
    });

    // Initialize store and local state from session
    useEffect(() => {
        initializeFromSession(session);
        setCurrentStep(2);
        
        const initialCategories = session.data.selected_categories || [];
        setLocalSelectedCategories(initialCategories);
        setData('category_ids', initialCategories);
    }, [session, initializeFromSession, setCurrentStep, setData]);

    const handleCategoryToggle = (categoryId: string, checked: boolean) => {
        let newCategories: string[];
        
        if (checked) {
            newCategories = [...localSelectedCategories, categoryId];
        } else {
            newCategories = localSelectedCategories.filter(id => id !== categoryId);
        }
        
        setLocalSelectedCategories(newCategories);
        setData('category_ids', newCategories);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        if (data.category_ids.length === 0) {
            return;
        }

        // Update store state
        setSelectedCategories(data.category_ids);
        
        // Submit to backend
        post(route('orders.wizard.store-categories'), {
            onSuccess: () => {
                // Will redirect to first category's services page
            },
        });
    };

    const goBack = () => {
        router.visit(route('orders.wizard.start'));
    };

    return (
        <>
            <Head title="Create Order - Select Service Categories" />
            
            <OrderWizardLayout
                title="Select Service Categories"
                description="Choose the types of services you need for your vessel"
                currentStep={2}
                canGoBack={true}
                onBack={goBack}
            >
                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Select one or more service categories. You'll choose specific agencies and services in the next steps.
                        </p>
                        
                        {errors.category_ids && <InputError message={errors.category_ids} className="mb-4" />}
                        
                        <div className="grid gap-4 md:grid-cols-2">
                            {categories.map((category) => {
                                const isSelected = localSelectedCategories.includes(category.id);
                                const servicesCount = category.services?.length || 0;
                                
                                return (
                                    <Card 
                                        key={category.id} 
                                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                                            isSelected ? 'ring-2 ring-primary' : ''
                                        }`}
                                        onClick={() => handleCategoryToggle(category.id, !isSelected)}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`category-${category.id}`}
                                                    checked={isSelected}
                                                    onCheckedChange={(checked) => 
                                                        handleCategoryToggle(category.id, checked === true)
                                                    }
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <Label 
                                                    htmlFor={`category-${category.id}`}
                                                    className="flex items-center gap-2 font-medium cursor-pointer"
                                                >
                                                    <Package className="h-4 w-4" />
                                                    {category.name}
                                                </Label>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <CardDescription>
                                                {servicesCount} service{servicesCount !== 1 ? 's' : ''} available
                                            </CardDescription>
                                            
                                            {/* Preview of services in this category */}
                                            {category.services && category.services.length > 0 && (
                                                <div className="mt-2">
                                                    <div className="text-xs text-muted-foreground">
                                                        Examples: {category.services
                                                            .slice(0, 3)
                                                            .map(s => s.name)
                                                            .join(', ')}
                                                        {category.services.length > 3 && '...'}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                        
                        {categories.length === 0 && (
                            <div className="text-center py-8">
                                <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <p className="mt-2 text-muted-foreground">
                                    No service categories available for the selected port.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Selected Categories Summary */}
                    {localSelectedCategories.length > 0 && (
                        <div className="rounded-lg bg-muted/50 p-4">
                            <h3 className="font-medium">Selected Categories ({localSelectedCategories.length})</h3>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {localSelectedCategories.map(categoryId => {
                                    const category = categories.find(c => c.id === categoryId);
                                    return (
                                        <span
                                            key={categoryId}
                                            className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                                        >
                                            {category?.name}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={goBack}>
                            Back: Port & Vessel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={processing || isSaving || localSelectedCategories.length === 0}
                        >
                            {(processing || isSaving) && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Next: Select Services ({localSelectedCategories.length} categories)
                        </Button>
                    </div>
                </form>
            </OrderWizardLayout>
        </>
    );
}
