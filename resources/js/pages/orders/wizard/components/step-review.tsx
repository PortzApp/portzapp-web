import { useState } from 'react';

import { router } from '@inertiajs/react';
import { Building2, CheckCircle, MapPin, Ship, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

import type { Service } from '@/types/models';
import type { OrderWizardSession } from '@/types/wizard';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

interface StepReviewProps {
    session: OrderWizardSession | null;
}

export function StepReview({ session }: StepReviewProps) {
    const [notes, setNotes] = useState('');
    const [isCompleting, setIsCompleting] = useState(false);

    if (!session) {
        return (
            <div className="text-center text-muted-foreground">
                <p>No session data available.</p>
            </div>
        );
    }

    // Group services by category first for display
    const selectedServices = session.service_selections || [];

    const servicesByCategory = selectedServices.reduce(
        (acc, selection) => {
            const service = selection.service;

            if (!service?.sub_category?.category) {
                return acc;
            }

            const categoryId = service.sub_category.category.id;
            if (!acc[categoryId]) {
                acc[categoryId] = {
                    category: service.sub_category.category,
                    services: [],
                };
            }
            acc[categoryId].services.push(service);
            return acc;
        },
        {} as Record<string, { category: { id: string; name: string }; services: Service[] }>,
    );

    // Get categories ONLY from services that were actually selected
    const uniqueCategories = Array.from(
        new Set(selectedServices.map((selection) => selection.service?.sub_category?.category?.name).filter(Boolean)),
    );

    // Calculate totals
    const totalServices = selectedServices.length;
    const totalCategories = Object.keys(servicesByCategory).length;

    // Calculate unique organizations from all services
    const uniqueOrganizations = new Set(selectedServices.map((selection) => selection.service?.organization?.id).filter(Boolean));
    const totalOrganizations = uniqueOrganizations.size;

    const totalPrice = selectedServices.reduce((sum, selection) => {
        const price = selection.service?.price || '0';
        return sum + parseFloat(price.toString());
    }, 0);

    const handleCompleteOrder = async () => {
        if (!session?.id) {
            toast.error('No active session found. Please start over.');
            return;
        }

        setIsCompleting(true);

        try {
            router.post(
                route('order-wizard-sessions.complete', session.id),
                {
                    notes: notes.trim() || '',
                },
                {
                    onSuccess: (response: unknown) => {
                        toast.success('Order created successfully!');
                        // Check if response contains order data with ID
                        const responseData = response as { props?: { order?: { id: string }; orders?: { id: string }[] } };
                        if (responseData.props?.order?.id) {
                            router.visit(route('orders.show', responseData.props.order.id));
                        } else if (responseData.props?.orders && responseData.props.orders.length > 0) {
                            // If multiple orders were created, redirect to the first one
                            router.visit(route('orders.show', responseData.props.orders[0].id));
                        } else {
                            // Fallback to orders index if no specific order ID available
                            router.visit(route('orders.index'));
                        }
                    },
                    onError: (errors) => {
                        console.error('Error completing order:', errors);
                        toast.error('Failed to complete order. Please try again.');
                    },
                    onFinish: () => setIsCompleting(false),
                },
            );
        } catch (error) {
            console.error('Error completing order:', error);
            toast.error('Failed to complete order. Please try again.');
            setIsCompleting(false);
        }
    };

    const canComplete = session?.vessel && session?.port && selectedServices.length > 0 && !isCompleting;

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left: Review Content */}
            <div className="space-y-6 lg:col-span-2">
                {/* Header */}
                <div>
                    <h3 className="flex items-center gap-2 text-xl font-semibold">
                        <CheckCircle className="h-5 w-5" />
                        Review & Confirm Order
                    </h3>
                    <p className="mt-1 text-muted-foreground">Please review your selections before placing the order.</p>
                </div>

                {/* Vessel & Port Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Vessel & Destination</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {session.vessel && (
                            <div className="flex items-start gap-3">
                                <Ship className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div>
                                    <div className="font-medium">{session.vessel?.name}</div>
                                    <div className="text-sm text-muted-foreground">IMO: {session.vessel?.imo_number}</div>
                                    {session.vessel?.vessel_type && (
                                        <Badge variant="secondary" className="mt-1">
                                            {session.vessel?.vessel_type}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}

                        {session.port && (
                            <div className="flex items-start gap-3">
                                <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div>
                                    <div className="font-medium">
                                        {session.port?.name} ({session.port?.code})
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {session.port?.city}, {session.port?.country}
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
                        {uniqueCategories.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {uniqueCategories.map((categoryName, index) => (
                                    <Badge key={index} variant="outline">
                                        {categoryName}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No categories selected</p>
                        )}
                    </CardContent>
                </Card>

                {/* Services by Category */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Selected Services by Category
                        </CardTitle>
                        <CardDescription>
                            {totalOrganizations > 0 ? (
                                <>
                                    Your order will be split into {totalOrganizations} order group{totalOrganizations !== 1 ? 's' : ''} based on
                                    service providers.
                                </>
                            ) : (
                                <>No services selected yet.</>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {Object.keys(servicesByCategory).length > 0 ? (
                            Object.values(servicesByCategory).map(({ category, services }) => {
                                const categoryTotal = services.reduce((sum, service) => sum + (service.price ? parseFloat(service.price) : 0), 0);

                                return (
                                    <div key={category.id} className="rounded-lg border p-4">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <div className="text-lg font-medium">{category.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {services.length} service{services.length !== 1 ? 's' : ''}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium text-green-600">${categoryTotal.toFixed(2)}</div>
                                                <div className="text-sm text-muted-foreground">Category Total</div>
                                            </div>
                                        </div>

                                        <Separator className="mb-4" />

                                        <div className="space-y-2">
                                            {services.map((service) => (
                                                <div key={service.id} className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="font-medium">{service.sub_category?.name || 'Service'}</div>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            {service.organization && (
                                                                <div className="flex items-center gap-1">
                                                                    <Building2 className="h-3 w-3" />
                                                                    <span>{service.organization.name}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {service.description && (
                                                            <div className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                                                                {service.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {service.price && <div className="ml-4 text-sm font-medium text-green-600">${service.price}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-muted-foreground">No services selected</p>
                        )}
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

            {/* Right: Order Summary & Action */}
            <div className="lg:col-span-1">
                <Card className="sticky top-6 bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-lg">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">Review your order details and place your order when ready.</p>

                        {/* Order Stats */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Service Categories</span>
                                <span className="font-medium">{totalCategories}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Total Services</span>
                                <span className="font-medium">{totalServices}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Service Providers</span>
                                <span className="font-medium">{totalOrganizations}</span>
                            </div>
                        </div>

                        <Separator />

                        {/* Total Price */}
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Estimated Total</span>
                            <span className="text-lg font-bold text-green-600">${totalPrice.toFixed(2)}</span>
                        </div>

                        {/* Action Section */}
                        <div className="space-y-4 border-t pt-4">
                            <div className="text-center">
                                <h4 className="font-semibold">Ready to Place Your Order?</h4>
                                <p className="mt-1 text-xs text-muted-foreground">Your order will be sent to service providers for processing.</p>
                            </div>

                            <Button onClick={handleCompleteOrder} disabled={!canComplete} className="w-full">
                                {isCompleting ? 'Creating Order...' : 'Place Order'}
                            </Button>

                            <p className="text-center text-xs text-muted-foreground">
                                By placing this order, you agree to our terms of service and acknowledge that pricing is estimated.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
