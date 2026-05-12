"use client";

import { Card } from "@/components/ui/card";
import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";

// import { Id } from "@server/convex/_generated/dataModel";

import { HabitAnalytics } from "./habit-analytics";
import { Id } from "../../../../convex/_generated/dataModel";

/**
 * HabitStatistics Component
 * Displays statistical information about a habit's completion patterns including:
 * - Current streak
 * - Days since last completion (off streak)
 * - Monthly completions
 * - Total completions
 * Also renders a visual analytics component for the habit data
 */

interface HabitStatisticsProps {
  habitId: Id<"habits">;
  colorTheme: string;
  completions:
    | Array<{
        habitId: Id<"habits">;
        completedAt: number;
      }>
    | undefined;
}

export function HabitStatistics({
  habitId,
  colorTheme,
  completions,
}: HabitStatisticsProps) {
  // Calculate total number of times this habit was completed
  const totalCompletions =
    completions?.filter((c) => c.habitId === habitId).length ?? 0;

  // Calculate completions for the current month only
  const thisMonthCompletions =
    completions?.filter((c) => {
      const date = new Date(c.completedAt);
      const now = new Date();
      return (
        c.habitId === habitId &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length ?? 0;

  /**
   * Calculates the current streak of consecutive days the habit was completed
   * A streak is broken if:
   * 1. No completions exist
   * 2. Neither today nor yesterday has a completion
   * 3. There's a gap of more than 1 day between completions
   */
  const currentStreak = (() => {
    if (!completions) return 0;

    // Convert completion timestamps to date strings (YYYY-MM-DD format) and sort
    const dates = completions
      .filter((c) => c.habitId === habitId)
      .map((c) => new Date(c.completedAt).toISOString().split("T")[0])
      .sort();

    if (dates.length === 0) return 0;

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    // Remove duplicate dates to ensure accurate streak counting
    const uniqueDates = [...new Set(dates)];

    // Break streak if neither today nor yesterday has a completion
    if (!uniqueDates.includes(today) && !uniqueDates.includes(yesterday)) {
      return 0;
    }

    // Count consecutive days backwards from the most recent completion
    let streak = 0;
    for (let i = uniqueDates.length - 1; i >= 0; i--) {
      const date = new Date(uniqueDates[i]);

      if (i < uniqueDates.length - 1) {
        const prevDate = new Date(uniqueDates[i + 1]);
        const dayDiff = Math.floor(
          (prevDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
        );

        // Break if there's a gap larger than 1 day
        if (dayDiff > 1) break;
      }

      streak++;
    }

    return streak;
  })();

  /**
   * Calculates the number of days since the last habit completion
   * If there's a current streak or no completions, starts counting from the beginning of the month
   */
  const offStreak = (() => {
    if (!completions || currentStreak > 0) return 0;

    const dates = completions
      .filter((c) => c.habitId === habitId)
      .map((c) => new Date(c.completedAt).toISOString().split("T")[0])
      .sort();

    // If no completions exist, count days since start of month
    if (dates.length === 0) {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return (
        Math.floor(
          (today.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1
      );
    }

    // Calculate days since last completion
    const lastCompletionDate = new Date(dates[dates.length - 1]);
    const today = new Date();
    return Math.floor(
      (today.getTime() - lastCompletionDate.getTime()) / (1000 * 60 * 60 * 24),
    );
  })();

  return (
    <div className="flex flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-[800px] border p-2 shadow-md">
          <div className="p-4">
            <h2 className="mb-4 text-lg font-semibold">Statistics</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="text-2xl font-bold">
                <NumberFlow value={currentStreak} />
              </p>

              <p className="text-sm text-muted-foreground">Off Days</p>
              <p className="text-2xl font-bold">
                <NumberFlow value={offStreak} />
              </p>

              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">
                <NumberFlow value={thisMonthCompletions} />
              </p>

              <p className="text-sm text-muted-foreground">Total Completions</p>
              <p className="text-2xl font-bold">
                <NumberFlow value={totalCompletions} />
              </p>
            </div>

            {/* Visual analytics section */}

            <HabitAnalytics
              colorTheme={colorTheme}
              completions={completions?.filter((c) => c.habitId === habitId)}
            />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
