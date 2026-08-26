"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { streakMultiplier } from "@/lib/xp";
import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/utils";
import { Flame, TrendingUp, Zap } from "lucide-react";
import { motion } from "framer-motion";

import { LeafAnalytics } from "./leaf-analytics";
import { Id } from "../../../../convex/_generated/dataModel";

interface LeafStatisticsProps {
  leafId: Id<"leaves">;
  completions:
    | Array<{
        leafId: Id<"leaves">;
        completedAt: number;
      }>
    | undefined;
}

export function LeafStatistics({
  leafId,
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
    <div className="flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <StatCard
                icon={<Flame className="h-4 w-4" />}
                label="Current Streak"
                value={currentStreak}
                highlight={currentStreak > 0}
              />
              <StatCard
                label="Off Days"
                value={offStreak}
                variant={offStreak > 0 ? "destructive" : "secondary"}
              />
              <StatCard
                label="This Month"
                value={thisMonthCompletions}
                highlight={thisMonthCompletions > 0}
              />
              <StatCard
                label="Total"
                value={totalCompletions}
              />
              <StatCard
                icon={<Zap className="h-4 w-4" />}
                label="Multiplier"
                value={multiplier}
                suffix="x"
                decimals={1}
                highlight={multiplier > 1}
              />
            </div>

            {monthProgress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Monthly completion rate
                  </span>
                  <span className="font-medium text-primary">
                    {Math.round(monthProgress)}%
                  </span>
                </div>
                <Progress value={monthProgress} className="h-2" />
              </div>
            )}

            <LeafAnalytics
              completions={completions?.filter((c) => c.leafId === leafId)}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  highlight,
  variant = "secondary",
  decimals = 0,
}: {
  icon?: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  highlight?: boolean;
  variant?: "secondary" | "destructive";
  decimals?: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        {icon}
        <p className="text-muted-foreground text-xs">{label}</p>
      </div>
      <Badge
        variant={variant}
        className={cn(
          "w-full justify-center text-lg font-bold",
          highlight && "bg-primary/10 text-primary",
        )}
      >
        {decimals > 0 ? value.toFixed(decimals) : <NumberFlow value={value} />}
        {suffix && <span className="ml-0.5 text-xs font-normal">{suffix}</span>}
      </Badge>
    </div>
  );
}


