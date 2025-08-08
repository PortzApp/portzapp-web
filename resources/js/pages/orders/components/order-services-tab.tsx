import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Package } from 'lucide-react';

type Service = {
    id: string;
    organization_id: string;
    port_id: string;
    service_category_id: string;
    name: string;
    description: string;
    price: string;
    status: string;
    created_at: string;
    updated_at: string;
    order_service: {
        order_id: string;
        service_id: string;
        created_at: string;
        updated_at: string;
    };
    organization: {
        id: string;
        name: string;
        registration_code: string;
        business_type: string;
        created_at: string;
        updated_at: string;
    };
};

interface OrderServicesTabProps {
    services: Service[];
}

export default function OrderServicesTab({ services }: OrderServicesTabProps) {
    const totalServicePrice = services.reduce((sum, service) => sum + parseFloat(service.price), 0);

    // Group services by organization
    const servicesByOrganization = services.reduce(
        (acc, service) => {
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
        {} as Record<string, { organization: Service['organization']; services: Service[] }>,
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
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{services.length}</div>
                            <div className="text-sm text-muted-foreground">Total Services</div>
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

            {/* Services by Organization */}
            <div className="space-y-6">
                {Object.values(servicesByOrganization).map(({ organization, services: orgServices }) => {
                    const orgTotal = orgServices.reduce((sum, service) => sum + parseFloat(service.price), 0);

                    return (
                        <Card key={organization.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Building2 className="h-5 w-5" />
                                            {organization.name}
                                        </CardTitle>
                                        <CardDescription>
                                            {organization.business_type.replace('_', ' ')} • {organization.registration_code}
                                        </CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-semibold">${orgTotal.toLocaleString()}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {orgServices.length} service{orgServices.length !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {orgServices.map((service) => (
                                        <div key={service.id} className="flex items-start justify-between rounded-lg border p-4">
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <h4 className="font-medium">{service.name}</h4>
                                                    <Badge variant={service.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                                        {service.status}
                                                    </Badge>
                                                </div>
                                                <p className="mb-3 text-sm text-muted-foreground">{service.description}</p>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span>Service ID: {service.id}</span>
                                                    <span>Added: {new Date(service.order_service.created_at).toLocaleDateString()}</span>
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
                        {services.map((service, index) => (
                            <div key={service.id} className="flex items-center justify-between border-b py-3 last:border-b-0">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className="font-medium">{service.name}</div>
                                        <div className="text-xs text-muted-foreground">by {service.organization.name}</div>
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
