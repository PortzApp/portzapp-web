import { FormEventHandler } from 'react';

import { Head, router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import type { BreadcrumbItem } from '@/types';
import { Organization } from '@/types/models';
import { OrganizationBusinessType } from '@/types/enums';

import AppLayout from '@/layouts/app-layout';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import InputError from '@/components/input-error';

const businessTypeOptions = [
    { value: 'shipping_agency', label: 'Shipping Agency' },
    { value: 'vessel_owner', label: 'Vessel Owner' },
    { value: 'portzapp_team', label: 'PortzApp Team' },
] as const;

export default function EditOrganizationPage({ organization }: { organization: Organization }) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Organizations',
            href: '/organizations',
        },
        {
            title: organization.name,
            href: `/organizations/${organization.id}`,
        },
        {
            title: 'Edit',
            href: `/organizations/${organization.id}/edit`,
        },
    ];

    type OrganizationForm = Omit<Organization, 'id' | 'created_at' | 'updated_at' | 'users_count'>;

    const { data, setData, put, processing, errors } = useForm<OrganizationForm>({
        name: organization.name,
        registration_code: organization.registration_code,
        business_type: organization.business_type,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('organizations.update', organization.id), {
            onSuccess: () => {
                router.visit(route('organizations.index'), {
                    only: ['organizations'],
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${organization.name}`} />

            <form onSubmit={submit} className="flex flex-col gap-8 p-8">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-semibold">Edit Organization</h1>
                    <p className="text-base text-muted-foreground">
                        Update the organization information below. You can modify the organization name, registration code, and business type.
                    </p>
                </div>

                <div className="grid max-w-4xl gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Organization Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Enter organization name"
                            disabled={processing}
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="registration_code">Registration Code</Label>
                        <Input
                            id="registration_code"
                            type="text"
                            value={data.registration_code}
                            onChange={(e) => setData('registration_code', e.target.value)}
                            placeholder="Enter registration code"
                            disabled={processing}
                            required
                        />
                        <InputError message={errors.registration_code} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="business_type">Business Type</Label>
                        <Select 
                            value={data.business_type} 
                            onValueChange={(value: OrganizationBusinessType) => setData('business_type', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                            <SelectContent>
                                {businessTypeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.business_type} />
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button type="submit" disabled={processing} className="w-fit">
                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Update Organization
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.visit(route('organizations.index'))}
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
