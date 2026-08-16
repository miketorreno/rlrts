"use client";

import { Show, UserButton } from "@clerk/nextjs";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";

import { ThemeToggle } from "@/components/theme-toggle";
import { XIcon } from "@/components/ui/x-icon";

import { useNavItems } from "@/components/layout/nav-items";

/**
 * AppSidebar Component
 *
 * A fixed desktop-only navigation sidebar (hidden below `md`) that sits on the
 * start edge (RTL-aware). Includes the logo, nav items with active state,
 * a spacer, theme toggle, and user button.
 */

export function AppSidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const navItems = useNavItems();

  return (
    <aside className="fixed inset-y-0 start-0 z-40 hidden w-64 flex-col border-e border-border bg-background/60 md:flex">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold"
        >
          <XIcon className="h-5 w-5 shrink-0 fill-red-500 drop-shadow-lg md:h-6 md:w-6" />
          <span className="whitespace-nowrap text-primary drop-shadow-lg">
            {t("app.name")}
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <span className="absolute inset-y-1 start-0 w-0.5 rounded-full bg-primary" />
              )}
              <item.icon className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer controls */}
      <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
        <ThemeToggle />
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </aside>
  );
}
