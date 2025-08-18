import { useState, useMemo } from 'react';

import { router } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Building2, Check, Search, Users } from 'lucide-react';

import type { Service } from '@/types/models';
import type { OrderWizardSession, OrderWizardCategorySelection } from '@/types/wizard';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface StepServicesProps {
    services: Service[];
    session: OrderWizardSession | null;
}

export function StepServices({ services, session }: StepServicesProps) {
    const [isSaving, setIsSaving] = useState(false);

    // Initialize with services from session using service_selections relationship
    const initiallySelectedServices = session?.service_selections
        ? services.filter((service) => session.service_selections?.some((selection) => selection.service_id === service.id))
        : [];

    const [tempSelectedServices, setTempSelectedServices] = useState<Service[]>(initiallySelectedServices);
    const [search, setSearch] = useState('');

    // Get selected categories from session for display
    const selectedCategories = useMemo(() => session?.category_selections || [], [session?.category_selections]);

    // Filter services by search only (they're already filtered by port and category from backend)
    const filteredServices = services.filter((service) => {
        const matchesSearch =
            search === '' ||
            service.name.toLowerCase().includes(search.toLowerCase()) ||
            service.description?.toLowerCase().includes(search.toLowerCase()) ||
            service.organization?.name.toLowerCase().includes(search.toLowerCase());

        return matchesSearch;
    });

    // Find categories that have no services available (use full services array, not filtered)
    const emptyCategorySelections = useMemo(() => {
        const categoriesSet = new Set(
            services
                .filter(service => service.sub_category?.category?.id != null)
                .map(service => service.sub_category.category.id)
        );
        return selectedCategories.filter(
            selection => !categoriesSet.has(selection.service_category_id)
        );
    }, [services, selectedCategories]);

    // Group services by category first, then by organization within each category
    const servicesByCategory = filteredServices.reduce(
        (acc, service) => {
            if (!service.sub_category?.category || !service.organization) return acc;

            const categoryId = service.sub_category.category.id;
            const orgId = service.organization.id;

            // Initialize category if it doesn't exist
            if (!acc[categoryId]) {
                acc[categoryId] = {
                    category: service.sub_category.category,
                    organizationGroups: {},
                };
            }

            // Initialize organization within category if it doesn't exist
            if (!acc[categoryId].organizationGroups[orgId]) {
                acc[categoryId].organizationGroups[orgId] = {
                    organization: service.organization,
                    services: [],
                };
            }

            acc[categoryId].organizationGroups[orgId].services.push(service);
            return acc;
        },
        {} as Record<
            string,
            {
                category: { id: string; name: string };
                organizationGroups: Record<string, { organization: { id: string; name: string }; services: Service[] }>;
            }
        >,
    );

    const handleServiceToggle = (service: Service, checked: boolean) => {
        if (checked) {
            setTempSelectedServices((prev) => [...prev, service]);
        } else {
            setTempSelectedServices((prev) => prev.filter((s) => s.id !== service.id));
        }
    };

    const handleOrganizationToggle = (orgServices: Service[], checked: boolean) => {
        if (checked) {
            const newServices = orgServices.filter((service) => !tempSelectedServices.some((s) => s.id === service.id));
            setTempSelectedServices((prev) => [...prev, ...newServices]);
        } else {
            const orgServiceIds = orgServices.map((s) => s.id);
            setTempSelectedServices((prev) => prev.filter((s) => !orgServiceIds.includes(s.id)));
        }
    };

    const handleContinue = () => {
        if (tempSelectedServices.length > 0 && session) {
            setIsSaving(true);

            router.patch(
                route('order-wizard-sessions.set-services', session.id),
                {
                    selected_services: tempSelectedServices.map((service) => service.id),
                },
                {
                    onSuccess: () => {
                        // Navigate to review step
                        router.visit(route('order-wizard.step.review', { session: session.id }));
                    },
                    onFinish: () => setIsSaving(false),
                },
            );
        }
    };

    const canContinue = tempSelectedServices.length > 0 && !isSaving;

    const getSelectedServicesCount = (orgServices: Service[]) => {
        return orgServices.filter((service) => tempSelectedServices.some((s) => s.id === service.id)).length;
    };

    const isOrganizationFullySelected = (orgServices: Service[]) => {
        return orgServices.length > 0 && orgServices.every((service) => tempSelectedServices.some((s) => s.id === service.id));
    };

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left: Service Selection */}
            <div className="space-y-6 lg:col-span-2">
                {/* Header */}
                <div>
                    <h3 className="flex items-center gap-2 text-xl font-semibold">
                        <Users className="h-5 w-5" />
                        Select Services
                    </h3>
                    <p className="mt-1 text-muted-foreground">
                        Choose services from the selected categories. Services are grouped by category, then by provider.
                    </p>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>

                {/* Selected Categories */}
                <div>
                    <Label className="text-sm font-medium">Selected Categories:</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {selectedCategories.map((selection: OrderWizardCategorySelection, index: number) => (
                            <Badge 
                                key={`${selection.service_category_id}:${selection.service_sub_category_id || 'no-sub'}:${index}`} 
                                variant="secondary"
                            >
                                {selection.service_sub_category?.name && selection.service_category?.name
                                    ? `${selection.service_sub_category.name} (${selection.service_category.name})`
                                    : selection.service_sub_category?.name ||
                                      selection.service_category?.name ||
                                      `Category ${selection.service_category_id}`}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Services by Category */}
                <div className="space-y-6">
                    {Object.values(servicesByCategory).map(({ category, organizationGroups }) => (
                        <Card key={category.id} className="overflow-hidden">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-xl">{category.name}</CardTitle>
                                <CardDescription>
                                    {Object.values(organizationGroups).reduce((total, org) => total + org.services.length, 0)} service(s) available
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {Object.values(organizationGroups).map(({ organization, services: orgServices }) => {
                                    const selectedCount = getSelectedServicesCount(orgServices);
                                    const isFullySelected = isOrganizationFullySelected(orgServices);
                                    const isPartiallySelected = selectedCount > 0 && !isFullySelected;

                                    return (
                                        <div key={organization.id} className="rounded-lg border bg-muted/30">
                                            <div className="p-4 pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Checkbox
                                                            checked={isFullySelected}
                                                            ref={(el) => {
                                                                if (el && el.querySelector('input')) {
                                                                    const input = el.querySelector('input') as HTMLInputElement;
                                                                    input.indeterminate = isPartiallySelected;
                                                                }
                                                            }}
                                                            onCheckedChange={(checked) => handleOrganizationToggle(orgServices, checked as boolean)}
                                                        />
                                                        <div>
                                                            <div className="flex items-center gap-2 font-medium">
                                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                                {organization.name}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                {orgServices.length} service{orgServices.length !== 1 ? 's' : ''} available
                                                                {selectedCount > 0 && (
                                                                    <span className="ml-2 text-primary">• {selectedCount} selected</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {selectedCount > 0 && (
                                                        <Badge variant="outline" className="border-primary text-primary">
                                                            {selectedCount}/{orgServices.length}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="px-4 pb-4">
                                                <Separator className="mb-3" />
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    {orgServices.map((service) => {
                                                        const isSelected = tempSelectedServices.some((s) => s.id === service.id);

                                                        return (
                                                            <div
                                                                key={service.id}
                                                                className={`relative cursor-pointer rounded-lg border p-3 transition-colors ${
                                                                    isSelected
                                                                        ? 'border-primary bg-primary/5'
                                                                        : 'border-border hover:border-muted-foreground/50'
                                                                }`}
                                                                onClick={() => handleServiceToggle(service, !isSelected)}
                                                            >
                                                                <div className="flex items-start space-x-3">
                                                                    <Checkbox
                                                                        id={service.id}
                                                                        checked={isSelected}
                                                                        onCheckedChange={(checked) =>
                                                                            handleServiceToggle(service, checked as boolean)
                                                                        }
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    />
                                                                    <div className="min-w-0 flex-1">
                                                                        <Label htmlFor={service.id} className="cursor-pointer font-medium">
                                                                            {service.name}
                                                                        </Label>
                                                                        {service.description && (
                                                                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                                                                {service.description}
                                                                            </p>
                                                                        )}
                                                                        {service.price && (
                                                                            <p className="mt-1 text-sm font-medium text-green-600">
                                                                                ${service.price}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    {isSelected && <Check className="h-5 w-5 text-primary" />}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    ))}

                    {/* Empty Categories - Show consolidated message for categories with no services */}
                    {emptyCategorySelections.length > 0 && (
                        <Card className="overflow-hidden border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-xl">Some Categories Unavailable</CardTitle>
                                <CardDescription className="text-amber-700 dark:text-amber-300">
                                    No agencies offer services for some of your selected categories at this port
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="py-6">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <AlertCircle className="mb-4 h-12 w-12 text-amber-500 dark:text-amber-400" />
                                    <h3 className="mb-2 text-lg font-medium text-amber-800 dark:text-amber-200">No agencies offer these services</h3>
                                    <p className="mb-4 max-w-md text-sm text-amber-700 dark:text-amber-300">
                                        The following categories have no agencies offering services at this port:{' '}
                                        <strong>
                                            {emptyCategorySelections.map((selection) => selection.service_category?.name || 'Unknown').join(', ')}
                                        </strong>
                                        . Try selecting different categories or search at a different port.
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.visit(route('order-wizard.dashboard'))}
                                        className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900"
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Start New Order Search
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {Object.keys(servicesByCategory).length === 0 && emptyCategorySelections.length === 0 && (
                        <Card>
                            <CardContent className="py-8 text-center text-sm text-muted-foreground">
                                No services available for the selected categories. Try selecting different categories in the previous step.
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Right: Selection Summary */}
            <div className="lg:col-span-1">
                <Card className="sticky top-6 bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Selected Services
                            {tempSelectedServices.length > 0 && (
                                <span className="ml-2 text-sm font-normal text-muted-foreground">({tempSelectedServices.length})</span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            {tempSelectedServices.length > 0
                                ? 'These services will be included in your order'
                                : 'Select services to see them here. Services from different providers will create separate order groups.'}
                        </p>

                        {/* Selected Services List */}
                        <div className="space-y-3">
                            {tempSelectedServices.length > 0 ? (
                                /* Group selected services by category for display */
                                Object.values(
                                    tempSelectedServices.reduce(
                                        (acc, service) => {
                                            if (!service.sub_category?.category) return acc;

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
                                    ),
                                ).map(({ category, services: selectedCategoryServices }) => {
                                    const categoryTotal = selectedCategoryServices.reduce(
                                        (sum, service) => sum + (service.price ? parseFloat(service.price) : 0),
                                        0,
                                    );

                                    return (
                                        <div key={category.id} className="rounded-md border bg-background p-3">
                                            <div className="mb-2 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-foreground">{category.name}</span>
                                                    <Badge variant="outline">
                                                        {selectedCategoryServices.length} service{selectedCategoryServices.length !== 1 ? 's' : ''}
                                                    </Badge>
                                                </div>
                                                {categoryTotal > 0 && (
                                                    <span className="text-sm font-medium text-green-600">${categoryTotal.toFixed(2)}</span>
                                                )}
                                            </div>
                                            <div className="space-y-1 pl-0">
                                                {selectedCategoryServices.map((service) => (
                                                    <div key={service.id} className="flex items-center justify-between text-sm">
                                                        <div className="flex-1">
                                                            <span className="text-foreground">{service.name}</span>
                                                            {service.organization && (
                                                                <span className="ml-2 text-xs text-muted-foreground">
                                                                    by {service.organization.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {service.price && <span className="font-medium text-green-600">${service.price}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-8 text-center text-sm text-muted-foreground italic">No services selected yet</div>
                            )}
                        </div>

                        {/* Action Button or Help Text */}
                        <div className="border-t pt-4">
                            {canContinue ? (
                                <Button onClick={handleContinue} disabled={isSaving} className="w-full">
                                    {isSaving ? 'Saving...' : 'Continue to Review'}
                                </Button>
                            ) : (
                                <div className="text-center text-sm text-muted-foreground">Select at least one service to continue</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
