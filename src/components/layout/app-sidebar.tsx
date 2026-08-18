"use client";

import { Show, UserButton } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";

import { ThemeToggle } from "@/components/theme-toggle";
import { XIcon } from "@/components/ui/x-icon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

import { useNavItems } from "@/components/layout/nav-items";
import { useSidebar } from "@/components/sidebar-provider";
import { XpBadge } from "@/components/todo/xp-badge";

/**
 * AppSidebar Component
 *
 * A fixed desktop-only navigation sidebar (hidden below `md`) that sits on the
 * start edge (RTL-aware). Includes the logo, nav items with active state,
 * a spacer, theme toggle, and user button. Supports collapsed icon-only mode.
 */

export function AppSidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const navItems = useNavItems();
  const { isOpen, toggle } = useSidebar();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 start-0 z-40 hidden flex-col border-e border-border bg-background/60 transition-all duration-300 md:flex",
        isOpen ? "w-64" : "w-16",
      )}
    >
      {/* Header: Logo + Toggle */}
      <div className="flex h-16 shrink-0 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold"
        >
          <XIcon className="h-5 w-5 shrink-0 fill-red-500 drop-shadow-lg md:h-6 md:w-6" />
          {isOpen && (
            <span className="whitespace-nowrap text-primary drop-shadow-lg">
              {t("app.name")}
            </span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={toggle}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className={cn("flex flex-col gap-1 py-4", isOpen ? "px-3" : "px-2")}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const linkContent = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors",
                isOpen ? "px-3" : "justify-center px-0",
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
              {isOpen && <span className="truncate">{item.label}</span>}
            </Link>
          );

          if (!isOpen) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right">{item.tooltip}</TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      {/* XP Badge - only when open */}
      {isOpen && (
        <div className="px-3 pb-4">
          <XpBadge />
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer controls */}
      <div
        className={cn(
          "flex items-center border-t border-border py-3",
          isOpen ? "justify-between gap-2 px-4" : "flex-col gap-3 px-2",
        )}
      >
        <ThemeToggle />
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </aside>
  );
}
