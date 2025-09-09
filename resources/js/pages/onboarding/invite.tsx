import React from 'react';

import { User } from '@/types';
import { router } from '@inertiajs/react';
import { ArrowRight, CheckCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

import OnboardingLayout from '@/layouts/onboarding-layout';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

import MemberInviteForm from '@/components/onboarding/member-invite-form';

interface Props {
    user: User;
    currentOrganization: {
        id: string;
        name: string;
    } | null;
    availableRoles: Array<{
        value: string;
        label: string;
    }>;
}

export default function Invite({ user, currentOrganization, availableRoles }: Props) {
    const handleInvitationsSuccess = (inviteCount: number) => {
        toast.success('Invitations Sent!', {
            description: `${inviteCount} invitation${inviteCount !== 1 ? 's' : ''} sent successfully.`,
            duration: 3000,
        });

        completeOnboarding();
    };

    const handleInvitationsSkipped = () => {
        completeOnboarding();
    };

    const completeOnboarding = () => {
        router.post(route('onboarding.update-step'), {
            step: 'complete',
        });
    };

    if (!currentOrganization) {
        return (
            <OnboardingLayout user={user} title="Invite Team Members">
                <div className="w-full space-y-4 py-0">
                    <div className="mx-auto mt-24 flex max-w-5xl flex-col justify-center space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-4 text-center">
                                <p className="text-muted-foreground">
                                    Your organization setup is not complete. Please go back and complete the organization setup first.
                                </p>
                            </div>

                            <div className="flex justify-center gap-4">
                                <Button onClick={() => router.visit(route('onboarding.organization'))} className="px-8 py-3">
                                    Complete Organization Setup
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </OnboardingLayout>
        );
    }

    return (
        <OnboardingLayout user={user} title="Invite Team Members">
            <div className="w-full space-y-4 py-0">
                <div className="mx-auto mt-24 flex max-w-5xl flex-col justify-center space-y-8">
                    <div className="space-y-8">
                        <div className="space-y-6 text-center">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-foreground">Organization Created Successfully!</h2>
                            <p className="text-lg text-muted-foreground">Your organization "{currentOrganization.name}" is ready to use</p>
                        </div>

                        <div className="mx-auto w-full max-w-md space-y-6">
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertTitle>Invite team members from your dashboard</AlertTitle>
                                <AlertDescription>You can invite team members from settings after completing setup.</AlertDescription>
                            </Alert>

                            <MemberInviteForm
                                organizationId={currentOrganization.id}
                                availableRoles={availableRoles}
                                onSuccess={handleInvitationsSuccess}
                                onSkip={handleInvitationsSkipped}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </OnboardingLayout>
    );
}
