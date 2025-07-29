import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import AppLayout from '@/layouts/app-layout';
import { LoaderCircle } from 'lucide-react';

import type { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

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
};

export default function CreateServicePage() {
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
                </div>

                <Button type="submit" disabled={processing} className="w-fit">
                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Create Service
                </Button>
            </form>
        </AppLayout>
    );
}
