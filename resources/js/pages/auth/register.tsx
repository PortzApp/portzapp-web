import { FormEventHandler, useEffect } from 'react';

import { Head, useForm } from '@inertiajs/react';
import { Building2, LoaderCircle, UserCheck } from 'lucide-react';

import AuthLayout from '@/layouts/auth-layout';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';

type RegisterForm = {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    password: string;
    password_confirmation: string;
    invite_token?: string;
};

interface InvitationInfo {
    organization: {
        name: string;
        business_type: string;
    };
    role: string;
    email: string;
}

interface RegisterProps {
    inviteToken?: string;
    invitation?: InvitationInfo;
}

export default function Register({ inviteToken, invitation }: RegisterProps) {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        first_name: '',
        last_name: '',
        email: invitation?.email || '',
        phone_number: '',
        password: '',
        password_confirmation: '',
        invite_token: inviteToken || undefined,
    });

    // Clear any existing onboarding storage when user visits registration
    useEffect(() => {
        try {
            Object.keys(localStorage).forEach((key) => {
                if (key.startsWith('portzapp_onboarding_state_')) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.warn('Failed to clear onboarding storage on registration:', error);
        }
    }, []);

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

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <Head title="Register" />

            {invitation && (
                <Alert className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                    <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                        <div className="mb-1 flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span className="font-medium">{invitation.organization.name}</span>
                        </div>
                        <div className="text-sm">
                            You've been invited to join as a <strong>{invitation.role}</strong> in their{' '}
                            {invitation.organization.business_type.toLowerCase()} organization.
                        </div>
                    </AlertDescription>
                </Alert>
            )}

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
                            disabled={processing || !!invitation}
                            readOnly={!!invitation}
                            placeholder="email@example.com"
                            className={invitation ? 'bg-gray-50 dark:bg-gray-800' : ''}
                        />
                        <InputError message={errors.email} />
                        {invitation && (
                            <p className="text-sm text-muted-foreground">This email is pre-filled from your invitation and cannot be changed.</p>
                        )}
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
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={5}
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
                            tabIndex={6}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Confirm password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="mt-2 w-full" tabIndex={7} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {invitation ? 'Accept Invitation & Create Account' : 'Create account'}
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <TextLink href={route('login')} tabIndex={8}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
