import React, { useState } from 'react';

import { useOnboarding } from '@/contexts/onboarding-context';
import { router } from '@inertiajs/react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { CompletionCelebration, InvitationSuccessCelebration, SuccessCelebration } from '@/components/ui/celebration';

import MemberInviteForm from './member-invite-form';
import OrganizationSetupForm, { OrganizationFormData } from './organization-setup-form';

interface Props {
    businessTypes: Array<{
        value: string;
        label: string;
    }>;
}

export default function EnhancedOrganizationWizard({ businessTypes }: Props) {
    const [showOrgCreationCelebration, setShowOrgCreationCelebration] = useState(false);
    const [showInvitationCelebration, setShowInvitationCelebration] = useState(false);
    const [showCompletionCelebration, setShowCompletionCelebration] = useState(false);
    const [invitationCount, setInvitationCount] = useState(0);

    const { state, setStep, setOrganizationData, setLoading, setError, resetState } = useOnboarding();

    const goToPreviousStep = () => {
        // No previous step from create-organization since it's now the first step
        return;
    };

    const { currentStep, organizationData, isLoading, error } = state;

    const handleOrganizationCreated = (data: OrganizationFormData) => {
        console.log('Organization created data received:', data);
        const orgData = data as { id?: string; name?: string };

        setOrganizationData(data);

        // Show celebration before moving to next step
        setShowOrgCreationCelebration(true);
        toast.success('Organization Created!', {
            description: `${orgData?.name || 'Your organization'} is ready to use.`,
            duration: 3000,
        });

        // Move to next step after celebration
        setTimeout(() => {
            setShowOrgCreationCelebration(false);
            console.log('Moving to invite-members step with org data:', data);
            setStep('invite-members');
        }, 2000);
    };

    const handleInvitationsSkipped = () => {
        completeOnboarding();
    };

    const handleInvitationsSuccess = (inviteCount: number) => {
        setInvitationCount(inviteCount);

        // Show celebration before completing onboarding
        setShowInvitationCelebration(true);
        toast.success('Invitations Sent!', {
            description: `${inviteCount} invitation${inviteCount !== 1 ? 's' : ''} sent successfully.`,
            duration: 3000,
        });

        // Complete onboarding after celebration
        setTimeout(() => {
            setShowInvitationCelebration(false);
            completeOnboarding();
        }, 2000);
    };

    const completeOnboarding = () => {
        setLoading(true);
        router.patch(
            route('onboarding.update'),
            {
                onboarding_status: 'completed',
            },
            {
                onSuccess: () => {
                    setStep('complete');

                    // Show completion celebration
                    setShowCompletionCelebration(true);
                    toast.success('Welcome to PortzApp!', {
                        description: "You're all set up and ready to go.",
                        duration: 4000,
                    });

                    // Clear onboarding state after celebration
                    setTimeout(() => {
                        setShowCompletionCelebration(false);
                        resetState();
                    }, 3000);
                },
                onError: (errors) => {
                    setError('Failed to complete onboarding. Please try again.');
                    toast.error('Onboarding Failed', {
                        description: 'There was an issue completing your onboarding. Please try again.',
                    });
                    console.error('Onboarding completion error:', errors);
                },
                onFinish: () => {
                    setLoading(false);
                },
            },
        );
    };

    // Available roles for invitations
    const availableRoles = [
        { value: 'admin', label: 'Admin' },
        { value: 'ceo', label: 'CEO' },
        { value: 'manager', label: 'Manager' },
        { value: 'operations', label: 'Operations' },
        { value: 'finance', label: 'Finance' },
        { value: 'viewer', label: 'Viewer' },
    ];

    const renderStepContent = () => {
        switch (currentStep) {
            case 'create-organization':
                return (
                    <div className="mx-auto w-full max-w-md space-y-8">
                        <div className="space-y-4 text-center">
                            <h2 className="text-3xl font-bold text-foreground">Create Your Organization</h2>
                            <p className="text-lg text-muted-foreground">Set up your organization details and get started</p>
                        </div>

                        <OrganizationSetupForm businessTypes={businessTypes} onSuccess={handleOrganizationCreated} onCancel={goToPreviousStep} />
                    </div>
                );

            case 'invite-members':
                return (
                    <div className="space-y-8">
                        <div className="space-y-6 text-center">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-foreground">Organization Created Successfully!</h2>
                            <p className="text-lg text-muted-foreground">Your organization "{organizationData?.name}" is ready to use</p>
                        </div>

                        <div>
                            {organizationData?.id ? (
                                <MemberInviteForm
                                    organizationId={organizationData.id}
                                    availableRoles={availableRoles}
                                    onSuccess={handleInvitationsSuccess}
                                    onSkip={handleInvitationsSkipped}
                                />
                            ) : (
                                <div className="space-y-6">
                                    <div className="space-y-4 text-center">
                                        <p className="text-muted-foreground">
                                            Your organization has been created successfully! You can now invite team members or continue to your
                                            dashboard.
                                        </p>
                                    </div>

                                    <div className="flex justify-center gap-4">
                                        <Button variant="outline" onClick={handleInvitationsSkipped} disabled={isLoading} className="px-8 py-3">
                                            Skip & Go to Dashboard
                                        </Button>
                                        <Button onClick={handleInvitationsSkipped} disabled={isLoading} className="px-8 py-3">
                                            Continue to Dashboard
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'complete':
                return (
                    <div className="space-y-8">
                        <div className="space-y-6 text-center">
                            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                                <CheckCircle className="h-12 w-12 text-green-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-foreground">Welcome to PortzApp!</h2>
                            <p className="text-lg text-muted-foreground">
                                Your account is set up and ready to go.
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <Button onClick={() => router.visit('/dashboard')} className="w-full max-w-sm px-8 py-3 text-lg">
                                Go to Dashboard
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="w-full space-y-4 py-0">
            {/* Main content container with better vertical centering */}
            <div className="mx-auto mt-24 flex max-w-5xl flex-col justify-center space-y-8">
                {/* Error Display */}
                {error && (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-destructive">
                        <p className="font-medium">Error</p>
                        <p className="text-sm">{error}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setError(null)}
                            className="mt-2 border-destructive/20 text-destructive hover:bg-destructive/20"
                        >
                            Dismiss
                        </Button>
                    </div>
                )}

                {/* Main Content */}
                <div className="space-y-8">{renderStepContent()}</div>
            </div>

            {/* Celebration overlays */}
            <SuccessCelebration
                isVisible={showOrgCreationCelebration}
                organizationName={organizationData?.name}
                onComplete={() => setShowOrgCreationCelebration(false)}
            />

            <InvitationSuccessCelebration
                isVisible={showInvitationCelebration}
                inviteCount={invitationCount}
                onComplete={() => setShowInvitationCelebration(false)}
            />

            <CompletionCelebration isVisible={showCompletionCelebration} onComplete={() => setShowCompletionCelebration(false)} />
        </div>
    );
}
