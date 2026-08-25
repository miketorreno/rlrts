# UI Improvements Design: Sidebar Toggle, Loading Skeletons, Dashboard

Three interrelated UI improvements: (1) collapsible sidebar with icon-only mode, (2) per-route loading skeletons, and (3) a comprehensive stats dashboard page.

---

## 1. Sidebar Toggle (Desktop Icon-Only Mode)

### Problem

The desktop sidebar is always visible at 256px wide with no toggle. Users cannot collapse it to reclaim screen space.

### Decision

Create a `SidebarProvider` context with `isOpen` state. The sidebar collapses to 64px (icon-only) when closed, expands to 256px when open. A toggle button switches between states. Mobile behavior is unchanged (BottomNav stays primary, sidebar always hidden).

### Implementation

**New files:**
- `src/components/sidebar-provider.tsx` — React context providing `{ isOpen, toggle, setOpen }`. Reads/writes `localStorage` key `sidebar-open` (default: `true`). Only applies at `md+` breakpoint.

**Modified files:**
- `src/components/layout/app-sidebar.tsx` — Consume `useSidebar()`. Dynamic width: `w-16` (closed) or `w-64` (open). When closed: show only icons with tooltips via `Tooltip`/`TooltipTrigger`/`TooltipContent`. Hide XP badge when collapsed. Toggle button (`PanelLeftClose`/`PanelLeftOpen` from lucide-react) at top-right of sidebar header. Add `transition-all duration-300` for smooth animation.
- `src/components/root-wrapper.tsx` — Wrap layout with `<SidebarProvider>`. Dynamic `main` class: `md:ps-16` (closed) or `md:ps-64` (open). Transition on main padding.
- `src/components/layout/nav-items.tsx` — Add `tooltip` string to each nav item return (e.g., "Trunks", "Limbs", etc.) for collapsed sidebar hover labels.

**Sidebar behavior details:**
- **Open (w-64):** Full nav items with labels, XP badge, theme toggle, user button (full size)
- **Closed (w-16):** Icons only, tooltips on hover, XP badge hidden, theme toggle + user button as small icons (32px)
- **Toggle button:** `PanelLeftClose` when open, `PanelLeftOpen` when closed. Positioned in sidebar header, next to logo.
- **State persistence:** `localStorage` key `sidebar-open`, default `true`
- **Responsive:** State only applies at `md+`. Below `md`, sidebar is always hidden.

### Constraints

- No Sheet/Drawer component needed (mobile stays BottomNav-only)
- Tooltips must respect RTL (use `start`/`end` instead of `left`/`right`)
- Transition must be smooth (300ms duration)

---

## 2. Loading Skeletons (loading.tsx per route)

### Problem

Zero `loading.tsx` files exist. Protected routes show nothing during auth/data loading (`return null`), except `/leaves/[leafId]` which has inline skeleton JSX.

### Decision

Add custom `loading.tsx` files for each protected route with skeletons matching their layout. Move the existing inline skeleton from `/leaves/[leafId]` to a `loading.tsx`.

### Skeleton designs per route

| Route | Skeleton |
|-------|----------|
| `/trunks` | Header bar + 3-column grid of card skeletons (6-8 cards) |
| `/limbs` | Header bar + filter dropdown placeholder + card grid |
| `/branches` | Header bar + filter dropdown placeholder + card grid |
| `/twig` | Header bar + calendar grid skeleton (7 cols × 5 rows of day cells) |
| `/twigs/[twigId]` | Back button + title + stats row + chart area skeleton |
| `/leaves/[leafId]` | Back button + header + chart area + form fields (existing inline skeleton, moved) |
| `/todos` | Header bar + XP badge placeholder + 4-5 todo row skeletons |

**Not needing loading.tsx:** `/` (landing), `/about`, `/pricing` — static content, no auth.

**Approach:** Use the existing `Skeleton` component from `src/components/ui/skeleton.tsx`. Each skeleton matches the approximate layout of its page. No data loading — pure visual placeholders.

### Files to create

- `src/app/[locale]/trunks/loading.tsx`
- `src/app/[locale]/limbs/loading.tsx`
- `src/app/[locale]/branches/loading.tsx`
- `src/app/[locale]/twig/loading.tsx`
- `src/app/[locale]/twigs/[twigId]/loading.tsx`
- `src/app/[locale]/leaves/[leafId]/loading.tsx` (move from inline)
- `src/app/[locale]/todos/loading.tsx`

### Constraints

- Skeletons use `Skeleton` component + Tailwind classes
- No new dependencies
- Skeletons should approximate the real layout (same grid structure, same spacing)
- Each skeleton is a simple functional component (no hooks, no state)

---

## 3. Dashboard Page (/dashboard)

### Problem

No global stats view exists. The only analytics are leaf-specific (leaf-statistics, leaf-analytics). Users have no single place to see their overall progress, habits, and trends.

### Decision

Create a `/dashboard` route with a card-grid layout showing: hero stats, entity counts, completion charts, and a recent activity feed.

### Layout

