import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 *
 * Key features:
 * - Position-based ordering of calendars
 * - Cascading deletions (calendar -> habits -> completions)
 * - User-specific calendar management
 * - Authentication checks on all operations
 */

/**
 * @throws {Error} If user is not authenticated
 * @returns {Promise<Calendar[]>} List of calendars owned by the user
 */
export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.db
      .query("calendars")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .order("asc")
      .collect();
  },
});

/**
 * @param {string} name - Display name for the calendar
 * @param {string} colorTheme - Color theme identifier for UI customization
 * @throws {Error} If user is not authenticated
 * @returns {Promise<Id<"calendars">>} ID of the newly created calendar
 */
export const create = mutation({
  args: {
    name: v.string(),
    colorTheme: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Position is 1-based and determined by number of existing calendars
    const existingCalendars = await ctx.db
      .query("calendars")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    return await ctx.db.insert("calendars", {
      name: args.name,
      userId: identity.subject,
      colorTheme: args.colorTheme,
      position: existingCalendars.length + 1,
    });
  },
});

/**
 * Performs cascading deletion in this order:
 * 1. Deletes all completions for each habit in the calendar
 * 2. Deletes all habits belonging to the calendar
 * 3. Updates positions of remaining calendars to maintain order
 * 4. Deletes the calendar itself
 *
 * @param {Id<"calendars">} id - ID of calendar to delete
 * @throws {Error} If user is not authenticated or calendar not found/owned by user
 */
export const remove = mutation({
  args: {
    id: v.id("calendars"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const calendar = await ctx.db.get(args.id);
    if (!calendar || calendar.userId !== identity.subject) {
      throw new Error("Calendar not found");
    }

    // Step 1 & 2: Delete habits and their completions
    const habits = await ctx.db
      .query("habits")
      .filter((q) => q.eq(q.field("calendarId"), args.id))
      .collect();

    for (const habit of habits) {
      // Delete all completions for this habit first
      await ctx.db
        .query("completions")
        .filter((q) => q.eq(q.field("habitId"), habit._id))
        .collect()
        .then((completions) => {
          return Promise.all(
            completions.map((completion) => ctx.db.delete(completion._id)),
          );
        });

      // Then delete the habit itself
      await ctx.db.delete(habit._id);
    }

    // Step 3: Update positions of remaining calendars
    const allCalendars = await ctx.db
      .query("calendars")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    const deletedPosition = calendar.position ?? allCalendars.length;

    // Decrement position of all calendars that were after the deleted one
    for (const otherCalendar of allCalendars) {
      if (otherCalendar._id === args.id) continue;

      const currentPosition = otherCalendar.position ?? allCalendars.length;
      if (currentPosition > deletedPosition) {
        await ctx.db.patch(otherCalendar._id, {
          position: currentPosition - 1,
        });
      }
    }

    // Step 4: Delete the calendar
    await ctx.db.delete(args.id);
  },
});

/**
 * Position update logic:
 * - Moving down: Decrement positions of calendars between old and new position
 * - Moving up: Increment positions of calendars between new and old position
 *
 * @param {Id<"calendars">} id - Calendar ID to update
 * @param {string} name - New calendar name
 * @param {string} colorTheme - New color theme
 * @param {number} position - New position in the list
 * @throws {Error} If user is not authenticated or calendar not found/owned by user
 */
export const update = mutation({
  args: {
    id: v.id("calendars"),
    name: v.string(),
    colorTheme: v.string(),
    position: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const calendar = await ctx.db.get(args.id);
    if (!calendar || calendar.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    const allCalendars = await ctx.db
      .query("calendars")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    // Handle position updates if position changed
    if (calendar.position !== args.position) {
      const oldPosition = calendar.position ?? allCalendars.length;
      const newPosition = args.position;

      for (const otherCalendar of allCalendars) {
        if (otherCalendar._id === args.id) continue;

        const currentPosition = otherCalendar.position ?? allCalendars.length;
        if (oldPosition < newPosition) {
          // Moving down: shift affected calendars up
          if (currentPosition > oldPosition && currentPosition <= newPosition) {
            await ctx.db.patch(otherCalendar._id, {
              position: currentPosition - 1,
            });
          }
        } else {
          // Moving up: shift affected calendars down
          if (currentPosition >= newPosition && currentPosition < oldPosition) {
            await ctx.db.patch(otherCalendar._id, {
              position: currentPosition + 1,
            });
          }
        }
      }
    }

    // Update the calendar's properties
    await ctx.db.patch(args.id, {
      name: args.name,
      colorTheme: args.colorTheme,
      position: args.position,
    });
  },
});

/**
 * @param {Id<"calendars">} id - Calendar ID to retrieve
 * @throws {Error} If calendar not found
 * @returns {Promise<Calendar>} The requested calendar
 */
export const get = query({
  args: { id: v.id("calendars") },
  handler: async (ctx, args) => {
    const calendar = await ctx.db.get(args.id);
    if (!calendar) throw new Error("Calendar not found");
    return calendar;
  },
});
