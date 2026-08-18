"use client";

import { useConvexAuth } from "convex/react";
import { useRouter } from "@/i18n/routing";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { HeroStats } from "@/components/dashboard/hero-stats";
import { EntityCounts } from "@/components/dashboard/entity-counts";
import { CompletionCharts } from "@/components/dashboard/completion-charts";
import { ActivityFeed } from "@/components/dashboard/activity-feed";

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const t = useTranslations("dashboard");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || (!isLoading && !isAuthenticated)) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6 pt-16">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <HeroStats />
      <EntityCounts />
      <CompletionCharts />
      <ActivityFeed />
    </div>
  );
}
