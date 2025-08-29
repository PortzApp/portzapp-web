import { OnboardingProvider, useOnboarding } from '@/contexts/onboarding-context';
import { User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';

import AppLogoIcon from '@/components/app-logo-icon';
import EnhancedOrganizationWizard from '@/components/onboarding/enhanced-organization-wizard';

interface Props {
    user: User;
    businessTypes: Array<{
        value: string;
        label: string;
    }>;
}

// Internal component that has access to onboarding context
function OnboardingContent({ businessTypes, user }: { businessTypes: Props['businessTypes']; user: Props['user'] }) {
    const { clearAllOnboardingStorage } = useOnboarding();

    const handleLogout = () => {
        // Clear all onboarding storage before logout
        clearAllOnboardingStorage();
        router.post(route('logout'));
    };

    return (
        <div className="relative min-h-screen bg-background">
            <Head title="Complete Setup" />

            {/* Minimal height header with centered logo */}
            <div className="sticky top-0 right-0 left-0 z-10 border-b border-border/10 bg-background/95 backdrop-blur-sm">
                <div className="flex items-center justify-center px-6 py-8">
                    {/* Centered Logo */}
                    <Link href={route('home')} className="flex items-center gap-3 text-xl font-medium">
                        <AppLogoIcon />
                        PortzApp
                    </Link>
                </div>
            </div>

            {/* Main content area with top padding to account for fixed header */}
            <div className="mt-0 px-6 md:px-12">
                <div className="mx-auto w-full max-w-4xl">
                    <EnhancedOrganizationWizard businessTypes={businessTypes} />
                </div>
            </div>

            {/* User email and logout at bottom-right */}
            <div className="fixed right-4 bottom-4 z-10">
                <div className="flex flex-col items-end gap-2">
                    <p className="text-sm text-muted-foreground">
                        You're signed in as <span className="font-medium text-foreground">{user.email}</span>
                    </p>
                    <Button variant="secondary" size="sm" onClick={handleLogout} className="text-sm">
                        Sign in as a different user
                    </Button>
                </div>
            </div>

            <Toaster />
        </div>
    );
}

export default function OnboardingIndex({ user, businessTypes }: Props) {
    return (
        <OnboardingProvider initialUser={user} initialBusinessTypes={businessTypes}>
            <OnboardingContent businessTypes={businessTypes} user={user} />
        </OnboardingProvider>
    );
}
