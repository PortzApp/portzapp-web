import { Building2, Package, Tag } from 'lucide-react';

import { Service } from '@/types/models';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface OrderServicesTabProps {
    services: Service[];
}

export default function OrderServicesTab({ services }: OrderServicesTabProps) {
    const safeServices = services || [];
    const totalServicePrice = safeServices.reduce((sum, service) => sum + parseFloat(service.price), 0);

    // Group services by sub-category
    const servicesBySubCategory = safeServices.reduce(
        (acc, service) => {
            if (!service.sub_category) return acc;
            const subCatId = service.sub_category.id;
            if (!acc[subCatId]) {
                acc[subCatId] = {
                    subCategory: service.sub_category,
                    category: service.sub_category.category,
                    services: [],
                };
            }
            acc[subCatId].services.push(service);
            return acc;
        },
        {} as Record<string, { subCategory: NonNullable<Service['sub_category']>; category: Service['category']; services: Service[] }>,
    );

    // Also keep organization grouping for summary stats
    const servicesByOrganization = safeServices.reduce(
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
        {} as Record<string, { organization: NonNullable<Service['organization']>; services: Service[] }>,
    );

    return (
        <div className="space-y-6">
            {/* Services Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Services Summary
                    </CardTitle>
                    <CardDescription>Overview of all services in this order</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{safeServices.length}</div>
                            <div className="text-sm text-muted-foreground">Total Services</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{Object.keys(servicesBySubCategory).length}</div>
                            <div className="text-sm text-muted-foreground">Sub-Categories</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{Object.keys(servicesByOrganization).length}</div>
                            <div className="text-sm text-muted-foreground">Service Providers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">${totalServicePrice.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">Total Value</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Services by Sub-Category */}
            <div className="space-y-6">
                {Object.values(servicesBySubCategory).map(({ subCategory, category, services: subCatServices }) => {
                    const subCatTotal = subCatServices.reduce((sum, service) => sum + parseFloat(service.price), 0);

                    return (
                        <Card key={subCategory.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Tag className="h-5 w-5" />
                                            {subCategory.name}
                                            <span className="text-sm font-normal text-muted-foreground">({category?.name || 'No Category'})</span>
                                        </CardTitle>
                                        <CardDescription>
                                            {subCategory.description || 'Service sub-category'} • {subCatServices.length} service
                                            {subCatServices.length !== 1 ? 's' : ''}
                                        </CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-semibold">${subCatTotal.toLocaleString()}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {subCatServices.length} service{subCatServices.length !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {subCatServices.map((service) => (
                                        <div key={service.id} className="flex items-start justify-between rounded-lg border p-4">
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <h4 className="font-medium">{service.name}</h4>
                                                    <Badge variant={service.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                                        {service.status}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        <Building2 className="mr-1 h-3 w-3" />
                                                        {service.organization?.name || 'Unknown Provider'}
                                                    </Badge>
                                                </div>
                                                <p className="mb-3 text-sm text-muted-foreground">{service.description}</p>
                                                <div className="mb-2 flex items-center gap-2">
                                                    <Badge variant="secondary" className="text-xs">
                                                        <Tag className="mr-1 h-3 w-3" />
                                                        {subCategory.name}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        Category: {category?.name || 'No Category'}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span>Service ID: {service.id}</span>
                                                    <span>
                                                        Added:{' '}
                                                        {new Date(service.order_service?.created_at || service.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4 text-right">
                                                <div className="text-lg font-semibold">${parseFloat(service.price).toLocaleString()}</div>
                                                <div className="mt-1 text-xs text-muted-foreground">per service</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Services List (Alternative flat view) */}
            <Card>
                <CardHeader>
                    <CardTitle>All Services</CardTitle>
                    <CardDescription>Complete list of services in this order</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {safeServices.map((service, index) => (
                            <div key={service.id} className="flex items-center justify-between border-b py-3 last:border-b-0">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className="font-medium">{service.name}</div>
                                        <div className="text-xs text-muted-foreground">by {service.organization?.name || 'Unknown'}</div>
                                        <div className="mt-1 flex items-center gap-1">
                                            <Badge variant="secondary" className="text-xs">
                                                {service.sub_category?.name || 'No Sub-Category'}
                                            </Badge>
                                            {service.sub_category?.category && (
                                                <Badge variant="outline" className="text-xs">
                                                    {service.sub_category.category.name}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">${parseFloat(service.price).toLocaleString()}</div>
                                    <Badge variant="outline" className="text-xs">
                                        {service.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
