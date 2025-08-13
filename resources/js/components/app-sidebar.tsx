import { router, usePage } from '@inertiajs/react';
import { Building2, ChevronsUpDown, ClipboardCheck, LayoutGrid, ListCheck, MapPin, Package, Plus, Ship, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

import type { NavItem, SharedData } from '@/types';
import { OrganizationBusinessType } from '@/types/enums';

import { cn } from '@/lib/utils';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';

import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';

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
    {
        title: 'Ports',
        href: '/ports',
        icon: MapPin,
    },
    {
        title: 'Organizations',
        href: '/organizations',
        icon: Building2,
    },
];

const mainNavItemsAsVesselOwner: NavItem[] = [
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
        href: route('orders.index'),
        icon: ClipboardCheck,
    },
    {
        title: 'Create Order',
        href: route('orders.wizard.start'),
        icon: Wand2,
    },
    {
        title: 'Vessels',
        href: '/vessels',
        icon: Ship,
    },
];

const mainNavItemsAsShippingAgency: NavItem[] = [
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
    {
        title: 'Order Requests',
        href: '/agency/orders',
        icon: ListCheck,
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

function getBusinessTypeLabel(businessType: string): string {
    switch (businessType) {
        case 'shipping_agency':
            return 'Shipping Agency';
        case 'vessel_owner':
            return 'Vessel Owner';
        case 'portzapp_team':
            return 'PortzApp Team';
        default:
            return businessType;
    }
}

export function AppSidebar() {
    const { isMobile } = useSidebar();

    const { auth } = usePage<SharedData>().props;
    const user = auth.user;
    const businessType: OrganizationBusinessType | undefined = user?.current_organization?.business_type;

    let navItems = mainNavItemsAsAdmin;

    if (businessType === 'portzapp_team') {
        navItems = mainNavItemsAsAdmin;
    } else if (businessType === 'vessel_owner') {
        navItems = mainNavItemsAsVesselOwner;
    } else if (businessType === 'shipping_agency') {
        navItems = mainNavItemsAsShippingAgency;
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                {user?.organizations && (
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton
                                        size="lg"
                                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                    >
                                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                            {/* <activeTeam.logo className="size-4" /> */}
                                            <span className="truncate">{user.current_organization?.name.charAt(0)}</span>
                                        </div>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate text-xs text-sidebar-accent-foreground">
                                                {getBusinessTypeLabel(businessType || '')}
                                            </span>
                                            <span className="truncate font-medium">{user.current_organization?.name}</span>
                                        </div>
                                        <ChevronsUpDown className="ml-auto" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-fit min-w-56 rounded-lg"
                                    align="start"
                                    side={isMobile ? 'bottom' : 'right'}
                                    sideOffset={4}
                                >
                                    <DropdownMenuLabel className="text-xs text-muted-foreground">Organizations</DropdownMenuLabel>
                                    <div className="flex flex-col gap-1">
                                        {user.organizations?.map((org, index) => (
                                            <DropdownMenuItem
                                                key={org.id}
                                                className={cn('gap-2 p-2', org.id === user.current_organization?.id && 'border bg-muted')}
                                                onClick={async () => {
                                                    router.put(
                                                        route('user.current-organization.update'),
                                                        {
                                                            organization_id: org.id,
                                                        },
                                                        {
                                                            onSuccess: () => {
                                                                toast('Switched organization', {
                                                                    description: `Switched to ${org.name}`,
                                                                });
                                                            },
                                                        },
                                                    );
                                                }}
                                            >
                                                <div className="flex size-6 items-center justify-center rounded-md border">
                                                    {/* <team.logo className="size-3.5 shrink-0" /> */}
                                                    <span className="truncate">{org.name.charAt(0)}</span>
                                                </div>
                                                <span className="truncate">{org.name}</span>
                                                <DropdownMenuShortcut>⌘{index}</DropdownMenuShortcut>
                                            </DropdownMenuItem>
                                        ))}
                                    </div>

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="gap-2 p-2">
                                        <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                                            <Plus className="size-4" />
                                        </div>
                                        <div className="font-medium text-muted-foreground">Add organization</div>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                )}
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
