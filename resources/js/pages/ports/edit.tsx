import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Port } from '@/types/models';
import { Head, router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function PortEditPage({ port }: { port: Port }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Ports',
            href: '/ports',
        },
        {
            title: port.name,
            href: `/ports/${port.id}`,
        },
        {
            title: 'Edit',
            href: `/ports/${port.id}/edit`,
        },
    ];

    type PortForm = Omit<Port, 'id' | 'created_at' | 'updated_at'>;

    const { data, setData, put, processing, errors } = useForm<PortForm>({
        name: port.name,
        code: port.code,
        status: port.status,
        country: port.country,
        city: port.city,
        latitude: port.latitude,
        longitude: port.longitude,
        timezone: port.timezone,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('ports.update', port.id), {
            onSuccess: () => {
                router.visit(route('ports.index'), {
                    only: ['ports'],
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${port.name}`} />

            <form onSubmit={submit} className="flex flex-col gap-8 p-8">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-semibold">Edit Port</h1>
                    <p className="text-base text-muted-foreground">
                        Update the port information below. You can modify the port name, code, location, and status.
                    </p>
                </div>

                <div className="grid max-w-4xl gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Port Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Enter port name"
                            disabled={processing}
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="code">Port Code</Label>
                        <Input
                            id="code"
                            type="text"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            placeholder="Enter port code"
                            disabled={processing}
                            required
                        />
                        <InputError message={errors.code} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                            id="country"
                            type="text"
                            value={data.country}
                            onChange={(e) => setData('country', e.target.value)}
                            placeholder="Enter country"
                            disabled={processing}
                            required
                        />
                        <InputError message={errors.country} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                            id="city"
                            type="text"
                            value={data.city}
                            onChange={(e) => setData('city', e.target.value)}
                            placeholder="Enter city"
                            disabled={processing}
                            required
                        />
                        <InputError message={errors.city} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input
                            id="latitude"
                            type="number"
                            step="any"
                            value={data.latitude}
                            onChange={(e) => setData('latitude', parseFloat(e.target.value) || 0)}
                            placeholder="Enter latitude"
                            disabled={processing}
                            required
                        />
                        <InputError message={errors.latitude} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input
                            id="longitude"
                            type="number"
                            step="any"
                            value={data.longitude}
                            onChange={(e) => setData('longitude', parseFloat(e.target.value) || 0)}
                            placeholder="Enter longitude"
                            disabled={processing}
                            required
                        />
                        <InputError message={errors.longitude} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Input
                            id="timezone"
                            type="text"
                            value={data.timezone}
                            onChange={(e) => setData('timezone', e.target.value)}
                            placeholder="Enter timezone (e.g., UTC, America/New_York)"
                            disabled={processing}
                            required
                        />
                        <InputError message={errors.timezone} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="status">Port Status</Label>
                        <Select value={data.status} onValueChange={(value: 'active' | 'inactive' | 'maintenance') => setData('status', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select port status" />
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
                        Update Port
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.visit(route('ports.index'))}
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
