import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  twigs: defineTable({
    name: v.string(),
    userId: v.string(),
    colorTheme: v.string(),
    position: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  leaves: defineTable({
    name: v.string(),
    userId: v.string(),
    twigId: v.id("twigs"),
    timerDuration: v.optional(v.number()),
    position: v.optional(v.number()),
    scheduledTimer: v.optional(v.id("_scheduled_functions")),
    timerEnd: v.optional(v.number()),
  })
    .index("by_twig", ["twigId"])
    .index("scheduledTimer", ["scheduledTimer"]),

  completions: defineTable({
    leafId: v.id("leaves"),
    userId: v.string(),
    completedAt: v.number(),
  })
    .index("by_leaf", ["leafId"])
    .index("by_user_and_date", ["userId", "completedAt"]),
});
