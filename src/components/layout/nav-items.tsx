"use client";

import {
  CalendarDays,
  CheckSquare,
  GitBranch,
  Network,
  TreePine,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export type NavItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  tooltipKey: string;
};

export const navItems: NavItem[] = [
  { href: "/trunks", labelKey: "nav.trunks", icon: TreePine, tooltipKey: "nav.trunks" },
  { href: "/limbs", labelKey: "nav.limbs", icon: GitBranch, tooltipKey: "nav.limbs" },
  { href: "/branches", labelKey: "nav.branches", icon: Network, tooltipKey: "nav.branches" },
  { href: "/twig", labelKey: "nav.twig", icon: CalendarDays, tooltipKey: "nav.twig" },
  { href: "/todos", labelKey: "nav.todos", icon: CheckSquare, tooltipKey: "nav.todos" },
];

export type ResolvedNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  tooltip: string;
};

export function useNavItems(): ResolvedNavItem[] {
  const t = useTranslations();
  return navItems.map((item) => ({
    href: item.href,
    label: t(item.labelKey),
    icon: item.icon,
    tooltip: t(item.tooltipKey),
  }));
}
