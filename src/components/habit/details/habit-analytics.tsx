"use client";

import { getChartRGBValues } from "@/lib/colors";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { Id } from "../../../../convex/_generated/dataModel";

// import { Id } from "@server/convex/_generated/dataModel";

/**
 * HabitAnalytics Component
 * A comprehensive analytics dashboard that visualizes habit tracking data through various charts.
 * Uses Chart.js for rendering different visualizations of habit completion patterns.
 */

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
);

// Global chart configuration with responsive design and mobile optimizations
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        maxRotation: 45,
        minRotation: 45,
        font: {
          size: window?.innerWidth < 640 ? 8 : 12,
        },
      },
      offset: window?.innerWidth < 640 ? false : true,
    },
    y: {
      grid: {
        color: "rgba(0, 0, 0, 0.1)",
      },
      beginAtZero: true,
      ticks: {
        font: {
          size: window?.innerWidth < 640 ? 8 : 12,
        },
        padding: window?.innerWidth < 640 ? 0 : 8,
      },
      offset: window?.innerWidth < 640 ? false : true,
    },
  },
  layout: {
    padding:
      window?.innerWidth < 640
        ? {
            left: 0,
            right: 0,
            top: 5,
            bottom: 0,
          }
        : {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10,
          },
  },
};

interface HabitAnalyticsProps {
  colorTheme: string; // Theme color for chart styling
  completions:
    | Array<{
        habitId: Id<"habits">;
        completedAt: number; // Unix timestamp of completion
      }>
    | undefined;
}

