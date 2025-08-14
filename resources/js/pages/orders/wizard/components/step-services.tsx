import { useState } from 'react';

import { Building2, Check, Search, Users } from 'lucide-react';

import type { Service } from '@/types/models';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import { useOrderWizardStore } from '../stores/order-wizard-store';

interface StepServicesProps {
    services: Service[];
}

export function StepServices({ services }: StepServicesProps) {
    const { selectedCategories, selectedServices, selectServices, isSaving } = useOrderWizardStore();
    // Initialize with services that match selected service IDs
    const initiallySelectedServices = services.filter((service) => selectedServices.some((selected) => selected.id === service.id));
    const [tempSelectedServices, setTempSelectedServices] = useState<Service[]>(initiallySelectedServices);
    const [search, setSearch] = useState('');

    // Filter services by selected categories and search
    const filteredServices = services.filter((service) => {
        const matchesCategory = selectedCategories.some((cat) => cat.id === service.service_category_id.toString());
        const matchesSearch =
            search === '' ||
            service.name.toLowerCase().includes(search.toLowerCase()) ||
            service.description?.toLowerCase().includes(search.toLowerCase()) ||
            service.organization?.name.toLowerCase().includes(search.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    // Group services by organization
    const servicesByOrganization = filteredServices.reduce(
        (acc, service) => {
            if (!service.organization) return acc;

            const orgId = service.organization.id;
            if (!acc[orgId]) {
                acc[orgId] = {
                    organization: service.organization,
                    services: [],
                };
            }
            acc[orgId].services.push(service);
            return acc;
        },
        {} as Record<string, { organization: { id: string; name: string }; services: Service[] }>,
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

    const handleContinue = async () => {
        if (tempSelectedServices.length > 0) {
            await selectServices(tempSelectedServices);
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
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Select Services
                    </CardTitle>
                    <CardDescription>Choose services from the selected categories. Services are grouped by provider.</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                    </div>

                    {/* Selected Categories */}
                    <div className="mb-4">
                        <Label className="text-sm font-medium">Selected Categories:</Label>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {selectedCategories.map((category) => (
                                <Badge key={category.id} variant="secondary">
                                    {category.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Services by Organization */}
            <div className="space-y-4">
                {Object.values(servicesByOrganization).map(({ organization, services: orgServices }) => {
                    const selectedCount = getSelectedServicesCount(orgServices);
                    const isFullySelected = isOrganizationFullySelected(orgServices);
                    const isPartiallySelected = selectedCount > 0 && !isFullySelected;

                    return (
                        <Card key={organization.id} className="overflow-hidden">
                            <CardHeader className="pb-3">
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
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <Building2 className="h-5 w-5 text-muted-foreground" />
                                                {organization.name}
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                {orgServices.length} service{orgServices.length !== 1 ? 's' : ''} available
                                                {selectedCount > 0 && <span className="ml-2 text-primary">• {selectedCount} selected</span>}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    {selectedCount > 0 && (
                                        <Badge variant="outline" className="border-primary text-primary">
                                            {selectedCount}/{orgServices.length}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                <Separator className="mb-4" />
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {orgServices.map((service) => {
                                        const isSelected = tempSelectedServices.some((s) => s.id === service.id);

                                        return (
                                            <div
                                                key={service.id}
                                                className={`relative cursor-pointer rounded-lg border p-3 transition-colors ${
                                                    isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50'
                                                }`}
                                                onClick={() => handleServiceToggle(service, !isSelected)}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <Checkbox
                                                        id={service.id}
                                                        checked={isSelected}
                                                        onCheckedChange={(checked) => handleServiceToggle(service, checked as boolean)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <Label htmlFor={service.id} className="cursor-pointer font-medium">
                                                            {service.name}
                                                        </Label>
                                                        {service.description && (
                                                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{service.description}</p>
                                                        )}
                                                        {service.price && <p className="mt-1 text-sm font-medium text-green-600">${service.price}</p>}
                                                    </div>
                                                    {isSelected && <Check className="h-5 w-5 text-primary" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {Object.keys(servicesByOrganization).length === 0 && (
                <Card>
                    <CardContent className="py-8 text-center text-sm text-muted-foreground">
                        No services available for the selected categories. Try selecting different categories in the previous step.
                    </CardContent>
                </Card>
            )}

            {/* Selection Summary */}
            {tempSelectedServices.length > 0 && (
                <Card className="bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-lg">Selected Services ({tempSelectedServices.length})</CardTitle>
                        <CardDescription>These services will be included in your order</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Group selected services by organization for display */}
                        {Object.values(
                            tempSelectedServices.reduce(
                                (acc, service) => {
                                    if (!service.organization) return acc;

                                    const orgId = service.organization.id;
                                    if (!acc[orgId]) {
                                        acc[orgId] = {
                                            organization: service.organization,
                                            services: [],
                                        };
                                    }
                                    acc[orgId].services.push(service);
                                    return acc;
                                },
                                {} as Record<string, { organization: { id: string; name: string }; services: Service[] }>,
                            ),
                        ).map(({ organization, services: selectedOrgServices }) => (
                            <div key={organization.id} className="rounded-md border bg-background p-3">
                                <div className="mb-2 flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{organization.name}</span>
                                    <Badge variant="outline">
                                        {selectedOrgServices.length} service{selectedOrgServices.length !== 1 ? 's' : ''}
                                    </Badge>
                                </div>
                                <div className="space-y-1 pl-6">
                                    {selectedOrgServices.map((service) => (
                                        <div key={service.id} className="flex items-center justify-between text-sm">
                                            <span>{service.name}</span>
                                            {service.price && <span className="font-medium text-green-600">${service.price}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {canContinue && (
                            <div className="border-t pt-4">
                                <Button onClick={handleContinue} disabled={isSaving} className="w-full">
                                    {isSaving ? 'Saving...' : 'Continue to Review'}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Help Text */}
            <div className="text-center text-sm text-muted-foreground">
                Select at least one service to continue. Services from different providers will create separate order groups.
            </div>
        </div>
    );
}
