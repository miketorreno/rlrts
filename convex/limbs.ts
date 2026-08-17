import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { deleteLimbSubtree } from "./tree_utils";

/**
 *
 * Key features:
 * - Position-based ordering of limbs within a trunk
 * - Cascading deletions (limb -> branches -> twigs -> leaves -> completions)
 * - User-specific limb management
 * - Authentication checks on all operations
 */

/**
 * @param {Id<"trunks">} [trunkId] - Optional trunk ID to filter limbs
 * @throws {Error} If user is not authenticated
 * @returns {Promise<Limb[]>} List of limbs owned by the user, ordered by position
 */
export const list = query({
  args: {
    trunkId: v.optional(v.id("trunks")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    let q = ctx.db
      .query("limbs")
      .filter((q) => q.eq(q.field("userId"), identity.subject));

    if (args.trunkId) {
      q = q.filter((q) => q.eq(q.field("trunkId"), args.trunkId));
    }

    const limbs = await q.collect();
    return limbs.sort(
      (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity),
    );
  },
});

/**
 * @param {string} name - Display name for the limb
 * @param {Id<"trunks">} trunkId - Trunk to create limb in
 * @throws {Error} If user is not authenticated or trunk not found/owned by user
 * @returns {Promise<Id<"limbs">>} ID of the newly created limb
 */
export const create = mutation({
  args: {
    name: v.string(),
    trunkId: v.id("trunks"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Verify trunk belongs to user
    const trunk = await ctx.db.get(args.trunkId);
    if (!trunk || trunk.userId !== identity.subject) {
      throw new Error("Trunk not found");
    }

    // Position is determined by the max existing position + 1 among the trunk's limbs
    const existingLimbs = await ctx.db
      .query("limbs")
      .filter((q) => q.eq(q.field("trunkId"), args.trunkId))
      .collect();

    const maxPosition = existingLimbs.reduce(
      (max, limb) => Math.max(max, limb.position || 0),
      0,
    );

    return await ctx.db.insert("limbs", {
      name: args.name,
      userId: identity.subject,
      trunkId: args.trunkId,
      position: maxPosition + 1,
    });
  },
});

/**
 * Performs cascading deletion in this order:
 * 1. Deletes the limb and its subtree (branches -> twigs -> leaves -> completions)
 * 2. Updates positions of remaining limbs to maintain order within the trunk
 *
 * @param {Id<"limbs">} id - ID of limb to delete
 * @throws {Error} If user is not authenticated or limb not found/owned by user
 */
export const remove = mutation({
  args: {
    id: v.id("limbs"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const limb = await ctx.db.get(args.id);
    if (!limb || limb.userId !== identity.subject) {
      throw new Error("Limb not found");
    }

    // Step 1: Delete the limb and its subtree (handled by deleteLimbSubtree)
    await deleteLimbSubtree(ctx, args.id);

    // Step 2: Update positions of remaining limbs within the same trunk
    const allLimbs = await ctx.db
      .query("limbs")
      .filter((q) => q.eq(q.field("trunkId"), limb.trunkId))
      .collect();

    const deletedPosition = limb.position ?? allLimbs.length + 1;

    // Decrement position of all limbs that were after the deleted one
    for (const otherLimb of allLimbs) {
      if (otherLimb._id === args.id) continue;

      const currentPosition = otherLimb.position ?? allLimbs.length + 1;
      if (currentPosition > deletedPosition) {
        await ctx.db.patch(otherLimb._id, {
          position: currentPosition - 1,
        });
      }
    }
  },
});

/**
 * Position update logic:
 * - Moving down: Decrement positions of limbs between old and new position
 * - Moving up: Increment positions of limbs between new and old position
 *
 * @param {Id<"limbs">} id - Limb ID to update
 * @param {string} name - New limb name
 * @param {number} position - New position in the list
 * @throws {Error} If user is not authenticated or limb not found/owned by user
 */
export const update = mutation({
  args: {
    id: v.id("limbs"),
    name: v.string(),
    position: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const limb = await ctx.db.get(args.id);
    if (!limb || limb.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    const allLimbs = await ctx.db
      .query("limbs")
      .filter((q) => q.eq(q.field("trunkId"), limb.trunkId))
      .collect();

    // Handle position updates if position changed
    if (limb.position !== args.position) {
      const oldPosition = limb.position ?? allLimbs.length;
      const newPosition = args.position;

      for (const otherLimb of allLimbs) {
        if (otherLimb._id === args.id) continue;

        const currentPosition = otherLimb.position ?? allLimbs.length;
        if (oldPosition < newPosition) {
          // Moving down: shift affected limbs up
          if (currentPosition > oldPosition && currentPosition <= newPosition) {
            await ctx.db.patch(otherLimb._id, {
              position: currentPosition - 1,
            });
          }
        } else {
          // Moving up: shift affected limbs down
          if (currentPosition >= newPosition && currentPosition < oldPosition) {
            await ctx.db.patch(otherLimb._id, {
              position: currentPosition + 1,
            });
          }
        }
      }
    }

    // Update the limb's properties
    await ctx.db.patch(args.id, {
      name: args.name,
      position: args.position,
    });
  },
});

/**
 * @param {Id<"limbs">} id - Limb ID to retrieve
 * @throws {Error} If user is not authenticated or limb not found/owned by user
 * @returns {Promise<Limb>} The requested limb
 */
export const get = query({
  args: { id: v.id("limbs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const limb = await ctx.db.get(args.id);
    if (!limb || limb.userId !== identity.subject) {
      throw new Error("Limb not found");
    }
    return limb;
  },
});
