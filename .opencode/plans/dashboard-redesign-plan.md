# Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the dashboard with gradient hero cards, split layout, animated numbers, horizontal scroll entity counts, and bug fixes.

**Architecture:** (1) Fix existing bugs (habitsDone, dark mode, loading states). (2) Redesign hero-stats with gradient cards + NumberFlow. (3) Redesign entity-counts as horizontal scroll row with clickable links. (4) Restructure page layout to split (charts left, feed right). (5) Redesign activity-feed with scroll, skeleton, animations. (6) Update loading skeleton to match new layout.

**Tech Stack:** NumberFlow (already in project), framer-motion (already in project), Tailwind v4 gradients, shadcn/ui Card, Chart.js, Convex queries.

**Spec:** `.opencode/plans/ui-improvements-design.md` (original design) + chat decisions (gradient cards, split layout, NumberFlow).

## Global Constraints

- Package manager: pnpm only
- Navigation: use `Link`/`useRouter`/`usePathname` from `@/i18n/routing` — never `next/link` or `next/router`
- Every new user-facing string must be an i18n key in all 9 locale files
- RTL-safe: use `start`/`end` instead of `left`/`right`
- Verification after every task: `pnpm lint` (0 errors) + `npx tsc --noEmit` + `pnpm build`
- NumberFlow is already installed and used in `src/components/leaf/details/leaf-statistics.tsx`
- framer-motion patterns: `motion.div` with `initial={{ opacity: 0, y: 20 }}` / `animate={{ opacity: 1, y: 0 }}`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/components/dashboard/hero-stats.tsx` | MODIFY | Gradient cards, NumberFlow, fix habitsDone bug |
| `src/components/dashboard/entity-counts.tsx` | MODIFY | Horizontal scroll, clickable links, compact chips |
| `src/components/dashboard/completion-charts.tsx` | MODIFY | Fix dark mode grid color |
| `src/components/dashboard/activity-feed.tsx` | MODIFY | Scroll, skeleton loading, stagger animations, i18n time |
| `src/app/[locale]/dashboard/page.tsx` | MODIFY | Split layout, welcome header, section labels |
| `src/app/[locale]/dashboard/loading.tsx` | MODIFY | Match new layout with gradient skeletons |
| `src/messages/*.json` (×9) | MODIFY | New i18n keys for welcome greeting, time formatting |

---

## Tasks

### Task 1: Fix Existing Bugs

**Files:**
- Modify: `src/components/dashboard/hero-stats.tsx`
- Modify: `src/components/dashboard/completion-charts.tsx`
- Modify: `src/components/dashboard/activity-feed.tsx`

**Interfaces:**
- Produces: Fixed habitsDone calculation, dark mode chart grid, Skeleton loading in feed

- [ ] **Step 1: Fix habitsDone in hero-stats.tsx**

The current filter at line 28 hardcodes `return false`. The leaves query returns leaves with a `completions` array. The fix: filter leaves where `leaf.completions` includes a completion with `date === today`. The completions are stored as `{ date: string, leafId: string }` objects. Check if the leaf has any completion matching today's date.

Read the current file first to understand the exact data structure, then fix the filter.

- [ ] **Step 2: Fix dark mode chart grid color in completion-charts.tsx**

Replace hardcoded `rgba(0, 0, 0, 0.1)` with a theme-aware color. Use `getComputedStyle` or a CSS variable approach. The simplest fix: use `rgba(128, 128, 128, 0.2)` which works in both modes, or read the CSS variable for muted foreground.

Read the current file to find the exact line, then fix it.

- [ ] **Step 3: Fix activity-feed.tsx loading state**

Replace the plain text `"Loading..."` with a Skeleton component:
```tsx
import { Skeleton } from "@/components/ui/skeleton";
// Replace: <p>Loading...</p>
// With: Array of skeleton rows
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
Expected: 0 errors

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/hero-stats.tsx src/components/dashboard/completion-charts.tsx src/components/dashboard/activity-feed.tsx
git commit -m "fix(dashboard): fix habitsDone bug, dark mode chart color, and feed loading state"
```

---

### Task 2: Redesign Hero Stats with Gradients + NumberFlow

**Files:**
- Modify: `src/components/dashboard/hero-stats.tsx`

**Interfaces:**
- Consumes: NumberFlow from `number-flow/react` (already installed)
- Consumes: `motion` from `framer-motion`
- Consumes: `levelFromXp`, `xpForNextLevel`, `xpInCurrentLevel` from `@/lib/xp`
- Produces: 4 gradient cards with animated numbers

- [ ] **Step 1: Read current hero-stats.tsx and leaf-statistics.tsx**

Read hero-stats for current structure. Read leaf-statistics.tsx to see NumberFlow usage pattern.

- [ ] **Step 2: Rewrite hero-stats.tsx**

Structure each card as:
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: index * 0.1 }}
>
  <Card className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white border-0 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="bg-white/20 rounded-full p-2">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <div className="mt-4">
        <NumberFlow value={number} className="text-3xl font-bold" />
        <p className="text-white/80 text-sm">{label}</p>
      </div>
    </CardContent>
  </Card>
</motion.div>
```

Four cards with gradients:
1. Level & XP: `from-violet-600 to-indigo-600`, Award icon, NumberFlow for level
2. Current Streak: `from-orange-500 to-red-500`, Flame icon, NumberFlow for streak
3. Longest Streak: `from-amber-400 to-yellow-500`, Trophy icon, NumberFlow for longest
4. Today's Progress: `from-emerald-500 to-green-600`, CheckCircle icon, fraction display

XP progress bar in Level card: white track (`bg-white/30`) with animated white fill using framer-motion `motion.div` with `initial={{ width: 0 }}` / `animate={{ width: "..." }}`.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/hero-stats.tsx
git commit -m "feat(dashboard): redesign hero stats with gradient cards and NumberFlow"
```

---

### Task 3: Redesign Entity Counts as Horizontal Scroll

**Files:**
- Modify: `src/components/dashboard/entity-counts.tsx`

**Interfaces:**
- Consumes: `Link` from `@/i18n/routing`
- Produces: Horizontal scroll row of clickable entity chips

- [ ] **Step 1: Read current entity-counts.tsx**

- [ ] **Step 2: Rewrite as horizontal scroll**

Structure:
```tsx
<div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
  {entities.map((entity) => (
    <Link key={entity.href} href={entity.href}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3 snap-start whitespace-nowrap hover:bg-muted transition-colors"
      >
        <entity.icon className="h-4 w-4 text-muted-foreground" />
        <NumberFlow value={entity.count} className="text-lg font-bold" />
        <span className="text-sm text-muted-foreground">{entity.label}</span>
      </motion.div>
    </Link>
  ))}
</div>
```

Each chip: icon + animated count + label. Clickable via `Link` to the respective page. Uses `snap-start` for scroll snapping.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/entity-counts.tsx
git commit -m "feat(dashboard): redesign entity counts as horizontal scroll with links"
```

---

### Task 4: Restructure Dashboard Layout + Welcome Header

**Files:**
- Modify: `src/app/[locale]/dashboard/page.tsx`
- Modify: `src/messages/*.json` (×9)

**Interfaces:**
- Consumes: `HeroStats`, `EntityCounts`, `CompletionCharts`, `ActivityFeed`
- Produces: Split layout with welcome header

- [ ] **Step 1: Read current dashboard page.tsx**

- [ ] **Step 2: Rewrite page layout**

New structure:
```tsx
<div className="container mx-auto max-w-7xl space-y-8 pt-16 px-4">
  {/* Welcome Header */}
  <div>
    <h1 className="text-2xl font-bold">{greeting}, {firstName}</h1>
    <p className="text-muted-foreground">{formattedDate}</p>
  </div>

  {/* Hero Stats - full width */}
  <HeroStats />

  {/* Entity Counts - horizontal scroll */}
  <EntityCounts />

  {/* Split: Charts + Activity Feed */}
  <div className="grid gap-6 lg:grid-cols-3">
    <div className="lg:col-span-2 space-y-6">
      <CompletionCharts />
    </div>
    <div className="space-y-6">
      <ActivityFeed />
    </div>
  </div>
