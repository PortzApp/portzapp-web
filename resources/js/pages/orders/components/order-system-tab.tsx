import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Database, User, Building2, MapPin, Ship } from 'lucide-react';

type Order = {
    id: string;
    order_number: string;
    vessel_id: string;
    port_id: string;
    placed_by_user_id: string;
    placed_by_organization_id: string;
    notes: string;
    status: string;
    created_at: string;
    updated_at: string;
    vessel: {
        id: string;
        organization_id: string;
        name: string;
        imo_number: string;
        vessel_type: string;
        status: string;
        created_at: string;
        updated_at: string;
    };
    port: {
        id: string;
        name: string;
        code: string;
        status: string;
        country: string;
        city: string;
        latitude: string;
        longitude: string;
        timezone: string;
        created_at: string;
        updated_at: string;
    };
    placed_by_user: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        phone_number: string;
        email_verified_at: string;
        created_at: string;
        updated_at: string;
        current_organization_id: string | null;
    };
    placed_by_organization: {
        id: string;
        name: string;
        registration_code: string;
        business_type: string;
        created_at: string;
        updated_at: string;
    };
    services: {
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
    }[];
};

interface OrderSystemTabProps {
    order: Order;
}

export default function OrderSystemTab({ order }: OrderSystemTabProps) {
    return (
        <div className="space-y-6">
            {/* System Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        System Information
                    </CardTitle>
                    <CardDescription>Technical details and database identifiers</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                            <div className="text-2xl mb-2">📋</div>
                            <div className="font-medium text-sm">Order ID</div>
                            <div className="text-xs text-muted-foreground font-mono break-all">
                                {order.id}
                            </div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                            <div className="text-2xl mb-2">🔢</div>
                            <div className="font-medium text-sm">Order Number</div>
                            <div className="text-xs text-muted-foreground font-mono">
                                {order.order_number}
                            </div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                            <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <div className="font-medium text-sm">Created</div>
                            <div className="text-xs text-muted-foreground">
                                {new Date(order.created_at).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Entity IDs and References */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Entity References
                        </CardTitle>
                        <CardDescription>Database identifiers and foreign key references</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <Ship className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-muted-foreground">Vessel ID:</span>
                            </div>
                            <span className="text-xs font-mono text-right max-w-[200px] break-all">
                                {order.vessel_id}
                            </span>
                        </div>
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-muted-foreground">Port ID:</span>
                            </div>
                            <span className="text-xs font-mono text-right max-w-[200px] break-all">
                                {order.port_id}
                            </span>
                        </div>
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-muted-foreground">User ID:</span>
                            </div>
                            <span className="text-xs font-mono text-right max-w-[200px] break-all">
                                {order.placed_by_user_id}
                            </span>
                        </div>
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-muted-foreground">Organization ID:</span>
                            </div>
                            <span className="text-xs font-mono text-right max-w-[200px] break-all">
                                {order.placed_by_organization_id}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Timestamps
                        </CardTitle>
                        <CardDescription>Creation and modification dates</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <span className="text-sm font-medium text-muted-foreground">Created At:</span>
                            <div className="text-sm">
                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: false,
                                })}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                                {order.created_at}
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <span className="text-sm font-medium text-muted-foreground">Last Updated:</span>
                            <div className="text-sm">
                                {new Date(order.updated_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    hour12: false,
                                })}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                                {order.updated_at}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Related Entities Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Related Entities</CardTitle>
                    <CardDescription>Detailed information about associated entities</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* User Details */}
                        <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                User Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Name:</span>
                                    <span className="ml-2 font-medium">
                                        {order.placed_by_user.first_name} {order.placed_by_user.last_name}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Email:</span>
                                    <span className="ml-2">{order.placed_by_user.email}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Phone:</span>
                                    <span className="ml-2">{order.placed_by_user.phone_number}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Email Verified:</span>
                                    <Badge variant={order.placed_by_user.email_verified_at ? 'default' : 'secondary'} className="ml-2">
                                        {order.placed_by_user.email_verified_at ? 'Verified' : 'Not Verified'}
                                    </Badge>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">User Created:</span>
                                    <span className="ml-2 text-xs">
                                        {new Date(order.placed_by_user.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">User ID:</span>
                                    <span className="ml-2 font-mono text-xs break-all">
                                        {order.placed_by_user.id}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Organization Details */}
                        <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Organization Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Name:</span>
                                    <span className="ml-2 font-medium">{order.placed_by_organization.name}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Registration:</span>
                                    <span className="ml-2 font-mono">{order.placed_by_organization.registration_code}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Business Type:</span>
                                    <Badge variant="outline" className="ml-2">
                                        {order.placed_by_organization.business_type.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Organization Created:</span>
                                    <span className="ml-2 text-xs">
                                        {new Date(order.placed_by_organization.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="md:col-span-2">
                                    <span className="text-muted-foreground">Organization ID:</span>
                                    <span className="ml-2 font-mono text-xs break-all">
                                        {order.placed_by_organization.id}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Port Details */}
                        <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Port Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Name:</span>
                                    <span className="ml-2 font-medium">{order.port.name}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Code:</span>
                                    <span className="ml-2 font-mono">{order.port.code}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Location:</span>
                                    <span className="ml-2">{order.port.city}, {order.port.country}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Timezone:</span>
                                    <span className="ml-2">{order.port.timezone}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Coordinates:</span>
                                    <span className="ml-2 font-mono text-xs">
                                        {order.port.latitude}, {order.port.longitude}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Port ID:</span>
                                    <span className="ml-2 font-mono text-xs break-all">
                                        {order.port.id}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Service Attachments */}
            <Card>
                <CardHeader>
                    <CardTitle>Service Relationships</CardTitle>
                    <CardDescription>Pivot table relationships and service attachments</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {order.services.map((service, index) => (
                            <div key={service.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-xs font-medium">
                                            {index + 1}
                                        </div>
                                        <span className="font-medium">{service.name}</span>
                                    </div>
                                    <Badge variant="outline">
                                        Service Attached
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Service ID:</span>
                                        <span className="ml-2 font-mono text-xs break-all">
                                            {service.id}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Attachment Date:</span>
                                        <span className="ml-2 text-xs">
                                            {new Date(service.order_service.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Provider:</span>
                                        <span className="ml-2">{service.organization.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Provider ID:</span>
                                        <span className="ml-2 font-mono text-xs break-all">
                                            {service.organization.id}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
