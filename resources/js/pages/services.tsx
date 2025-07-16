import { servicesPageColumns } from '@/components/data-table/page-services/columns';
import { ServicesPageDataTable } from '@/components/data-table/page-services/data-table';
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
import { type BreadcrumbItem } from '@/types';
import { Service } from '@/types/service';
import { ServiceForm } from '@/types/service-form';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Plus } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Services',
        href: '/services',
    },
];

export default function Services({ services }: { services: Service[] }) {
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<ServiceForm>({
        name: '',
        description: '',
        price: '',
        status: 'active',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('services.store'), {
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Services Page" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Services</h1>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Service
                            </Button>
                        </DialogTrigger>

                        <DialogContent>
                            <form onSubmit={submit} className="space-y-4">
                                <DialogHeader>
                                    <DialogTitle>Create New Service</DialogTitle>
                                    <DialogDescription>
                                        Fill out the form below to create a new service. You can specify the service name, description, price, and
                                        status.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-2">
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

                                <div className="space-y-2">
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

                                <div className="space-y-2">
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

                                <div className="space-y-2">
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

                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline" type="button">
                                            Cancel
                                        </Button>
                                    </DialogClose>

                                    <Button type="submit" disabled={processing} className="w-full">
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        Create Service
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <ServicesPageDataTable columns={servicesPageColumns} data={services} />

                {services.length === 0 && (
                    <div className="py-8 text-center">
                        <p className="text-muted-foreground">No services found. Create your first service!</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
