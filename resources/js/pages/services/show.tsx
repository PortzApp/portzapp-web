import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import { Service } from '@/types/models';
import { Head, Link, router } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { Dot, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ServiceEvent {
    message: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    timestamp: string;
}

interface ServiceCreatedEvent extends ServiceEvent {
    service: Service;
}

interface ServiceUpdatedEvent extends ServiceEvent {
    service: Service;
}

interface ServiceDeletedEvent extends ServiceEvent {
    serviceId: string;
    serviceName: string;
}

export default function ServiceShowPage({ service: initialService }: { service: Service }) {
    const [service, setService] = useState(initialService);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    // Listen for service updated events
    useEcho<ServiceCreatedEvent>('services', 'ServiceCreated', ({ service: newService }) => {
        toast('Service created', {
            description: `ID: #${newService.id} — "${newService.name}"`,
            action: {
                label: 'View Service',
                onClick: () => {
                    router.visit(route('services.show', newService.id));
                },
            },
        });
    });

    useEcho<ServiceUpdatedEvent>('services', 'ServiceUpdated', ({ service: updatedService }) => {
        if (updatedService.id === service.id) {
            setService({ ...service, ...updatedService });
        }

        toast('Service updated', {
            description: `ID: #${updatedService.id} — "${updatedService.name}"`,
            action: {
                label: 'View Service',
                onClick: () => {
                    router.visit(route('services.show', updatedService.id));
                },
            },
        });
    });

    // Listen for service deleted events
    useEcho<ServiceDeletedEvent>('services', 'ServiceDeleted', ({ serviceId, serviceName }) => {
        if (serviceId === service.id) {
            toast('Service deleted', {
                description: `ID: #${serviceId} — "${serviceName}"`,
                action: {
                    label: 'View All',
                    onClick: () => {
                        router.visit(route('services.index'));
                    },
                },
            });
        }
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Services',
            href: '/services',
        },
        {
            title: service.name,
            href: `/services/${service.id}`,
        },
    ];

    function handleDeleteService() {
        setOpenDeleteDialog(false);

        router.delete(route('services.destroy', service.id), {
            onSuccess: () => {
                toast(`Service "${service.name}" deleted successfully!`);
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={service.name} />

            <div className="flex flex-col gap-8 p-8">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold">{service.name}</h1>
                        <p className="text-base text-muted-foreground">Service details and information</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('services.edit', service.id)} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Link>
                        <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                            <DialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Delete Service</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to delete "{service.name}"? This action cannot be undone.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button variant="destructive" onClick={handleDeleteService}>
                                        Delete Service
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Core service details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Name:</span>
                                <span className="text-sm font-medium">{service.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Description:</span>
                                <span className="max-w-xs text-right text-sm font-medium">{service.description || 'No description'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Price:</span>
                                <span className="text-sm font-medium tabular-nums">${service.price}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Status:</span>
                                <Badge
                                    className={cn(
                                        service.status === 'active' && 'bg-blue-200 text-blue-950 uppercase dark:bg-blue-900 dark:text-blue-50',
                                        service.status === 'inactive' && 'bg-red-200 text-red-950 uppercase dark:bg-red-900 dark:text-red-50',
                                    )}
                                >
                                    <Dot />
                                    {service.status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Associated Information</CardTitle>
                            <CardDescription>Related entities and assignments</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Port:</span>
                                <span className="text-sm font-medium">
                                    {(
                                        service as Service & {
                                            port?: { name: string };
                                        }
                                    ).port?.name || 'No port assigned'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Organization:</span>
                                <span className="text-sm font-medium">
                                    {(
                                        service as Service & {
                                            organization?: { name: string };
                                        }
                                    ).organization?.name || 'No organization'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>System Information</CardTitle>
                            <CardDescription>Record metadata</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Service ID:</span>
                                <span className="text-sm font-medium tabular-nums">#{service.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Created:</span>
                                <span className="text-sm font-medium tabular-nums">
                                    {new Date(service.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false,
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Last Updated:</span>
                                <span className="text-sm font-medium tabular-nums">
                                    {new Date(service.updated_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false,
                                    })}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
