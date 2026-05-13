/**
 * Migration to add position fields to existing leaves.
 * This ensures proper ordering of leaves within each calendar
 * for features like drag-and-drop reordering.
 */
import { mutation } from "./_generated/server";

export const addPositionsToLeaves = mutation({
  handler: async (ctx) => {
    // Query leaves that don't have a position field yet
    // These are likely older leaves created before position tracking was added
    const leaves = await ctx.db
      .query("leaves")
      .filter((q) => q.eq(q.field("position"), undefined))
      .collect();

    // Organize leaves by their calendar ID for batch processing
    // This ensures position numbers are sequential within each calendar
    const leavesByCalendar = leaves.reduce(
      (acc, leaf) => {
        const calendarId = leaf.calendarId;
        if (!acc[calendarId]) {
          acc[calendarId] = [];
        }
        acc[calendarId].push(leaf);
        return acc;
      },
      {} as Record<string, typeof leaves>,
    );

    // Iterate through each calendar's leaves and assign sequential positions
    // Starting from 1, increment position for each leaf in the calendar
    for (const calendarLeaves of Object.values(leavesByCalendar)) {
      for (let i = 0; i < calendarLeaves.length; i++) {
        await ctx.db.patch(calendarLeaves[i]._id, {
          position: i + 1,
        });
      }
    }

    return `Updated positions for ${leaves.length} leaves`;
  },
});
