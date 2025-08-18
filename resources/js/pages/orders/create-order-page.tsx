import { FormEventHandler } from 'react';

import { Head, router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import type { BreadcrumbItem } from '@/types';
import { Port, Service, Vessel } from '@/types/models';

import AppLayout from '@/layouts/app-layout';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import InputError from '@/components/input-error';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Orders',
        href: route('orders.index'),
    },
    {
        title: 'Create Order',
        href: route('orders.create'),
    },
];

type CreateOrderForm = {
    service_id: string;
    vessel_id: string;
    port_id: string;
    notes: string;
};

export default function CreateOrderPage({ vessels, services, ports }: { vessels: Array<Vessel>; services: Array<Service>; ports: Array<Port> }) {
    const { data, setData, post, processing, errors, reset } = useForm<CreateOrderForm>({
        service_id: '',
        vessel_id: '',
        port_id: '',
        notes: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('orders.store'), {
            onSuccess: () => {
                reset();
                router.visit(route('orders'), {
                    only: ['orders'],
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Order" />

            <form onSubmit={submit} className="flex flex-col gap-8 p-8">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-semibold">Create Order</h1>
                    <p className="text-base text-muted-foreground">
                        Fill out the form below to create a new order. Select a service and vessel from your organization.
                    </p>
                </div>

                <div className="flex max-w-md flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="service_id">Service</Label>
                        <Select value={data.service_id} onValueChange={(value) => setData('service_id', value)} disabled={processing}>
                            <SelectTrigger className="h-auto text-left [&>span]:flex [&>span]:items-center [&>span]:gap-2" id="service_id">
                                <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                            <SelectContent>
                                {services.map((service) => (
                                    <SelectItem key={service.id} value={service.id.toString()}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {service.sub_category?.name || 'Service'} - {service.organization?.name || 'Unknown'}
                                            </span>
                                            <span className="text-sm text-muted-foreground">${service.price}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.service_id} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="vessel_id">Vessel</Label>
                        <Select value={data.vessel_id} onValueChange={(value) => setData('vessel_id', value)} disabled={processing}>
                            <SelectTrigger className="h-auto text-left [&>span]:flex [&>span]:items-center [&>span]:gap-2" id="vessel_id">
                                <SelectValue placeholder="Select vessel" />
                            </SelectTrigger>
                            <SelectContent>
                                {vessels.map((vessel) => (
                                    <SelectItem key={vessel.id} value={vessel.id}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{vessel.name}</span>
                                            <span className="text-sm text-muted-foreground">IMO: {vessel.imo_number}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.vessel_id} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="port_id">Port</Label>
                        <Select value={data.port_id} onValueChange={(value) => setData('port_id', value)} disabled={processing}>
                            <SelectTrigger className="h-auto text-left [&>span]:flex [&>span]:items-center [&>span]:gap-2" id="port_id">
                                <SelectValue placeholder="Select port" />
                            </SelectTrigger>
                            <SelectContent>
                                {ports.map((port) => (
                                    <SelectItem key={port.id} value={port.id.toString()}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {port.name} <span className="text-xs text-muted-foreground">({port.code})</span>
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {port.city}, {port.country}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.port_id} />
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Enter any additional notes or requirements"
                            disabled={processing}
                            rows={4}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <InputError message={errors.notes} />
                    </div>
                </div>

                <Button type="submit" disabled={processing} className="w-fit">
                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Create Order
                </Button>
            </form>
        </AppLayout>
    );
}
