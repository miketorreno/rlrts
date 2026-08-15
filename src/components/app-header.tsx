"use client";

import { Link } from "@/i18n/routing";
// import { Show, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Show, UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { XIcon } from "./ui/x-icon";

/**
 * AppHeader Component
 *
 * A responsive navigation header component that includes:
 * - Logo and brand name
 * - Navigation links (desktop)
 * - Mobile menu toggle
 * - Theme toggle
 * - Authentication-based actions (Sign in/User button)
 */

export function AppHeader() {
  const t = useTranslations("nav");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background/60">
      <div className="container mx-auto px-3 md:px-4">
        <div className="relative flex h-14 items-center justify-between md:h-16">
          {/* Logo */}
          <div className="flex shrink-0 items-center">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-lg font-bold md:gap-2 md:text-xl"
            >
              <XIcon className="h-5 w-5 shrink-0 fill-red-500 drop-shadow-lg md:h-6 md:w-6" />
              <span className="whitespace-nowrap text-primary drop-shadow-lg">
                {t("app.name")}
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex">
            <Link
              href="/trunks"
              className="text-xs font-medium hover:text-muted-foreground md:text-sm"
            >
              {t("trunks")}
            </Link>
            <Link
              href="/limb"
              className="text-xs font-medium hover:text-muted-foreground md:text-sm"
            >
              {t("limb")}
            </Link>
            <Link
              href="/branch"
              className="text-xs font-medium hover:text-muted-foreground md:text-sm"
            >
              {t("branch")}
            </Link>
            <Link
              href="/twig"
              className="text-xs font-medium hover:text-muted-foreground md:text-sm"
            >
              {t("twig")}
            </Link>
            {/* <Link
              href="/about"
              className="text-xs font-medium hover:text-muted-foreground md:text-sm"
            >
              {t("about")}
            </Link>
            <Link
              href="/pricing"
              className="text-xs font-medium hover:text-muted-foreground md:text-sm"
            >
              {t("pricing")}
            </Link> */}
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
            <ThemeToggle />
            <Show when="signed-out">
              <Button
                asChild
                size="sm"
                className="h-8 text-xs md:h-9 md:text-sm"
              >
                <Link href="/pricing">{t("getStarted")}</Link>
              </Button>
            </Show>
            {/* <SignedOut>
              <Button
                asChild
                size="sm"
                className="h-8 text-xs md:h-9 md:text-sm"
              >
                <Link href="/pricing">{t("getStarted")}</Link>
              </Button>
            </SignedOut> */}
            {/* TODO: 2025-01-05 - what is this? */}
            <div className="flex scale-100 md:mx-2 md:scale-110">
              <Show when="signed-in">
                <UserButton />
              </Show>
              {/* <SignedIn>
                <UserButton />
              </SignedIn> */}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="bg-background md:hidden">
            <div className="flex flex-col space-y-4">
              <Link
                href="/trunks"
                className="font-medium hover:text-muted-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("trunks")}
              </Link>
              <Link
                href="/limb"
                className="font-medium hover:text-muted-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("limb")}
              </Link>
              <Link
                href="/branch"
                className="font-medium hover:text-muted-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("branch")}
              </Link>
              <Link
                href="/twig"
                className="font-medium hover:text-muted-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("twig")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
