import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { MutationCtx, mutation, query } from "./_generated/server";
import { streakMultiplier } from "./xp";

export function periodStart(cadence: "daily" | "weekly", now: number): number {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  if (cadence === "weekly") {
    const daysBack = (date.getDay() + 6) % 7;
    date.setDate(date.getDate() - daysBack);
  }
  return date.getTime();
}

async function recomputeCompletion(
  ctx: MutationCtx,
  userId: string,
  todo: Doc<"todos">,
) {
  const items = await ctx.db
    .query("todoItems")
    .filter((q) => q.eq(q.field("todoId"), todo._id))
    .collect();

  const allDone = items.length > 0 && items.every((item) => item.isCompleted);

  const periodStartMs = periodStart(todo.cadence, Date.now());
  const currentPeriodCompletions = await ctx.db
    .query("todoCompletions")
    .withIndex("by_user_and_date", (q) =>
      q.eq("userId", userId).gte("completedAt", periodStartMs),
    )
    .filter((q) => q.eq(q.field("todoId"), todo._id))
    .collect();

  if (allDone) {
    if (currentPeriodCompletions.length === 0) {
      await ctx.db.insert("todoCompletions", {
        todoId: todo._id,
        userId,
        completedAt: Date.now(),
      });

      // Record XP for this completion
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0];

      let profile = await ctx.db
        .query("xpProfiles")
        .filter((q) => q.eq(q.field("userId"), userId))
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
        const profileId = await ctx.db.insert("xpProfiles", {
          userId,
          lifetimeXp: todo.xp,
          currentStreak: 1,
          longestStreak: 1,
          lastCompletionDate: today,
        });
        await ctx.db.insert("xpEvents", {
          userId,
          source: "todo",
          sourceId: todo._id,
          amount: todo.xp,
          baseAmount: todo.xp,
          streakAtTime: 1,
          createdAt: Date.now(),
        });
      } else {
        const alreadyCompletedToday = profile.lastCompletionDate === today;
        const multiplier = streakMultiplier(profile.currentStreak);
        const amount = Math.round(todo.xp * multiplier);

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
          userId,
          source: "todo",
          sourceId: todo._id,
          amount,
          baseAmount: todo.xp,
          streakAtTime: profile.currentStreak,
          createdAt: Date.now(),
        });
      }
    }
  } else {
    for (const completion of currentPeriodCompletions) {
      await ctx.db.delete(completion._id);
    }
  }
}

export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const todos = await ctx.db
      .query("todos")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();
    const items = await ctx.db
      .query("todoItems")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();
    const completions = await ctx.db
      .query("todoCompletions")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    return {
      todos: todos.sort(
        (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity),
      ),
      items,
      completions,
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    cadence: v.union(v.literal("daily"), v.literal("weekly")),
    xp: v.number(),
    items: v.array(v.object({ name: v.string() })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existingTodos = await ctx.db
      .query("todos")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    const maxPosition = existingTodos.reduce(
      (max, todo) => Math.max(max, todo.position || 0),
      0,
    );

    const todoId = await ctx.db.insert("todos", {
      name: args.name,
      userId: identity.subject,
      cadence: args.cadence,
      xp: args.xp,
      position: maxPosition + 1,
    });

    for (const [index, item] of args.items.entries()) {
      await ctx.db.insert("todoItems", {
        todoId,
        userId: identity.subject,
        name: item.name,
        position: index + 1,
        isCompleted: false,
      });
    }

    return todoId;
  },
});

