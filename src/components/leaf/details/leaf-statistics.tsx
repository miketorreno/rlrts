"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { streakMultiplier } from "@/lib/xp";
import NumberFlow from "@number-flow/react";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

import { LeafAnalytics } from "./leaf-analytics";
import { Id } from "../../../../convex/_generated/dataModel";

interface LeafStatisticsProps {
  leafId: Id<"leaves">;
  colorTheme: string;
  completions:
    | Array<{
        leafId: Id<"leaves">;
        completedAt: number;
      }>
    | undefined;
}

export function LeafStatistics({
  leafId,
  colorTheme,
  completions,
}: LeafStatisticsProps) {
  const totalCompletions =
    completions?.filter((c) => c.leafId === leafId).length ?? 0;

  const thisMonthCompletions =
    completions?.filter((c) => {
      const date = new Date(c.completedAt);
      const now = new Date();
      return (
        c.leafId === leafId &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length ?? 0;

  const currentStreak = (() => {
    if (!completions) return 0;

    const dates = completions
      .filter((c) => c.leafId === leafId)
      .map((c) => new Date(c.completedAt).toISOString().split("T")[0])
      .sort();

    if (dates.length === 0) return 0;

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    const uniqueDates = [...new Set(dates)];

    if (!uniqueDates.includes(today) && !uniqueDates.includes(yesterday)) {
      return 0;
    }

    let streak = 0;
    for (let i = uniqueDates.length - 1; i >= 0; i--) {
      const date = new Date(uniqueDates[i]);

      if (i < uniqueDates.length - 1) {
        const prevDate = new Date(uniqueDates[i + 1]);
        const dayDiff = Math.floor(
          (prevDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (dayDiff > 1) break;
      }

      streak++;
    }

    return streak;
  })();

  const offStreak = (() => {
    if (!completions || currentStreak > 0) return 0;

    const dates = completions
      .filter((c) => c.leafId === leafId)
      .map((c) => new Date(c.completedAt).toISOString().split("T")[0])
      .sort();

    if (dates.length === 0) {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return (
        Math.floor(
          (today.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1
      );
    }

    const lastCompletionDate = new Date(dates[dates.length - 1]);
    const today = new Date();
    return Math.floor(
      (today.getTime() - lastCompletionDate.getTime()) / (1000 * 60 * 60 * 24),
    );
  })();

  const multiplier = streakMultiplier(currentStreak);
  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0,
  ).getDate();
  const monthProgress = Math.min((thisMonthCompletions / daysInMonth) * 100, 100);

  return (
    <div className="flex flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <Badge variant="secondary" className="text-lg font-bold">
                  <NumberFlow value={currentStreak} />
                  {currentStreak > 0 && (
                    <TrendingUp className="ml-1 h-3 w-3 text-green-500" />
                  )}
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Off Days</p>
                <Badge variant="secondary" className="text-lg font-bold">
                  <NumberFlow value={offStreak} />
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">This Month</p>
                <Badge variant="secondary" className="text-lg font-bold">
                  <NumberFlow value={thisMonthCompletions} />
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Total Completions
                </p>
                <Badge variant="secondary" className="text-lg font-bold">
                  <NumberFlow value={totalCompletions} />
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Multiplier</p>
                </div>
                <Badge variant="secondary" className="text-lg font-bold">
                  {multiplier > 1 ? `x${multiplier.toFixed(1)}` : "1.0x"}
                </Badge>
              </div>
            </div>

            {monthProgress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Monthly completion rate
                  </span>
                  <span className="font-medium">
                    {Math.round(monthProgress)}%
                  </span>
                </div>
                <Progress value={monthProgress} className="h-2" />
              </div>
            )}

            <LeafAnalytics
              colorTheme={colorTheme}
              completions={completions?.filter((c) => c.leafId === leafId)}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
