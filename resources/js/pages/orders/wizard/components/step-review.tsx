import { useState } from 'react';

import { router } from '@inertiajs/react';
import { Building2, CheckCircle, MapPin, Ship, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

import type { ServiceSelection } from '@/types/wizard';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

import { useOrderWizardStore } from '../stores/order-wizard-store';

export function StepReview() {
    const {
        vessel,
        port,
        selectedCategories,
        selectedServices,
        sessionId,
        isSaving,
        completeOrder,
        setNotes: updateStoreNotes,
    } = useOrderWizardStore();
    const [notes, setNotes] = useState('');
    const [isCompleting, setIsCompleting] = useState(false);

    // Group services by organization for display
    const servicesByOrganization = selectedServices.reduce(
        (acc, service) => {
            const orgId = service.organization_id;
            if (!orgId) return acc;

            if (!acc[orgId]) {
                acc[orgId] = {
                    organization: {
                        id: service.organization_id,
                        name: service.organization_name,
                    },
                    services: [],
                };
            }
            acc[orgId].services.push(service);
            return acc;
        },
        {} as Record<string, { organization: { id: string; name: string }; services: ServiceSelection[] }>,
    );

    // Calculate totals
    const totalServices = selectedServices.length;
    const totalOrganizations = Object.keys(servicesByOrganization).length;
    const totalPrice = selectedServices.reduce((sum, service) => {
        return sum + (service.price ? parseFloat(service.price) : 0);
    }, 0);

    const handleCompleteOrder = async () => {
        if (!sessionId) {
            toast.error('No active session found. Please start over.');
            return;
        }

        setIsCompleting(true);

        try {
            // Update store with notes first
            updateStoreNotes(notes.trim() || '');

            // Complete the order using store method
            const result = await completeOrder();

            if (result.success) {
                toast.success('Order created successfully!');

                // Redirect to orders page or order detail
                if (result.order?.id) {
                    router.visit(route('orders.show', result.order.id));
                } else {
                    router.visit(route('orders.index'));
                }
            } else {
                throw new Error(result.error || 'Failed to complete order');
            }
        } catch (error) {
            console.error('Error completing order:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to complete order. Please try again.');
        } finally {
            setIsCompleting(false);
        }
    };

    const canComplete = vessel && port && selectedServices.length > 0 && !isSaving && !isCompleting;

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Review & Confirm Order
                    </CardTitle>
                    <CardDescription>Please review your selections before placing the order.</CardDescription>
                </CardHeader>
            </Card>

            {/* Order Summary */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Left Column - Vessel & Port */}
                <div className="space-y-6">
                    {/* Vessel & Port Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Vessel & Destination</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {vessel && (
                                <div className="flex items-start gap-3">
                                    <Ship className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="font-medium">{vessel.name}</div>
                                        <div className="text-sm text-muted-foreground">IMO: {vessel.imo_number}</div>
                                        {vessel.vessel_type && (
                                            <Badge variant="secondary" className="mt-1">
                                                {vessel.vessel_type}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}

                            {port && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="font-medium">
                                            {port.name} ({port.code})
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {port.city}, {port.country}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Categories */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Selected Categories</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {selectedCategories.map((category) => (
                                    <Badge key={category.id} variant="outline">
                                        {category.name}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Order Summary */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">{totalServices}</div>
                                    <div className="text-sm text-muted-foreground">Service{totalServices !== 1 ? 's' : ''}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">{totalOrganizations}</div>
                                    <div className="text-sm text-muted-foreground">Provider{totalOrganizations !== 1 ? 's' : ''}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">${totalPrice.toFixed(2)}</div>
                                    <div className="text-sm text-muted-foreground">Total Est.</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Additional Notes</CardTitle>
                            <CardDescription>Add any special instructions or requirements (optional)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Label htmlFor="notes" className="sr-only">
                                Order Notes
                            </Label>
                            <Textarea
                                id="notes"
                                placeholder="Enter any additional notes or special instructions..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                                maxLength={1000}
                            />
                            <div className="mt-2 text-right text-xs text-muted-foreground">{notes.length}/1000 characters</div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Services by Organization */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Selected Services by Provider
                    </CardTitle>
                    <CardDescription>
                        Your order will be split into {totalOrganizations} order group{totalOrganizations !== 1 ? 's' : ''} based on service
                        providers.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {Object.values(servicesByOrganization).map(({ organization, services }) => {
                        const orgTotal = services.reduce((sum, service) => sum + (service.price ? parseFloat(service.price) : 0), 0);

                        return (
                            <div key={organization.id} className="rounded-lg border p-4">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <div className="font-medium">{organization.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {services.length} service{services.length !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium text-green-600">${orgTotal.toFixed(2)}</div>
                                        <div className="text-sm text-muted-foreground">Est. Total</div>
                                    </div>
                                </div>

                                <Separator className="mb-4" />

                                <div className="space-y-2">
                                    {services.map((service) => (
                                        <div key={service.id} className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="font-medium">{service.name}</div>
                                                {service.description && (
                                                    <div className="line-clamp-1 text-sm text-muted-foreground">{service.description}</div>
                                                )}
                                            </div>
                                            {service.price && <div className="ml-4 text-sm font-medium text-green-600">${service.price}</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="bg-muted/50">
                <CardContent className="pt-6">
                    <div className="space-y-4 text-center">
                        <div>
                            <h3 className="text-lg font-semibold">Ready to Place Your Order?</h3>
                            <p className="text-sm text-muted-foreground">
                                Once confirmed, your order will be sent to the respective service providers for processing.
                            </p>
                        </div>

                        <Button onClick={handleCompleteOrder} disabled={!canComplete} size="lg" className="w-full sm:w-auto">
                            {isCompleting ? 'Creating Order...' : 'Place Order'}
                        </Button>

                        <p className="text-xs text-muted-foreground">
                            By placing this order, you agree to our terms of service and acknowledge that pricing is estimated.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