export const update = mutation({
  args: {
    id: v.id("todos"),
    name: v.string(),
    cadence: v.union(v.literal("daily"), v.literal("weekly")),
    xp: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const todo = await ctx.db.get(args.id);
    if (!todo || todo.userId !== identity.subject) {
      throw new Error("Todo not found");
    }

    await ctx.db.patch(args.id, {
      name: args.name,
      cadence: args.cadence,
      xp: args.xp,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const todo = await ctx.db.get(args.id);
    if (!todo || todo.userId !== identity.subject) {
      throw new Error("Todo not found");
    }

    const items = await ctx.db
      .query("todoItems")
      .filter((q) => q.eq(q.field("todoId"), args.id))
      .collect();
    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    const completions = await ctx.db
      .query("todoCompletions")
      .filter((q) => q.eq(q.field("todoId"), args.id))
      .collect();
    for (const completion of completions) {
      await ctx.db.delete(completion._id);
    }

    const allTodos = await ctx.db
      .query("todos")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    const deletedPosition = todo.position ?? allTodos.length + 1;

    for (const otherTodo of allTodos) {
      if (otherTodo._id === args.id) continue;

      const currentPosition = otherTodo.position ?? allTodos.length + 1;
      if (currentPosition > deletedPosition) {
        await ctx.db.patch(otherTodo._id, {
          position: currentPosition - 1,
        });
      }
    }

    await ctx.db.delete(args.id);
  },
});

export const toggleItem = mutation({
  args: {
    todoId: v.id("todos"),
    itemId: v.id("todoItems"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const todo = await ctx.db.get(args.todoId);
    if (!todo || todo.userId !== identity.subject) {
      throw new Error("Todo not found");
    }

    const item = await ctx.db.get(args.itemId);
    if (
      !item ||
      item.todoId !== args.todoId ||
      item.userId !== identity.subject
    ) {
      throw new Error("Item not found");
    }

    await ctx.db.patch(args.itemId, { isCompleted: !item.isCompleted });

    await recomputeCompletion(ctx, identity.subject, todo);
  },
});

export const addItem = mutation({
  args: {
    todoId: v.id("todos"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const todo = await ctx.db.get(args.todoId);
    if (!todo || todo.userId !== identity.subject) {
      throw new Error("Todo not found");
    }

    const items = await ctx.db
      .query("todoItems")
      .filter((q) => q.eq(q.field("todoId"), args.todoId))
      .collect();

    const maxPosition = items.reduce(
      (max, item) => Math.max(max, item.position || 0),
      0,
    );

    await ctx.db.insert("todoItems", {
      todoId: args.todoId,
      userId: identity.subject,
      name: args.name,
      position: maxPosition + 1,
      isCompleted: false,
    });

    await recomputeCompletion(ctx, identity.subject, todo);
  },
});

export const removeItem = mutation({
  args: { itemId: v.id("todoItems") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.itemId);
    if (!item || item.userId !== identity.subject) {
      throw new Error("Item not found");
    }

    const todo = await ctx.db.get(item.todoId);
    if (!todo || todo.userId !== identity.subject) {
      throw new Error("Todo not found");
    }

    await ctx.db.delete(args.itemId);

    await recomputeCompletion(ctx, identity.subject, todo);
  },
});

/**
 * @deprecated Use xp.getXpProfile instead. This query is kept for backward
 * compatibility but will be removed in a future release.
 */
export const getXp = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const completions = await ctx.db
      .query("todoCompletions")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();
    let xp = 0;
    for (const c of completions) {
      const todo = await ctx.db.get(c.todoId);
      if (todo) xp += todo.xp;
    }
    return { xp };
  },
});

export const resetPeriod = mutation({
  args: {
    cadence: v.union(v.literal("daily"), v.literal("weekly")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const todos = await ctx.db
      .query("todos")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();
    const cadenceTodoIds = new Set(
      todos.filter((todo) => todo.cadence === args.cadence).map((todo) => todo._id),
    );

    const items = await ctx.db
      .query("todoItems")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();
    for (const item of items) {
      if (item.isCompleted && cadenceTodoIds.has(item.todoId)) {
        await ctx.db.patch(item._id, { isCompleted: false });
      }
    }

    const todoById = new Map(todos.map((todo) => [todo._id, todo]));
    const now = Date.now();
    const completions = await ctx.db
      .query("todoCompletions")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();
    for (const completion of completions) {
      const todo = todoById.get(completion.todoId);
      if (!todo) continue;
      if (todo.cadence !== args.cadence) continue;
      if (completion.completedAt < periodStart(todo.cadence, now)) {
        await ctx.db.delete(completion._id);
      }
    }
  },
});
