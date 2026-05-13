/**
 * Migration to add position fields to existing leaves.
 * This ensures proper ordering of leaves within each twig
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

    // Organize leaves by their twig ID for batch processing
    // This ensures position numbers are sequential within each twig
    const leavesByTwig = leaves.reduce(
      (acc, leaf) => {
        const twigId = leaf.twigId;
        if (!acc[twigId]) {
          acc[twigId] = [];
        }
        acc[twigId].push(leaf);
        return acc;
      },
      {} as Record<string, typeof leaves>,
    );

    // Iterate through each twig's leaves and assign sequential positions
    // Starting from 1, increment position for each leaf in the twig
    for (const twigLeaves of Object.values(leavesByTwig)) {
      for (let i = 0; i < twigLeaves.length; i++) {
        await ctx.db.patch(twigLeaves[i]._id, {
          position: i + 1,
        });
      }
    }

    return `Updated positions for ${leaves.length} leaves`;
  },
});