```
┌─────────────────────────────────────────────┐
│  Hero Stats (4 cards in a row)              │
│  [Level/XP] [Streak] [Longest] [Today]     │
├─────────────────────────────────────────────┤
│  Entity Counts (6 small cards, 3-col grid) │
│  [Trunks] [Limbs] [Branches]               │
│  [Twigs]  [Leaves] [Todos]                 │
├─────────────────────────────────────────────┤
│  Charts (2-col grid)                        │
│  [Weekly Completions] [Monthly Progress]    │
├─────────────────────────────────────────────┤
│  Recent Activity Feed                       │
│  [Last 10 XP events with icons/timestamps]  │
└─────────────────────────────────────────────┘
```

### Section details

**Section A: Hero Stats (4 cards)**

| Card | Content | Data Source |
|------|---------|-------------|
| Level & XP | Large level number, XP progress bar (`xpInCurrentLevel / xpForNextLevel`), total XP text | `api.xp.getXpProfile` |
| Current Streak | Flame icon + streak count + "days" | `api.xp.getXpProfile` |
| Longest Streak | Trophy icon + longest streak count | `api.xp.getXpProfile` |
| Today's Progress | CheckCircle + "X/Y habits done" + "X/Y todos done" | `api.leaves.list` + `api.todos.list` + completions for today |

**Section B: Entity Counts (6 cards)**

Small cards with icon + count. Data from existing `list` queries:
- `api.trunks.list` → count
- `api.limbs.list` → count
- `api.branches.list` → count
- `api.twigs.list` → count
- `api.leaves.list` → count
- `api.todos.list` → count

**Section C: Charts (2-column grid)**

| Chart | Type | Data | Description |
|-------|------|------|-------------|
| Weekly Completions | Bar (Chart.js) | `leaves.getCompletions` (last 28 days) + todo completions | Stacked bars: habits vs todos per day |
| Monthly Progress | Line (Chart.js) | Same data aggregated by month | Completion trend over time |

Reuses the Chart.js pattern from `src/components/leaf/details/leaf-analytics.tsx`.

**Section D: Recent Activity Feed**

Last 10 `xpEvents` records for the user. Each row: source icon (habit/todo), description (leaf/todo name), XP amount, timestamp. Requires a new query `api.xp.getRecentEvents` that returns the last 10 events.

### Files to create

- `src/app/[locale]/dashboard/page.tsx` — main dashboard page
- `src/app/[locale]/dashboard/loading.tsx` — dashboard skeleton
- `src/components/dashboard/hero-stats.tsx` — 4 stat cards
- `src/components/dashboard/entity-counts.tsx` — 6 entity count cards
- `src/components/dashboard/completion-charts.tsx` — Chart.js weekly + monthly
- `src/components/dashboard/activity-feed.tsx` — recent XP events
- `src/components/layout/nav-items.tsx` — add dashboard as first nav item

### New Convex query

- `convex/xp.ts` — add `getRecentEvents` query: returns last 10 `xpEvents` for the authenticated user, joined with leaf/todo names for display.

### Navigation

Add "Dashboard" as the first item in `useNavItems()`. Use `LayoutDashboard` icon from lucide-react. Route: `/{locale}/dashboard`.

### Constraints

- Dashboard is a protected route (requires auth)
- All data fetched client-side via Convex `useQuery`
- Chart.js for charts (existing pattern from leaf-analytics)
- shadcn Card-based layout
- Responsive: single column on mobile, 2-4 columns on desktop
- No new UI component library dependencies
- i18n keys added to all 9 locales

---

## File change summary

| Action | File | Feature |
|--------|------|---------|
| NEW | `src/components/sidebar-provider.tsx` | Sidebar |
| MODIFY | `src/components/layout/app-sidebar.tsx` | Sidebar |
| MODIFY | `src/components/root-wrapper.tsx` | Sidebar |
| MODIFY | `src/components/layout/nav-items.tsx` | Sidebar + Dashboard |
| NEW | `src/app/[locale]/trunks/loading.tsx` | Loading |
| NEW | `src/app/[locale]/limbs/loading.tsx` | Loading |
| NEW | `src/app/[locale]/branches/loading.tsx` | Loading |
| NEW | `src/app/[locale]/twig/loading.tsx` | Loading |
| NEW | `src/app/[locale]/twigs/[twigId]/loading.tsx` | Loading |
| NEW | `src/app/[locale]/leaves/[leafId]/loading.tsx` | Loading |
| NEW | `src/app/[locale]/todos/loading.tsx` | Loading |
| NEW | `src/app/[locale]/dashboard/page.tsx` | Dashboard |
| NEW | `src/app/[locale]/dashboard/loading.tsx` | Dashboard |
| NEW | `src/components/dashboard/hero-stats.tsx` | Dashboard |
| NEW | `src/components/dashboard/entity-counts.tsx` | Dashboard |
| NEW | `src/components/dashboard/completion-charts.tsx` | Dashboard |
| NEW | `src/components/dashboard/activity-feed.tsx` | Dashboard |
| MODIFY | `convex/xp.ts` | Dashboard (new query) |
| MODIFY | `src/messages/*.json` (×9) | Dashboard + Sidebar i18n |

**Total: 12 new files, 7 modified files**
