import { Link, usePage } from '@inertiajs/react';
import { Activity, CreditCard, LayoutGrid } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Subscription',
        href: '/subscription',
        icon: CreditCard,
    },
    {
        title: 'Usage',
        href: '/usage',
        icon: Activity,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { name } = usePage().props as { name: string };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#17221e]">
                                    <img
                                        src="/favicon.svg"
                                        className="size-5"
                                        alt={name}
                                    />
                                </div>
                                <span className="truncate font-semibold">
                                    {name}
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
