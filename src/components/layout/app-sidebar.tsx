"use client";

import { Show, UserButton } from "@clerk/nextjs";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/routing";

import { ThemeToggle } from "@/components/theme-toggle";
import { XIcon } from "@/components/ui/x-icon";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useNavItems } from "@/components/layout/nav-items";
import { XpBadge } from "@/components/todo/xp-badge";

export function AppSidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const navItems = useNavItems();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex h-14 shrink-0 items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold"
          >
            <XIcon className="h-5 w-5 shrink-0 fill-red-500 drop-shadow-lg md:h-6 md:w-6" />
            <span className="whitespace-nowrap text-primary drop-shadow-lg group-data-[collapsible=icon]:hidden">
              {t("app.name")}
            </span>
          </Link>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.tooltip}
                    >
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <item.icon className="size-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="group-data-[collapsible=icon]:hidden px-3 pb-4">
        <XpBadge />
      </div>

      <SidebarFooter>
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <ThemeToggle />
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
