import { endOfDay, format, startOfDay } from "date-fns";
import { useMemo } from "react";

/**
 * Custom hook for generating a date range for habit tracking
 * Provides today's date, a start date, and an array of dates in between
 */

/**
 * Generates an array of dates between today and a specified number of days in the past
 * @param daysBack - Number of days to look back from today
 * @returns {Object} Object containing:
 *   - today: Current date
 *   - startDate: Date 'daysBack' days ago
 *   - days: Array of ISO date strings between startDate and today (inclusive)
 */
const getDatesForRange = (daysBack: number) => {
  const now = new Date();
  const today = endOfDay(now);
  const startDate = startOfDay(new Date(now));
  startDate.setDate(startDate.getDate() - daysBack);

  const days = [];
  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = format(d, "yyyy-MM-dd");
    days.push(dateStr);
  }

  return {
    today,
    startDate,
    days,
  };
};

/**
 * React hook that memoizes date range calculations to prevent unnecessary recalculations
 * @param daysBack - Number of days to look back (defaults to 40)
 * @returns {Object} Memoized object containing today's date, start date, and array of dates
 */
export function useDateRange(daysBack: number = 40) {
  // Memoize the date range calculation to only recompute when daysBack changes
  const { today, startDate, days } = useMemo(() => getDatesForRange(daysBack), [daysBack]);

  return {
    today,
    startDate,
    days,
  };
}
