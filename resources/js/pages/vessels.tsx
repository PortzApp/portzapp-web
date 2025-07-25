import { columns } from '@/components/data-table/page-vessels/columns';
import { VesselsPageDataTable } from '@/components/data-table/page-vessels/data-table';
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
import { Vessel } from '@/types/core';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Plus } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Vessels',
        href: '/vessels',
    },
];

export default function OrdersPage({ vessels }: { vessels: Array<Vessel> }) {
    // const { role: currentRole } = usePage<SharedData>().props.auth.user;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vessels Page" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">My Vessels</h1>
                    <CreateVesselDialog />
                </div>

                <VesselsPageDataTable columns={columns} data={vessels} />

                {vessels.length === 0 && (
                    <div className="py-8 text-center">
                        <p className="text-muted-foreground">No vessels found. Create your first vessel!</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function CreateVesselDialog() {
    const [openDialog, setOpenDialog] = useState(false);

    type VesselForm = Omit<Vessel, 'id' | 'owner_id' | 'created_at' | 'updated_at'>;

    const { data, setData, post, processing, errors, reset } = useForm<VesselForm>({
        name: '',
        imo_number: '',
        vessel_type: 'tanker',
        status: 'active',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('vessels.store'), {
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
                    Add Vessel
                </Button>
            </DialogTrigger>

            <DialogContent>
                <form onSubmit={submit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Create New Vessel</DialogTitle>
                        <DialogDescription>
                            Fill out the form below to create a new vessel. You can specify the vessel name, IMO number, vessel type, and status.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
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

                    <div className="space-y-2">
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

                    <div className="space-y-2">
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

                    <div className="space-y-2">
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

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </DialogClose>

                        <Button type="submit" disabled={processing} className="w-full">
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Create Vessel
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
