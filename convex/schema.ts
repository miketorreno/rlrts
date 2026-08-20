import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  twigs: defineTable({
    name: v.string(),
    userId: v.string(),
    colorTheme: v.string(),
    position: v.optional(v.number()),
    branchId: v.optional(v.id("branches")),
  })
    .index("by_user", ["userId"])
    .index("by_branch", ["branchId"]),

  trunks: defineTable({
    name: v.string(),
    userId: v.string(),
    position: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  limbs: defineTable({
    name: v.string(),
    userId: v.string(),
    trunkId: v.id("trunks"),
    position: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_trunk", ["trunkId"]),

  branches: defineTable({
    name: v.string(),
    userId: v.string(),
    limbId: v.id("limbs"),
    position: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_limb", ["limbId"]),

  leaves: defineTable({
    name: v.string(),
    userId: v.string(),
    twigId: v.id("twigs"),
    xp: v.optional(v.number()),
    timerDuration: v.optional(v.number()),
    position: v.optional(v.number()),
    scheduledTimer: v.optional(v.id("_scheduled_functions")),
    timerEnd: v.optional(v.number()),
    reminderTime: v.optional(
      v.object({
        hour: v.number(),
        minute: v.number(),
      }),
    ),
    scheduledReminder: v.optional(v.id("_scheduled_functions")),
    reminderNextFire: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_twig", ["twigId"])
    .index("scheduledTimer", ["scheduledTimer"]),

  completions: defineTable({
    leafId: v.id("leaves"),
    userId: v.string(),
    completedAt: v.number(),
  })
    .index("by_leaf", ["leafId"])
    .index("by_user_and_date", ["userId", "completedAt"]),

  todos: defineTable({
    name: v.string(),
    userId: v.string(),
    cadence: v.union(v.literal("daily"), v.literal("weekly")),
    xp: v.number(),
    position: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  todoItems: defineTable({
    todoId: v.id("todos"),
    userId: v.string(),
    name: v.string(),
    position: v.optional(v.number()),
    isCompleted: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_todo", ["todoId"]),

  todoCompletions: defineTable({
    todoId: v.id("todos"),
    userId: v.string(),
    completedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "completedAt"]),

  xpEvents: defineTable({
    userId: v.string(),
    source: v.union(v.literal("todo"), v.literal("habit")),
    sourceId: v.string(),
    amount: v.number(),
    baseAmount: v.number(),
    streakAtTime: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_source", ["userId", "source"]),

  xpProfiles: defineTable({
    userId: v.string(),
    lifetimeXp: v.number(),
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastCompletionDate: v.optional(v.string()),
    onboardingCompleted: v.optional(v.boolean()),
  }).index("by_user", ["userId"]),
});
