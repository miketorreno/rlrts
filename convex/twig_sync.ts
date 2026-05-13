/* eslint-disable check-file/filename-naming-convention */
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

/**
 * Exports all user's twigs with their leaves and completions.
 * Structure:
 * {
 *   twigs: [{
 *     name: string,
 *     colorTheme: string,
 *     leaves: [{
 *       name: string,
 *       completions: [{ completedAt: number }]
 *     }]
 *   }]
 * }
 */

export const exportTwigsAndLeaves = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const twigs = await ctx.db
      .query("twigs")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    const allLeaves = await ctx.db
      .query("leaves")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    // Build the export structure without _id fields
    const exportedTwigs = twigs.map((twig) => {
      const twigLeaves = allLeaves.filter((l) => l.twigId === twig._id);
      const exportedLeaves = twigLeaves.map((leaf) => ({
        name: leaf.name,
        position: leaf.position,
        timerDuration: leaf.timerDuration,
        completions: [], // Will be filled by exportCompletions
      }));

      return {
        name: twig.name,
        colorTheme: twig.colorTheme,
        position: twig.position,
        leaves: exportedLeaves,
      };
    });

    return { twigs: exportedTwigs };
  },
});

export const exportCompletions = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { completionsByLeaf: {} };

    try {
      // Get all leaves first to map IDs to names
      const leaves = await ctx.db
        .query("leaves")
        .filter((q) => q.eq(q.field("userId"), identity.subject))
        .collect();

      const leafIdToName = new Map(leaves.map((l) => [l._id, l.name]));

      // Get all completions
      const completions = await ctx.db
        .query("completions")
        .withIndex("by_user_and_date", (q) => q.eq("userId", identity.subject))
        .collect();

      // Group completions by leaf name
      const completionsByLeaf = new Map();
      for (const completion of completions) {
        const leafName = leafIdToName.get(completion.leafId);
        if (!leafName) continue;

        const encodedName = encodeURIComponent(leafName);
        const leafCompletions = completionsByLeaf.get(encodedName) || [];
        leafCompletions.push({ completedAt: completion.completedAt });
        completionsByLeaf.set(encodedName, leafCompletions);
      }

      return { completionsByLeaf: Object.fromEntries(completionsByLeaf) };
    } catch (error) {
      console.error("Error in exportCompletions:", error);
      return { completionsByLeaf: {} };
    }
  },
});

/**
 * Imports twig data with leaves and completions.
 * For existing twigs (matched by name):
 * - Updates the twig's color theme
 * - Adds new leaves or updates existing ones
 * - Adds only new completions (avoids duplicates)
 *
 * For new twigs:
 * - Creates the twig with all leaves and completions
 */
export const importData = mutation({
  args: {
    data: v.object({
      twigs: v.array(
        v.object({
          name: v.string(),
          colorTheme: v.string(),
          position: v.optional(v.number()),
          leaves: v.array(
            v.union(
              v.object({
                name: v.string(),
                timerDuration: v.optional(v.number()),
                position: v.optional(v.number()),
                completions: v.array(v.object({ completedAt: v.number() })),
                targetFrequency: v.optional(v.any()),
              }),
              // Allow any additional fields in the input
              v.any(),
            ),
          ),
        }),
      ),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Clean the input data to only use fields we need
    const cleanedTwigs = args.data.twigs.map((twig) => ({
      ...twig,
      leaves: twig.leaves.map((leaf) => ({
        name: leaf.name,
        timerDuration: "timerDuration" in leaf ? leaf.timerDuration : undefined,
        position: "position" in leaf ? leaf.position : undefined,
        completions: "completions" in leaf ? leaf.completions : [],
      })),
    }));

    const existingTwigs = await ctx.db
      .query("twigs")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    // Continue with the rest of the import using cleanedTwigs
    const sortedTwigs = [...cleanedTwigs].sort(
      (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity),
    );

    for (const twigData of sortedTwigs) {
      const existingTwig = existingTwigs.find(
        (cal) => cal.name === twigData.name,
      );
      const twigId = existingTwig?._id;

      if (twigId) {
        // Update existing twig
        await ctx.db.patch(twigId, {
          colorTheme: twigData.colorTheme,
          position: twigData.position,
        });

        const existingLeaves = await ctx.db
          .query("leaves")
          .filter((q) => q.eq(q.field("twigId"), twigId))
          .collect();

        const sortedLeaves = [...twigData.leaves].sort(
          (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity),
        );

        for (const leafData of sortedLeaves) {
          const { name, completions, timerDuration, position } = leafData;

          const existingLeaf = existingLeaves.find((l) => l.name === name);
          let leafId: Id<"leaves">;

          if (existingLeaf) {
            leafId = existingLeaf._id;
            await ctx.db.patch(leafId, {
              position: position ?? existingLeaves.indexOf(existingLeaf) + 1,
              timerDuration,
            });
          } else {
            leafId = await ctx.db.insert("leaves", {
              name,
              userId: identity.subject,
              twigId,
              timerDuration,
              position: position ?? existingLeaves.length + 1,
            });
          }

          // Process completions in batches of 100
          const existingCompletions = await ctx.db
            .query("completions")
            .filter((q) => q.eq(q.field("leafId"), leafId))
            .collect();

          const existingCompletionTimes = new Set(
            existingCompletions.map((c) => c.completedAt),
          );

          // Process completions in chunks of 100
          for (let i = 0; i < completions.length; i += 100) {
            const batch = completions.slice(i, i + 100);
            const newCompletions = batch.filter(
              (c: { completedAt: number }) =>
                !existingCompletionTimes.has(c.completedAt),
            );

            if (newCompletions.length > 0) {
              await Promise.all(
                newCompletions.map((completion: { completedAt: number }) =>
                  ctx.db.insert("completions", {
                    leafId,
                    userId: identity.subject,
                    completedAt: completion.completedAt,
                  }),
                ),
              );
            }
          }
        }
      } else {
        // Create new twig
        const newTwigId = await ctx.db.insert("twigs", {
          name: twigData.name,
          userId: identity.subject,
          colorTheme: twigData.colorTheme,
          position: twigData.position ?? existingTwigs.length + 1,
        });

        const sortedLeaves = [...twigData.leaves].sort(
          (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity),
        );

        for (const leafData of sortedLeaves) {
          const { name, completions, timerDuration, position } = leafData;

          const leafId = await ctx.db.insert("leaves", {
            name,
            userId: identity.subject,
            twigId: newTwigId,
            timerDuration,
            position: position ?? twigData.leaves.indexOf(leafData) + 1,
          });

          // Process completions in batches of 100
          for (let i = 0; i < completions.length; i += 100) {
            const batch = completions.slice(i, i + 100);
            await Promise.all(
              batch.map((completion: { completedAt: number }) =>
                ctx.db.insert("completions", {
                  leafId,
                  userId: identity.subject,
                  completedAt: completion.completedAt,
                }),
              ),
            );
          }
        }
      }
    }
  },
});
