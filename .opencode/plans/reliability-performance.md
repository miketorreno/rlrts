# Reliability & Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add test infrastructure, consolidate dashboard queries, and fix missing Convex indexes.

**Architecture:** (1) Add Vitest + write tests for the 3 most complex/risky Convex functions. (2) Create a single `getDashboardStats` query replacing 12 separate queries. (3) Add missing `by_user` indexes to 3 tables.

**Tech Stack:** Vitest (test runner), Convex testing helpers, Convex indexes, next-intl.

**Spec:** Audit findings from comprehensive project review.

## Global Constraints

- Package manager: pnpm only
- Verification after every task: `pnpm lint` (0 errors) + `npx tsc --noEmit` + `pnpm build`
- Convex backend must be running (`npx convex dev`) for codegen after schema/function changes

---

## Tasks

### Task 1: Add Vitest + Write Tests for XP/Streak Logic

**Files:**
- Modify: `package.json` (add vitest devDependency + test script)
- Create: `vitest.config.ts`
- Create: `convex/__tests__/xp.test.ts` (or similar path)
- Create: `convex/__tests__/todos.test.ts`

**Interfaces:**
- Tests validate: `streakMultiplier`, `updateStreak`, `recomputeCompletion` logic

- [ ] **Step 1:** Install Vitest: `pnpm add -D vitest`
- [ ] **Step 2:** Create `vitest.config.ts` with Convex-compatible config
- [ ] **Step 3:** Add `"test": "vitest run"` to package.json scripts
- [ ] **Step 4:** Write tests for `streakMultiplier` (pure function — test edge cases: streak 0, 1, 5, 10, 15)
- [ ] **Step 5:** Write tests for `updateStreak` logic — test today, yesterday, gap > 1 day scenarios
- [ ] **Step 6:** Run: `pnpm test` — verify all pass
- [ ] **Step 7:** Commit: `test(xp): add Vitest + tests for XP streak logic`

---

### Task 2: Consolidate Dashboard into Single Query

**Files:**
- Modify: `convex/dashboard.ts` (CREATE)
- Modify: `src/app/[locale]/dashboard/page.tsx`
- Modify: `src/components/dashboard/hero-stats.tsx`
- Modify: `src/components/dashboard/entity-counts.tsx`
- Modify: `src/components/dashboard/completion-charts.tsx`
- Modify: `src/components/dashboard/activity-feed.tsx`

**Interfaces:**
- Produces: `getDashboardStats` query returning all counts + XP profile + recent events in one round-trip
- Consumes: All dashboard components receive data as props instead of each querying independently

- [ ] **Step 1:** Create `convex/dashboard.ts` with `getDashboardStats` query that returns:
  ```ts
  {
    xpProfile: { level, lifetimeXp, currentStreak, longestStreak, xpForNextLevel, xpInCurrentLevel },
    counts: { trunks, limbs, branches, twigs, leaves, todos },
    todayProgress: { habitsDone, totalHabits, todosDone, totalTodos },
    recentEvents: [...],
  }
  ```
- [ ] **Step 2:** Run `npx convex dev` to regenerate codegen
- [ ] **Step 3:** Modify dashboard page to fetch via single `useQuery(api.dashboard.getDashboardStats)` and pass data down to child components as props
- [ ] **Step 4:** Update each child component to accept props instead of querying independently
- [ ] **Step 5:** Verify: `npx tsc --noEmit && pnpm lint && pnpm build`
- [ ] **Step 6:** Commit: `perf(dashboard): consolidate 12 queries into single getDashboardStats`

---

### Task 3: Add Missing Convex Indexes

**Files:**
- Modify: `convex/schema.ts`
- Modify: `convex/leaves.ts` (add `.withIndex()` calls)
- Modify: `convex/todos.ts` (add `.withIndex()` calls)
- Modify: `convex/tree.ts` (add `.withIndex()` calls)

**Interfaces:**
- Produces: 3 new indexes, updated queries using them

- [ ] **Step 1:** Add indexes to `convex/schema.ts`:
  ```ts
  // leaves table — add by_user index
  .index("by_user", ["userId"])
  
  // todoItems table — add by_user index (requires userId field or join through todo)
  // Note: todoItems may not have userId directly — check if querying through todo is sufficient
  
  // todoCompletions table — add standalone by_user index
  .index("by_user", ["userId"])
  ```
- [ ] **Step 2:** Update `leaves.ts` queries to use `.withIndex("by_user")` where filtering by userId
- [ ] **Step 3:** Update `tree.ts` to use `.withIndex("by_user")` on all 5 table queries
- [ ] **Step 4:** Update `todos.ts` queries to use `.withIndex()` where applicable
- [ ] **Step 5:** Run `npx convex dev` to regenerate codegen
- [ ] **Step 6:** Verify: `npx tsc --noEmit && pnpm lint && pnpm build`
- [ ] **Step 7:** Commit: `perf(convex): add by_user indexes to leaves, todoCompletions and use .withIndex()`

---

## Task Dependencies

```
Task 1 (Tests) — independent
Task 2 (Consolidate queries) — independent
Task 3 (Indexes) — independent
```

All three tasks are independent and can run in parallel.
