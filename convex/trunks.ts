import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { deleteTrunkSubtree } from "./tree_utils";

/**
 *
 * Key features:
 * - Position-based ordering of trunks
 * - Cascading deletions (trunk -> limbs -> branches -> twigs -> leaves -> completions)
 * - User-specific trunk management
 * - Authentication checks on all operations
 */

/**
 * @throws {Error} If user is not authenticated
 * @returns {Promise<Trunk[]>} List of trunks owned by the user, ordered by position
 */
export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const trunks = await ctx.db
      .query("trunks")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    return trunks.sort(
      (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity),
    );
  },
});

/**
 * @param {string} name - Display name for the trunk
 * @throws {Error} If user is not authenticated
 * @returns {Promise<Id<"trunks">>} ID of the newly created trunk
 */
export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Position is determined by the max existing position + 1
    const existingTrunks = await ctx.db
      .query("trunks")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    const maxPosition = existingTrunks.reduce(
      (max, trunk) => Math.max(max, trunk.position || 0),
      0,
    );

    return await ctx.db.insert("trunks", {
      name: args.name,
      userId: identity.subject,
      position: maxPosition + 1,
    });
  },
});

/**
 * Performs cascading deletion in this order:
 * 1. Deletes the trunk and its subtree (limbs -> branches -> twigs -> leaves -> completions)
 * 2. Updates positions of remaining trunks to maintain order
 *
 * @param {Id<"trunks">} id - ID of trunk to delete
 * @throws {Error} If user is not authenticated or trunk not found/owned by user
 */
export const remove = mutation({
  args: {
    id: v.id("trunks"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const trunk = await ctx.db.get(args.id);
    if (!trunk || trunk.userId !== identity.subject) {
      throw new Error("Trunk not found");
    }

    // Step 1: Delete the trunk and its subtree (handled by deleteTrunkSubtree)
    await deleteTrunkSubtree(ctx, args.id);

    // Step 2: Update positions of remaining trunks
    const allTrunks = await ctx.db
      .query("trunks")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    const deletedPosition = trunk.position ?? allTrunks.length + 1;

    // Decrement position of all trunks that were after the deleted one
    for (const otherTrunk of allTrunks) {
      if (otherTrunk._id === args.id) continue;

      const currentPosition = otherTrunk.position ?? allTrunks.length + 1;
      if (currentPosition > deletedPosition) {
        await ctx.db.patch(otherTrunk._id, {
          position: currentPosition - 1,
        });
      }
    }
  },
});

/**
 * Position update logic:
 * - Moving down: Decrement positions of trunks between old and new position
 * - Moving up: Increment positions of trunks between new and old position
 *
 * @param {Id<"trunks">} id - Trunk ID to update
 * @param {string} name - New trunk name
 * @param {number} position - New position in the list
 * @throws {Error} If user is not authenticated or trunk not found/owned by user
 */
export const update = mutation({
  args: {
    id: v.id("trunks"),
    name: v.string(),
    position: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const trunk = await ctx.db.get(args.id);
    if (!trunk || trunk.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    const allTrunks = await ctx.db
      .query("trunks")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    // Handle position updates if position changed
    if (trunk.position !== args.position) {
      const oldPosition = trunk.position ?? allTrunks.length;
      const newPosition = args.position;

      for (const otherTrunk of allTrunks) {
        if (otherTrunk._id === args.id) continue;

        const currentPosition = otherTrunk.position ?? allTrunks.length;
        if (oldPosition < newPosition) {
          // Moving down: shift affected trunks up
          if (currentPosition > oldPosition && currentPosition <= newPosition) {
            await ctx.db.patch(otherTrunk._id, {
              position: currentPosition - 1,
            });
          }
        } else {
          // Moving up: shift affected trunks down
          if (currentPosition >= newPosition && currentPosition < oldPosition) {
            await ctx.db.patch(otherTrunk._id, {
              position: currentPosition + 1,
            });
          }
        }
      }
    }

    // Update the trunk's properties
    await ctx.db.patch(args.id, {
      name: args.name,
      position: args.position,
    });
  },
});

/**
 * @param {Id<"trunks">} id - Trunk ID to retrieve
 * @throws {Error} If user is not authenticated or trunk not found/owned by user
 * @returns {Promise<Trunk>} The requested trunk
 */
export const get = query({
  args: { id: v.id("trunks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const trunk = await ctx.db.get(args.id);
    if (!trunk || trunk.userId !== identity.subject) {
      throw new Error("Trunk not found");
    }
    return trunk;
  },
});
