import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { deleteTwigSubtree } from "./tree_utils";

/**
 *
 * Key features:
 * - Position-based ordering of twigs within a scope (root or a branch)
 * - Optional branch scoping via `branchId`
 * - Cascading deletions (twig -> leaves -> completions)
 * - User-specific twig management
 * - Authentication checks on all operations
 */

/**
 * @param {Id<"branches">} [branchId] - Optional branch ID to filter twigs
 * @param {boolean} [rootOnly] - When true, only return root-level twigs (branchId undefined)
 * @throws {Error} If user is not authenticated
 * @returns {Promise<Twig[]>} List of twigs owned by the user
 */
export const list = query({
  args: {
    branchId: v.optional(v.id("branches")),
    rootOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    let q = ctx.db
      .query("twigs")
      .filter((q) => q.eq(q.field("userId"), identity.subject));

    if (args.branchId) {
      q = q.filter((q) => q.eq(q.field("branchId"), args.branchId));
    } else if (args.rootOnly) {
      q = q.filter((q) => q.eq(q.field("branchId"), undefined));
    }

    return await q.order("asc").collect();
  },
});

/**
 * @param {string} name - Display name for the twig
 * @param {string} colorTheme - Color theme identifier for UI customization
 * @param {Id<"branches">} [branchId] - Optional branch to create the twig in
 * @throws {Error} If user is not authenticated or branch not found/owned by user
 * @returns {Promise<Id<"twigs">>} ID of the newly created twig
 */
