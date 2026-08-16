import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { deleteTwigSubtree } from "./tree_utils";

/**
 *
 * Key features:
 * - Position-based ordering of twigs
 * - Cascading deletions (twig -> leaves -> completions)
 * - User-specific twig management
 * - Authentication checks on all operations
 */

/**
 * @throws {Error} If user is not authenticated
 * @returns {Promise<Twig[]>} List of twigs owned by the user
 */
export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.db
      .query("twigs")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .order("asc")
      .collect();
  },
});

/**
 * @param {string} name - Display name for the twig
 * @param {string} colorTheme - Color theme identifier for UI customization
 * @throws {Error} If user is not authenticated
 * @returns {Promise<Id<"twigs">>} ID of the newly created twig
 */
export const create = mutation({
  args: {
    name: v.string(),
    colorTheme: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Position is 1-based and determined by number of existing twigs
    const existingTwigs = await ctx.db
      .query("twigs")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    return await ctx.db.insert("twigs", {
      name: args.name,
      userId: identity.subject,
      colorTheme: args.colorTheme,
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

    // Step 3: Update positions of remaining twigs
    const allTwigs = await ctx.db
      .query("twigs")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    const deletedPosition = twig.position ?? allTwigs.length;

    // Decrement position of all twigs that were after the deleted one
    for (const otherTwig of allTwigs) {
      if (otherTwig._id === args.id) continue;

      const currentPosition = otherTwig.position ?? allTwigs.length;
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
 * Position update logic:
 * - Moving down: Decrement positions of twigs between old and new position
 * - Moving up: Increment positions of twigs between new and old position
 *
 * @param {Id<"twigs">} id - Twig ID to update
 * @param {string} name - New twig name
 * @param {string} colorTheme - New color theme
 * @param {number} position - New position in the list
 * @throws {Error} If user is not authenticated or twig not found/owned by user
 */
export const update = mutation({
  args: {
    id: v.id("twigs"),
    name: v.string(),
    colorTheme: v.string(),
    position: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const twig = await ctx.db.get(args.id);
    if (!twig || twig.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    const allTwigs = await ctx.db
      .query("twigs")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    // Handle position updates if position changed
    if (twig.position !== args.position) {
      const oldPosition = twig.position ?? allTwigs.length;
      const newPosition = args.position;

      for (const otherTwig of allTwigs) {
        if (otherTwig._id === args.id) continue;

        const currentPosition = otherTwig.position ?? allTwigs.length;
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
      position: args.position,
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
