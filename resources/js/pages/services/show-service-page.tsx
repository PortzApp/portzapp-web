import { useState } from 'react';

import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { Dot, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import type { BreadcrumbItem, SharedData } from '@/types';
import { Service } from '@/types/models';

import { cn } from '@/lib/utils';

import AppLayout from '@/layouts/app-layout';

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
}

export default function ShowServicePage({ service: initialService }: { service: Service }) {
    const { auth } = usePage<SharedData>().props;
    const [service, setService] = useState(initialService);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    // Listen for service created events on organization-scoped channel
    useEcho<ServiceCreatedEvent>(`services.organization.${auth.user.current_organization?.id}`, 'ServiceCreated', ({ service: newService }) => {
        toast('Service created', {
            description: `Service #${newService.id} created`,
            action: {
                label: 'View Service',
                onClick: () => {
                    router.visit(route('services.show', newService.id));
                },
            },
        });
    });

    useEcho<ServiceUpdatedEvent>(`services.${service.id}`, 'ServiceUpdated', ({ service: updatedService }) => {
        if (updatedService.id === service.id) {
            setService({ ...service, ...updatedService });
        }

        toast('Service updated', {
            description: `Service #${updatedService.id} updated`,
            action: {
                label: 'View Service',
                onClick: () => {
                    router.visit(route('services.show', updatedService.id));
                },
            },
        });
    });

    // Listen for service deleted events on resource-specific channel
    useEcho<ServiceDeletedEvent>(`services.${service.id}`, 'ServiceDeleted', ({ serviceId }) => {
        if (serviceId === service.id) {
            toast('Service deleted', {
                description: `Service #${serviceId} deleted`,
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
            href: route('services.index'),
        },
        {
            title: service.sub_category?.name || 'Service Details',
            href: `/services/${service.id}`,
        },
    ];

    function handleDeleteService() {
        setOpenDeleteDialog(false);

        router.delete(route('services.destroy', service.id), {
            onSuccess: () => {
                toast(`Service #${service.id} deleted successfully!`);
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={service.sub_category?.name || 'Service Details'} />

            <div className="flex flex-col gap-8 p-8">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold">{service.sub_category?.name || 'Service Details'}</h1>
                        <p className="text-base text-muted-foreground">
                            {(service as Service & { port?: { name: string; country: string; city: string } }).port?.name && (
                                <>
                                    {(service as Service & { port?: { name: string; country: string; city: string } }).port?.name} (
                                    {(service as Service & { port?: { name: string; country: string; city: string } }).port?.country},{' '}
                                    {(service as Service & { port?: { name: string; country: string; city: string } }).port?.city})
                                </>
                            )}
                        </p>
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
                                        Are you sure you want to delete Service #{service.id}? This action cannot be undone.
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

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Service Overview */}
                        <Card>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-3xl font-bold text-primary">
                                            {new Intl.NumberFormat('en-US', {
                                                style: 'currency',
                                                currency: 'USD',
                                            }).format(Number(service.price))}
                                        </div>
                                        <Badge
                                            className={cn(
                                                service.status === 'active' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
                                                service.status === 'inactive' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
                                            )}
                                        >
                                            <Dot className="mr-1" />
                                            {service.status === 'active' ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>

                                    {service.description && (
                                        <div>
                                            <h3 className="mb-2 text-lg font-semibold">Description</h3>
                                            <p className="leading-relaxed text-muted-foreground">{service.description}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Service Provider */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Service Provider</CardTitle>
                                <CardDescription>Information about the organization providing this service</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                                        <div className="h-6 w-6 rounded-full bg-gray-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            {(service as Service & { organization?: { name: string } }).organization?.name || 'Unknown Organization'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Service Provider</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Quick Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">Category</p>
                                    <p className="text-sm">
                                        {(service as Service & { sub_category?: { category?: { name: string } } }).sub_category?.category?.name ||
                                            'Not specified'}
                                    </p>
                                </div>

                                <div>
                                    <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">Service Type</p>
                                    <p className="text-sm">
                                        {(service as Service & { sub_category?: { name: string } }).sub_category?.name || 'Not specified'}
                                    </p>
                                </div>

                                <div>
                                    <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">Port Location</p>
                                    <p className="text-sm">
                                        {(service as Service & { port?: { name: string; country: string; city: string } }).port ? (
                                            <>
                                                {(service as Service & { port?: { name: string; country: string; city: string } }).port?.name}
                                                <br />
                                                <span className="text-xs text-muted-foreground">
                                                    {(service as Service & { port?: { name: string; country: string; city: string } }).port?.city},{' '}
                                                    {(service as Service & { port?: { name: string; country: string; city: string } }).port?.country}
                                                </span>
                                            </>
                                        ) : (
                                            'Not specified'
                                        )}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Service Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-xs">
                                <div>
                                    <p className="text-muted-foreground">Added on</p>
                                    <p>
                                        {new Date(service.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Last updated</p>
                                    <p>
                                        {new Date(service.updated_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
