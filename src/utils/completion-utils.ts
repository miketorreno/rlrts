// import { Id } from "@server/convex/_generated/dataModel";
import { Id } from "../../convex/_generated/dataModel";

/**
 * Utility functions for handling habit completion calculations.
 * Provides date-based filtering and counting of habit completions.
 */

/**
 * Calculates the number of times a habit was completed on a specific date.
 *
 * @param date - The date to check completions for (in ISO string format)
 * @param habitId - The ID of the habit to check
 * @param completions - Array of completion records with habit IDs and timestamps
 * @returns Number of times the habit was completed on the specified date
 *
 * Note: Uses local timezone for date boundaries (midnight to midnight)
 */
export function getCompletionCount(
  date: string,
  habitId: Id<"habits">,
  completions:
    | Array<{
        habitId: Id<"habits">;
        completedAt: number;
      }>
    | null
    | undefined,
) {
  if (!Array.isArray(completions)) return 0;

  // Set start of day (midnight 00:00:00.000)
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  // Set end of day (23:59:59.999)
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  // Convert to timestamps for comparison
  const dayStartTime = dayStart.getTime();
  const dayEndTime = dayEnd.getTime();

  // Filter and count completions that match:
  // 1. The specified habit ID
  // 2. Timestamp falls within the day's boundaries
  return completions.filter(
    (completion) =>
      completion.habitId === habitId &&
      completion.completedAt >= dayStartTime &&
      completion.completedAt <= dayEndTime,
  ).length;
}
