"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getChartRGBValues } from "@/lib/colors";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
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
      grid: { display: false },
      ticks: { font: { size: 12 } },
    },
    y: {
      grid: { color: "rgba(0, 0, 0, 0.1)" },
      beginAtZero: true,
      ticks: { font: { size: 12 }, stepSize: 1 },
    },
  },
};

export function CompletionCharts() {
  const t = useTranslations("dashboard");

  const dateRange = useMemo(() => {
    const now = new Date().getTime();
    return {
      startDate: now - 28 * 24 * 60 * 60 * 1000,
      endDate: now,
    };
  }, []);

  const habitCompletions = useQuery(api.leaves.getCompletions, dateRange);
  const todoData = useQuery(api.todos.list, {});

  const { weeklyLabels, habitDaily, todoDaily } = useMemo(() => {
    const now = new Date();
    const labels: string[] = [];
    const hDaily: number[] = [];
    const tDaily: number[] = [];

    for (let i = 27; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      labels.push(
        d.toLocaleDateString("default", { month: "short", day: "numeric" }),
      );
      hDaily.push(
        habitCompletions?.completions.filter(
          (c) => new Date(c.completedAt).toISOString().split("T")[0] === key,
        ).length ?? 0,
      );
      tDaily.push(
        todoData?.completions.filter(
          (c) => new Date(c.completedAt).toISOString().split("T")[0] === key,
        ).length ?? 0,
      );
    }

    return { weeklyLabels: labels, habitDaily: hDaily, todoDaily: tDaily };
  }, [habitCompletions, todoData]);

  const { monthlyLabels, monthlyCounts } = useMemo(() => {
    const monthlyMap: Record<string, number> = {};

    habitCompletions?.completions.forEach((c) => {
      const d = new Date(c.completedAt);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap[k] = (monthlyMap[k] ?? 0) + 1;
    });
    todoData?.completions.forEach((c) => {
      const d = new Date(c.completedAt);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap[k] = (monthlyMap[k] ?? 0) + 1;
    });

    const sorted = Object.entries(monthlyMap).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    const labels = sorted.map(([m]) => {
      const [year, monthNum] = m.split("-");
      return `${new Date(0, Number(monthNum) - 1).toLocaleString("default", { month: "short" })} ${year}`;
    });
    const counts = sorted.map(([, v]) => v);

    return { monthlyLabels: labels, monthlyCounts: counts };
  }, [habitCompletions, todoData]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            {t("weeklyCompletions")}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[240px]">
          <Bar
            data={{
              labels: weeklyLabels,
              datasets: [
                {
                  label: t("habitsCompleted"),
                  data: habitDaily,
                  backgroundColor: `rgb(${getChartRGBValues("bg-green-500", 500)})`,
                  borderRadius: 2,
                },
                {
                  label: t("todosCompleted"),
                  data: todoDaily,
                  backgroundColor: `rgb(${getChartRGBValues("bg-blue-500", 500)})`,
                  borderRadius: 2,
                },
              ],
            }}
            options={{
              ...chartOptions,
              plugins: {
                legend: {
                  display: true,
                  position: "top",
                  labels: { font: { size: 12 } },
                },
              },
              scales: {
                x: {
                  ...chartOptions.scales.x,
                  stacked: true,
                },
                y: {
                  ...chartOptions.scales.y,
                  stacked: true,
                },
              },
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            {t("monthlyProgress")}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[240px]">
          <Line
            data={{
              labels: monthlyLabels,
              datasets: [
                {
                  label: t("title"),
                  data: monthlyCounts,
                  borderColor: `rgb(${getChartRGBValues("bg-green-500", 500)})`,
                  backgroundColor: `rgb(${getChartRGBValues("bg-green-500", 300)} / 0.2)`,
                  borderWidth: 2,
                  tension: 0.4,
                  fill: true,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                },
              ],
            }}
            options={chartOptions}
          />
        </CardContent>
      </Card>
    </div>
  );
}
