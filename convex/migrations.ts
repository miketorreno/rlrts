/**
 * Migration to add position fields to existing habits.
 * This ensures proper ordering of habits within each calendar
 * for features like drag-and-drop reordering.
 */
import { mutation } from "./_generated/server";

export const addPositionsToHabits = mutation({
  handler: async (ctx) => {
    // Query habits that don't have a position field yet
    // These are likely older habits created before position tracking was added
    const habits = await ctx.db
      .query("habits")
      .filter((q) => q.eq(q.field("position"), undefined))
      .collect();

    // Organize habits by their calendar ID for batch processing
    // This ensures position numbers are sequential within each calendar
    const habitsByCalendar = habits.reduce(
      (acc, habit) => {
        const calendarId = habit.calendarId;
        if (!acc[calendarId]) {
          acc[calendarId] = [];
        }
        acc[calendarId].push(habit);
        return acc;
      },
      {} as Record<string, typeof habits>
    );

    // Iterate through each calendar's habits and assign sequential positions
    // Starting from 1, increment position for each habit in the calendar
    for (const calendarHabits of Object.values(habitsByCalendar)) {
      for (let i = 0; i < calendarHabits.length; i++) {
        await ctx.db.patch(calendarHabits[i]._id, {
          position: i + 1,
        });
      }
    }

    return `Updated positions for ${habits.length} habits`;
  },
});
