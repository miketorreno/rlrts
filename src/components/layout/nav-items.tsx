"use client";

import { CalendarDays, GitBranch, Network, TreePine } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export type NavItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { href: "/trunks", labelKey: "nav.trunks", icon: TreePine },
  { href: "/limbs", labelKey: "nav.limbs", icon: GitBranch },
  { href: "/branches", labelKey: "nav.branches", icon: Network },
  { href: "/twig", labelKey: "nav.twig", icon: CalendarDays },
];

export type ResolvedNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function useNavItems(): ResolvedNavItem[] {
  const t = useTranslations();
  return navItems.map((item) => ({
    href: item.href,
    label: t(item.labelKey),
    icon: item.icon,
  }));
}
