import { FormEventHandler, useEffect } from 'react';

import { Head, router, useForm } from '@inertiajs/react';
import { LoaderCircle, Ship, MapPin, Building2, Package, CheckCircle } from 'lucide-react';

import { useOrderWizardStore, WizardSession } from '@/stores/order-wizard-store';
import { Port, Vessel, ServiceCategory, Service } from '@/types/models';

import OrderWizardLayout from '@/components/order-wizard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

import InputError from '@/components/input-error';

interface ServiceWithCategory extends Service {
    category?: ServiceCategory;
}

interface CategoryServices {
    category: ServiceCategory;
    services: Array<{
        service: ServiceWithCategory;
        quantity: number;
        unit_price: number;
        line_total: number;
    }>;
}

interface WizardSummaryPageProps {
    vessel: Vessel;
    port: Port;
    selectedServices: CategoryServices[];
    totalEstimate: number;
    session: WizardSession;
}

export default function WizardSummaryPage({ 
    vessel, 
    port, 
    selectedServices, 
    totalEstimate, 
    session 
}: WizardSummaryPageProps) {
    const { setCurrentStep, initializeFromSession, isSaving } = useOrderWizardStore();

    const { data, setData, post, processing, errors } = useForm({
        notes: '',
    });

    // Initialize store from session
    useEffect(() => {
        initializeFromSession(session);
        setCurrentStep(4);
    }, [session, initializeFromSession, setCurrentStep]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        post(route('orders.wizard.confirm'), {
            onSuccess: () => {
                // Will redirect to orders index with success message
            },
        });
    };

    const goBack = () => {
        // Go back to the last category's services page
        const lastCategoryId = selectedServices[selectedServices.length - 1]?.category?.id;
        if (lastCategoryId) {
            router.visit(route('orders.wizard.services', lastCategoryId));
        } else {
            router.visit(route('orders.wizard.categories'));
        }
    };

    // Group services by agency for multi-agency breakdown
    const servicesByAgency = selectedServices.reduce((acc, categoryGroup) => {
        categoryGroup.services.forEach(serviceItem => {
            const agencyId = serviceItem.service.organization?.id;
            const agencyName = serviceItem.service.organization?.name;
            
            if (agencyId && agencyName) {
                if (!acc[agencyId]) {
                    acc[agencyId] = {
                        agency: serviceItem.service.organization,
                        services: [],
                        total: 0,
                    };
                }
                
                acc[agencyId].services.push({
                    ...serviceItem,
                    categoryName: categoryGroup.category.name,
                });
                acc[agencyId].total += serviceItem.line_total;
            }
        });
        
        return acc;
    }, {} as Record<string, {
        agency: any;
        services: Array<any & { categoryName: string }>;
        total: number;
    }>);

    const totalServices = selectedServices.reduce((sum, cat) => sum + cat.services.length, 0);
    const totalAgencies = Object.keys(servicesByAgency).length;

    return (
        <>
            <Head title="Create Order - Review & Confirm" />
            
            <OrderWizardLayout
                title="Review & Confirm Order"
                description="Review your selections and confirm the order"
                currentStep={4}
                canGoBack={true}
                onBack={goBack}
            >
                <form onSubmit={submit} className="space-y-8">
                    {/* Order Overview */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Ship className="h-4 w-4" />
                                    Vessel Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Name:</span>{' '}
                                    <span className="font-medium">{vessel.name}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">IMO:</span>{' '}
                                    <span className="font-medium">{vessel.imo_number}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Owner:</span>{' '}
                                    <span className="font-medium">{vessel.organization?.name}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <MapPin className="h-4 w-4" />
                                    Port Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Name:</span>{' '}
                                    <span className="font-medium">{port.name} ({port.code})</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Location:</span>{' '}
                                    <span className="font-medium">{port.city}, {port.country}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                            <CardDescription>
                                Your order will be distributed across {totalAgencies} shipping agenc{totalAgencies !== 1 ? 'ies' : 'y'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">{selectedServices.length}</div>
                                    <div className="text-sm text-muted-foreground">Categories</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">{totalServices}</div>
                                    <div className="text-sm text-muted-foreground">Services</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">{totalAgencies}</div>
                                    <div className="text-sm text-muted-foreground">Agencies</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Multi-Agency Breakdown */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Agency Breakdown</h3>
                        <p className="text-sm text-muted-foreground">
                            Your order will be split into separate groups for each agency. 
                            Each agency will receive their portion for approval.
                        </p>

                        {Object.entries(servicesByAgency).map(([agencyId, agencyGroup]) => (
                            <Card key={agencyId}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        {agencyGroup.agency.name}
                                        <Badge variant="secondary" className="ml-auto">
                                            ${agencyGroup.total.toFixed(2)}
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription>
                                        {agencyGroup.services.length} service{agencyGroup.services.length !== 1 ? 's' : ''} selected
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {agencyGroup.services.map((serviceItem, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                                <div className="flex-1">
                                                    <div className="font-medium">{serviceItem.service.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {serviceItem.categoryName} • Qty: {serviceItem.quantity} • ${serviceItem.unit_price.toFixed(2)} each
                                                    </div>
                                                </div>
                                                <div className="font-medium">
                                                    ${serviceItem.line_total.toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Notes (Optional)</CardTitle>
                            <CardDescription>
                                Any special instructions or requirements for the agencies
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Enter any additional notes or special requirements..."
                                disabled={processing || isSaving}
                                rows={4}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <InputError message={errors.notes} />
                        </CardContent>
                    </Card>

                    {/* Total */}
                    <Card className="border-primary/20 bg-primary/5">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-lg font-semibold">Total Order Value</div>
                                    <div className="text-sm text-muted-foreground">
                                        Estimated total across all agencies
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-primary">
                                    ${totalEstimate.toFixed(2)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={goBack}>
                            Back: Edit Services
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={processing || isSaving}
                            className="gap-2"
                        >
                            {(processing || isSaving) && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            <CheckCircle className="h-4 w-4" />
                            Confirm & Create Order
                        </Button>
                    </div>
                </form>
            </OrderWizardLayout>
        </>
    );
}
