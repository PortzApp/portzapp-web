import React from 'react';

import { User } from '@/types';
import { router } from '@inertiajs/react';

import OnboardingLayout from '@/layouts/onboarding-layout';

import JoinOrganizationForm from '@/components/onboarding/join-organization-form';
import OrganizationSetupForm from '@/components/onboarding/organization-setup-form';

interface Props {
    user: User;
    action: 'create' | 'join';
    businessTypes: Array<{
        value: string;
        label: string;
    }>;
}

export default function Organization({ user, action, businessTypes }: Props) {
    const handleOrganizationCreated = () => {
        // Move to invite step after successful organization creation
        router.post(route('onboarding.update-step'), {
            step: 'invite',
        });
    };

    const handleGoBack = () => {
        router.visit(route('onboarding.welcome'));
    };

    if (action === 'create') {
        return (
            <OnboardingLayout user={user} title="Create Organization">
                <div className="w-full space-y-4 py-0">
                    <div className="mx-auto mt-24 flex max-w-5xl flex-col justify-center space-y-8">
                        <div className="mx-auto w-full max-w-md space-y-8">
                            <div className="space-y-4 text-center">
                                <h2 className="text-3xl font-bold text-foreground">Create Your Organization</h2>
                                <p className="text-lg text-muted-foreground">Set up your organization details and get started</p>
                            </div>

                            <OrganizationSetupForm businessTypes={businessTypes} onSuccess={handleOrganizationCreated} onCancel={handleGoBack} />
                        </div>
                    </div>
                </div>
            </OnboardingLayout>
        );
    }

    return (
        <OnboardingLayout user={user} title="Join Organization">
            <div className="w-full space-y-4 py-0">
                <div className="mx-auto mt-24 flex max-w-5xl flex-col justify-center space-y-8">
                    <div className="space-y-8">
                        <div className="space-y-4 text-center">
                            <h2 className="text-3xl font-bold text-foreground">Join Organization</h2>
                            <p className="text-lg text-muted-foreground">Enter your invitation details or request to join an organization</p>
                        </div>

                        <JoinOrganizationForm onCancel={handleGoBack} />
                    </div>
                </div>
            </div>
        </OnboardingLayout>
    );
}
