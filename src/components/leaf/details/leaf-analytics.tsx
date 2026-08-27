"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
          size: 10,
        },
      },
      offset: true,
    },
    y: {
      grid: {
        color: "rgb(0 0 0 / 0.06)",
      },
      beginAtZero: true,
      ticks: {
        font: {
          size: 10,
        },
        padding: 8,
      },
      offset: true,
    },
  },
  layout: {
    padding: {
      left: 10,
      right: 10,
      top: 10,
      bottom: 10,
    },
  },
};

interface LeafAnalyticsProps {
  completions:
    | Array<{
        leafId: Id<"leaves">;
        completedAt: number;
      }>
    | undefined;
}

export function LeafAnalytics({ completions }: LeafAnalyticsProps) {
  function calculateStreakHistory(
    completions: LeafAnalyticsProps["completions"],
  ) {
    if (!completions) return { labels: [], activeData: [], offData: [] };

    const dates = completions
      .map((c) => new Date(c.completedAt).toISOString().split("T")[0])
      .sort();
    const uniqueDates = [...new Set(dates)];
    const streaks: { date: string; length: number; type: "active" | "off" }[] =
      [];

    if (uniqueDates.length === 0)
      return { labels: [], activeData: [], offData: [] };

    let currentStreak = 1;
    let streakStartDate = uniqueDates[0];

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

    for (let i = 1; i < uniqueDates.length; i++) {
      const curr = new Date(uniqueDates[i]);
      const prev = new Date(uniqueDates[i - 1]);
      const dayDiff = Math.floor(
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (dayDiff === 1) {
        currentStreak++;
      } else {
        streaks.push({
          date: streakStartDate,
          length: currentStreak,
          type: "active",
        });
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
    streaks.push({
      date: streakStartDate,
      length: currentStreak,
      type: "active",
    });

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

  function calculateWeeklyPattern(
    completions: LeafAnalyticsProps["completions"],
  ) {
    if (!completions) return { labels: [], data: [] };

    const counts = new Array(7).fill(0);

    completions.forEach((c) => {
      const dayIndex = new Date(c.completedAt).getDay();
      counts[dayIndex]++;
    });

    return {
      labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      data: counts,
    };
  }

  function calculateMonthlyProgress(
    completions: LeafAnalyticsProps["completions"],
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

    return {
      labels: sortedEntries.map(([month]) => {
        const [year, monthNum] = month.split("-");
        const monthStr = new Date(0, Number(monthNum) - 1).toLocaleString(
          "default",
          { month: "short" },
        );
        return `${monthStr} ${year}`;
      }),
      data: sortedEntries.map(([, count]) => count),
    };
  }

  function calculateTimeOfDay(completions: LeafAnalyticsProps["completions"]) {
    if (!completions) return { labels: [], data: [] };

    const timeSlots = {
      Morning: 0,
      Afternoon: 0,
      Evening: 0,
      Night: 0,
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

  const streakData = calculateStreakHistory(completions);
  const weeklyData = calculateWeeklyPattern(completions);
  const monthlyData = calculateMonthlyProgress(completions);
  const timeData = calculateTimeOfDay(completions);

  return (
    <div className="w-full space-y-4">
      <div className="space-y-1">
        <CardTitle className="text-base">Analysis</CardTitle>
        <CardDescription>
          Insights into your habit patterns over time.
        </CardDescription>
      </div>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <ChartCard title="Streak History" description="Active vs rest periods">
          <Bar
            data={{
              labels: streakData.labels,
              datasets: [
                {
                  label: "Active Streaks",
                  data: streakData.activeData,
                  backgroundColor: "var(--chart-1)",
                  borderColor: "var(--chart-5)",
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
                  backgroundColor: "color-mix(in oklch, var(--chart-1) 20%, transparent)",
                  borderColor: "color-mix(in oklch, var(--chart-1) 50%, transparent)",
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
                      size: 10,
                    },
                  },
                },
              },
              scales: {
                x: {
                  ...chartOptions.scales.x,
                  stacked: true,
                  title: {
                    display: true,
                    text: "Start Date",
                  },
                },
                y: {
                  ...chartOptions.scales.y,
                  stacked: false,
                  title: {
                    display: true,
                    text: "Days",
                  },
                },
              },
            }}
          />
        </ChartCard>

        <ChartCard title="Weekly Pattern" description="Completions by day of week">
          <Line
            data={{
              labels: weeklyData.labels,
              datasets: [
                {
                  data: weeklyData.data,
                  borderColor: "var(--chart-1)",
                  backgroundColor: "color-mix(in oklch, var(--chart-2) 20%, transparent)",
                  borderWidth: 2,
                  tension: 0.4,
                  fill: true,
                  pointBackgroundColor: "var(--chart-1)",
                  pointRadius: 4,
                  pointHoverRadius: 6,
                },
              ],
            }}
            options={chartOptions}
          />
        </ChartCard>

        <ChartCard title="Monthly Progress" description="Completions per month">
          <Line
            data={{
              labels: monthlyData.labels,
              datasets: [
                {
                  data: monthlyData.data,
                  borderColor: "var(--chart-1)",
                  backgroundColor: "color-mix(in oklch, var(--chart-2) 20%, transparent)",
                  borderWidth: 2,
                  tension: 0.4,
                  fill: true,
                },
              ],
            }}
            options={chartOptions}
          />
        </ChartCard>

        <ChartCard title="Time of Day" description="When you complete habits">
          <Line
            data={{
              labels: timeData.labels,
              datasets: [
                {
                  data: timeData.data,
                  borderColor: "var(--chart-1)",
                  backgroundColor: "color-mix(in oklch, var(--chart-2) 20%, transparent)",
                  borderWidth: 2,
                  tension: 0.4,
                  fill: true,
                  pointBackgroundColor: "var(--chart-1)",
                  pointRadius: 4,
                  pointHoverRadius: 6,
                },
              ],
            }}
            options={chartOptions}
          />
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="h-[200px] sm:h-[240px]">{children}</CardContent>
    </Card>
  );
}
