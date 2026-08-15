# RLRTS Full Roadmap Implementation Plan

> **For agentic workers:** Implement this plan phase-by-phase, task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Each task ends with a verification pass (`pnpm lint` + `npx tsc --noEmit` + `pnpm build`) and a commit.

**Goal:** Execute the full `todo.md` roadmap in sequential phases: baseline cleanup → tree anatomy (trunk/limbs/branches) → responsive layout (sidebar + bottom nav) → Todos with sub-tasks + XP → Obsidian-like tree visualization.

**Architecture:** The app is a Next.js 16 App Router client-heavy app backed by Convex. The current model is `twigs` → `leaves` → `completions`. The tree phase extends this to `trunks` → `limbs` → `branches` → `twigs` → `leaves` with full nested tables. Each phase keeps the app green and buildable before the next starts.

**Tech Stack:** Next.js 16, Convex, Clerk, next-intl (9 locales), Tailwind v4, shadcn/ui, framer-motion, lucide-react, date-fns, react-activity-calendar. Package manager is pnpm.

**Spec:** `todo.md` + `AGENTS.md` (tree-anatomy vocabulary, command/gotcha rules).

## Global Constraints

- Package manager is **pnpm** (not npm). Dev requires **two processes**: `pnpm dev` and `npx convex dev` (local backend at `http://127.0.0.1:3210`).
- After changing `convex/schema.ts` or function signatures, run `npx convex codegen` and **commit the regenerated `convex/_generated/` files** or type errors result.
- Always use tree-anatomy vocabulary (`trunk`, `limb`, `branch`, `twig`, `leaf`) in UI text, routes, and component names. Do not reintroduce `calendar`/`habit`.
- Navigate only with `Link`/`useRouter`/`usePathname` from `@/i18n/routing` — never `next/link` or `next/router`.
- Every new/edited UI string must be added to **all 9 locale files** in `src/messages/` (`en`, `de`, `es`, `fr`, `ru`, `he`, `ar`, `hi`, `zh`).
- Protected routes are enforced in `src/proxy.ts` (`/twig(.*)`, `/leaves(.*)`); extend the matcher as new authenticated routes are added.
- Verification per task: `pnpm lint` (no new errors), `npx tsc --noEmit` (no new errors), `pnpm build` (must pass). No test framework is used.

---

## Phase 0: Baseline Cleanup

Goal: make the repo pass `pnpm lint` and `npx tsc --noEmit` cleanly, remove dead code, and reconcile `AGENTS.md` with the new state. (Do not start any feature work until this phase is green.)

### Task 0.1: Fix pre-existing type errors
**Files:**
- Modify: `src/app/providers.tsx:41`
- Modify: `src/components/leaf/details/leaf-activity-twig.tsx:87`

- [ ] **Step 1:** In `src/app/providers.tsx`, remove the `afterSignUpUrl="/twig"` prop from `<ClerkProvider>` (it does not exist in the installed Clerk types; `afterSignInUrl` already points at `/twig`). Verify sign-up still routes to `/twig` in the running app.
- [ ] **Step 2:** In `src/components/leaf/details/leaf-activity-twig.tsx`, replace the `hideColorLegend` prop with `renderColorLegend={false}` (the react-activity-calendar v3 replacement, per the tsc hint).
- [ ] **Step 3:** Verify: `npx tsc --noEmit` shows these two errors gone.

### Task 0.2: Remove dead code in `trash/`
**Files:**
- Delete: `trash/` (git rm the whole directory — `trash/convex/tasks.ts`, `trash/src/app/page.tsx`, `trash/src/proxy.ts`)

- [ ] **Step 1:** Confirm nothing under `src/` or `convex/` imports from `trash/` (grep `from ".*trash` and `trash/`). It is committed dead code and recoverable from git history.
- [ ] **Step 2:** `git rm -r trash/`.
- [ ] **Step 3:** Verify `npx tsc --noEmit` — all `trash/**` errors are gone.

