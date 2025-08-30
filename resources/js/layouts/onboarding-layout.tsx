import React, { ReactNode } from 'react';

import { User } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

import type { SharedData } from '@/types';

import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';

import AppLogoIcon from '@/components/app-logo-icon';

interface OnboardingLayoutProps {
    children: ReactNode;
    user: User;
    title?: string;
    hideNameText?: boolean;
}

export default function OnboardingLayout({ children, user, title = 'Complete Setup', hideNameText = false }: OnboardingLayoutProps) {
    const { name } = usePage<SharedData>().props;

    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <div className="relative min-h-screen bg-background">
            <Head title={title} />

            {/* Minimal height header with centered logo */}
            <div className="sticky top-0 right-0 left-0 z-10 border-b border-border/10 bg-background/95 backdrop-blur-sm">
                <div className="flex items-center justify-center px-6 py-8">
                    {/* Centered Logo */}
                    <Link href={route('home')} className="flex items-center gap-3 text-xl font-medium">
                        <AppLogoIcon />
                    </Link>
                </div>
            </div>

            {/* Main content area */}
            <div className="mt-0 px-6 md:px-12">
                <div className="mx-auto w-full max-w-4xl">{children}</div>
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
