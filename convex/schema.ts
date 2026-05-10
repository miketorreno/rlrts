import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  calendars: defineTable({
    name: v.string(),
    userId: v.string(),
    colorTheme: v.string(),
    position: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  habits: defineTable({
    name: v.string(),
    userId: v.string(),
    calendarId: v.id("calendars"),
    timerDuration: v.optional(v.number()),
    position: v.optional(v.number()),
    scheduledTimer: v.optional(v.id("_scheduled_functions")),
    timerEnd: v.optional(v.number()),
  })
    .index("by_calendar", ["calendarId"])
    .index("scheduledTimer", ["scheduledTimer"]),

  completions: defineTable({
    habitId: v.id("habits"),
    userId: v.string(),
    completedAt: v.number(),
  })
    .index("by_habit", ["habitId"])
    .index("by_user_and_date", ["userId", "completedAt"]),
});
