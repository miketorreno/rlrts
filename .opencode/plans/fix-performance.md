# Fix Performance Issues (Convex-Optimized)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix N+1 query patterns, add missing indexes, replace `.filter()` with `.withIndex()`, optimize dashboard overfetching, and apply Vercel React best practices.

**Architecture:** The app has multiple performance bottlenecks: N+1 queries in dashboard/xp, full table scans where indexes exist, missing indexes, and dashboard overfetching. Apply `convex-expert` patterns (withIndex, object-form, validators) and `vercel-react-best-practices` (async-parallel, rerender-optimize).

**Tech Stack:** Convex database, indexes, `.withIndex()`, `.count()`, React performance patterns.

**Skills Applied:** `convex-expert` (Convex code patterns), `convex-reviewer` (review checklist), `vercel-react-best-practices` (React performance).

**Spec:** Comprehensive performance audit + Convex reviewer checklist + Vercel React best practices.

---

## Tasks

### Task 1: Fix N+1 Queries in Dashboard and XP

**Files:**
- Modify: `convex/dashboard.ts` (getDashboardStats recentEvents)
- Modify: `convex/xp.ts` (getRecentEvents)

**Interfaces:**
- Produces: Batch lookups instead of per-item queries
- Both functions currently do individual `.query().filter()` for each of 10 events

**Convex Expert Rules Applied:**
- Use `ctx.db.get(id)` for O(1) primary key lookups instead of `.query().filter()`
- Never use `.filter()` for something that should be a primary key lookup

- [ ] **Step 1:** Read `convex/dashboard.ts` and `convex/xp.ts`
- [ ] **Step 2:** Fix both by:
  - Collect unique sourceIds from events into two sets (leafIds, todoIds)
  - Use `ctx.db.get(id)` for each unique ID (O(1) primary key lookup)
  - Map results back to events in memory
- [ ] **Step 3:** Verify all functions have `args` and `returns` validators (convex-expert rule)
- [ ] **Step 4:** Run `npx convex dev` to regenerate codegen
- [ ] **Step 5:** Run `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
- [ ] **Step 6:** Commit: `perf(xp): fix N+1 queries in getRecentEvents and getDashboardStats`

---

### Task 2: Add Missing Indexes + Replace .filter() with .withIndex()

**Files:**
- Modify: `convex/schema.ts` (add missing indexes)
- Modify: `convex/twigs.ts` (use by_user index)
- Modify: `convex/limbs.ts` (use by_user index)
- Modify: `convex/branches.ts` (use by_user index)
- Modify: `convex/trunks.ts` (use by_user index)
- Modify: `convex/xp.ts` (use by_user index)
- Modify: `convex/todos.ts` (add by_todo index to todoCompletions, use it)
- Modify: `convex/leaves.ts` (use by_twig index when twigId provided)
- Modify: `convex/tree_utils.ts` (use by_leaf index for completions)

**Interfaces:**
- Produces: All queries use indexes instead of full table scans

**Convex Expert Rules Applied:**
- "Index, don't filter" — add `.index(...)` for every read path and query with `.withIndex(...)`
- `.filter()` is a full table scan, never a substitute for a WHERE
- Never an unbounded `.collect()` on a table that can grow

- [ ] **Step 1:** Add missing index to `convex/schema.ts`:
  ```ts
  // todoCompletions — add by_todo index
  .index("by_todo", ["todoId"])
  ```
- [ ] **Step 2:** Update `convex/twigs.ts:list` to use `.withIndex("by_user")`
- [ ] **Step 3:** Update `convex/limbs.ts:list` to use `.withIndex("by_user")`
- [ ] **Step 4:** Update `convex/branches.ts:list` to use `.withIndex("by_user")`
- [ ] **Step 5:** Update `convex/trunks.ts:list` and `create` to use `.withIndex("by_user")`
- [ ] **Step 6:** Update `convex/xp.ts` queries to use `.withIndex("by_user")`
- [ ] **Step 7:** Update `convex/todos.ts` to use `.withIndex("by_todo")` on todoCompletions
- [ ] **Step 8:** Update `convex/leaves.ts:list` to use `.withIndex("by_twig")` when twigId provided
- [ ] **Step 9:** Update `convex/tree_utils.ts` to use `.withIndex("by_leaf")` for completions
- [ ] **Step 10:** Run `npx convex dev` to regenerate codegen
- [ ] **Step 11:** Run `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
- [ ] **Step 12:** Commit: `perf(convex): add missing indexes and use .withIndex() everywhere`

---

### Task 3: Optimize Dashboard Overfetching

**Files:**
- Modify: `convex/dashboard.ts` (getDashboardStats)

**Interfaces:**
- Produces: Efficient dashboard query using .count() and eliminating duplicate fetches

**Convex Expert Rules Applied:**
- Never an unbounded `.collect()` on a table that can grow — use `.count()` instead
- Eliminate duplicate data fetches

**Vercel React Best Practices Applied:**
- `async-parallel` — use Promise.all() for independent operations
- `server-serialization` — minimize data passed to client components

- [ ] **Step 1:** Read `convex/dashboard.ts` to understand current overfetching
- [ ] **Step 2:** Replace `.collect().length` with `.count()` for entity counts (trunks, limbs, branches, twigs, leaves, todos)
- [ ] **Step 3:** Eliminate duplicate `todoCompletions` fetch — reuse `chartTodoCompletions` data for `todosDoneToday`
- [ ] **Step 4:** Optimize `todosDoneToday` — filter by date at query time using `by_user_and_date` index
- [ ] **Step 5:** Run `npx convex dev` to regenerate codegen
- [ ] **Step 6:** Run `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
- [ ] **Step 7:** Commit: `perf(dashboard): optimize getDashboardStats with .count() and eliminate duplicate fetches`

---

### Task 4: Apply React Performance Best Practices

**Files:**
- Modify: `src/components/dashboard/hero-stats.tsx`
- Modify: `src/components/dashboard/entity-counts.tsx`
- Modify: `src/components/dashboard/completion-charts.tsx`
- Modify: `src/components/dashboard/activity-feed.tsx`
- Modify: `src/components/tree/tree-node.tsx`

**Interfaces:**
- Produces: React components optimized per Vercel best practices

**Vercel React Best Practices Applied:**
- `rerender-memo` — extract expensive work into memoized components
- `rerender-no-inline-components` — don't define components inside components
- `js-index-maps` — build Map for repeated lookups
- `js-combine-iterations` — combine multiple filter/map into one loop

- [ ] **Step 1:** Read all dashboard components and tree-node
- [ ] **Step 2:** Check for inline component definitions (rerender-no-inline-components)
- [ ] **Step 3:** Check for expensive computations that should be memoized
- [ ] **Step 4:** Check for repeated filter/map operations that could be combined
- [ ] **Step 5:** Apply fixes where applicable
- [ ] **Step 6:** Run `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
- [ ] **Step 7:** Commit: `perf(react): apply Vercel React best practices to dashboard and tree`

---

## Task Dependencies

```
Task 1 (N+1 fixes) — independent
Task 2 (Indexes) — independent
Task 3 (Dashboard optimization) — independent
Task 4 (React performance) — independent
```
