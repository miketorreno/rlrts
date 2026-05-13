"use client";

import { AuthenticationWrapper } from "@/components/authentication-wrapper";
import { TwigContainer } from "@/components/twig/twig-container";
import { ImportExport } from "@/components/twig/import-export";
// DEPRECATED
// import { YearlyOverview } from "@/components/twig/yearly-overview";
import { useTwigData } from "@/hooks/use-twig-data";
import { useDateRange } from "@/hooks/use-date-range";
import { useViewState } from "@/hooks/use-view-state";
import { memo, useMemo } from "react";

/**
 * Twig Page Component
 * Renders the main twig interface with support for month and year views.
 * Handles data fetching, view state management, and memoization for performance.
 */

// Memoize components to prevent unnecessary re-renders
const MemoizedTwigContainer = memo(TwigContainer);
// const MemoizedYearlyOverview = memo(YearlyOverview);

export default function TwigPage() {
  // Manage view state (monthRow/year) using custom hook
  const { view, setView } = useViewState();
  const isMonthView = view === "monthRow";

  // Fetch date ranges for both views to prevent loading states during transitions
  // Month view shows 40 days, year view shows 365 days
  const monthData = useDateRange(40);
  const yearData = useDateRange(365);

  // Fetch twig data (leaves, completions) for both views
  const monthViewData = useTwigData(monthData.startDate, monthData.today);
  // const yearViewData = useTwigData(yearData.startDate, yearData.today);

  // Select appropriate days range based on current view
  const days = isMonthView ? monthData.days : yearData.days;

  // Memoize twig data to prevent unnecessary re-renders
  const memoizedData = useMemo(
    () => ({
      twigs: monthViewData.twigs || [],
      leaves: monthViewData.leaves || [],
      completions: monthViewData.completions || [],
    }),
    [monthViewData.twigs, monthViewData.leaves, monthViewData.completions],
  );

  // Show loading state only during initial data fetch
  const isLoading =
    !monthViewData.twigs || !monthViewData.leaves || !monthViewData.completions;

  return (
    <div className="container mx-auto max-w-7xl pt-16">
      <AuthenticationWrapper>
        <>
          {/* Yearly overview component showing leaf completion heatmap */}
          {/* <MemoizedYearlyOverview
            completions={yearViewData.completions || []}
            leaves={memoizedData.leaves}
            twigs={memoizedData.twigs}
            isLoading={isLoading}
          /> */}

          {/* Main twig container with month/year view toggle */}
          <MemoizedTwigContainer
            twigView={view}
            twigs={memoizedData.twigs}
            completions={memoizedData.completions}
            days={days}
            leaves={memoizedData.leaves}
            monthViewData={monthViewData}
            onViewChange={setView}
            view={view}
            isLoading={isLoading}
          />

          {/* Import/Export functionality for twig data */}
          <div className="mx-4 my-8 justify-center">
            <ImportExport />
          </div>
        </>
      </AuthenticationWrapper>
    </div>
  );
}