export function HabitAnalytics({
  colorTheme,
  completions,
}: HabitAnalyticsProps) {
  /**
   * Calculates streak history including both active streaks and off periods
   * @param completions - Array of habit completion records
   * @returns Object containing labels and data for active/off streaks
   */
  function calculateStreakHistory(
    completions: HabitAnalyticsProps["completions"],
  ) {
    if (!completions) return { labels: [], activeData: [], offData: [] };

    // Convert timestamps to date strings and sort chronologically
    const dates = completions
      .map((c) => new Date(c.completedAt).toISOString().split("T")[0])
      .sort();
    const uniqueDates = [...new Set(dates)];
    const streaks: { date: string; length: number; type: "active" | "off" }[] =
      [];

    if (uniqueDates.length === 0)
      return { labels: [], activeData: [], offData: [] };

    // Initialize streak tracking
    let currentStreak = 1;
    let streakStartDate = uniqueDates[0];

    // Check for initial off-streak before first completion
    const firstCompletionDate = new Date(uniqueDates[0]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysSinceStart = Math.floor(
      (firstCompletionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysSinceStart < -1) {
      streaks.push({
        date: today.toISOString().split("T")[0],
        length: Math.abs(daysSinceStart),
        type: "off",
      });
    }

    // Calculate streaks by analyzing consecutive dates
    for (let i = 1; i < uniqueDates.length; i++) {
      const curr = new Date(uniqueDates[i]);
      const prev = new Date(uniqueDates[i - 1]);
      const dayDiff = Math.floor(
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (dayDiff === 1) {
        currentStreak++;
      } else {
        // Add the active streak
        streaks.push({
          date: streakStartDate,
          length: currentStreak,
          type: "active",
        });
        // Add the off streak if there was a gap
        if (dayDiff > 1) {
          streaks.push({
            date: new Date(prev.getTime() + 86400000)
              .toISOString()
              .split("T")[0],
            length: dayDiff - 1,
            type: "off",
          });
        }
        currentStreak = 1;
        streakStartDate = uniqueDates[i];
      }
    }
    // Add the final active streak
    streaks.push({
      date: streakStartDate,
      length: currentStreak,
      type: "active",
    });

    // Check if there's a final off-streak after the last completion
    const lastCompletionDate = new Date(uniqueDates[uniqueDates.length - 1]);
    const daysSinceLastCompletion = Math.floor(
      (today.getTime() - lastCompletionDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysSinceLastCompletion > 1) {
      streaks.push({
        date: new Date(lastCompletionDate.getTime() + 86400000)
          .toISOString()
          .split("T")[0],
        length: daysSinceLastCompletion - 1,
        type: "off",
      });
    }

    // Get last 10 streaks for better visibility
    const lastStreaks = streaks.slice(-10);

    return {
      labels: lastStreaks.map((s) =>
        new Date(s.date).toLocaleDateString("default", {
          month: "short",
          day: "numeric",
        }),
      ),
      activeData: lastStreaks.map((s) =>
        s.type === "active" ? s.length : null,
      ),
      offData: lastStreaks.map((s) => (s.type === "off" ? s.length : null)),
    };
  }

  /**
   * Analyzes completion patterns by day of week
   * @param completions - Array of habit completion records
   * @returns Object containing labels and completion counts for each day
   */
  function calculateWeeklyPattern(
    completions: HabitAnalyticsProps["completions"],
  ) {
    if (!completions) return { labels: [], data: [] };

    const days =
      window?.innerWidth < 640
        ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        : [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ];
    const counts = new Array(7).fill(0);

    completions.forEach((c) => {
      const dayIndex = new Date(c.completedAt).getDay();
      counts[dayIndex]++;
    });

    return {
      labels: days,
      data: counts,
    };
  }

  /**
   * Aggregates completions by month to show long-term progress
   * @param completions - Array of habit completion records
   * @returns Object containing labels and monthly completion counts
   */
  function calculateMonthlyProgress(
    completions: HabitAnalyticsProps["completions"],
  ) {
    if (!completions) return { labels: [], data: [] };

    const monthlyData = completions.reduce(
      (acc, c) => {
        const date = new Date(c.completedAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const sortedEntries = Object.entries(monthlyData).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    const isMobile = window?.innerWidth < 640;

    return {
      labels: sortedEntries.map(([month]) => {
        const [year, monthNum] = month.split("-");
        const monthStr = new Date(0, Number(monthNum) - 1).toLocaleString(
          "default",
          { month: "short" },
        );
        return isMobile ? monthStr : `${monthStr} ${year}`;
      }),
      data: sortedEntries.map(([, count]) => count),
    };
  }

  /**
   * Analyzes completion patterns by time of day
   * Categorizes completions into Morning (6am-12pm), Afternoon (12pm-6pm),
   * Evening (6pm-12am), and Night (12am-6am)
   * @param completions - Array of habit completion records
   * @returns Object containing labels and completion counts for each time period
   */
  function calculateTimeOfDay(completions: HabitAnalyticsProps["completions"]) {
    if (!completions) return { labels: [], data: [] };

    const timeSlots = {
      Morning: 0, // 6am-12pm
      Afternoon: 0, // 12pm-6pm
      Evening: 0, // 6pm-12am
      Night: 0, // 12am-6am
    };

    completions.forEach((c) => {
      const hour = new Date(c.completedAt).getHours();
      if (hour >= 6 && hour < 12) timeSlots.Morning++;
      else if (hour >= 12 && hour < 18) timeSlots.Afternoon++;
      else if (hour >= 18) timeSlots.Evening++;
      else timeSlots.Night++;
    });

    return {
      labels: Object.keys(timeSlots),
      data: Object.values(timeSlots),
    };
  }

  // Calculate data for all charts
  const streakData = calculateStreakHistory(completions);
  const weeklyData = calculateWeeklyPattern(completions);
  const monthlyData = calculateMonthlyProgress(completions);
  const timeData = calculateTimeOfDay(completions);

  return (
    <div className="w-full">
      <h2 className="mb-4 text-lg font-semibold">Analysis</h2>
      {/* Grid layout for analytics charts with responsive design */}
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Streak History Chart */}
        <div className="h-[200px] w-full max-w-[300px] rounded-lg border p-2 pb-6 sm:h-[240px] sm:max-w-none sm:p-4 sm:pb-8">
          <h3 className="mb-2 text-sm text-muted-foreground">Streak History</h3>
          <Bar
            data={{
              labels: streakData.labels,
              datasets: [
                {
                  label: "Active Streaks",
                  data: streakData.activeData,
                  backgroundColor: `rgb(${getChartRGBValues(colorTheme, 500)})`,
                  borderColor: `rgb(${getChartRGBValues(colorTheme, 600)})`,
                  borderWidth: 1,
                  borderRadius: {
                    topLeft: 4,
                    topRight: 4,
                    bottomLeft: 4,
                    bottomRight: 4,
                  },
                  categoryPercentage: 0.8,
                  barPercentage: 0.9,
                },
                {
                  label: "Off Days",
                  data: streakData.offData,
                  backgroundColor: `rgb(${getChartRGBValues(colorTheme, 500)} / 0.2)`,
                  borderColor: `rgb(${getChartRGBValues(colorTheme, 500)} / 0.5)`,
                  borderWidth: 2,
                  borderRadius: {
                    topLeft: 20,
                    topRight: 20,
                    bottomLeft: 0,
                    bottomRight: 0,
                  },
                  borderSkipped: false,
                  categoryPercentage: 0.8,
                  barPercentage: 0.9,
                },
              ],
            }}
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  display: true,
                  position: "top",
                  labels: {
                    font: {
                      size: window?.innerWidth < 640 ? 8 : 12,
                    },
                  },
                },
              },
              scales: {
                x: {
                  ...chartOptions.scales.x,
                  stacked: true,
                  title: {
                    display: window?.innerWidth >= 640,
                    text: "Start Date",
                  },
                },
                y: {
                  ...chartOptions.scales.y,
                  stacked: false,
                  title: {
                    display: window?.innerWidth >= 640,
                    text: "Days",
                  },
                },
              },
            }}
          />
        </div>

        {/* Weekly Pattern Chart */}
        <div className="h-[200px] w-full max-w-[300px] rounded-lg border p-2 pb-6 sm:h-[240px] sm:max-w-none sm:p-4 sm:pb-8">
          <h3 className="mb-2 text-sm text-muted-foreground">Weekly Pattern</h3>
          <Line
            data={{
              labels: weeklyData.labels,
              datasets: [
                {
                  data: weeklyData.data,
                  borderColor: `rgb(${getChartRGBValues(colorTheme, 500)})`,
                  backgroundColor: `rgb(${getChartRGBValues(colorTheme, 300)} / 0.2)`,
                  borderWidth: 2,
                  tension: 0.4,
                  fill: true,
                  pointBackgroundColor: `rgb(${getChartRGBValues(colorTheme, 500)})`,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                },
              ],
            }}
            options={chartOptions}
          />
        </div>

        {/* Monthly Progress Chart */}
        <div className="h-[200px] w-full max-w-[300px] rounded-lg border p-2 pb-6 sm:h-[240px] sm:max-w-none sm:p-4 sm:pb-8">
          <h3 className="mb-2 text-sm text-muted-foreground">
            Monthly Progress
          </h3>
          <Line
            data={{
              labels: monthlyData.labels,
              datasets: [
                {
                  data: monthlyData.data,
                  borderColor: `rgb(${getChartRGBValues(colorTheme, 500)})`,
                  backgroundColor: `rgb(${getChartRGBValues(colorTheme, 300)} / 0.2)`,
                  borderWidth: 2,
                  tension: 0.4,
                  fill: true,
                },
              ],
            }}
            options={chartOptions}
          />
        </div>

        {/* Time of Day Chart */}
        <div className="h-[200px] w-full max-w-[300px] rounded-lg border p-2 pb-6 sm:h-[240px] sm:max-w-none sm:p-4 sm:pb-8">
          <h3 className="mb-2 text-sm text-muted-foreground">Time of Day</h3>
          <Line
            data={{
              labels: timeData.labels,
              datasets: [
                {
                  data: timeData.data,
                  borderColor: `rgb(${getChartRGBValues(colorTheme, 500)})`,
                  backgroundColor: `rgb(${getChartRGBValues(colorTheme, 300)} / 0.2)`,
                  borderWidth: 2,
                  tension: 0.4,
                  fill: true,
                  pointBackgroundColor: `rgb(${getChartRGBValues(colorTheme, 500)})`,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                },
              ],
            }}
            options={chartOptions}
          />
        </div>
      </div>
    </div>
  );
}
