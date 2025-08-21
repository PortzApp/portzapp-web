import { OnboardingProvider, useOnboarding } from '@/contexts/onboarding-context';
import { User } from '@/types';
import { Head, router } from '@inertiajs/react';
import { LogOut } from 'lucide-react';

import AuthLayout from '@/layouts/auth-layout';

import { Button } from '@/components/ui/button';

import EnhancedOrganizationWizard from '@/components/onboarding/enhanced-organization-wizard';

interface Props {
    user: User;
    businessTypes: Array<{
        value: string;
        label: string;
    }>;
}

// Internal component that has access to onboarding context
function OnboardingContent({ businessTypes }: { businessTypes: Props['businessTypes'] }) {
    const { clearAllOnboardingStorage } = useOnboarding();

    const handleLogout = () => {
        // Clear all onboarding storage before logout
        clearAllOnboardingStorage();
        router.post(route('logout'));
    };

    return (
        <div className="relative min-h-screen">
            <Head title="Complete Setup" />

            {/* Logout button positioned in top-right */}
            <div className="absolute top-4 right-4 z-10">
                <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                </Button>
            </div>

            <AuthLayout title="Complete Setup" description="Finish setting up your account">
                <EnhancedOrganizationWizard businessTypes={businessTypes} />
            </AuthLayout>
        </div>
    );
}

export default function OnboardingIndex({ user, businessTypes }: Props) {
    return (
        <OnboardingProvider initialUser={user} initialBusinessTypes={businessTypes}>
            <OnboardingContent businessTypes={businessTypes} />
        </OnboardingProvider>
    );
}
