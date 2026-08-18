"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Trophy, CheckCircle } from "lucide-react";
import { levelFromXp, xpInCurrentLevel } from "@/lib/xp";

export function HeroStats() {
  const t = useTranslations("dashboard");
  const profile = useQuery(api.xp.getXpProfile, {});
  const leaves = useQuery(api.leaves.list, {});
  const todos = useQuery(api.todos.list, {});

  const level = profile?.level ?? 0;
  const lifetimeXp = profile?.lifetimeXp ?? 0;
  const currentStreak = profile?.currentStreak ?? 0;
  const longestStreak = profile?.longestStreak ?? 0;
  const xpInLevel = profile ? xpInCurrentLevel(lifetimeXp) : 0;
  const xpForNext = profile ? profile.xpForNextLevel - levelFromXp(lifetimeXp) * levelFromXp(lifetimeXp) * 100 : 100;
  const progressPercent = xpForNext > 0 ? Math.min((xpInLevel / xpForNext) * 100, 100) : 0;

  const today = new Date().toISOString().split("T")[0];
  const habitsDone = leaves?.filter((leaf) => {
    // Count leaves that were completed today (this is a simplification)
    return false;
  }).length ?? 0;

  const todosDone = todos?.completions?.filter((c) => {
    const cDate = new Date(c.completedAt).toISOString().split("T")[0];
    return cDate === today;
  }).length ?? 0;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-muted-foreground">
            {t("level")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-3xl font-bold">{level}</div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {lifetimeXp.toLocaleString()} XP
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-muted-foreground">
            {t("currentStreak")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            <span className="text-3xl font-bold">{currentStreak}</span>
            <span className="text-sm text-muted-foreground">{t("days")}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-muted-foreground">
            {t("longestStreak")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <span className="text-3xl font-bold">{longestStreak}</span>
            <span className="text-sm text-muted-foreground">{t("days")}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-muted-foreground">
            {t("todaysProgress")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <div className="space-y-1">
              <p className="text-sm">
                {t("habitsCompleted")}: {habitsDone}
              </p>
              <p className="text-sm">
                {t("todosCompleted")}: {todosDone}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
