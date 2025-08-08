import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderWithRelations } from '@/types/models';
import { Building2, Calendar, Database, MapPin, Ship, User } from 'lucide-react';

interface OrderSystemTabProps {
    order: OrderWithRelations;
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
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-lg bg-muted/50 p-4 text-center">
                            <div className="mb-2 text-2xl">📋</div>
                            <div className="text-sm font-medium">Order ID</div>
                            <div className="font-mono text-xs break-all text-muted-foreground">{order.id}</div>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-4 text-center">
                            <div className="mb-2 text-2xl">🔢</div>
                            <div className="text-sm font-medium">Order Number</div>
                            <div className="font-mono text-xs text-muted-foreground">{order.order_number}</div>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-4 text-center">
                            <Calendar className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                            <div className="text-sm font-medium">Created</div>
                            <div className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Entity IDs and References */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Entity References
                        </CardTitle>
                        <CardDescription>Database identifiers and foreign key references</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <Ship className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-muted-foreground">Vessel ID:</span>
                            </div>
                            <span className="max-w-[200px] text-right font-mono text-xs break-all">{order.vessel_id}</span>
                        </div>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-muted-foreground">Port ID:</span>
                            </div>
                            <span className="max-w-[200px] text-right font-mono text-xs break-all">{order.port_id}</span>
                        </div>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-muted-foreground">User ID:</span>
                            </div>
                            <span className="max-w-[200px] text-right font-mono text-xs break-all">{order.placed_by_user_id}</span>
                        </div>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-muted-foreground">Organization ID:</span>
                            </div>
                            <span className="max-w-[200px] text-right font-mono text-xs break-all">{order.placed_by_organization_id}</span>
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
                            <div className="font-mono text-xs text-muted-foreground">{order.created_at}</div>
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
                            <div className="font-mono text-xs text-muted-foreground">{order.updated_at}</div>
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
                            <h4 className="mb-3 flex items-center gap-2 font-medium">
                                <User className="h-4 w-4" />
                                User Information
                            </h4>
                            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
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
                                    <span className="ml-2 text-xs">{new Date(order.placed_by_user.created_at).toLocaleDateString()}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">User ID:</span>
                                    <span className="ml-2 font-mono text-xs break-all">{order.placed_by_user.id}</span>
                                </div>
                            </div>
                        </div>

                        {/* Organization Details */}
                        <div>
                            <h4 className="mb-3 flex items-center gap-2 font-medium">
                                <Building2 className="h-4 w-4" />
                                Organization Information
                            </h4>
                            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
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
                                    <span className="ml-2 text-xs">{new Date(order.placed_by_organization.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="md:col-span-2">
                                    <span className="text-muted-foreground">Organization ID:</span>
                                    <span className="ml-2 font-mono text-xs break-all">{order.placed_by_organization.id}</span>
                                </div>
                            </div>
                        </div>

                        {/* Port Details */}
                        <div>
                            <h4 className="mb-3 flex items-center gap-2 font-medium">
                                <MapPin className="h-4 w-4" />
                                Port Information
                            </h4>
                            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
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
                                    <span className="ml-2">
                                        {order.port.city}, {order.port.country}
                                    </span>
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
                                    <span className="ml-2 font-mono text-xs break-all">{order.port.id}</span>
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
                            <div key={service.id} className="rounded-lg border p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                                            {index + 1}
                                        </div>
                                        <span className="font-medium">{service.name}</span>
                                    </div>
                                    <Badge variant="outline">Service Attached</Badge>
                                </div>
                                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                                    <div>
                                        <span className="text-muted-foreground">Service ID:</span>
                                        <span className="ml-2 font-mono text-xs break-all">{service.id}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Attachment Date:</span>
                                        <span className="ml-2 text-xs">{new Date(service.order_service.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Provider:</span>
                                        <span className="ml-2">{service.organization.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Provider ID:</span>
                                        <span className="ml-2 font-mono text-xs break-all">{service.organization.id}</span>
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
