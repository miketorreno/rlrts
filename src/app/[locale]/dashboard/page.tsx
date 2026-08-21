"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "@/i18n/routing";
import { useEffect, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useUser } from "@clerk/nextjs";
import { HeroStats } from "@/components/dashboard/hero-stats";
import { EntityCounts } from "@/components/dashboard/entity-counts";
import { CompletionCharts } from "@/components/dashboard/completion-charts";
import { ActivityFeed } from "@/components/dashboard/activity-feed";

function getGreetingKey(hour: number): "morning" | "afternoon" | "evening" {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  return "evening";
}

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const router = useRouter();
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const { user } = useUser();

  const stats = useQuery(api.dashboard.getDashboardStats);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [authLoading, isAuthenticated, router]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return t(`greeting.${getGreetingKey(hour)}`);
  }, [t]);

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date());
  }, [locale]);

  const firstName = user?.firstName ?? "";

  if (authLoading || !isAuthenticated || stats === undefined) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-8 pt-16 px-4">
      <div>
        <h1 className="text-2xl font-bold">
          {greeting}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="text-muted-foreground">{formattedDate}</p>
      </div>

      <HeroStats xpProfile={stats.xpProfile} todayProgress={stats.todayProgress} />

      <EntityCounts counts={stats.counts} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <CompletionCharts
            todayCompletions={stats.chartCompletions ?? []}
            todoCompletions={stats.chartTodoCompletions ?? []}
          />
        </div>
        <div className="space-y-6">
          <ActivityFeed recentEvents={stats.recentEvents} />
        </div>
      </div>
    </div>
  );
}
