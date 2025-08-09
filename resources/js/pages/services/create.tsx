import { FormEventHandler } from 'react';

import { Head, router, useForm } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';

import type { BreadcrumbItem } from '@/types';
import { Port, Service } from '@/types/models';

import AppLayout from '@/layouts/app-layout';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import InputError from '@/components/input-error';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Services',
        href: '/services',
    },
    {
        title: 'Create Service',
        href: '/services/create',
    },
];

export type ServiceForm = {
    name: string;
    description: string;
    price: string;
    status: 'active' | 'inactive';
    port_id: number;
};

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

export default function CreateServicePage({ ports }: { ports: Port[] }) {
    const { data, setData, post, processing, errors, reset } = useForm<ServiceForm>({
        name: '',
        description: '',
        price: '',
        status: 'active',
        port_id: 0,
    });

    // Listen for service events to show real-time updates
    useEcho<ServiceCreatedEvent>('services', 'ServiceCreated', ({ service }) => {
        toast('Service created', {
            description: `ID: #${service.id} — "${service.name}"`,
            action: {
                label: 'View Service',
                onClick: () => {
                    router.visit(route('services.show', service.id));
                },
            },
        });
    });

    useEcho<ServiceUpdatedEvent>('services', 'ServiceUpdated', ({ service }) => {
        toast('Service updated', {
            description: `ID: #${service.id} — "${service.name}"`,
            action: {
                label: 'View Service',
                onClick: () => {
                    router.visit(route('services.show', service.id));
                },
            },
        });
    });

    useEcho<ServiceDeletedEvent>('services', 'ServiceDeleted', ({ serviceId, serviceName }) => {
        toast('Service deleted', {
            description: `ID: #${serviceId} — "${serviceName}"`,
            action: {
                label: 'View All',
                onClick: () => {
                    router.visit(route('services.index'));
                },
            },
        });
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('services.store'), {
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Services Page" />

            <form onSubmit={submit} className="flex flex-col gap-8 p-8">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-semibold">Create Service</h1>
                    <p className="text-base text-muted-foreground">
                        Fill out the form below to create a new service. You can specify the service name, description, price, and status.
                    </p>
                </div>

                <div className="flex max-w-md flex-col gap-4">
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
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            type="text"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Enter service description (optional)"
                            disabled={processing}
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="price">Price</Label>
                        <Input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={data.price}
                            onChange={(e) => setData('price', e.target.value)}
                            placeholder="0.00"
                            disabled={processing}
                            required
                        />
                        <InputError message={errors.price} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={data.status} onValueChange={(value: 'active' | 'inactive') => setData('status', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.status} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="port">Port</Label>
                        <Select
                            value={data.port_id.toString()}
                            onValueChange={(value) => {
                                const currentValue = parseInt(value);
                                setData('port_id', currentValue);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select port" />
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
                </div>

                <Button type="submit" disabled={processing} className="w-fit">
                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Create Service
                </Button>
            </form>
        </AppLayout>
    );
}
