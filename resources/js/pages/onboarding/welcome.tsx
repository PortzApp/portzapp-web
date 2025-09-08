import { User } from '@/types';
import { router } from '@inertiajs/react';
import { Building2, Users } from 'lucide-react';

import OnboardingLayout from '@/layouts/onboarding-layout';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    user: User;
    businessTypes: Array<{
        value: string;
        label: string;
    }>;
}

export default function Welcome({ user }: Props) {
    const handleActionChoice = (action: 'create' | 'join') => {
        router.post(route('onboarding.update-step'), {
            step: 'organization',
            action: action,
        });
    };

    return (
        <OnboardingLayout user={user} title="Welcome - Choose Action">
            <div className="w-full space-y-4 py-0">
                <div className="mx-auto mt-24 flex max-w-5xl flex-col justify-center space-y-8">
                    <div className="space-y-8">
                        <div className="space-y-4 text-center">
                            <h2 className="text-3xl font-bold text-foreground">Let's get you started</h2>
                            <p className="text-lg text-muted-foreground">Choose how you'd like to proceed with PortzApp</p>
                        </div>

                        <div className="flex items-center justify-center gap-8">
                            <Card
                                className="h-fit w-full max-w-lg cursor-pointer border px-4 py-4 transition-all duration-200 hover:border-blue-200 hover:bg-neutral-900/50 hover:shadow-lg"
                                onClick={() => handleActionChoice('create')}
                            >
                                <CardHeader className="p-4">
                                    <div className="flex flex-col items-start gap-6">
                                        <div className="flex rounded-xl bg-blue-100 p-4">
                                            <Building2 className="size-8 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-xl text-foreground">Create Organization</CardTitle>
                                            <CardDescription className="mt-2 text-base text-balance text-muted-foreground">
                                                Set up a new organization and invite your team
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>

                            {/* OR Divider */}
                            <span className="bg-background px-4 py-2 font-medium text-muted-foreground">OR</span>

                            <Card
                                className="h-fit w-full max-w-lg cursor-pointer border px-4 py-4 transition-all duration-200 hover:border-green-200 hover:bg-neutral-900/50 hover:shadow-lg"
                                onClick={() => handleActionChoice('join')}
                            >
                                <CardHeader className="p-4">
                                    <div className="flex flex-col items-start gap-6">
                                        <div className="flex rounded-xl bg-green-100 p-4">
                                            <Users className="size-8 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-xl text-foreground">Join Organization</CardTitle>
                                            <CardDescription className="mt-2 text-base text-balance text-muted-foreground">
                                                Join an existing organization with an invitation code
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </OnboardingLayout>
    );
}
