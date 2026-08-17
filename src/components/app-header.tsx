"use client";

import { Show, UserButton } from "@clerk/nextjs";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";

import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { XIcon } from "./ui/x-icon";

/**
 * AppHeader Component
 *
 * A slim mobile-only top bar (hidden at `md` and up where the AppSidebar takes
 * over). Contains the logo, theme toggle, and auth controls (sign-in button
 * when signed out, user button when signed in).
 */

export function AppHeader() {
  const t = useTranslations("nav");

  return (
    <header className="border-b border-border bg-background/60 md:hidden">
      <div className="flex h-14 items-center justify-between gap-2 px-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 text-lg font-bold">
          <XIcon className="h-5 w-5 shrink-0 fill-red-500 drop-shadow-lg" />
          <span className="whitespace-nowrap text-primary drop-shadow-lg">
            {t("app.name")}
          </span>
        </Link>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Show when="signed-out">
            <Button asChild size="sm" className="h-8 text-xs">
              <Link href="/pricing">{t("getStarted")}</Link>
            </Button>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
}
