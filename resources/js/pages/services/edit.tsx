import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Port, Service } from '@/types/core';
import { Head, router, useForm } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'sonner';

interface ServiceEvent {
    message: string;
    user: {
        id: number;
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
    serviceId: number;
    serviceName: string;
}

export default function ServiceEditPage({ service: initialService, ports }: { service: Service; ports: Port[] }) {
    const [service, setService] = useState(initialService);
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Services',
            href: '/services',
        },
        {
            title: service.name,
            href: `/services/${service.id}`,
        },
        {
            title: 'Edit',
            href: `/services/${service.id}/edit`,
        },
    ];

    type ServiceForm = {
        name: string;
        description: string;
        price: number;
        status: 'active' | 'inactive';
        port_id: number;
    };

    const { data, setData, put, processing, errors } = useForm<ServiceForm>({
        name: service.name,
        description: service.description || '',
        price: typeof service.price === 'string' ? parseFloat(service.price) : service.price,
        status: service.status,
        port_id: service.port_id,
    });

    // Listen for service events
    useEcho<ServiceCreatedEvent>('services', 'ServiceCreated', ({ service: newService, user }) => {
        toast(`New service "${newService.name}" created by ${user.name}`);
    });

    useEcho<ServiceUpdatedEvent>('services', 'ServiceUpdated', ({ service: updatedService, user }) => {
        if (updatedService.id === service.id) {
            setService({ ...service, ...updatedService });
            // Update form data if this service was updated
            setData({
                name: updatedService.name,
                description: updatedService.description || '',
                price: typeof updatedService.price === 'string' ? parseFloat(updatedService.price) : updatedService.price,
                status: updatedService.status,
                port_id: updatedService.port_id,
            });
            toast(`This service was updated by ${user.name}`);
        } else {
            toast(`Service "${updatedService.name}" updated by ${user.name}`);
        }
    });

    useEcho<ServiceDeletedEvent>('services', 'ServiceDeleted', ({ serviceId, serviceName, user }) => {
        if (serviceId === service.id) {
            toast(`This service was deleted by ${user.name}`);
            router.visit(route('services.index'));
        } else {
            toast(`Service "${serviceName}" deleted by ${user.name}`);
        }
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('services.update', service.id), {
            onSuccess: () => {
                router.visit(route('services.index'), {
                    only: ['services'],
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${service.name}`} />

            <form onSubmit={submit} className="flex flex-col gap-8 p-8">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-semibold">Edit Service</h1>
                    <p className="text-base text-muted-foreground">
                        Update the service information below. You can modify the service name, description, price, port assignment, and status.
                    </p>
                </div>

                <div className="grid max-w-4xl gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Service Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Enter service name"
                            disabled={processing}
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="price">Price</Label>
                        <Input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={data.price}
                            onChange={(e) => setData('price', parseFloat(e.target.value) || 0)}
                            placeholder="Enter service price"
                            disabled={processing}
                            required
                        />
                        <InputError message={errors.price} />
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Enter service description"
                            disabled={processing}
                            rows={3}
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="port_id">Port</Label>
                        <Select value={data.port_id?.toString()} onValueChange={(value) => setData('port_id', parseInt(value))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a port" />
                            </SelectTrigger>
                            <SelectContent>
                                {ports.map((port) => (
                                    <SelectItem key={port.id} value={port.id.toString()}>
                                        {port.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.port_id} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="status">Service Status</Label>
                        <Select value={data.status} onValueChange={(value: 'active' | 'inactive') => setData('status', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select service status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.status} />
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button type="submit" disabled={processing} className="w-fit">
                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Update Service
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.visit(route('services.index'))}
                        disabled={processing}
                        className="w-fit"
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
