import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";
import { deleteLeafAndCompletions } from "./tree_utils";
import { streakMultiplier } from "./xp";

/**
 * Key features:
 * - Position-based ordering within twigs
 * - Multiple completion tracking per day
 * - Cascading deletions (leaf -> completions)
 * - Timer duration support for timed leaves
 */

/**
 * @param {Id<"twigs">} [twigId] - Optional twig ID to filter leaves
 * @throws {Error} If user is not authenticated
 * @returns {Promise<Doc<"leaves">[]>} List of leaves, sorted by position
 */
export const list = query({
  args: {
    twigId: v.optional(v.id("twigs")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    let q = ctx.db
      .query("leaves")
      .filter((q) => q.eq(q.field("userId"), identity.subject));

    if (args.twigId) {
      q = q.filter((q) => q.eq(q.field("twigId"), args.twigId));
    }

    const leaves = await q.collect();
    return leaves.sort(
      (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity),
    );
  },
});

/**
 * @param {string} name - Display name for the leaf
 * @param {Id<"twigs">} twigId - Twig to create leaf in
 * @param {number} [timerDuration] - Optional duration in milliseconds for timed leaves
 * @throws {Error} If user is not authenticated or twig not found/owned by user
 * @returns {Promise<Id<"leaves">>} ID of the newly created leaf
 */
export const create = mutation({
  args: {
    name: v.string(),
    twigId: v.id("twigs"),
    timerDuration: v.optional(v.number()),
    xp: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Verify twig belongs to user
    const twig = await ctx.db.get(args.twigId);
    if (!twig || twig.userId !== identity.subject) {
      throw new Error("Twig not found");
    }

    // Get max position for this twig
    const leaves = await ctx.db
      .query("leaves")
      .filter((q) => q.eq(q.field("twigId"), args.twigId))
      .collect();

    const maxPosition = leaves.reduce(
      (max, leaf) => Math.max(max, leaf.position || 0),
      0,
    );

    return await ctx.db.insert("leaves", {
      name: args.name,
      userId: identity.subject,
      twigId: args.twigId,
      timerDuration: args.timerDuration,
      xp: args.xp,
      position: maxPosition + 1,
    });
  },
});

/**
 * @param {Id<"leaves">} leafId - Leaf to mark complete
 * @param {number} completedAt - Timestamp for the completion
 * @param {number} [count] - Optional target completion count, if not provided increments by 1
 * @throws {Error} If user is not authenticated or leaf not found/owned by user
 */
export const markComplete = mutation({
  args: {
    leafId: v.id("leaves"),
    completedAt: v.number(),
    count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Verify leaf belongs to user
    const leaf = await ctx.db.get(args.leafId);
    if (!leaf || leaf.userId !== identity.subject) {
      throw new Error("Leaf not found");
    }

    // Get all completions for this leaf on this date
    const date = new Date(args.completedAt);
    date.setHours(0, 0, 0, 0);
    const startOfDay = date.getTime();
    date.setHours(23, 59, 59, 999);
    const endOfDay = date.getTime();

    const existingCompletions = await ctx.db
      .query("completions")
      .filter((q) => q.eq(q.field("leafId"), args.leafId))
      .filter((q) =>
        q.and(
          q.gte(q.field("completedAt"), startOfDay),
          q.lte(q.field("completedAt"), endOfDay),
        ),
      )
      .collect();

    const currentCount = existingCompletions.length;
    // If count is provided, use it directly. Otherwise increment by 1
    const targetCount = args.count ?? currentCount + 1;

    if (targetCount < currentCount) {
      // Remove completions from the end until we reach target count
      const numToRemove = currentCount - targetCount;
      const toRemove = existingCompletions.slice(-numToRemove);
      await Promise.all(
        toRemove.map((completion) => ctx.db.delete(completion._id)),
      );
    } else if (targetCount > currentCount) {
      // Check if the completion is for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isToday = date.getTime() === today.getTime();

      // Use current timestamp for today's completions, otherwise use the provided date
      const baseTimestamp = isToday ? Date.now() : args.completedAt;

      const newCompletions = Array.from(
        { length: targetCount - currentCount },
        (_, index) => ({
          leafId: args.leafId,
          userId: identity.subject,
          completedAt: baseTimestamp + index * 1000, // Add 1 second between each completion if multiple
        }),
      );
      await Promise.all(
        newCompletions.map((completion) =>
          ctx.db.insert("completions", completion),
        ),
      );

      // Record XP for this habit completion
      if ((leaf.xp ?? 0) > 0) {
        const baseAmount = leaf.xp!;
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .split("T")[0];

        let profile = await ctx.db
          .query("xpProfiles")
          .filter((q) => q.eq(q.field("userId"), identity.subject))
          .first();

        // Reset streak if gap is too long
        if (profile) {
          if (
            profile.lastCompletionDate !== today &&
            profile.lastCompletionDate !== yesterday
          ) {
            await ctx.db.patch(profile._id, { currentStreak: 0 });
            profile = { ...profile, currentStreak: 0 };
          }
        }

        if (!profile) {
          await ctx.db.insert("xpProfiles", {
            userId: identity.subject,
            lifetimeXp: baseAmount,
            currentStreak: 1,
            longestStreak: 1,
            lastCompletionDate: today,
          });
          await ctx.db.insert("xpEvents", {
            userId: identity.subject,
            source: "habit",
            sourceId: args.leafId,
            amount: baseAmount,
            baseAmount,
            streakAtTime: 1,
            createdAt: Date.now(),
          });
        } else {
          const alreadyCompletedToday =
            profile.lastCompletionDate === today;
          const multiplier = streakMultiplier(profile.currentStreak);
          const amount = Math.round(baseAmount * multiplier);

          if (alreadyCompletedToday) {
            await ctx.db.patch(profile._id, {
              lifetimeXp: profile.lifetimeXp + amount,
            });
          } else {
            await ctx.db.patch(profile._id, {
              lifetimeXp: profile.lifetimeXp + amount,
              currentStreak: profile.currentStreak + 1,
              longestStreak: Math.max(
                profile.longestStreak,
                profile.currentStreak + 1,
              ),
              lastCompletionDate: today,
            });
          }

          await ctx.db.insert("xpEvents", {
            userId: identity.subject,
            source: "habit",
            sourceId: args.leafId,
            amount,
            baseAmount,
            streakAtTime: profile.currentStreak,
            createdAt: Date.now(),
          });
        }
      }
    }

    return null;
  },
});

/**
 * Response type for paginated completion queries
 */
type CompletionsResponse = {
  completions: Doc<"completions">[];
  cursor: string | null;
  hasMore: boolean;
};

/**
 * Retrieves paginated completions within a date range.
 * Uses the by_user_and_date index for efficient querying.
 *
 * @param {number} startDate - Start of date range (timestamp)
 * @param {number} endDate - End of date range (timestamp)
 * @param {string} [cursor] - Pagination cursor from previous query
 * @param {number} [limit] - Max completions to return (default 100, max 100)
 * @throws {Error} If user is not authenticated
 * @returns {Promise<CompletionsResponse>} Paginated completions with cursor
 */
export const getCompletions = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<CompletionsResponse> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Use a high limit to get all completions in one query for now
    // TODO: Implement proper pagination in the UI later
    const limit = 10000;

    const queryBuilder = ctx.db
      .query("completions")
      .withIndex("by_user_and_date", (q) =>
        q
          .eq("userId", identity.subject)
          .gte("completedAt", args.startDate)
          .lte("completedAt", args.endDate),
      )
      .order("desc");

    const page = await queryBuilder.paginate({
      numItems: limit,
      cursor: args.cursor ?? null,
    });

    return {
      completions: page.page,
      cursor: page.continueCursor,
      hasMore: page.isDone === false,
    };
  },
});

