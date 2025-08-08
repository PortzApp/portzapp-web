import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Service, Vessel } from '@/types/core';
import { Head, router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Orders',
        href: route('orders'),
    },
    {
        title: 'Create Order',
        href: '/orders/create',
    },
];

interface CreateOrderForm {
    service_ids: string[];
    vessel_id: string;
    notes: string;
    [key: string]: string | string[];
}

export default function OrdersCreatePage({ vessels, services }: { vessels: Array<Vessel>; services: Array<Service> }) {
    const { data, setData, post, processing, errors, reset } = useForm<CreateOrderForm>({
        service_ids: [],
        vessel_id: '',
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

                <div className="grid max-w-4xl gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="service_ids">Service</Label>
                        <Select
                            value={data.service_ids.length > 0 ? data.service_ids[0] : ''}
                            onValueChange={(value) => setData('service_ids', [value])}
                            disabled={processing}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                            <SelectContent>
                                {services.map((service) => (
                                    <SelectItem key={service.id} value={service.id.toString()}>
                                        {service.name} - ${service.price}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.service_ids} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="vessel_id">Vessel</Label>
                        <Select value={data.vessel_id} onValueChange={(value) => setData('vessel_id', value)} disabled={processing}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select vessel" />
                            </SelectTrigger>
                            <SelectContent>
                                {vessels.map((vessel) => (
                                    <SelectItem key={vessel.id} value={vessel.id.toString()}>
                                        {vessel.name} (IMO: {vessel.imo_number})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.vessel_id} />
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
