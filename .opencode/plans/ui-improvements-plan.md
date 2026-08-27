# UI Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add collapsible sidebar, per-route loading skeletons, and a comprehensive stats dashboard.

**Architecture:** (1) SidebarContext provider + AppSidebar collapse to icon-only mode. (2) loading.tsx files with Skeleton components matching each page layout. (3) /dashboard route with hero stats, entity counts, Chart.js completion trends, and XP activity feed.

**Tech Stack:** React Context, shadcn/ui Skeleton, Chart.js (react-chartjs-2), lucide-react icons, Convex queries, next-intl i18n, Tailwind v4, framer-motion.

**Spec:** `.opencode/plans/ui-improvements-design.md`

## Global Constraints

- Package manager: pnpm only
- Navigation: use `Link`/`useRouter`/`usePathname` from `@/i18n/routing` — never `next/link` or `next/router`
- Every new user-facing string must be an i18n key in all 9 locale files (`src/messages/{en,de,es,fr,ru,he,ar,hi,zh}.json`)
- RTL-safe: use `start`/`end` instead of `left`/`right` for padding/margin; use logical CSS properties
- Verification after every task: `pnpm lint` (0 errors, ~27 warnings baseline) + `npx tsc --noEmit` + `pnpm build`
- Convex backend must be running (`npx convex dev`) for codegen after schema/function changes
- Existing skeleton component: `src/components/ui/skeleton.tsx` (animate-pulse, rounded-md, bg-muted)
- Chart.js pattern: reuse from `src/components/leaf/details/leaf-analytics.tsx`
- Protected routes require auth — use `useConvexAuth()` pattern from existing pages

---

## File Structure

### Feature 1: Sidebar Toggle

| File | Action | Responsibility |
|------|--------|---------------|
| `src/components/sidebar-provider.tsx` | CREATE | React context: `{ isOpen, toggle, setOpen }` + localStorage persistence |
| `src/components/layout/app-sidebar.tsx` | MODIFY | Consume context, dynamic width, toggle button, icon-only collapsed mode |
| `src/components/root-wrapper.tsx` | MODIFY | Wrap with SidebarProvider, dynamic main padding |
| `src/components/layout/nav-items.tsx` | MODIFY | Add `tooltip` string to each nav item |

### Feature 2: Loading Skeletons

| File | Action | Responsibility |
|------|--------|---------------|
| `src/app/[locale]/trunks/loading.tsx` | CREATE | Trunk card grid skeleton |
| `src/app/[locale]/limbs/loading.tsx` | CREATE | Limb card grid skeleton |
| `src/app/[locale]/branches/loading.tsx` | CREATE | Branch card grid skeleton |
| `src/app/[locale]/twig/loading.tsx` | CREATE | Calendar grid skeleton |
| `src/app/[locale]/twigs/[twigId]/loading.tsx` | CREATE | Twig detail skeleton |
| `src/app/[locale]/leaves/[leafId]/loading.tsx` | CREATE | Leaf detail skeleton (replaces inline) |
| `src/app/[locale]/todos/loading.tsx` | CREATE | Todo list skeleton |

### Feature 3: Dashboard

| File | Action | Responsibility |
|------|--------|---------------|
| `convex/xp.ts` | MODIFY | Add `getRecentEvents` query |
| `src/app/[locale]/dashboard/page.tsx` | CREATE | Dashboard page composition |
| `src/app/[locale]/dashboard/loading.tsx` | CREATE | Dashboard skeleton |
| `src/components/dashboard/hero-stats.tsx` | CREATE | 4 hero stat cards |
| `src/components/dashboard/entity-counts.tsx` | CREATE | 6 entity count cards |
| `src/components/dashboard/completion-charts.tsx` | CREATE | Chart.js weekly + monthly |
| `src/components/dashboard/activity-feed.tsx` | CREATE | Recent XP events feed |
| `src/components/layout/nav-items.tsx` | MODIFY | Add dashboard as first nav item |
| `src/messages/*.json` (×9) | MODIFY | i18n keys for all features |

---

## Tasks

### Task 1: SidebarProvider Context + Nav Tooltips

**Files:**
- Create: `src/components/sidebar-provider.tsx`
- Modify: `src/components/layout/nav-items.tsx`

