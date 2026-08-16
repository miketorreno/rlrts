"use client";

import { motion } from "framer-motion";

import { useNavItems } from "@/components/layout/nav-items";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * BottomNav Component
 *
 * A fixed mobile-only bottom navigation bar (hidden at `md` and up).
 * Icon-only nav items with an animated active pill that slides between
 * items via a shared framer-motion `layoutId`. Padded for the iOS safe
 * area and laid out with direction-agnostic flex utilities.
 */

export function BottomNav() {
  const pathname = usePathname();
  const navItems = useNavItems();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/60 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex flex-1 items-center justify-center py-3 text-muted-foreground transition-colors",
                isActive && "text-primary",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-lg bg-primary/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className="relative size-5" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
