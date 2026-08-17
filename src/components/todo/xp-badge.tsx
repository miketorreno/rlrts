"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { Flame, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../../../convex/_generated/api";

// TODO: Replace hardcoded strings with useTranslations("xp") once Task 8 adds i18n keys

export function XpBadge() {
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
          Lv.{profile.level}
        </span>
        <span className="text-xs text-muted-foreground">
          {profile.lifetimeXp.toLocaleString()} XP
        </span>
        {profile.currentStreak > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-orange-500">
            <Flame className="size-3" />
            {profile.currentStreak}
          </span>
        )}
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