**Interfaces:**
- Produces: `SidebarProvider` component, `useSidebar()` hook returning `{ isOpen: boolean, toggle: () => void, setOpen: (open: boolean) => void }`
- Produces: `useNavItems()` returns items with `{ href, label, icon, tooltip }` (tooltip is the i18n key string)

- [ ] **Step 1: Create SidebarProvider**

Create `src/components/sidebar-provider.tsx` with:
- React context providing `{ isOpen, toggle, setOpen }`
- `useState(true)` for default open state
- `useEffect` to read `localStorage` key `sidebar-open` on mount
- `toggle` callback that flips state and persists to localStorage
- `setOpen` callback that sets state and persists to localStorage
- Prevent hydration flash: render with `isOpen: true` until mounted
- Export `useSidebar()` hook that throws if used outside provider

- [ ] **Step 2: Add tooltip to nav items**

Modify `src/components/layout/nav-items.tsx` — add `tooltip` property to each item. The `tooltip` should be the i18n key string (e.g., `"nav.trunks"`, `"nav.limbs"`, etc.).

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add src/components/sidebar-provider.tsx src/components/layout/nav-items.tsx
git commit -m "feat(sidebar): add SidebarProvider context and nav item tooltips"
```

---

### Task 2: AppSidebar Collapse + RootWrapper Integration

**Files:**
- Modify: `src/components/layout/app-sidebar.tsx`
- Modify: `src/components/root-wrapper.tsx`

**Interfaces:**
- Consumes: `useSidebar()` from Task 1 (isOpen, toggle)
- Consumes: `useNavItems()` with `tooltip` property from Task 1
- Produces: Collapsible sidebar that toggles between w-64 and w-16

- [ ] **Step 1: Read current AppSidebar and RootWrapper**

Read both files to understand current implementation before modifying.

- [ ] **Step 2: Modify AppSidebar**

Key changes:
1. Import `useSidebar` from `@/components/sidebar-provider`
2. Import `Tooltip`, `TooltipTrigger`, `TooltipContent` from `@/components/ui/tooltip`
3. Import `PanelLeftClose`, `PanelLeftOpen` from `lucide-react`
4. Consume `useSidebar()` to get `isOpen` and `toggle`
5. Dynamic width: `w-64` when open, `w-16` when closed
6. Add `transition-all duration-300` for smooth animation
7. When closed: hide nav item labels (show icons only), hide XP badge, wrap each nav item in Tooltip with `tooltip` text, theme toggle and UserButton become icon-only
8. When open: show full nav items with labels, show XP badge, full-size theme toggle and UserButton
9. Add toggle button at top-right of sidebar header: `PanelLeftClose` when open, `PanelLeftOpen` when closed, small ghost button
10. Logo: when collapsed, hide the app name text, show only the XIcon

- [ ] **Step 3: Modify RootWrapper**

Key changes:
1. Import `SidebarProvider` from `@/components/sidebar-provider`
2. Create an inner component that consumes `useSidebar()` and applies dynamic classes to `<main>`
3. Wrap layout with `<SidebarProvider>`, use inner component for dynamic main padding
4. Dynamic main class: `md:ps-64` when open, `md:ps-16` when closed, with `transition-all duration-300`
5. Keep existing `pb-20 md:pb-0` behavior unchanged

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
Expected: 0 errors

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/app-sidebar.tsx src/components/root-wrapper.tsx
git commit -m "feat(sidebar): add collapsible sidebar with icon-only mode"
```

---

### Task 3: Entity List Page Skeletons (Trunks, Limbs, Branches)

**Files:**
- Create: `src/app/[locale]/trunks/loading.tsx`
- Create: `src/app/[locale]/limbs/loading.tsx`
- Create: `src/app/[locale]/branches/loading.tsx`

**Interfaces:**
- Consumes: `Skeleton` from `@/components/ui/skeleton`
- Produces: Three loading.tsx files with page-appropriate skeletons

- [ ] **Step 1: Read current trunks, limbs, branches pages**

Read each page to understand their layout structure for accurate skeletons.

- [ ] **Step 2: Create trunks loading skeleton**

Skeleton with header bar + 3-column grid of 6 card skeletons (h-32 rounded-xl).

- [ ] **Step 3: Create limbs loading skeleton**

Same as trunks but with a filter dropdown placeholder (h-10 w-48) above the grid.

