import { FormEventHandler } from 'react';

import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import { OrganizationBusinessType, UserRoles } from '@/types/enums';

import { getRoleLabel } from '@/utils/role-labels';

import AuthLayout from '@/layouts/auth-layout';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';

type RegisterForm = {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    company_name: string;
    company_registration_code: string;
    password: string;
    password_confirmation: string;
    user_role: string;
    organization_business_type: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        company_name: '',
        company_registration_code: '',
        password: '',
        password_confirmation: '',
        user_role: UserRoles.ADMIN,
        organization_business_type: OrganizationBusinessType.VESSEL_OWNER,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
            onSuccess: () => {
                console.log('Registration successful!');
            },
            onError: (errors) => {
                console.log('Registration errors:', errors);
            },
        });
    };

    const handleUserRoleChange = (value: string) => {
        setData('user_role', value);
    };

    const handleOrganizationBusinessTypeChange = (value: string) => {
        setData('organization_business_type', value);
    };

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <Head title="Register" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="flex gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="first_name">First name</Label>
                            <Input
                                id="first_name"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="given-name"
                                value={data.first_name}
                                onChange={(e) => setData('first_name', e.target.value)}
                                disabled={processing}
                                placeholder="First name"
                            />
                            <InputError message={errors.first_name} className="mt-2" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="last_name">Last name</Label>
                            <Input
                                id="last_name"
                                type="text"
                                required
                                autoFocus
                                tabIndex={2}
                                autoComplete="family-name"
                                value={data.last_name}
                                onChange={(e) => setData('last_name', e.target.value)}
                                disabled={processing}
                                placeholder="Last name"
                            />
                            <InputError message={errors.last_name} className="mt-2" />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={3}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone_number">Phone number</Label>
                        <Input
                            id="phone_number"
                            type="tel"
                            required
                            tabIndex={4}
                            autoComplete="tel"
                            value={data.phone_number}
                            onChange={(e) => setData('phone_number', e.target.value)}
                            disabled={processing}
                            placeholder="+971 55 123 4567"
                        />
                        <InputError message={errors.phone_number} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="company_name">Company name</Label>
                        <Input
                            id="company_name"
                            type="text"
                            required
                            tabIndex={5}
                            autoComplete="organization"
                            value={data.company_name}
                            onChange={(e) => setData('company_name', e.target.value)}
                            disabled={processing}
                            placeholder="Your company name"
                        />
                        <InputError message={errors.company_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="company_registration_code">Company registration code</Label>
                        <Input
                            id="company_registration_code"
                            type="text"
                            required
                            tabIndex={6}
                            value={data.company_registration_code}
                            onChange={(e) => setData('company_registration_code', e.target.value)}
                            disabled={processing}
                            placeholder="Your company registration code"
                        />
                        <InputError message={errors.company_registration_code} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={7}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={8}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Confirm password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="organization_business_type">Company Type</Label>
                        <RadioGroup
                            value={data.organization_business_type}
                            onValueChange={handleOrganizationBusinessTypeChange}
                            className="flex flex-col gap-2"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value={OrganizationBusinessType.VESSEL_OWNER} id="vessel_owner_business" />
                                <Label htmlFor="vessel_owner_business">Vessel Owner Company</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value={OrganizationBusinessType.SHIPPING_AGENCY} id="shipping_agency_business" />
                                <Label htmlFor="shipping_agency_business">Shipping Agency</Label>
                            </div>
                        </RadioGroup>
                        <InputError message={errors.organization_business_type} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="user_role">Your Role in Company</Label>
                        <RadioGroup value={data.user_role} onValueChange={handleUserRoleChange} className="flex flex-col gap-2">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value={UserRoles.ADMIN} id="admin_role" />
                                <Label htmlFor="admin_role">{getRoleLabel(UserRoles.ADMIN)}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value={UserRoles.CEO} id="ceo_role" />
                                <Label htmlFor="ceo_role">{getRoleLabel(UserRoles.CEO)}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value={UserRoles.MANAGER} id="manager_role" />
                                <Label htmlFor="manager_role">{getRoleLabel(UserRoles.MANAGER)}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value={UserRoles.OPERATIONS} id="operations_role" />
                                <Label htmlFor="operations_role">{getRoleLabel(UserRoles.OPERATIONS)}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value={UserRoles.FINANCE} id="finance_role" />
                                <Label htmlFor="finance_role">{getRoleLabel(UserRoles.FINANCE)}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value={UserRoles.VIEWER} id="viewer_role" />
                                <Label htmlFor="viewer_role">{getRoleLabel(UserRoles.VIEWER)}</Label>
                            </div>
                        </RadioGroup>
                        <InputError message={errors.user_role} />
                    </div>

                    <Button type="submit" className="mt-2 w-full" tabIndex={9} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Create account
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <TextLink href={route('login')} tabIndex={10}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
