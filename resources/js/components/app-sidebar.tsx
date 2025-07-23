import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, SharedData } from '@/types/index';
import { Link, usePage } from '@inertiajs/react';
import { ClipboardCheck, LayoutGrid, Package } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItemsAsAdmin: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Services',
        href: '/services',
        icon: Package,
    },
];

const mainNavItemsAsVesselOwnerRole: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Services',
        href: '/services',
        icon: Package,
    },
    {
        title: 'Orders',
        href: '/orders',
        icon: ClipboardCheck,
    },
];

const mainNavItemsAsShippingAgencyRole: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'My Services',
        href: '/services',
        icon: Package,
    },
];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    const { role: currentRole } = usePage<SharedData>().props.auth.user;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={currentRole === 'admin' ? mainNavItemsAsAdmin :
                    currentRole === 'vessel_owner' ?
                        mainNavItemsAsVesselOwnerRole : mainNavItemsAsShippingAgencyRole} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