- [ ] **Step 4: Create branches loading skeleton**

Same pattern as limbs — filter dropdown + card grid.

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
Expected: 0 errors

- [ ] **Step 6: Commit**

```bash
git add src/app/[locale]/trunks/loading.tsx src/app/[locale]/limbs/loading.tsx src/app/[locale]/branches/loading.tsx
git commit -m "feat(loading): add skeleton loading states for entity list pages"
```

---

### Task 4: Detail/Complex Page Skeletons (Twig, TwigId, LeafId, Todos)

**Files:**
- Create: `src/app/[locale]/twig/loading.tsx`
- Create: `src/app/[locale]/twigs/[twigId]/loading.tsx`
- Create: `src/app/[locale]/leaves/[leafId]/loading.tsx`
- Create: `src/app/[locale]/todos/loading.tsx`

**Interfaces:**
- Consumes: `Skeleton` from `@/components/ui/skeleton`
- Produces: Four loading.tsx files with page-appropriate skeletons

- [ ] **Step 1: Read current twig, twigId, leafId, todos pages**

Read each page to understand their layout. Pay special attention to `leaves/[leafId]/page.tsx` which has an inline skeleton to extract.

- [ ] **Step 2: Create twig loading skeleton (calendar grid)**

Skeleton with header + 7×5 grid of day cell skeletons (aspect-square rounded-lg).

- [ ] **Step 3: Create twigs/[twigId] loading skeleton**

Skeleton with back button + title + 3 stat cards + chart area.

- [ ] **Step 4: Create leaves/[leafId] loading skeleton**

Move the existing inline skeleton from the page component to this loading.tsx.

- [ ] **Step 5: Create todos loading skeleton**

Skeleton with header + XP badge + 5 todo row skeletons (h-16 rounded-xl).

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
Expected: 0 errors

- [ ] **Step 7: Commit**

```bash
git add src/app/[locale]/twig/loading.tsx src/app/[locale]/twigs/[twigId]/loading.tsx src/app/[locale]/leaves/[leafId]/loading.tsx src/app/[locale]/todos/loading.tsx
git commit -m "feat(loading): add skeleton loading states for detail pages"
```

---

### Task 5: getRecentEvents Convex Query

**Files:**
- Modify: `convex/xp.ts`

**Interfaces:**
- Produces: `getRecentEvents` query — returns last 10 xpEvents with source names

- [ ] **Step 1: Read current convex/xp.ts**

Read to understand existing query patterns.

- [ ] **Step 2: Add getRecentEvents query**

Add a new exported query after `getXpProfile`:
- No args (just uses auth identity)
- Queries `xpEvents` filtered by userId, ordered desc, take 10
- Enriches each event with source name by looking up the leaf or todo by `sourceId`
- Returns `{ ...event, sourceName: string }[]`

- [ ] **Step 3: Run convex codegen**

Run: `npx convex dev` for a few seconds to regenerate `convex/_generated/`.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
Expected: 0 errors

- [ ] **Step 5: Commit**

```bash
git add convex/xp.ts convex/_generated/
git commit -m "feat(xp): add getRecentEvents query for dashboard activity feed"
```

---

### Task 6: Dashboard Page + Hero Stats + Entity Counts

**Files:**
- Create: `src/app/[locale]/dashboard/page.tsx`
- Create: `src/app/[locale]/dashboard/loading.tsx`
- Create: `src/components/dashboard/hero-stats.tsx`
- Create: `src/components/dashboard/entity-counts.tsx`

**Interfaces:**
- Consumes: `api.xp.getXpProfile`, `api.trunks.list`, `api.limbs.list`, `api.branches.list`, `api.twigs.list`, `api.leaves.list`, `api.todos.list`
- Consumes: `levelFromXp`, `xpForNextLevel`, `xpInCurrentLevel` from `@/lib/xp`
- Produces: Dashboard page with 4 hero stat cards + 6 entity count cards

- [ ] **Step 1: Create dashboard loading skeleton**

Skeleton with header + 4 hero card skeletons + 6 entity card skeletons + 2 chart area skeletons.

- [ ] **Step 2: Create hero-stats component**

4-card grid: Level & XP (with progress bar), Current Streak (flame icon), Longest Streak (trophy icon), Today's Progress (habits + todos counts). Uses `useQuery` for xp profile, leaves, todos.

