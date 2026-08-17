import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { deleteBranchSubtree } from "./tree_utils";

/**
 *
 * Key features:
 * - Position-based ordering of branches within a limb
 * - Cascading deletions (branch -> twigs -> leaves -> completions)
 * - User-specific branch management
 * - Authentication checks on all operations
 */

/**
 * @param {Id<"limbs">} [limbId] - Optional limb ID to filter branches
 * @throws {Error} If user is not authenticated
 * @returns {Promise<Branch[]>} List of branches owned by the user, ordered by position
 */
export const list = query({
  args: {
    limbId: v.optional(v.id("limbs")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    let q = ctx.db
      .query("branches")
      .filter((q) => q.eq(q.field("userId"), identity.subject));

    if (args.limbId) {
      q = q.filter((q) => q.eq(q.field("limbId"), args.limbId));
    }

    const branches = await q.collect();
    return branches.sort(
      (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity),
    );
  },
});

/**
 * @param {string} name - Display name for the branch
 * @param {Id<"limbs">} limbId - Limb to create branch in
 * @throws {Error} If user is not authenticated or limb not found/owned by user
 * @returns {Promise<Id<"branches">>} ID of the newly created branch
 */
export const create = mutation({
  args: {
    name: v.string(),
    limbId: v.id("limbs"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Verify limb belongs to user
    const limb = await ctx.db.get(args.limbId);
    if (!limb || limb.userId !== identity.subject) {
      throw new Error("Limb not found");
    }

    // Position is determined by the max existing position + 1 among the limb's branches
    const existingBranches = await ctx.db
      .query("branches")
      .filter((q) => q.eq(q.field("limbId"), args.limbId))
      .collect();

    const maxPosition = existingBranches.reduce(
      (max, branch) => Math.max(max, branch.position || 0),
      0,
    );

    return await ctx.db.insert("branches", {
      name: args.name,
      userId: identity.subject,
      limbId: args.limbId,
      position: maxPosition + 1,
    });
  },
});

/**
 * Performs cascading deletion in this order:
 * 1. Deletes the branch and its subtree (twigs -> leaves -> completions)
 * 2. Updates positions of remaining branches to maintain order within the limb
 *
 * @param {Id<"branches">} id - ID of branch to delete
 * @throws {Error} If user is not authenticated or branch not found/owned by user
 */
export const remove = mutation({
  args: {
    id: v.id("branches"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const branch = await ctx.db.get(args.id);
    if (!branch || branch.userId !== identity.subject) {
      throw new Error("Branch not found");
    }

    // Step 1: Delete the branch and its subtree (handled by deleteBranchSubtree)
    await deleteBranchSubtree(ctx, args.id);

    // Step 2: Update positions of remaining branches within the same limb
    const allBranches = await ctx.db
      .query("branches")
      .filter((q) => q.eq(q.field("limbId"), branch.limbId))
      .collect();

    const deletedPosition = branch.position ?? allBranches.length + 1;

    // Decrement position of all branches that were after the deleted one
    for (const otherBranch of allBranches) {
      if (otherBranch._id === args.id) continue;

      const currentPosition = otherBranch.position ?? allBranches.length + 1;
      if (currentPosition > deletedPosition) {
        await ctx.db.patch(otherBranch._id, {
          position: currentPosition - 1,
        });
      }
    }
  },
});

/**
 * Position update logic:
 * - Moving down: Decrement positions of branches between old and new position
 * - Moving up: Increment positions of branches between new and old position
 *
 * @param {Id<"branches">} id - Branch ID to update
 * @param {string} name - New branch name
 * @param {number} position - New position in the list
 * @throws {Error} If user is not authenticated or branch not found/owned by user
 */
export const update = mutation({
  args: {
    id: v.id("branches"),
    name: v.string(),
    position: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const branch = await ctx.db.get(args.id);
    if (!branch || branch.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    const allBranches = await ctx.db
      .query("branches")
      .filter((q) => q.eq(q.field("limbId"), branch.limbId))
      .collect();

    // Handle position updates if position changed
    if (branch.position !== args.position) {
      const oldPosition = branch.position ?? allBranches.length;
      const newPosition = args.position;

      for (const otherBranch of allBranches) {
        if (otherBranch._id === args.id) continue;

        const currentPosition = otherBranch.position ?? allBranches.length;
        if (oldPosition < newPosition) {
          // Moving down: shift affected branches up
          if (currentPosition > oldPosition && currentPosition <= newPosition) {
            await ctx.db.patch(otherBranch._id, {
              position: currentPosition - 1,
            });
          }
        } else {
          // Moving up: shift affected branches down
          if (currentPosition >= newPosition && currentPosition < oldPosition) {
            await ctx.db.patch(otherBranch._id, {
              position: currentPosition + 1,
            });
          }
        }
      }
    }

    // Update the branch's properties
    await ctx.db.patch(args.id, {
      name: args.name,
      position: args.position,
    });
  },
});

/**
 * @param {Id<"branches">} id - Branch ID to retrieve
 * @throws {Error} If user is not authenticated or branch not found/owned by user
 * @returns {Promise<Branch>} The requested branch
 */
export const get = query({
  args: { id: v.id("branches") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const branch = await ctx.db.get(args.id);
    if (!branch || branch.userId !== identity.subject) {
      throw new Error("Branch not found");
    }
    return branch;
  },
});
