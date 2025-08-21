import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Building2, Users, CheckCircle } from 'lucide-react';

import { User } from '@/types';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import OrganizationSetupForm from './organization-setup-form';
import JoinOrganizationForm from './join-organization-form';
import MemberInviteForm from './member-invite-form';

interface Props {
    user: User;
    businessTypes: Array<{
        value: string;
        label: string;
    }>;
}

type OnboardingStep = 'choose-action' | 'create-organization' | 'join-organization' | 'invite-members';

interface OrganizationFormData {
    id?: string;
    name: string;
    slug: string;
    business_type: string;
    registration_code: string;
    description?: string;
}

export default function OrganizationCreationWizard({ businessTypes }: Props) {
    const [currentStep, setCurrentStep] = useState<OnboardingStep>('choose-action');
    const [organizationData, setOrganizationData] = useState<OrganizationFormData | null>(null);

    const handleActionChoice = (action: 'create' | 'join') => {
        if (action === 'create') {
            setCurrentStep('create-organization');
        } else {
            setCurrentStep('join-organization');
        }
    };

    const handleOrganizationCreated = (data: OrganizationFormData) => {
        setOrganizationData(data);
        setCurrentStep('invite-members');
    };

    const handleInvitationsSkipped = () => {
        // Complete onboarding and redirect to dashboard
        router.patch(route('onboarding.update'), {
            onboarding_status: 'completed',
        });
    };

    const handleInvitationsSuccess = () => {
        // Complete onboarding and redirect to dashboard
        router.patch(route('onboarding.update'), {
            onboarding_status: 'completed',
        });
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
            case 'choose-action':
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-semibold">Let's get you started</h2>
                            <p className="text-muted-foreground">
                                Choose how you'd like to proceed with PortzApp
                            </p>
                        </div>

                        <div className="grid gap-4">
                            <Card 
                                className="cursor-pointer transition-colors hover:bg-muted/50 border-2 hover:border-primary/20"
                                onClick={() => handleActionChoice('create')}
                            >
                                <CardHeader className="pb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Building2 className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Create Organization</CardTitle>
                                            <CardDescription>
                                                Set up a new organization and invite your team
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>

                            <Card 
                                className="cursor-pointer transition-colors hover:bg-muted/50 border-2 hover:border-primary/20"
                                onClick={() => handleActionChoice('join')}
                            >
                                <CardHeader className="pb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Users className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Join Organization</CardTitle>
                                            <CardDescription>
                                                Join an existing organization with an invitation code
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>
                );

            case 'create-organization':
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-semibold">Create Your Organization</h2>
                            <p className="text-muted-foreground">
                                Set up your organization details and get started
                            </p>
                        </div>

                        <OrganizationSetupForm
                            businessTypes={businessTypes}
                            onSuccess={handleOrganizationCreated}
                            onCancel={() => setCurrentStep('choose-action')}
                        />
                    </div>
                );

            case 'join-organization':
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-semibold">Join Organization</h2>
                            <p className="text-muted-foreground">
                                Enter your invitation details or request to join an organization
                            </p>
                        </div>

                        <JoinOrganizationForm
                            onCancel={() => setCurrentStep('choose-action')}
                        />
                    </div>
                );

            case 'invite-members':
                return (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-semibold">Organization Created Successfully!</h2>
                            <p className="text-muted-foreground">
                                Your organization "{organizationData?.name}" is ready to use
                            </p>
                        </div>

                        {organizationData?.id && (
                            <MemberInviteForm
                                organizationId={organizationData.id}
                                availableRoles={availableRoles}
                                onSuccess={handleInvitationsSuccess}
                                onSkip={handleInvitationsSkipped}
                            />
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {renderStepContent()}
        </div>
    );
}