export const create = mutation({
  args: {
    name: v.string(),
    colorTheme: v.string(),
    type: v.optional(v.union(v.literal("once"), v.literal("many"))),
    branchId: v.optional(v.id("branches")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Verify the branch belongs to the user
    if (args.branchId) {
      const branch = await ctx.db.get(args.branchId);
      if (!branch || branch.userId !== identity.subject) {
        throw new Error("Branch not found");
      }
    }

    // Position is 1-based and determined by the sibling count in the parent scope
    // (scope = the branch if branchId is set, else root-level twigs)
    const existingTwigs = await ctx.db
      .query("twigs")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .filter((q) =>
        args.branchId
          ? q.eq(q.field("branchId"), args.branchId)
          : q.eq(q.field("branchId"), undefined),
      )
      .collect();

    return await ctx.db.insert("twigs", {
      name: args.name,
      userId: identity.subject,
      colorTheme: args.colorTheme,
      type: args.type,
      branchId: args.branchId,
      position: existingTwigs.length + 1,
    });
  },
});

/**
 * Performs cascading deletion in this order:
 * 1. Deletes all completions for each leaf in the twig
 * 2. Deletes all leaves belonging to the twig
 * 3. Updates positions of remaining twigs to maintain order
 * 4. Deletes the twig itself
 *
 * @param {Id<"twigs">} id - ID of twig to delete
 * @throws {Error} If user is not authenticated or twig not found/owned by user
 */
export const remove = mutation({
  args: {
    id: v.id("twigs"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const twig = await ctx.db.get(args.id);
    if (!twig || twig.userId !== identity.subject) {
      throw new Error("Twig not found");
    }

    // Step 1 & 2 are handled by deleteTwigSubtree below

    // Step 3: Update positions of remaining twigs in the deleted twig's scope
    const siblingTwigs = await ctx.db
      .query("twigs")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .filter((q) =>
        twig.branchId
          ? q.eq(q.field("branchId"), twig.branchId)
          : q.eq(q.field("branchId"), undefined),
      )
      .collect();

    const deletedPosition = twig.position ?? siblingTwigs.length;

    // Decrement position of sibling twigs that were after the deleted one
    for (const otherTwig of siblingTwigs) {
      if (otherTwig._id === args.id) continue;

      const currentPosition = otherTwig.position ?? siblingTwigs.length;
      if (currentPosition > deletedPosition) {
        await ctx.db.patch(otherTwig._id, {
          position: currentPosition - 1,
        });
      }
    }

    // Step 4: Delete the twig and its subtree (leaves + completions)
    await deleteTwigSubtree(ctx, args.id);
  },
});

/**
 * Position update logic (parameterized by scope — the twig's branchId):
 * - Moving down: Decrement positions of siblings between old and new position
 * - Moving up: Increment positions of siblings between new and old position
 * - Cross-scope move (branchId differs): close the gap in the old scope, then
 *   use the given position in the new scope, or append at the end if no
 *   position is provided.
 *
 * @param {Id<"twigs">} id - Twig ID to update
 * @param {string} name - New twig name
 * @param {string} colorTheme - New color theme
 * @param {number} [position] - New position in the (new) scope
 * @param {Id<"branches">} [branchId] - Optional branch to move the twig into
 * @throws {Error} If user is not authenticated, twig/branch not found/owned by user, or invalid position
 */
export const update = mutation({
  args: {
    id: v.id("twigs"),
    name: v.string(),
    colorTheme: v.string(),
    position: v.optional(v.number()),
    branchId: v.optional(v.id("branches")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const twig = await ctx.db.get(args.id);
    if (!twig || twig.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    // If moving to a branch, verify the branch belongs to the user
    if (args.branchId) {
      const branch = await ctx.db.get(args.branchId);
      if (!branch || branch.userId !== identity.subject) {
        throw new Error("Branch not found");
      }
    }

    // Siblings are the twigs sharing the twig's NEW scope (branchId)
    const siblings = await ctx.db
      .query("twigs")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .filter((q) =>
        args.branchId
          ? q.eq(q.field("branchId"), args.branchId)
          : q.eq(q.field("branchId"), undefined),
      )
      .collect();

    const scopeChanged = args.branchId !== twig.branchId;

    // Determine the new position within the new scope
    let newPosition: number;
    if (scopeChanged) {
      // Cross-scope move: use the provided position if given, else append at end
      newPosition = args.position ?? siblings.length + 1;
    } else if (args.position !== undefined) {
      newPosition = args.position;
    } else {
      // Same scope without a position - keep the current position
      newPosition = twig.position ?? siblings.length + 1;
    }

    // Validate position
    if (newPosition < 1 || newPosition > siblings.length + 1) {
      throw new Error("Invalid position");
    }

    const oldPosition = twig.position ?? siblings.length;

    if (scopeChanged) {
      // Close the gap left behind in the old scope
      const oldSiblings = await ctx.db
        .query("twigs")
        .filter((q) => q.eq(q.field("userId"), identity.subject))
        .filter((q) =>
          twig.branchId
            ? q.eq(q.field("branchId"), twig.branchId)
            : q.eq(q.field("branchId"), undefined),
        )
        .collect();

      const deletedPosition = twig.position ?? oldSiblings.length + 1;

      for (const otherTwig of oldSiblings) {
        if (otherTwig._id === args.id) continue;

        const currentPosition = otherTwig.position ?? oldSiblings.length + 1;
        if (currentPosition > deletedPosition) {
          await ctx.db.patch(otherTwig._id, {
            position: currentPosition - 1,
          });
        }
      }

      // Make room in the new scope when a specific position was requested
      if (args.position !== undefined) {
        for (const sibling of siblings) {
          const currentPosition = sibling.position ?? 0;
          if (currentPosition >= newPosition) {
            await ctx.db.patch(sibling._id, {
              position: currentPosition + 1,
            });
          }
        }
      }
    } else if (args.position !== undefined && oldPosition !== newPosition) {
      // Pure in-scope reorder: shift siblings between the old and new position
      for (const otherTwig of siblings) {
        if (otherTwig._id === args.id) continue;

        const currentPosition = otherTwig.position ?? siblings.length;
        if (oldPosition < newPosition) {
          // Moving down: shift affected twigs up
          if (currentPosition > oldPosition && currentPosition <= newPosition) {
            await ctx.db.patch(otherTwig._id, {
              position: currentPosition - 1,
            });
          }
        } else {
          // Moving up: shift affected twigs down
          if (currentPosition >= newPosition && currentPosition < oldPosition) {
            await ctx.db.patch(otherTwig._id, {
              position: currentPosition + 1,
            });
          }
        }
      }
    }

    // Update the twig's properties
    await ctx.db.patch(args.id, {
      name: args.name,
      colorTheme: args.colorTheme,
      branchId: args.branchId,
      position: newPosition,
    });
  },
});

/**
 * @param {Id<"twigs">} id - Twig ID to retrieve
 * @throws {Error} If twig not found
 * @returns {Promise<Twig>} The requested twig
 */
export const get = query({
  args: { id: v.id("twigs") },
  handler: async (ctx, args) => {
    const twig = await ctx.db.get(args.id);
    if (!twig) throw new Error("Twig not found");
    return twig;
  },
});
