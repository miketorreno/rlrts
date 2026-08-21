import { v } from "convex/values";
import { query, mutation, type MutationCtx } from "./_generated/server";

export function streakMultiplier(streak: number): number {
  return Math.min(1 + streak * 0.1, 1.5);
}

export const getXpProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("xpProfiles")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    if (!profile) {
      return {
        lifetimeXp: 0,
        currentStreak: 0,
        longestStreak: 0,
        level: 0,
        xpForNextLevel: 100,
        xpInCurrentLevel: 0,
      };
    }

    const level = Math.floor(Math.sqrt(profile.lifetimeXp / 100));
    const xpForCurrentLevel = level * level * 100;
    const xpForNextLevel = (level + 1) * (level + 1) * 100;

    return {
      lifetimeXp: profile.lifetimeXp,
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      level,
      xpForNextLevel,
      xpInCurrentLevel: profile.lifetimeXp - xpForCurrentLevel,
    };
  },
});

export const getRecentEvents = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const events = await ctx.db
      .query("xpEvents")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
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
  },
});

export const recordHabitXp = mutation({
  args: {
    leafId: v.id("leaves"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const leaf = await ctx.db.get(args.leafId);
    if (!leaf || leaf.userId !== identity.subject) {
      throw new Error("Leaf not found");
    }

    const baseAmount = leaf.xp ?? 0;
    if (baseAmount <= 0) return;

    // Update streak before recording XP
    let profile = await ctx.db
      .query("xpProfiles")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    if (profile) {
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      if (profile.lastCompletionDate !== today && profile.lastCompletionDate !== yesterday) {
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
        lastCompletionDate: new Date().toISOString().split("T")[0],
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
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const alreadyCompletedToday = profile.lastCompletionDate === today;
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
        longestStreak: Math.max(profile.longestStreak, profile.currentStreak + 1),
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
  },
});

export const getOnboardingStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("xpProfiles")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    return { onboardingCompleted: profile?.onboardingCompleted === true };
  },
});

export const completeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("xpProfiles")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!profile) {
      await ctx.db.insert("xpProfiles", {
        userId: identity.subject,
        lifetimeXp: 0,
        currentStreak: 0,
        longestStreak: 0,
        onboardingCompleted: true,
      });
    } else {
      await ctx.db.patch(profile._id, { onboardingCompleted: true });
    }
  },
});

export async function updateStreak(
  ctx: MutationCtx,
  userId: string,
) {
  const profile = await ctx.db
    .query("xpProfiles")
    .filter((q) => q.eq(q.field("userId"), userId))
    .first();

  if (!profile) return;

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (profile.lastCompletionDate === today) {
    return;
  } else if (profile.lastCompletionDate === yesterday) {
    // Streak continues
  } else {
    // Streak broken
    await ctx.db.patch(profile._id, {
      currentStreak: 0,
    });
  }
}
