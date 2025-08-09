import { type ReactNode } from 'react';

import type { BreadcrumbItem } from '@/types';

import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';

import { Toaster } from '@/components/ui/sonner';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        {children}
        <Toaster />
    </AppLayoutTemplate>
);
