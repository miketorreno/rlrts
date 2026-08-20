"use client";

import { useTranslations } from "next-intl";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  return (
    <div className="container mx-auto max-w-7xl px-4 pt-16">
      <ErrorBoundary
        title={t("title")}
        description={t("dashboardError")}
        retryLabel={t("retry")}
        onRetry={reset}
      >
        <div />
      </ErrorBoundary>
    </div>
  );
}
