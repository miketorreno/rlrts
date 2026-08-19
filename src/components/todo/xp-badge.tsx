"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { Flame, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { api } from "../../../convex/_generated/api";
import { streakMultiplier } from "@/lib/xp";

export function XpBadge() {
  const t = useTranslations("xp");
  const { isAuthenticated } = useConvexAuth();
  const profile = useQuery(
    api.xp.getXpProfile,
    isAuthenticated ? {} : "skip",
  );

  if (!isAuthenticated || profile === undefined) return null;

  const progress =
    profile.xpForNextLevel > 0
      ? (profile.xpInCurrentLevel /
          (profile.xpForNextLevel - profile.level * profile.level * 100)) *
        100
      : 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-yellow-500/10 px-2 py-1 text-sm font-semibold text-yellow-600 dark:text-yellow-400">
          <Sparkles className="size-4 shrink-0" aria-hidden="true" />
          {t("level", { level: profile.level })}
        </span>
        <span className="text-xs text-muted-foreground">
          {t("total", { count: profile.lifetimeXp.toLocaleString() })}
        </span>
        {profile.currentStreak > 0 && (() => {
          const multiplier = streakMultiplier(profile.currentStreak);
          return (
            <>
              <span className="inline-flex items-center gap-1 text-xs text-orange-500">
                <Flame className="size-3" />
                {t("streak", { count: profile.currentStreak })}
              </span>
              {multiplier > 1 && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                  x{multiplier.toFixed(1)}
                </span>
              )}
            </>
          );
        })()}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-yellow-500"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
