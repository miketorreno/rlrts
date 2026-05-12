"use client";

import { AuthenticationWrapper } from "@/components/authentication-wrapper";
import { CalendarContainer } from "@/components/calendar/calendar-container";
import { ImportExport } from "@/components/calendar/import-export";
// DEPRECATED
// import { YearlyOverview } from "@/components/calendar/yearly-overview";
import { useCalendarData } from "@/hooks/use-calendar-data";
import { useDateRange } from "@/hooks/use-date-range";
import { useViewState } from "@/hooks/use-view-state";
import { memo, useMemo } from "react";

/**
 * Calendar Page Component
 * Renders the main calendar interface with support for month and year views.
 * Handles data fetching, view state management, and memoization for performance.
 */

// Memoize components to prevent unnecessary re-renders
const MemoizedCalendarContainer = memo(CalendarContainer);
// const MemoizedYearlyOverview = memo(YearlyOverview);

export default function CalendarPage() {
  // Manage view state (monthRow/year) using custom hook
  const { view, setView } = useViewState();
  const isMonthView = view === "monthRow";

  // Fetch date ranges for both views to prevent loading states during transitions
  // Month view shows 40 days, year view shows 365 days
  const monthData = useDateRange(40);
  const yearData = useDateRange(365);

  // Fetch calendar data (habits, completions) for both views
  const monthViewData = useCalendarData(monthData.startDate, monthData.today);
  // const yearViewData = useCalendarData(yearData.startDate, yearData.today);

  // Select appropriate days range based on current view
  const days = isMonthView ? monthData.days : yearData.days;

  // Memoize calendar data to prevent unnecessary re-renders
  const memoizedData = useMemo(
    () => ({
      calendars: monthViewData.calendars || [],
      habits: monthViewData.habits || [],
      completions: monthViewData.completions || [],
    }),
    [monthViewData.calendars, monthViewData.habits, monthViewData.completions],
  );

  // Show loading state only during initial data fetch
  const isLoading =
    !monthViewData.calendars ||
    !monthViewData.habits ||
    !monthViewData.completions;

  return (
    <div className="container mx-auto max-w-7xl pt-16">
      <AuthenticationWrapper>
        <>
          {/* Yearly overview component showing habit completion heatmap */}
          {/* <MemoizedYearlyOverview
            completions={yearViewData.completions || []}
            habits={memoizedData.habits}
            calendars={memoizedData.calendars}
            isLoading={isLoading}
          /> */}

          {/* Main calendar container with month/year view toggle */}
          <MemoizedCalendarContainer
            calendarView={view}
            calendars={memoizedData.calendars}
            completions={memoizedData.completions}
            days={days}
            habits={memoizedData.habits}
            monthViewData={monthViewData}
            onViewChange={setView}
            view={view}
            isLoading={isLoading}
          />

          {/* Import/Export functionality for calendar data */}
          <div className="mx-4 my-8 justify-center">
            <ImportExport />
          </div>
        </>
      </AuthenticationWrapper>
    </div>
  );
}
