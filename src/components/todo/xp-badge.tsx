"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { api } from "../../../convex/_generated/api";

export function XpBadge() {
  const t = useTranslations("xp");
  const { isAuthenticated } = useConvexAuth();
  const xp = useQuery(api.todos.getXp, isAuthenticated ? {} : "skip");

  if (!isAuthenticated || xp === undefined) return null;

  return (
    <span
      aria-label={t("points")}
      className="inline-flex items-center gap-1.5 rounded-md bg-yellow-500/10 px-2 py-1 text-sm font-semibold text-yellow-600 dark:text-yellow-400"
    >
      <Sparkles className="size-4 shrink-0" aria-hidden="true" />
      {xp.xp}
    </span>
  );
}