</div>
```

Welcome header: Determine greeting based on time of day (morning/afternoon/evening). Get first name from Clerk user (`useUser()` from `@clerk/nextjs`). Format date with `Intl.DateTimeFormat`.

- [ ] **Step 3: Add i18n keys**

Add to all 9 locale files:
```json
{
  "dashboard": {
    "greeting": {
      "morning": "Good morning",
      "afternoon": "Good afternoon",
      "evening": "Good evening"
    }
  }
}
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
Run: `pnpm build 2>&1 | grep -E "Compiled|error" | head -5`
Expected: 0 errors

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/dashboard/page.tsx src/messages/
git commit -m "feat(dashboard): restructure layout with split view and welcome header"
```

---

### Task 5: Redesign Activity Feed + Fix i18n Time

**Files:**
- Modify: `src/components/dashboard/activity-feed.tsx`

**Interfaces:**
- Consumes: `api.xp.getRecentEvents`
- Produces: Scrollable feed with stagger animations, skeleton loading, i18n time

- [ ] **Step 1: Read current activity-feed.tsx**

- [ ] **Step 2: Rewrite activity-feed.tsx**

Key changes:
1. Max height with scroll: `max-h-[400px] overflow-y-auto`
2. Skeleton loading state (array of skeleton rows, not "Loading..." text)
3. `motion.div` staggered entrance for each row
4. Colored dot indicator (green for habits, blue for todos) instead of large icon
5. Separator lines between events (`border-b` on each row except last)
6. i18n-aware relative time formatting using `useTranslations`
7. XP badge: small pill with `bg-primary/10 text-primary` styling

Structure:
```tsx
<Card>
  <CardHeader>
    <CardTitle>{t("dashboard.recentActivity")}</CardTitle>
  </CardHeader>
  <CardContent className="max-h-[400px] overflow-y-auto">
    {isLoading ? (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    ) : events.length === 0 ? (
      <p className="text-sm text-muted-foreground">{t("dashboard.noActivity")}</p>
    ) : (
      <div>
        {events.map((event, index) => (
          <motion.div
            key={event._id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex items-center justify-between py-3 border-b last:border-0"
          >
            <div className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${event.source === "habit" ? "bg-green-500" : "bg-blue-500"}`} />
              <div>
                <p className="text-sm font-medium">{event.sourceName}</p>
                <p className="text-xs text-muted-foreground">{formatRelativeTime(event.createdAt)}</p>
              </div>
            </div>
            <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              +{event.amount} XP
            </span>
          </motion.div>
        ))}
      </div>
    )}
  </CardContent>
</Card>
```

Fix `formatRelativeTime` to be simpler and work with i18n (or keep it simple — the time format is universal enough).

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/activity-feed.tsx
git commit -m "feat(dashboard): redesign activity feed with scroll, animations, and skeleton"
```

---

### Task 6: Update Dashboard Skeleton Loading

**Files:**
- Modify: `src/app/[locale]/dashboard/loading.tsx`

**Interfaces:**
- Consumes: `Skeleton` from `@/components/ui/skeleton`
- Produces: Skeleton matching new layout (gradient cards, horizontal scroll, split)

- [ ] **Step 1: Read current loading.tsx and new page layout**

- [ ] **Step 2: Rewrite loading.tsx**

New skeleton structure:
```tsx
<div className="container mx-auto max-w-7xl space-y-8 pt-16 px-4">
  {/* Welcome header skeleton */}
  <div className="space-y-2">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-4 w-40" />
  </div>

  {/* Hero card skeletons with gradient placeholders */}
  <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <Skeleton key={i} className="h-36 rounded-xl" />
    ))}
  </div>

  {/* Entity count horizontal scroll skeleton */}
  <div className="flex gap-3 overflow-hidden">
    {Array.from({ length: 6 }).map((_, i) => (
      <Skeleton key={i} className="h-14 w-32 rounded-xl flex-shrink-0" />
    ))}
  </div>

  {/* Split skeleton */}
  <div className="grid gap-6 lg:grid-cols-3">
    <div className="lg:col-span-2 space-y-4">
      <Skeleton className="h-64 rounded-xl" />
    </div>
    <div className="space-y-4">
      <Skeleton className="h-64 rounded-xl" />
    </div>
  </div>
</div>
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/dashboard/loading.tsx
git commit -m "feat(dashboard): update skeleton loading to match new layout"
```

---

## Task Dependencies

```
Task 1 (Bug fixes) — independent, do first
  └─ Task 2 (Hero gradients + NumberFlow) — needs bug fix
  └─ Task 3 (Entity horizontal scroll) — needs bug fix
  └─ Task 5 (Activity feed redesign) — needs bug fix
Task 4 (Layout restructure + welcome header) — independent
Task 6 (Skeleton update) — depends on Task 4 (layout must be final)
```

Tasks 1-5 can run in parallel after Task 1 completes. Task 6 depends on Task 4.
