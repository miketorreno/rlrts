# XP Multiplier Indicator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add streak multiplier display to the XP badge, todo items, and leaf statistics — showing users how their streak boosts their XP gains.

**Architecture:** Import `streakMultiplier` from `@/lib/xp` (already exists, identical to server logic) and display the computed multiplier in 3 locations. No new queries needed — each component already has access to the streak data.

**Tech Stack:** shadcn/ui (Badge), lucide-react icons, next-intl i18n, Tailwind v4.

**Spec:** XP System Design Spec lines 87-89 (multiplier indicator on cards)

## Global Constraints

- Package manager: pnpm only
- Navigation: use `Link`/`useRouter`/`usePathname` from `@/i18n/routing`
- Every new user-facing string must be an i18n key in all 9 locale files
- RTL-safe: use `start`/`end` instead of `left`/`right`
- Verification after every task: `pnpm lint` (0 errors) + `npx tsc --noEmit` + `pnpm build`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/components/todo/xp-badge.tsx` | MODIFY | Add multiplier badge next to streak flame |
| `src/components/todo/todo-item.tsx` | MODIFY | Show effective XP with multiplier |
| `src/components/leaf/details/leaf-statistics.tsx` | MODIFY | Add multiplier row to stats grid |

---

## Tasks

### Task 1: Add Multiplier to XpBadge

**Files:**
- Modify: `src/components/todo/xp-badge.tsx`

**Interfaces:**
- Consumes: `streakMultiplier` from `@/lib/xp` (already exists)
- Consumes: `api.xp.getXpProfile` (already fetched, returns `currentStreak`)
- Produces: Multiplier badge next to flame icon

- [ ] **Step 1:** Read current xp-badge.tsx to understand structure

- [ ] **Step 2:** Add multiplier display:
  - Import `streakMultiplier` from `@/lib/xp`
  - Compute: `const multiplier = streakMultiplier(xpProfile.currentStreak)`
  - Display next to the streak flame icon: when multiplier > 1, show a small Badge with `x{multiplier.toFixed(1)}`
  - Only show when multiplier > 1 (streak 1+ days)
  - Style: `bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full`

- [ ] **Step 3:** Verify: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`

- [ ] **Step 4:** Commit: `feat(xp): add streak multiplier indicator to XpBadge`

---

### Task 2: Add Multiplier to Todo Items

**Files:**
- Modify: `src/components/todo/todo-item.tsx`

**Interfaces:**
- Consumes: `streakMultiplier` from `@/lib/xp`
- Consumes: `api.xp.getXpProfile` (new query in this component)
- Produces: Effective XP display with multiplier on each todo item

- [ ] **Step 1:** Read current todo-item.tsx to understand where XP is displayed

- [ ] **Step 2:** Add multiplier to XP display:
  - Import `useQuery` from `convex/react` and `api` from `@convex/_generated/api`
  - Import `streakMultiplier` from `@/lib/xp`
  - Query `api.xp.getXpProfile` to get current streak
  - Compute effective XP: `todo.xp * streakMultiplier(profile?.currentStreak ?? 0)`
  - Display as: `{effectiveXp} XP` with a small `(x{multiplier.toFixed(1)})` suffix when multiplier > 1
  - If the todo has no XP set (`todo.xp === 0` or undefined), don't show multiplier

- [ ] **Step 3:** Verify: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`

- [ ] **Step 4:** Commit: `feat(xp): show effective XP with multiplier on todo items`

---

### Task 3: Add Multiplier to Leaf Statistics

**Files:**
- Modify: `src/components/leaf/details/leaf-statistics.tsx`

**Interfaces:**
- Consumes: `streakMultiplier` from `@/lib/xp`
- Consumes: `currentStreak` (already computed locally in this component)
- Produces: Multiplier row in the stats grid

- [ ] **Step 1:** Read current leaf-statistics.tsx to find where currentStreak is computed

- [ ] **Step 2:** Add multiplier row:
  - Import `streakMultiplier` from `@/lib/xp`
  - Compute: `const multiplier = streakMultiplier(currentStreak)` using the already-computed local `currentStreak` variable
  - Add a new stat row in the grid: icon (TrendingUp or Zap), label "Multiplier", value `x{multiplier.toFixed(1)}`
  - Only show when multiplier > 1, otherwise show "1.0x" (baseline)
  - Style consistently with existing stat rows

- [ ] **Step 3:** Verify: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`

- [ ] **Step 4:** Commit: `feat(xp): add streak multiplier to leaf statistics`

---

## Task Dependencies

All three tasks are independent (they modify different files) and can run in parallel.
