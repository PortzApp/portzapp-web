import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Order, Vessel } from '@/types/core';
import { Head, router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

interface EditOrderForm {
    vessel_id: string;
    status: string;
    notes: string;
    [key: string]: string;
}

export default function OrderEditPage({ order, vessels }: { order: Order; vessels: Array<Vessel> }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Orders',
            href: route('orders'),
        },
        {
            title: `Order #${order.id}`,
            href: `/orders/${order.id}`,
        },
        {
            title: 'Edit',
            href: `/orders/${order.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors } = useForm<EditOrderForm>({
        vessel_id: order.vessel_id.toString(),
        status: order.status,
        notes: order.notes || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('orders.update', order.id), {
            onSuccess: () => {
                router.visit(route('orders'), {
                    only: ['orders'],
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Order #${order.id}`} />

            <form onSubmit={submit} className="flex flex-col gap-8 p-8">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-semibold">Edit Order</h1>
                    <p className="text-base text-muted-foreground">
                        Update the order information below. You can modify the vessel, status, and notes.
                    </p>
                </div>

                <div className="grid max-w-4xl gap-4 md:grid-cols-2">
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

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={data.status}
                            onValueChange={(value: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled') => setData('status', value)}
                            disabled={processing}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="accepted">Accepted</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.status} />
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-2">
                        <Label htmlFor="notes">Notes</Label>
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

                <div className="flex gap-4">
                    <Button type="submit" disabled={processing} className="w-fit">
                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Update Order
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            router.visit(route('orders'));
                        }}
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