- [ ] **Step 3: Create entity-counts component**

6-card grid (3-col on desktop): Trunks, Limbs, Branches, Twigs, Leaves, Todos with icons and counts from respective `list` queries.

- [ ] **Step 4: Create dashboard page**

Client component with `useConvexAuth()` guard, renders `<HeroStats />` and `<EntityCounts />` in a space-y-6 container.

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
Expected: 0 errors

- [ ] **Step 6: Commit**

```bash
git add src/app/[locale]/dashboard/ src/components/dashboard/hero-stats.tsx src/components/dashboard/entity-counts.tsx
git commit -m "feat(dashboard): add dashboard page with hero stats and entity counts"
```

---

### Task 7: Dashboard Charts + Activity Feed

**Files:**
- Create: `src/components/dashboard/completion-charts.tsx`
- Create: `src/components/dashboard/activity-feed.tsx`
- Modify: `src/app/[locale]/dashboard/page.tsx` (add charts + feed sections)

**Interfaces:**
- Consumes: `api.leaves.getCompletions`, `api.todos.list`, `api.xp.getRecentEvents`
- Consumes: Chart.js pattern from `src/components/leaf/details/leaf-analytics.tsx`
- Produces: Completion charts and activity feed on dashboard

- [ ] **Step 1: Read leaf-analytics.tsx for Chart.js pattern**

Read to understand the Chart.js setup, theme colors, and options pattern.

- [ ] **Step 2: Create completion-charts component**

Two Chart.js charts:
1. **Weekly Completions** (Bar) — last 28 days, stacked habits vs todos
2. **Monthly Progress** (Line) — completions per month over time

Use `react-chartjs-2` with theme-based colors via `getChartRGBValues`. Register required Chart.js components.

- [ ] **Step 3: Create activity-feed component**

Card with last 10 XP events. Each row: source icon (habit/todo), description, XP amount, timestamp. Uses `api.xp.getRecentEvents` from Task 5.

- [ ] **Step 4: Update dashboard page to include charts + feed**

Add `<CompletionCharts />` and `<ActivityFeed />` sections after `<EntityCounts />`.

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
Expected: 0 errors

- [ ] **Step 6: Commit**

```bash
git add src/components/dashboard/completion-charts.tsx src/components/dashboard/activity-feed.tsx src/app/[locale]/dashboard/page.tsx
git commit -m "feat(dashboard): add completion charts and activity feed"
```

---

### Task 8: Dashboard Nav Item + i18n Keys

**Files:**
- Modify: `src/components/layout/nav-items.tsx` (add dashboard)
- Modify: `src/messages/*.json` (×9)

**Interfaces:**
- Produces: Dashboard as first nav item + all i18n keys for all features

- [ ] **Step 1: Add dashboard to nav items**

Add "Dashboard" as the first item in `useNavItems()`: `{ href: "/dashboard", label: "nav.dashboard", icon: LayoutDashboard, tooltip: "nav.dashboard" }`. Import `LayoutDashboard` from `lucide-react`.

- [ ] **Step 2: Add i18n keys to en.json**

Add `nav.dashboard` and full `dashboard` namespace: title, level, currentStreak, longestStreak, todaysProgress, habitsCompleted, todosCompleted, days, weeklyCompletions, monthlyProgress, recentActivity.

- [ ] **Step 3: Add placeholder keys to all 8 non-English locales**

Copy the same keys with English text as placeholder to de, es, fr, ru, he, ar, hi, zh.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3` then `pnpm build 2>&1 | grep -E "Compiled|error" | head -5`
Expected: 0 errors, build compiles

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/nav-items.tsx src/messages/
git commit -m "feat(dashboard): add dashboard nav item and i18n keys across 9 locales"
```

---

## Task Dependencies

```
Task 1 (SidebarProvider + tooltips)
  └─ Task 2 (AppSidebar + RootWrapper)

Task 3 (Entity list skeletons) — independent
Task 4 (Detail page skeletons) — independent

Task 5 (getRecentEvents query) — independent
  └─ Task 6 (Dashboard page + hero + entity counts)
       └─ Task 7 (Charts + activity feed)
            └─ Task 8 (Nav item + i18n)
```

Tasks 1-2, 3, 4, and 5 are all independent and can run in parallel.
Tasks 6-8 are sequential.