### Task 0.3: Fix eslint errors
**Files:** varies — fix the ~11 errors reported by `pnpm lint`.
- [ ] **Step 1:** Run `pnpm lint` and list the errors.
- [ ] **Step 2:** Fix each error. Known one: `react-hooks/set-state-in-effect` at `src/hooks/use-twig-data.ts:89` (append `nextPageQuery.completions` without `setState` inside `useEffect`; e.g., derive combined completions in render with `useMemo`, or reset via reducer). Fix the remaining errors similarly, preserving behavior.
- [ ] **Step 3:** Verify `pnpm lint` reports **0 errors** (warnings may remain).

### Task 0.4: Rename `twgis` typo folder
**Files:**
- Rename: `src/components/twgis/` → `src/components/twigs/`
- Modify: `src/components/twigs/card.tsx`, `src/components/twigs/card-small.tsx` (only if imports inside change)
- Modify: `src/app/[locale]/twigs/page.tsx:3` (`@/components/twigs/card`)

- [ ] **Step 1:** `git mv src/components/twgis src/components/twigs`.
- [ ] **Step 2:** Update imports referencing `@/components/twgis/` (grep for `twgis`).
- [ ] **Step 3:** Verify lint + tsc + build.

### Task 0.5: Update `AGENTS.md`
- [ ] **Step 1:** Remove/rewrite the now-fixed gotchas: the `providers.tsx:41` and `leaf-activity-twig.tsx:87` type-error entries, the `twgis` spelling note, and the `trash/` "dead code" note (trash no longer exists).
- [ ] **Step 2:** Note in AGENTS.md that Phase 0 was completed and that `trash/` was deleted.
- [ ] **Step 3:** Commit Phase 0 as one commit: `chore: baseline cleanup — fix type/lint errors, remove trash, rename twgis`.

---

## Phase 1: Tree Anatomy Data Model (trunk → limbs → branches → twigs → leaves)

Goal: full 5-level hierarchy via nested tables. Existing twigs keep working with an optional `branchId`.

### Task 1.1: Extend the Convex schema
**Files:**
- Modify: `convex/schema.ts`

- [ ] **Step 1:** Add three tables and extend `twigs`, following the `twigs` pattern (userId, name, parent ref, position):
```ts
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
}).index("by_user", ["userId"]).index("by_trunk", ["trunkId"]),

branches: defineTable({
  name: v.string(),
  userId: v.string(),
  limbId: v.id("limbs"),
  position: v.optional(v.number()),
}).index("by_user", ["userId"]).index("by_limb", ["limbId"]),
```
And add to the existing `twigs` table: `branchId: v.optional(v.id("branches"))` plus `.index("by_branch", ["branchId"])`.
- [ ] **Step 2:** Run `npx convex codegen` and commit the regenerated `convex/_generated/`.

### Task 1.2: CRUD functions for trunks
**Files:**
- Create: `convex/trunks.ts`

- [ ] **Step 1:** Port the `twigs.ts` pattern (list, create, remove, update, get) for `trunks`. `create` sets position to `max + 1`; `remove` cascades: delete branches → twigs → leaves → completions of every descendant (reuse the `leaves.remove`/`twigs.remove` cascade logic); `update` reorders siblings by position.
- [ ] **Step 2:** Run `npx convex codegen`; verify tsc + build.

### Task 1.3: CRUD functions for limbs and branches
**Files:**
- Create: `convex/limbs.ts`
- Create: `convex/branches.ts`

- [ ] **Step 1:** Same pattern as `trunks.ts`, but scoped by parent: `limbs.list({ trunkId })`, `branches.list({ limbId })`. Cascade on delete removes children down to completions.
- [ ] **Step 2:** Extend `twigs.create`/`twigs.update`/`twigs.list` in `convex/twigs.ts` to accept/scope by `branchId` (optional — no breaking change for existing callers).
- [ ] **Step 3:** Run `npx convex codegen`; verify tsc + build.
- [ ] **Step 4:** Commit: `feat: add trunk/limb/branch tables and CRUD`.

