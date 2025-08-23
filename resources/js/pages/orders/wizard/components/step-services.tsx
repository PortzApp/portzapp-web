import { useMemo, useState } from 'react';

import { router } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Building2, Search, Users } from 'lucide-react';

import type { Service } from '@/types/models';
import type { OrderWizardCategorySelection, OrderWizardSession } from '@/types/wizard';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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

    // Store selected services as a map of subCategoryId -> serviceId for radio group management
    const [selectedServicesBySubCategory, setSelectedServicesBySubCategory] = useState<Record<string, string>>(() => {
        const initialMap: Record<string, string> = {};
        initiallySelectedServices.forEach((service) => {
            if (service.sub_category?.id) {
                initialMap[service.sub_category.id] = service.id;
            }
        });
        return initialMap;
    });
    const [search, setSearch] = useState('');

    // Get selected categories from session for display
    const selectedCategories = useMemo(() => session?.category_selections || [], [session?.category_selections]);

    // Computed property to get currently selected services
    const tempSelectedServices = useMemo(() => {
        const selectedServiceIds = Object.values(selectedServicesBySubCategory);
        return services.filter((service) => selectedServiceIds.includes(service.id));
    }, [selectedServicesBySubCategory, services]);

    // Filter services by search only (they're already filtered by port and category from backend)
    const filteredServices = services.filter((service) => {
        const matchesSearch =
            search === '' ||
            service.sub_category?.name.toLowerCase().includes(search.toLowerCase()) ||
            service.description?.toLowerCase().includes(search.toLowerCase()) ||
            service.organization?.name.toLowerCase().includes(search.toLowerCase());

        return matchesSearch;
    });

    // Find categories that have no services available (use full services array, not filtered)
    const emptyCategorySelections = useMemo(() => {
        const categoriesSet = new Set(
            services.filter((service) => service.sub_category?.category?.id != null).map((service) => service.sub_category?.category?.id),
        );
        return selectedCategories.filter((selection) => !categoriesSet.has(selection.service_category_id));
    }, [services, selectedCategories]);

    // Group services by sub-category first, then by organization within each sub-category
    const servicesBySubCategory = filteredServices.reduce(
        (acc, service) => {
            if (!service.sub_category || !service.organization) return acc;

            const subCategoryId = service.sub_category.id;
            const orgId = service.organization.id;

            // Initialize sub-category if it doesn't exist
            if (!acc[subCategoryId]) {
                acc[subCategoryId] = {
                    subCategory: service.sub_category,
                    organizationGroups: {},
                };
            }

            // Initialize organization within sub-category if it doesn't exist
            if (!acc[subCategoryId].organizationGroups[orgId]) {
                acc[subCategoryId].organizationGroups[orgId] = {
                    organization: service.organization,
                    services: [],
                };
            }

            acc[subCategoryId].organizationGroups[orgId].services.push(service);
            return acc;
        },
        {} as Record<
            string,
            {
                subCategory: { id: string; name: string; category?: { id: string; name: string } };
                organizationGroups: Record<string, { organization: { id: string; name: string }; services: Service[] }>;
            }
        >,
    );

    const handleServiceSelection = (subCategoryId: string, serviceId: string) => {
        setSelectedServicesBySubCategory((prev) => ({
            ...prev,
            [subCategoryId]: serviceId,
        }));
    };

    const handleSubCategoryDeselection = (subCategoryId: string) => {
        setSelectedServicesBySubCategory((prev) => {
            const updated = { ...prev };
            delete updated[subCategoryId];
            return updated;
        });
    };

    const handleContinue = () => {
        if (tempSelectedServices.length > 0 && session) {
            setIsSaving(true);

            router.patch(
                route('order-wizard-sessions.services', session.id),
                {
                    selected_services: tempSelectedServices.map((service) => service.id),
                },
                {
                    onFinish: () => setIsSaving(false),
                    onError: (errors) => {
                        console.error('Service selection errors:', errors);
                        setIsSaving(false);
                    },
                },
            );
        }
    };

    const canContinue = tempSelectedServices.length > 0 && !isSaving;

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
                        Choose one service provider per category. Services are grouped by category, and you can select only one provider per category.
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

                {/* Services by Sub-Category */}
                <div className="space-y-6">
                    {Object.values(servicesBySubCategory).map(({ subCategory, organizationGroups }) => (
                        <Card key={subCategory.id} className="overflow-hidden">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-xl">{subCategory.name}</CardTitle>
                                <CardDescription>
                                    {Object.keys(organizationGroups).length} agenc{Object.keys(organizationGroups).length === 1 ? 'y' : 'ies'}{' '}
                                    offering services
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <RadioGroup
                                    value={selectedServicesBySubCategory[subCategory.id] || ''}
                                    onValueChange={(value) => {
                                        if (value) {
                                            handleServiceSelection(subCategory.id, value);
                                        } else {
                                            handleSubCategoryDeselection(subCategory.id);
                                        }
                                    }}
                                    className="gap-2"
                                >
                                    {Object.values(organizationGroups).map(({ organization, services: orgServices }) => {
                                        // Since each organization only offers one service per sub-category,
                                        // we can simplify this to show one card per organization-service combination
                                        const service = orgServices[0]; // Take the first (and only) service
                                        const isSelected = selectedServicesBySubCategory[subCategory.id] === service.id;

                                        return (
                                            <div
                                                key={`${organization.id}-${service.id}`}
                                                className={`relative flex w-full items-start gap-2 rounded-md border border-input p-4 shadow-xs outline-none transition-colors ${
                                                    isSelected ? 'border-primary/50 bg-primary/5' : 'hover:border-muted-foreground/50'
                                                }`}
                                            >
                                                <RadioGroupItem
                                                    value={service.id}
                                                    id={`${subCategory.id}-${service.id}`}
                                                    className="order-1 after:absolute after:inset-0"
                                                />
                                                <div className="flex grow items-center gap-3">
                                                    {/* Agency Logo Placeholder */}
                                                    <div className="h-12 w-12 flex-shrink-0 rounded-md bg-muted" />

                                                    <div className="grid grow gap-2">
                                                        <Label htmlFor={`${subCategory.id}-${service.id}`} className="cursor-pointer">
                                                            {service.organization?.name || 'Agency'}{' '}
                                                            <span className="text-xs leading-[inherit] font-normal text-muted-foreground">
                                                                ({subCategory.name})
                                                            </span>
                                                        </Label>
                                                        {service.description && (
                                                            <p className="text-xs text-muted-foreground line-clamp-2">{service.description}</p>
                                                        )}
                                                        {service.price && (
                                                            <p className="text-sm font-semibold text-green-600">${service.price}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </RadioGroup>
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

                    {Object.keys(servicesBySubCategory).length === 0 && emptyCategorySelections.length === 0 && (
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
                                : 'Select one service provider per category to see them here. Each provider will create a separate order group.'}
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
                                                            <span className="text-foreground">{service.sub_category?.name || 'Service'}</span>
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
