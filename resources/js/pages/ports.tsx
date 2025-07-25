import { columns } from '@/components/data-table/page-ports/columns';
import { PortsPageDataTable } from '@/components/data-table/page-ports/data-table';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Port } from '@/types/core';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Plus } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Ports',
        href: '/ports',
    },
];

export default function PortsPage({ ports }: { ports: Array<Port> }) {
    // const { role: currentRole } = usePage<SharedData>().props.auth.user;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ports Page" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Ports</h1>
                    <CreatePortDialog />
                </div>

                <PortsPageDataTable columns={columns} data={ports} />

                {ports.length === 0 && (
                    <div className="py-8 text-center">
                        <p className="text-muted-foreground">No ports found. Create your first port!</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function CreatePortDialog() {
    const [openDialog, setOpenDialog] = useState(false);

    type PortForm = Omit<Port, 'id' | 'created_at' | 'updated_at'>;

    const { data, setData, post, processing, errors, reset } = useForm<PortForm>({
        name: '',
        code: '',
        country: '',
        city: '',
        latitude: 0,
        longitude: 0,
        timezone: '',
        status: 'active',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('ports.store'), {
            onSuccess: () => {
                reset();
                setOpenDialog(false);
            },
        });
    };

    return (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Plus className="h-4 w-4" />
                    Add Port
                </Button>
            </DialogTrigger>

            <DialogContent>
                <form onSubmit={submit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Create New Port</DialogTitle>
                        <DialogDescription>
                            Fill out the form below to create a new port. You can specify the port name, code, country, city, latitude, longitude, and
                            timezone.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
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

                    <div className="space-y-2">
                        <Label htmlFor="code">Code</Label>
                        <Input
                            id="code"
                            type="text"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            placeholder="Enter port code"
                            disabled={processing}
                        />
                        <InputError message={errors.code} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={data.status} onValueChange={(value: 'active' | 'inactive' | 'maintenance') => setData('status', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.status} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                            id="country"
                            type="text"
                            value={data.country}
                            onChange={(e) => setData('country', e.target.value)}
                            placeholder="Enter country"
                            disabled={processing}
                        />
                        <InputError message={errors.country} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                            id="city"
                            type="text"
                            value={data.city}
                            onChange={(e) => setData('city', e.target.value)}
                            placeholder="Enter port code"
                            disabled={processing}
                        />
                        <InputError message={errors.city} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input
                            id="latitude"
                            type="number"
                            value={data.latitude}
                            onChange={(e) => setData('latitude', Number(e.target.value))}
                            placeholder="Enter latitude"
                            disabled={processing}
                        />
                        <InputError message={errors.latitude} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input
                            id="longitude"
                            type="number"
                            value={data.longitude}
                            onChange={(e) => setData('longitude', Number(e.target.value))}
                            placeholder="Enter longitude"
                            disabled={processing}
                        />
                        <InputError message={errors.longitude} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Input
                            id="timezone"
                            type="text"
                            value={data.timezone}
                            onChange={(e) => setData('timezone', e.target.value)}
                            placeholder="Enter timezone"
                            disabled={processing}
                        />
                        <InputError message={errors.timezone} />
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </DialogClose>

                        <Button type="submit" disabled={processing} className="w-full">
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Create Port
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