### Task 1.4: Functional `/trunks`, `/limb`, `/branch` pages
**Files:**
- Modify: `src/app/[locale]/trunks/page.tsx` (currently a placeholder)
- Create: `src/app/[locale]/limb/page.tsx`
- Create: `src/app/[locale]/branch/page.tsx`
- Create: `src/components/trunk/`, `src/components/limb/`, `src/components/branch/` (list + create dialogs, following the `src/components/twig/` structure)
- Modify: `src/messages/*.json` (all 9 locales)
- Modify: `src/proxy.ts:14` — extend protected routes to include `/trunk(.*)`, `/limb(.*)`, `/branch(.*)`

- [ ] **Step 1:** Build `/trunks` as a real page: list trunks, create/delete/reorder (reuse `useDialogState`/`useToastMessages` patterns). Keep the "tree overview" richer rendering for Phase 4.
- [ ] **Step 2:** Build `/limb` (list limbs, pick/create in a trunk, drill into branches) and `/branch` (list branches, pick/create in a limb, drill into twigs). Singular routes match the existing header links.
- [ ] **Step 3:** Add i18n keys (`trunk.*`, `limb.*`, `branch.*` namespaces: list/create/edit/delete strings) to all 9 locale files.
- [ ] **Step 4:** Extend `src/proxy.ts` protected matcher to the new routes.
- [ ] **Step 5:** Verify: lint + tsc + build, manual walkthrough in browser (both dev processes running).
- [ ] **Step 6:** Commit: `feat: functional trunk/limb/branch pages`.

---

## Phase 2: Responsive Layout (Sidebar for PC, Bottom Nav for Mobile)

Goal: replace the single top header with a desktop sidebar and a mobile bottom navigation bar.

### Task 2.1: Navigation layout components
**Files:**
- Create: `src/components/layout/app-sidebar.tsx`
- Create: `src/components/layout/bottom-nav.tsx`
- Modify: `src/components/root-wrapper.tsx`
- Modify: `src/components/app-header.tsx`
- Modify: `src/messages/*.json`

- [ ] **Step 1:** Extract nav links (Trunks, Limb, Branch, Twig) into a shared `src/components/layout/nav-items.tsx` (array of `{ href, label, icon }` using `@/i18n/routing` `Link`, lucide icons).
- [ ] **Step 2:** `AppSidebar`: visible `md:` and up, fixed left column with nav items, theme toggle, `UserButton` (`<Show when="signed-in">`).
- [ ] **Step 3:** `BottomNav`: `md:hidden`, fixed bottom bar with icon-only nav items + active-state highlight (framer-motion layoutId indicator).
- [ ] **Step 4:** Rework `RootWrapper` to compose sidebar + main content (add bottom padding so content clears the mobile bar); keep `MotionWrapper`/`Toaster`; drop the now-redundant `AppHeader` (or reduce it to the top bar only).
- [ ] **Step 5:** Add `padding-bottom` for the bottom nav; i18n keys already exist under `nav.*`, add any new ones (e.g., tooltips) to all 9 locales.
- [ ] **Step 6:** Verify: lint + tsc + build; manual responsive check at mobile and desktop widths.
- [ ] **Step 7:** Commit: `feat: sidebar + bottom nav responsive layout`.

---

## Phase 3: Todos with Sub-Tasks and XP

Goal: daily/weekly todo lists with checkable sub-tasks; completing a todo grants XP (todos only — leaves unchanged).

### Task 3.1: Todos data model
**Files:**
- Modify: `convex/schema.ts`
- Create: `convex/todos.ts`

