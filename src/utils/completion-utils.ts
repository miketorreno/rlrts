// import { Id } from "@server/convex/_generated/dataModel";
import { Id } from "../../convex/_generated/dataModel";

/**
 * Utility functions for handling leaf completion calculations.
 * Provides date-based filtering and counting of leaf completions.
 */

/**
 * Calculates the number of times a leaf was completed on a specific date.
 *
 * @param date - The date to check completions for (in ISO string format)
 * @param leafId - The ID of the leaf to check
 * @param completions - Array of completion records with leaf IDs and timestamps
 * @returns Number of times the leaf was completed on the specified date
 *
 * Note: Uses local timezone for date boundaries (midnight to midnight)
 */
export function getCompletionCount(
  date: string,
  leafId: Id<"leaves">,
  completions:
    | Array<{
        leafId: Id<"leaves">;
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
  // 1. The specified leaf ID
  // 2. Timestamp falls within the day's boundaries
  return completions.filter(
    (completion) =>
      completion.leafId === leafId &&
      completion.completedAt >= dayStartTime &&
      completion.completedAt <= dayEndTime,
  ).length;
}
