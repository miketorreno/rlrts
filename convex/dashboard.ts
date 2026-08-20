import { query } from "./_generated/server";

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        xpProfile: {
          level: 0,
          lifetimeXp: 0,
          currentStreak: 0,
          longestStreak: 0,
          xpForNextLevel: 100,
          xpInCurrentLevel: 0,
        },
        counts: { trunks: 0, limbs: 0, branches: 0, twigs: 0, leaves: 0, todos: 0 },
        todayProgress: { habitsDone: 0, totalHabits: 0, todosDone: 0, totalTodos: 0 },
        recentEvents: [] as Array<{
          _id: string;
          source: string;
          sourceName: string;
          amount: number;
          createdAt: number;
        }>,
      };
    }

    const userId = identity.subject;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfDayMs = today.getTime();
    const endOfDayMs = startOfDayMs + 86400000 - 1;
    const chartRangeStart = Date.now() - 28 * 24 * 60 * 60 * 1000;

    const [xpProfile, trunks, limbs, branches, twigs, leaves, todayCompletions, todoData, recentEvents] =
      await Promise.all([
        ctx.db.query("xpProfiles").filter((q) => q.eq(q.field("userId"), userId)).first(),
        ctx.db.query("trunks").filter((q) => q.eq(q.field("userId"), userId)).collect(),
        ctx.db.query("limbs").filter((q) => q.eq(q.field("userId"), userId)).collect(),
        ctx.db.query("branches").filter((q) => q.eq(q.field("userId"), userId)).collect(),
        ctx.db.query("twigs").filter((q) => q.eq(q.field("userId"), userId)).collect(),
        ctx.db.query("leaves").filter((q) => q.eq(q.field("userId"), userId)).collect(),
        ctx.db
          .query("completions")
          .withIndex("by_user_and_date", (q) =>
            q.eq("userId", userId).gte("completedAt", startOfDayMs).lte("completedAt", endOfDayMs),
          )
          .collect(),
        (async () => {
          const todos = await ctx.db.query("todos").filter((q) => q.eq(q.field("userId"), userId)).collect();
          const items = await ctx.db.query("todoItems").filter((q) => q.eq(q.field("userId"), userId)).collect();
          const completions = await ctx.db.query("todoCompletions").filter((q) => q.eq(q.field("userId"), userId)).collect();
          return { todos, items, completions };
        })(),
        (async () => {
          const events = await ctx.db
            .query("xpEvents")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .take(10);
          return Promise.all(
            events.map(async (event) => {
              let sourceName = "Unknown";
              if (event.source === "habit") {
                const leaf = await ctx.db
                  .query("leaves")
                  .filter((q) => q.eq(q.field("_id"), event.sourceId))
                  .first();
                if (leaf) sourceName = leaf.name;
              } else {
                const todo = await ctx.db
                  .query("todos")
                  .filter((q) => q.eq(q.field("_id"), event.sourceId))
                  .first();
                if (todo) sourceName = todo.name;
              }
              return { ...event, sourceName };
            }),
          );
        })(),
      ]);

    const profile = xpProfile ?? {
      lifetimeXp: 0,
      currentStreak: 0,
      longestStreak: 0,
    };
    const level = Math.floor(Math.sqrt(profile.lifetimeXp / 100));
    const xpForCurrentLevel = level * level * 100;
    const xpForNextLevel = (level + 1) * (level + 1) * 100;

    const todayKey = new Date().toISOString().split("T")[0];
    const uniqueHabitsDone = new Set(todayCompletions.map((c) => c.leafId)).size;
    const todosDoneToday = todoData.completions.filter((c) => {
      const cDate = new Date(c.completedAt).toISOString().split("T")[0];
      return cDate === todayKey;
    }).length;

    return {
      xpProfile: {
        level,
        lifetimeXp: profile.lifetimeXp,
        currentStreak: profile.currentStreak,
        longestStreak: profile.longestStreak,
        xpForNextLevel,
        xpInCurrentLevel: profile.lifetimeXp - xpForCurrentLevel,
      },
      counts: {
        trunks: trunks.length,
        limbs: limbs.length,
        branches: branches.length,
        twigs: twigs.length,
        leaves: leaves.length,
        todos: todoData.todos.length,
      },
      todayProgress: {
        habitsDone: uniqueHabitsDone,
        totalHabits: leaves.length,
        todosDone: todosDoneToday,
        totalTodos: todoData.todos.length,
      },
      recentEvents: recentEvents,
    };
  },
});
