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
