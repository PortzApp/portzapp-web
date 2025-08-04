import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Vessel } from '@/types/core';
import { Head, router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function VesselEditPage({ vessel }: { vessel: Vessel }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Vessels',
            href: '/vessels',
        },
        {
            title: vessel.name,
            href: `/vessels/${vessel.id}`,
        },
        {
            title: 'Edit',
            href: `/vessels/${vessel.id}/edit`,
        },
    ];

    type VesselForm = Omit<Vessel, 'id' | 'owner_id' | 'created_at' | 'updated_at' | 'organization_id'>;

    const { data, setData, put, processing, errors } = useForm<VesselForm>({
        name: vessel.name,
        imo_number: vessel.imo_number,
        vessel_type: vessel.vessel_type,
        status: vessel.status,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('vessels.update', vessel.id), {
            onSuccess: () => {
                router.visit(route('vessels.index'), {
                    only: ['vessels'],
                    preserveScroll: true,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${vessel.name}`} />

            <form onSubmit={submit} className="flex flex-col gap-8 p-8">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-semibold">Edit Vessel</h1>
                    <p className="text-base text-muted-foreground">
                        Update the vessel information below. You can modify the vessel name, IMO number, vessel type, and status.
                    </p>
                </div>

                <div className="flex max-w-md flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Vessel Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Enter vessel name"
                            disabled={processing}
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="imo_number">IMO Number</Label>
                        <Input
                            id="imo_number"
                            type="number"
                            value={data.imo_number}
                            onChange={(e) => setData('imo_number', e.target.value)}
                            placeholder="Enter IMO number"
                            disabled={processing}
                        />
                        <InputError message={errors.imo_number} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="vessel_type">Vessel Type</Label>
                        <Select value={data.vessel_type} onValueChange={(value: 'cargo' | 'tanker' | 'container') => setData('vessel_type', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select vessel type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cargo">Cargo</SelectItem>
                                <SelectItem value="tanker">Tanker</SelectItem>
                                <SelectItem value="container">Container</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.vessel_type} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="status">Vessel Status</Label>
                        <Select value={data.status} onValueChange={(value: 'active' | 'inactive' | 'maintenance') => setData('status', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select vessel status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.status} />
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button type="submit" disabled={processing} className="w-fit">
                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Update Vessel
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.visit(route('vessels.index'))}
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