/**
 * Position update scenarios:
 * 1. Moving to different twig: Place at end of target twig
 * 2. Moving within same twig: Adjust positions of leaves in between
 * 3. No position change: Update other properties only
 *
 * @param {Id<"leaves">} id - Leaf ID to update
 * @param {string} name - New leaf name
 * @param {number} [timerDuration] - Optional new timer duration
 * @param {Id<"twigs">} twigId - Twig to move/keep leaf in
 * @param {number} [position] - Optional new position in twig
 * @throws {Error} If user not authenticated, leaf/twig not found, or invalid position
 */
export const update = mutation({
  args: {
    id: v.id("leaves"),
    name: v.string(),
    timerDuration: v.optional(v.number()),
    twigId: v.id("twigs"),
    position: v.optional(v.number()),
    xp: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const leaf = await ctx.db.get(args.id);
    if (!leaf || leaf.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    // Verify twig belongs to user
    const twig = await ctx.db.get(args.twigId);
    if (!twig || twig.userId !== identity.subject) {
      throw new Error("Twig not found");
    }

    // Handle position update if provided or if twig changed
    if (args.position !== undefined || args.twigId !== leaf.twigId) {
      const leaves = await ctx.db
        .query("leaves")
        .filter((q) => q.eq(q.field("twigId"), args.twigId))
        .collect();

      // Calculate new position based on scenario
      let newPosition: number;
      if (args.twigId !== leaf.twigId) {
        // Moving to different twig - put at end
        newPosition = leaves.length + 1;
      } else if (args.position !== undefined) {
        // Staying in same twig with specified position
        newPosition = args.position;
      } else {
        // Staying in same twig without position - keep current
        newPosition = leaf.position ?? leaves.length + 1;
      }

      // Validate position
      if (newPosition < 1 || newPosition > leaves.length + 1) {
        throw new Error("Invalid position");
      }

      // Update positions of other leaves if needed
      const oldPosition = leaf.position ?? 0;

      if (args.twigId === leaf.twigId && oldPosition !== newPosition) {
        if (oldPosition < newPosition) {
          // Moving down: decrease positions of leaves in between
          for (const l of leaves) {
            const hPos = l.position ?? 0;
            if (hPos > oldPosition && hPos <= newPosition) {
              await ctx.db.patch(l._id, { position: hPos - 1 });
            }
          }
        } else {
          // Moving up: increase positions of leaves in between
          for (const l of leaves) {
            const hPos = l.position ?? 0;
            if (hPos >= newPosition && hPos < oldPosition) {
              await ctx.db.patch(l._id, { position: hPos + 1 });
            }
          }
        }
      }

      // Update the leaf with new position
      await ctx.db.patch(args.id, {
        name: args.name,
        timerDuration: args.timerDuration,
        twigId: args.twigId,
        xp: args.xp,
        position: newPosition,
      });
      return;
    }

    // Update the leaf's properties without position change
    await ctx.db.patch(args.id, {
      name: args.name,
      timerDuration: args.timerDuration,
      twigId: args.twigId,
      xp: args.xp,
      ...(args.position !== undefined && { position: args.position }),
    });
  },
});

/**
 * Performs cascading deletion in this order:
 * 1. Delete all completions for the leaf
 * 2. Delete the leaf itself
 *
 * @param {Id<"leaves">} id - Leaf ID to delete
 * @throws {Error} If user not authenticated or leaf not found/owned by user
 */
export const remove = mutation({
  args: { id: v.id("leaves") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const leaf = await ctx.db.get(args.id);
    if (!leaf || leaf.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    // Delete the leaf and its completions
    await deleteLeafAndCompletions(ctx, args.id);
  },
});

/**
 * @param {Id<"leaves">} id - Leaf ID to retrieve
 * @throws {Error} If leaf not found
 * @returns {Promise<Doc<"leaves">>} The requested leaf
 */
export const get = query({
  args: { id: v.id("leaves") },
  handler: async (ctx, args) => {
    const leaf = await ctx.db.get(args.id);
    if (!leaf) throw new Error("Leaf not found");
    return leaf;
  },
});

export const scheduleLeafIncrement = mutation({
  args: {
    leafId: v.id("leaves"),
    durationMs: v.number(),
    clientNow: v.number(),
  },
  handler: async (ctx, args): Promise<Id<"_scheduled_functions">> => {
    console.log("Starting schedule mutation for leaf:", args.leafId);

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const leaf = await ctx.db.get(args.leafId);
    if (!leaf || leaf.userId !== identity.subject) {
      console.error("Leaf not found or unauthorized:", args.leafId);
      throw new Error("Leaf not found or unauthorized");
    }

    const serverNow = Date.now();
    const timeDrift = serverNow - args.clientNow;
    const completionTime = serverNow + args.durationMs - timeDrift;
    console.log("Scheduling with:", {
      clientNow: args.clientNow,
      serverNow,
      timeDrift,
      scheduledDelay: args.durationMs - timeDrift,
      completionTime,
    });

    if (leaf.scheduledTimer) {
      console.log("Cancelling existing timer:", leaf.scheduledTimer);
      await ctx.scheduler.cancel(leaf.scheduledTimer);
    }

    try {
      const scheduledId = await ctx.scheduler.runAfter(
        args.durationMs - timeDrift,
        internal.leaves.incrementLeafCount,
        {
          leafId: args.leafId,
          completionTime,
        },
      );
      console.log("Scheduled successfully with ID:", scheduledId);

      await ctx.db.patch(args.leafId, {
        scheduledTimer: scheduledId,
        timerEnd: completionTime,
      });
      console.log("Updated leaf with scheduled timer");

      return scheduledId;
    } catch {
      throw new Error("Failed to schedule timer");
    }
  },
});

export const cancelScheduledIncrement = mutation({
  args: { leafId: v.id("leaves") },
  handler: async (ctx, { leafId }) => {
    const leaf = await ctx.db.get(leafId);
    if (!leaf || !leaf.scheduledTimer) return;

    // Cancel the scheduled job
    await ctx.scheduler.cancel(leaf.scheduledTimer);

    // Update the leaf document
    await ctx.db.patch(leafId, {
      scheduledTimer: undefined,
      timerEnd: undefined,
    });
  },
});

export const incrementLeafCount = internalMutation({
  args: {
    leafId: v.id("leaves"),
    completionTime: v.number(),
  },
  handler: async (ctx, { leafId, completionTime }) => {
    const leaf = await ctx.db.get(leafId);
    if (!leaf) throw new Error("Leaf not found");

    // Use the pre-calculated completion time
    await ctx.db.insert("completions", {
      leafId,
      userId: leaf.userId,
      completedAt: completionTime,
    });

    await ctx.db.patch(leafId, {
      scheduledTimer: undefined,
      timerEnd: undefined,
    });
  },
});
