import React, { useEffect, useState } from 'react';

import { User } from '@/types';
import { router } from '@inertiajs/react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

import OnboardingLayout from '@/layouts/onboarding-layout';

import { Button } from '@/components/ui/button';

interface Props {
    user: User;
    currentOrganization: {
        id: string;
        name: string;
    } | null;
}

export default function Complete({ user, currentOrganization }: Props) {
    const [isCompleting, setIsCompleting] = useState(false);

    const handleComplete = () => {
        setIsCompleting(true);

        toast.success('Welcome to PortzApp!', {
            description: "You're all set up and ready to go.",
            duration: 4000,
        });

        // Complete onboarding and redirect to dashboard
        router.patch(route('onboarding.update'), {
            onboarding_status: 'completed',
        });
    };

    // Auto-complete onboarding after 3 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isCompleting) {
                handleComplete();
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [isCompleting]);

    return (
        <OnboardingLayout user={user} title="Welcome to PortzApp!">
            <div className="w-full space-y-4 py-0">
                <div className="mx-auto mt-24 flex max-w-5xl flex-col items-center justify-center space-y-8">
                    <div className="space-y-8">
                        <div className="space-y-6 text-center">
                            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                                <CheckCircle className="h-12 w-12 text-green-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-foreground">Welcome to PortzApp!</h2>
                            <div className="space-y-2">
                                <p className="text-lg text-muted-foreground">Your account is set up and ready to go.</p>
                                {currentOrganization && (
                                    <p className="text-base text-muted-foreground">
                                        You're all set up with <span className="font-medium text-foreground">{currentOrganization.name}</span>.
                                    </p>
                                )}
                                <p className="text-sm text-muted-foreground">You'll be redirected to your dashboard shortly.</p>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <Button onClick={handleComplete} disabled={isCompleting} className="w-full max-w-sm px-8 py-3 text-lg">
                                {isCompleting ? 'Setting up...' : 'Go to Dashboard'}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </OnboardingLayout>
    );
}
