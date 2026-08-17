# XP System Design Spec

## Goal

Design a gamification system that promotes productivity by rewarding consistent habit and todo completion with cumulative XP, streaks, levels, and multipliers.

## Architecture

Event-based model: each completion writes an `xpEvents` row and updates a cumulative `xpProfile`. Levels are derived (not stored) from lifetime XP. Streaks track consecutive periods with completions.

## Data Model

### New table: `xpEvents`

```ts
xpEvents: defineTable({
  userId: v.string(),
  source: v.union(v.literal("todo"), v.literal("habit")),
  sourceId: v.string(),        // todo._id or leaf._id
  amount: v.number(),          // XP earned (after multipliers)
  baseAmount: v.number(),      // XP before multipliers (for display)
  streakAtTime: v.number(),    // streak count when this happened
  createdAt: v.number(),       // timestamp
}).index("by_user", ["userId"])
  .index("by_user_source", ["userId", "source"])
```

### New table: `xpProfiles`

```ts
xpProfiles: defineTable({
  userId: v.string(),
  lifetimeXp: v.number(),
  currentStreak: v.number(),
  longestStreak: v.number(),
  lastCompletionDate: v.optional(v.string()),  // "yyyy-MM-dd"
}).index("by_user", ["userId"])
```

### Modified table: `leaves`

```ts
// Add to existing leaves table:
xp: v.optional(v.number()),  // XP reward per habit completion
```

### Existing table: `todos` (unchanged)

```ts
// Already has:
xp: v.number(),  // XP reward per todo completion
```

## XP Mechanics

### Earning XP
- **Todos:** Complete all sub-items → earn `todo.xp`
- **Habits:** Complete a leaf (mark done in completions) → earn `leaf.xp`
- Both write an `xpEvents` row and update `xpProfile.lifetimeXp`

### Multipliers
- **Streak multiplier:** +10% per consecutive period, up to +50% max
- Applied at completion: `finalXp = baseXp * min(1 + streak * 0.1, 1.5)`
- `baseAmount` and `amount` in `xpEvents` capture both values

### Levels
- Derived from lifetime XP: `level = floor(sqrt(lifetimeXp / 100))`
- Level thresholds: 1=100, 5=2500, 10=10000, 20=40000
- Displayed as "Level N" (no theming)

### Streak Calculation
- Per-user (not per-habit or per-todo)
- After each completion: check if previous period had completions
- Yes → increment streak. No → streak resets to 1
- `lastCompletionDate` tracks most recent completion period key
- Streaks reset if a full period passes with zero completions

## UI Components

### Sidebar XP Badge (upgrade existing)
- Show: level number + XP total + streak fire icon
- Format: `Lv.5 • 2,847 XP • 🔥 12`
- Add small progress bar to next level
- Works on desktop sidebar; add streak to mobile header/bottom nav

### Todo/Habit Cards
- Todo cards: keep existing XP badge, add multiplier indicator when > 1x
- Habit cards: add XP badge (same style as todo)
- Multiplier display: `10 XP (1.3x)` or similar

### NOT in scope (YAGNI)
- XP history page
- Achievements/badges system
- Daily/weekly XP goals
- XP gain animations

## Files

### New files
| File | Purpose |
|------|---------|
| `convex/xp.ts` | Backend: `getXpProfile`, `recordCompletion`, streak/level calculations |
| `src/lib/xp.ts` | Client: `levelFromXp()`, `streakMultiplier()`, `xpForNextLevel()` |

### Modified files
| File | Change |
|------|--------|
| `convex/schema.ts` | Add `xpEvents`, `xpProfiles` tables; add `xp` to `leaves` |
| `convex/todos.ts` | Write to `xpEvents` + update `xpProfile` after earning XP |
| `convex/leaves.ts` | Add XP param to create/update; write to `xpEvents` on completion |
| `src/components/todo/xp-badge.tsx` | Upgrade: level, streak, progress bar |
| `src/components/todo/todo-item.tsx` | Show multiplier when active |
| `src/components/leaf/leaf-item.tsx` | Add XP badge |
| `src/components/leaf/leaf-dialogs.tsx` | Add XP input field |
| `src/components/layout/app-sidebar.tsx` | Update XpBadge if needed |
| `src/messages/{9 locales}.json` | New i18n keys |

### NOT modified
- `convex/completions.ts` — stays as-is; XP derived via triggers
- `src/components/todo/todo-list.tsx` — no changes needed