- [ ] **Step 1:** Add tables:
```ts
todos: defineTable({
  name: v.string(),
  userId: v.string(),
  cadence: v.union(v.literal("daily"), v.literal("weekly")),
  xp: v.number(),
  position: v.optional(v.number()),
}).index("by_user", ["userId"]),

todoItems: defineTable({
  todoId: v.id("todos"),
  userId: v.string(),
  name: v.string(),
  isCompleted: v.boolean(),
  position: v.optional(v.number()),
}).index("by_todo", ["todoId"]),

todoCompletions: defineTable({
  todoId: v.id("todos"),
  userId: v.string(),
  completedAt: v.number(),
}).index("by_user_and_date", ["userId", "completedAt"]),

userStats: defineTable({
  userId: v.string(),
  xp: v.number(),
}).index("by_user", ["userId"]),
```
- [ ] **Step 2:** `convex/todos.ts`: `list`, `create`, `remove` (cascade items + completions), `update`, `toggleItem` (flip `isCompleted`, mark `todoCompletions` when all items done → else remove today's completion), `getXp` (read `userStats`, backfilled from `todoCompletions` × `todos.xp` on first read).
- [ ] **Step 3:** In the mutation that completes a todo, upsert `userStats` (create or `patch` xp += todo.xp).
- [ ] **Step 4:** Run `npx convex codegen`; verify tsc + build.

### Task 3.2: Todos UI
**Files:**
- Create: `src/app/[locale]/todos/page.tsx`
- Create: `src/components/todo/todo-list.tsx`, `todo-item.tsx`, `todo-dialogs.tsx`, `xp-badge.tsx`
- Modify: `src/components/layout/nav-items.tsx` (add Todos link)
- Modify: `src/proxy.ts:14` (add `/todos(.*)` to protected routes)
- Modify: `src/messages/*.json`

- [ ] **Step 1:** `/todos` page: daily + weekly sections, collapsible groups, add/edit/delete todo dialogs (reuse `useDialogState` + toast patterns), sub-task checkboxes (completing all checks the todo).
- [ ] **Step 2:** `xp-badge.tsx` in the sidebar header showing `userStats.xp` via `useQuery(api.todos.getXp)`.
- [ ] **Step 3:** i18n keys for `todo.*` and `xp.*` in all 9 locales.
- [ ] **Step 4:** Verify: lint + tsc + build; manual flow (create todo with sub-tasks, check all, confirm XP increments and persists across reload).
- [ ] **Step 5:** Commit: `feat: todos with sub-tasks and XP`.

---

## Phase 4: Obsidian-like Tree Visualization

Goal: an interactive tree view of the full hierarchy: trunk → limbs → branches → twigs → leaves.

### Task 4.1: Recursive tree component
**Files:**
- Create: `src/components/tree/tree-view.tsx`
- Create: `src/components/tree/tree-node.tsx`
- Modify: `src/app/[locale]/trunks/page.tsx` (render the tree, replacing the Phase 1 list, or add a view toggle)
- Modify: `src/messages/*.json`

- [ ] **Step 1:** Build a recursive, collapsible tree: each node shows its icon (trunk/limb/branch/twig/leaf), name, child count, and expand/collapse (framer-motion `AnimatePresence` for smooth open/close). Root query: `api.trunks.list` then `api.limbs.list`, `api.branches.list`, `api.twigs.list`, `api.leaves.list` (all user-scoped).
- [ ] **Step 2:** Nodes link to their detail pages: trunk/limb/branch pages, `/twigs/[twigId]`, `/leaves/[leafId]`.
- [ ] **Step 3:** Keyboard/basic a11y: nodes are focusable buttons with `aria-expanded`.
- [ ] **Step 4:** i18n keys (`tree.*`) in all 9 locales.
- [ ] **Step 5:** Verify: lint + tsc + build; manual check of expand/collapse, deep-nesting, empty states, dark mode, RTL (`he`/`ar`).
- [ ] **Step 6:** Commit: `feat: interactive tree visualization`.

### Task 4.2 (future / stretch): Simulated Tree
- [ ] **Step 1:** Out of scope for this plan (marked "long term" in `todo.md`). Note in `todo.md` and PLAN.md that Phase 4 lands the static interactive tree; the animated "simulated tree" is a future plan.

---

## Post-Implementation

- Update `todo.md`: check off completed roadmap items, keep trunk/limbs/branches items as done once Phase 1 lands.
- Update `AGENTS.md` if architecture notes change (e.g., new routes, `trash/` gone).
- Final verification pass on the `develop` branch: `pnpm lint`, `npx tsc --noEmit`, `pnpm build`.
