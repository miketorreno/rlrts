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

    const existingProfile = await ctx.db
      .query("xpProfiles")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    if (!existingProfile) {
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
    const multiplier = streakMultiplier(existingProfile.currentStreak);
    const amount = Math.round(baseAmount * multiplier);

    await ctx.db.patch(existingProfile._id, {
      lifetimeXp: existingProfile.lifetimeXp + amount,
      currentStreak: existingProfile.currentStreak + 1,
      longestStreak: Math.max(existingProfile.longestStreak, existingProfile.currentStreak + 1),
      lastCompletionDate: today,
    });

    await ctx.db.insert("xpEvents", {
      userId: identity.subject,
      source: "habit",
      sourceId: args.leafId,
      amount,
      baseAmount,
      streakAtTime: existingProfile.currentStreak,
      createdAt: Date.now(),
    });
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
