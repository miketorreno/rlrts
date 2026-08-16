# RLRTS Roadmap Implementation Plan (v2)

> **For agentic workers:** Implement task-by-task via subagent-driven development. Each task ends with verification (`pnpm lint` + `npx tsc --noEmit` + `pnpm build`) and a commit on a feature branch off `develop`. Steps use `- [ ]` for tracking.

**Goal:** Ship the full `todo.md` roadmap — trunk/limbs/branches tree anatomy with real pages, a responsive sidebar + bottom-nav layout, Todos with sub-tasks + XP, and an Obsidian-like tree visualization — keeping the app green at every step.

**Architecture:** Next.js 16 App Router client-heavy app, Convex backend (5-level hierarchy: `trunks → limbs → branches → twigs → leaves`), Clerk auth, next-intl (9 locales, `en` default, RTL for `he`/`ar`).

**Tech Stack:** Next.js 16.2, Convex 1.38, Clerk 7, next-intl 4, Tailwind v4, shadcn/ui, framer-motion 12, lucide-react, date-fns 4. Package manager: **pnpm**. No test framework.

**Spec:** `todo.md` + `AGENTS.md` + `PROMPT.md`.

## Global Constraints

- **pnpm only.** Dev needs two processes: `pnpm dev` + `npx convex dev` (`http://127.0.0.1:3210`).
- **Always commit `convex/_generated/`** after any schema/function change via `npx convex codegen` — stale generated files cause tsc errors.
- **Tree vocabulary only** (`trunk`, `limb`, `branch`, `twig`, `leaf`) in UI text, routes, component names. Never reintroduce `calendar`/`habit`.
- **Navigate only** with `Link`/`useRouter`/`usePathname` from `@/i18n/routing`. Never `next/link` or `next/router`.
- **Every new UI string goes into all 9 locale files** (`src/messages/{en,de,es,fr,ru,he,ar,hi,zh}.json`). Structure must match `en.json` exactly; translate values.
- **Protected routes** live in `src/proxy.ts:14`. Extend the matcher for every new authenticated route.
- **Verification per task:** `pnpm lint` (0 errors; don't add warnings), `npx tsc --noEmit`, `pnpm build`. Manual browser walkthrough when UI behavior changes.
- **Git:** feature branch `feat/roadmap-v2` off `develop`; one commit per task; merge to `develop` when complete. `main` merges from `develop` via PR only.
- `convex/_generated/` is committed; do not hand-edit it.

---

## Phase 1: Tree Anatomy — Schema, Convex Backend, Pages

### Task 1.1: Commit schema + regenerate `_generated`

**Files:**
- Modify: `convex/schema.ts` (already edited in working tree — commit it)
- Modify (generated): `convex/_generated/*`

- [ ] **Step 1:** Confirm `convex/schema.ts` contains `trunks`, `limbs`, `branches` tables and `twigs.branchId` (working-tree change, present).
- [ ] **Step 2:** Run `npx convex codegen` to regenerate `convex/_generated/` (adds `Doc<"trunks">`, `Id<"trunks">`, etc.).
- [ ] **Step 3:** Verify `npx tsc --noEmit` passes.
- [ ] **Step 4:** Commit: `feat: extend schema with trunk/limb/branch tables (include generated types)`.

**Interfaces produced:** `Id<"trunks">`, `Id<"limbs">`, `Id<"branches">` and `Doc<"trunks"> | ...` types now exist in `convex/_generated/dataModel.d.ts` — all later tasks consume these.

### Task 1.2: Shared cascade-delete helpers

**Files:**
- Create: `convex/tree_utils.ts`
- Modify: `convex/leaves.ts` (use helper in `remove`)
- Modify: `convex/twigs.ts` (use helper in `remove`)

**Interfaces:**
- Consumes: generated `MutationCtx`/`Id` types (Task 1.1).
- Produces: `deleteLeafAndCompletions(ctx, leafId)`, `deleteTwigSubtree(ctx, twigId)`, `deleteBranchSubtree(ctx, branchId)`, `deleteLimbSubtree(ctx, limbId)`, `deleteTrunkSubtree(ctx, trunkId)`.

- [ ] **Step 1:** Create `convex/tree_utils.ts`:
```ts
import { Id } from "./_generated/dataModel";
import { MutationCtx } from "./_generated/server";

export async function deleteLeafAndCompletions(
  ctx: MutationCtx,
  leafId: Id<"leaves">,
): Promise<void> {
  const completions = await ctx.db
    .query("completions")
    .filter((q) => q.eq(q.field("leafId"), leafId))
    .collect();
  await Promise.all(completions.map((c) => ctx.db.delete(c._id)));
  await ctx.db.delete(leafId);
}

export async function deleteTwigSubtree(ctx: MutationCtx, twigId: Id<"twigs">): Promise<void> {
  const leaves = await ctx.db
    .query("leaves")
    .filter((q) => q.eq(q.field("twigId"), twigId))
    .collect();
  for (const leaf of leaves) await deleteLeafAndCompletions(ctx, leaf._id);
  await ctx.db.delete(twigId);
}

export async function deleteBranchSubtree(ctx: MutationCtx, branchId: Id<"branches">): Promise<void> {
  const twigs = await ctx.db
    .query("twigs")
    .filter((q) => q.eq(q.field("branchId"), branchId))
    .collect();
  for (const twig of twigs) await deleteTwigSubtree(ctx, twig._id);
  await ctx.db.delete(branchId);
}

export async function deleteLimbSubtree(ctx: MutationCtx, limbId: Id<"limbs">): Promise<void> {
  const branches = await ctx.db
    .query("branches")
    .filter((q) => q.eq(q.field("limbId"), limbId))
    .collect();
  for (const branch of branches) await deleteBranchSubtree(ctx, branch._id);
  await ctx.db.delete(limbId);
}

export async function deleteTrunkSubtree(ctx: MutationCtx, trunkId: Id<"trunks">): Promise<void> {
  const limbs = await ctx.db
    .query("limbs")
    .filter((q) => q.eq(q.field("trunkId"), trunkId))
    .collect();
  for (const limb of limbs) await deleteLimbSubtree(ctx, limb._id);
  await ctx.db.delete(trunkId);
}
```
- [ ] **Step 2:** Refactor `leaves.remove` to call `deleteLeafAndCompletions`; refactor `twigs.remove` to call `deleteTwigSubtree` (drop the inlined duplicate logic). Behavior unchanged.
- [ ] **Step 3:** Verify lint + tsc + build.
- [ ] **Step 4:** Commit: `refactor: shared cascade-delete helpers for tree subtrees`.

### Task 1.3: `convex/trunks.ts` CRUD

**Files:**
- Create: `convex/trunks.ts`

**Interfaces:**
- Consumes: `deleteTrunkSubtree` (Task 1.2).
- Produces: `trunks.list()`, `trunks.get({id})`, `trunks.create({name})`, `trunks.update({id,name,position})`, `trunks.remove({id})`.

- [ ] **Step 1:** Port the `twigs.ts` pattern:
  - `list` — all user trunks ordered by `position`.
  - `get` — single by id (verify ownership).
  - `create` — position = `max(existing positions) + 1`.
  - `update` — rename + sibling reorder (shift positions of trunks between old and new position, port logic from `twigs.update`).
  - `remove` — ownership check → `deleteTrunkSubtree(ctx, id)` → re-sort sibling positions.
- [ ] **Step 2:** Run `npx convex codegen`; verify tsc + build.
- [ ] **Step 3:** Commit: `feat: trunk CRUD functions`.

### Task 1.4: `convex/limbs.ts` + `convex/branches.ts` CRUD

**Files:**
- Create: `convex/limbs.ts`
- Create: `convex/branches.ts`

**Interfaces:**
- Consumes: `deleteLimbSubtree`, `deleteBranchSubtree` (Task 1.2).
- Produces: `limbs.list({trunkId?})`, `limbs.create({name,trunkId})`, `limbs.update({id,name,position})`, `limbs.remove({id})`, `limbs.get({id})`; `branches.list({limbId?})`, `branches.create({name,limbId})`, `branches.update({id,name,position})`, `branches.remove({id})`, `branches.get({id})`.

- [ ] **Step 1:** Mirror Task 1.3, scoped by parent: `create` verifies parent ownership (`trunk.userId` / `limb.userId`) and positions within the parent (`max position among siblings + 1`); `remove` uses `deleteLimbSubtree`/`deleteBranchSubtree`; `update` reorders within the same parent scope.
- [ ] **Step 2:** Run `npx convex codegen`; verify tsc + build.
- [ ] **Step 3:** Commit: `feat: limb and branch CRUD functions`.

### Task 1.5: Branch-scoped twigs

**Files:**
- Modify: `convex/twigs.ts`

**Interfaces:**
- Consumes: `deleteTwigSubtree` (already refactored in 1.2).
- Produces: `twigs.list({ branchId?, rootOnly? })`, `twigs.create({name, colorTheme, branchId?})`, `twigs.update({id, name, colorTheme, position, branchId?})` — all backwards-compatible.

- [ ] **Step 1:** `list`: add optional `branchId: v.optional(v.id("branches"))` and `rootOnly: v.optional(v.boolean())` args. `rootOnly: true` → filter `branchId === undefined`; `branchId` set → filter to that branch; neither → current behavior (all user twigs). **The `/twig` dashboard keeps calling `list({})`** — it still shows every twig including nested ones (no data hides).
- [ ] **Step 2:** `create`: add optional `branchId`; if set, verify the branch belongs to the user. Position = sibling count in the parent scope + 1 (scope = the branch if `branchId`, else root-level twigs).
- [ ] **Step 3:** `update`: accept optional `branchId` to move a twig between scopes; reorder positions within the *same new scope* (port the shift logic, parameterized by scope).
- [ ] **Step 4:** Run `npx convex codegen`; verify tsc + build.
- [ ] **Step 5:** Commit: `feat: branch-scoped twigs (optional branchId)`.

### Task 1.6: `/trunks` page

**Files:**
- Modify: `src/app/[locale]/trunks/page.tsx` (replace placeholder)
- Create: `src/components/trunk/trunk-list.tsx`, `src/components/trunk/trunk-dialogs.tsx`, `src/components/trunk/trunk-item.tsx`
- Modify: `src/messages/*.json` (all 9), `src/proxy.ts:14`

**Interfaces:**
- Consumes: `api.trunks.*` (Task 1.3), `useDialogState`-style patterns.
- Produces: trunk list with create/edit/delete; "View limbs →" links to `/limbs?trunkId=<id>`.

- [ ] **Step 1:** Build the list page: `useQuery(api.trunks.list)` gated on `useConvexAuth().isAuthenticated`, sorted by position. Each row: name, child count (optional), Edit (reorder via position select, like twig edit), Delete (AlertDialog with cascade warning), "View limbs".
- [ ] **Step 2:** Reuse the shadcn dialog pattern from `src/components/twig/twig-dialogs.tsx` (Dialog + Input + Select + buttons). Name-only create dialog (no colors at this level).
- [ ] **Step 3:** i18n keys: `dialogs.trunk.*` (new/edit/delete/confirm), `toast.trunk.{created,updated,deleted}`, `trunks.emptyState` in all 9 locales.
- [ ] **Step 4:** `src/proxy.ts:14` matcher → `["/twig(.*)", "/leaves(.*)", "/trunks(.*)", "/limbs(.*)", "/branches(.*)", "/todos(.*)"]`.
- [ ] **Step 5:** Verify lint + tsc + build; manual walkthrough (create/edit/reorder/delete trunk).
- [ ] **Step 6:** Commit: `feat: functional trunks page`.

### Task 1.7: `/limbs` page

**Files:**
- Create: `src/app/[locale]/limbs/page.tsx`
- Create: `src/components/limb/limb-list.tsx`, `src/components/limb/limb-dialogs.tsx`, `src/components/limb/limb-item.tsx`
- Modify: `src/messages/*.json`

**Interfaces:**
- Consumes: `api.limbs.*`, `api.trunks.list`.
- Produces: limbs grouped by selected trunk via query param `?trunkId=`.

- [ ] **Step 1:** Page reads `?trunkId=` from `useSearchParams` (client component; wrap in `Suspense` if the App Router requires it). No param → default to first trunk. Render a trunk selector (Select) at top.
- [ ] **Step 2:** Limb rows: create/edit/reorder/delete (same dialog pattern as 1.6), "View branches →" → `/branches?limbId=<id>`. Delete warns "removes all branches, twigs, and leaves inside".
- [ ] **Step 3:** i18n keys `dialogs.limb.*`, `toast.limb.*`, `limbs.*` in all 9 locales.
- [ ] **Step 4:** Verify lint + tsc + build; manual walkthrough with a fresh trunk → limb.
- [ ] **Step 5:** Commit: `feat: functional limbs page`.

### Task 1.8: `/branches` page

**Files:**
- Create: `src/app/[locale]/branches/page.tsx`
- Create: `src/components/branch/branch-list.tsx`, `src/components/branch/branch-dialogs.tsx`, `src/components/branch/branch-item.tsx`
- Modify: `src/messages/*.json`

**Interfaces:**
- Consumes: `api.branches.*`, `api.limbs.list`, `api.twigs.list({ branchId })`, `api.twigs.create`.
- Produces: branch drill-in showing each branch's twigs inline.

- [ ] **Step 1:** Page reads `?limbId=`; limb selector at top. Branch rows: create/edit/reorder/delete.
- [ ] **Step 2:** Each branch row expands to show its twigs (via `api.twigs.list({ branchId })`): twig name + color dot, link to `/twigs/[twigId]`, and an "Add twig" button opening the twig create dialog pre-bound to that branch (calls `api.twigs.create({ name, colorTheme, branchId })`).
- [ ] **Step 3:** i18n keys `dialogs.branch.*`, `toast.branch.*`, `branches.*` in all 9 locales.
- [ ] **Step 4:** Verify lint + tsc + build; manual walkthrough trunk → limb → branch → twig → leaf.
- [ ] **Step 5:** Commit: `feat: functional branches page with inline twig management`.

### Task 1.9: Route consistency + legacy cleanup

**Files:**
- Modify: `src/components/app-header.tsx` (links `/limb` → `/limbs`, `/branch` → `/branches`; desktop + mobile menus)
- Delete: `src/app/[locale]/twigs/page.tsx` (orphaned card grid, imports `next/link`)
- Delete: `src/components/twigs/card.tsx`, `src/components/twigs/card-small.tsx`
- Modify: `src/messages/*.json` (rename `nav.limb` → `nav.limbs`, `nav.branch` → `nav.branches`; label "Limbs"/"Branches")
- Modify: `todo.md` (check off trunk/limbs/branches/twigs items)

- [ ] **Step 1:** `grep` for `@/components/twigs` — confirmed only `twigs/page.tsx` imports it (verified pre-plan). Delete the three files.
- [ ] **Step 2:** Update `app-header.tsx` hrefs/labels to plural routes in both desktop nav and mobile menu.
- [ ] **Step 3:** Confirm `twig-item.tsx:90` uses `useRouter` from `@/i18n/routing` (import from `@/i18n/routing`; fix if it imports `next/router`).
- [ ] **Step 4:** i18n: rename the two nav keys in all 9 locales.
- [ ] **Step 5:** Delete the stale root `PLAN.md` duplicate (tracked); `.agents/plans/PLAN.md` becomes the single plan source.
- [ ] **Step 6:** Verify lint + tsc + build; click through all nav links.
- [ ] **Step 7:** Commit: `chore: consistent plural routes; remove orphaned twigs card page and duplicate PLAN.md`.

---

## Phase 2: Responsive Layout (Sidebar + Bottom Nav)

### Task 2.1: Shared nav config

**Files:**
- Create: `src/components/layout/nav-items.tsx`

**Interfaces:**
- Consumes: `@/i18n/routing` Link, lucide icons, `useTranslations("nav")`.
- Produces: `export const navItems = [{ href: "/trunks", labelKey: "nav.trunks", icon: TreePine }, { href: "/limbs", ... }, { href: "/branches", ... }, { href: "/twig", ... }]` — one source for sidebar + bottom nav.

- [ ] **Step 1:** Define the array with icons (`TreePine`, `GitBranch`, `Network`, `CalendarDays` from lucide-react) and i18n label keys. `getNavItems()` resolves keys via `useTranslations`.
- [ ] **Step 2:** Verify tsc + build. Commit: `feat: shared navigation items config`.

### Task 2.2: `AppSidebar` (desktop)

**Files:**
- Create: `src/components/layout/app-sidebar.tsx`
- Modify: `src/messages/*.json` if tooltips needed

- [ ] **Step 1:** `hidden md:flex` fixed column on the **start** side (`inset-y-0 start-0`, RTL-aware via logical properties). Contains: logo (`XIcon` + app name, links `/`), nav items with active state (`usePathname` from `@/i18n/routing`, compare against `item.href`), spacer, theme toggle, `UserButton` inside `<Show when="signed-in">`.
- [ ] **Step 2:** Width `w-16 lg:w-64` with icon-only (collapsed) / icon+label (expanded) variants using `@number-flow`-style polish — keep simple: `w-64` fixed, labels always visible.
- [ ] **Step 3:** Verify tsc + build. Commit: `feat: desktop sidebar navigation`.

### Task 2.3: `BottomNav` (mobile)

**Files:**
- Create: `src/components/layout/bottom-nav.tsx`
- Modify: `src/messages/*.json` if tooltips needed

- [ ] **Step 1:** `md:hidden`, fixed at `inset-x-0 bottom-0`, icon-only items from `nav-items.tsx`, active highlight with framer-motion `layoutId="nav-pill"` animated background.
- [ ] **Step 2:** Add `pb-[env(safe-area-inset-bottom)]` for iOS safe area. Use `aria-label` per item.
- [ ] **Step 3:** Verify tsc + build. Commit: `feat: mobile bottom navigation bar`.

### Task 2.4: Compose layout in `RootWrapper`

**Files:**
- Modify: `src/components/root-wrapper.tsx`
- Modify: `src/components/app-header.tsx` (reduce to slim mobile-only top bar with logo + theme toggle, or remove)

- [ ] **Step 1:** Rework `RootWrapper`: compose `AppSidebar` + `main` (`md:ps-64` for sidebar clearance) + `BottomNav` + `AnimatePresence`/`MotionWrapper` + `Toaster`.
- [ ] **Step 2:** Add bottom padding to main content on mobile so content clears the bottom nav (`pb-20 md:pb-0`). Drop the header's hamburger menu (now redundant); keep logo in sidebar (desktop) and a slim top bar (mobile).
- [ ] **Step 3:** Verify lint + tsc + build. Manual responsive check at ≤768px and ≥768px + RTL (`he`, `ar`) + dark mode.
- [ ] **Step 4:** Commit: `feat: sidebar + bottom nav responsive layout`.

---

## Phase 3: Todos with Sub-Tasks + XP

### Task 3.1: Todos schema + `convex/todos.ts`

**Files:**
- Modify: `convex/schema.ts`
- Create: `convex/todos.ts`

**Interfaces:**
- Produces: tables `todos`, `todoItems`, `todoCompletions`; functions `todos.list()`, `todos.getXp()`, `todos.create({name,cadence,xp,items:[{name}]})`, `todos.update({id,name,cadence,xp})`, `todos.remove({id})`, `todos.toggleItem({todoId,itemId})`, `todos.addItem({todoId,name})`, `todos.removeItem({itemId})`, `todos.resetPeriod()`.

- [ ] **Step 1:** Add to `convex/schema.ts`:
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
  position: v.optional(v.number()),
  isCompleted: v.boolean(),
}).index("by_todo", ["todoId"]),

todoCompletions: defineTable({
  todoId: v.id("todos"),
  userId: v.string(),
  completedAt: v.number(),
}).index("by_user_and_date", ["userId", "completedAt"]),
```
- [ ] **Step 2:** `periodStart(cadence, now)` server helper: daily → today 00:00 local; weekly → Monday 00:00 local (`(day + 6) % 7` days back).
- [ ] **Step 3:** Implement functions:
  - `list` — returns `{ todos (sorted by position), items (all user), completions (all user) }`. Client derives current-period state.
  - `create` — insert todo + its initial items (`isCompleted: false`, sequential positions), position = max + 1.
  - `remove` — cascade items + completions, re-sort positions.
  - `toggleItem` — flip `todoItems.isCompleted`; then if **all** items of the todo are now checked → insert `todoCompletions` for the current period only if none exists yet; if any item is unchecked → delete the current-period `todoCompletions` record. This is the XP gate.
  - `addItem` / `removeItem` — manage sub-tasks (removing an item re-checks the "all done" condition via the same recompute).
  - `getXp` — **query**, aggregates deterministically:
```ts
export const getXp = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const completions = await ctx.db
      .query("todoCompletions")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();
    let xp = 0;
    for (const c of completions) {
      const todo = await ctx.db.get(c.todoId);
      if (todo) xp += todo.xp;
    }
    return { xp };
  },
});
```
  - `resetPeriod` — sets all `todoItems.isCompleted = false` and deletes `todoCompletions` not in the current period. (Rollover cleanup.)
- [ ] **Step 4:** Run `npx convex codegen`; verify tsc + build.
- [ ] **Step 5:** Commit: `feat: todos data model, sub-task toggling, and XP aggregation`.

### Task 3.2: `/todos` page + components

**Files:**
- Create: `src/app/[locale]/todos/page.tsx`
- Create: `src/components/todo/todo-list.tsx`, `todo-item.tsx`, `todo-dialogs.tsx`
- Create: `src/lib/todos.ts` (client `periodStart` mirror using `date-fns` `startOfWeek`)
- Modify: `src/messages/*.json`

**Interfaces:**
- Consumes: `api.todos.*` (3.1), `useDialogState` pattern, `useToastMessages`-style (`toast.todo.*`).

- [ ] **Step 1:** Page: `useQuery(api.todos.list)` gated on auth. Two collapsible sections — Daily and Weekly (group by `cadence`, sort by position). Empty states with "Add todo".
- [ ] **Step 2:** Todo row: name, cadence badge, XP chip, sub-task checkboxes (each calls `toggleItem`; disable while pending), progress ("2/4"), edit/delete.
- [ ] **Step 3:** Dialogs: create (name, cadence select, xp number, initial sub-task name list), edit (name/cadence/xp), add/remove sub-task. Toast on create/update/delete. Delete confirms cascade.
- [ ] **Step 4:** Period rollover: on mount, compare a locally stored `periodKey` (day for daily / ISO week for weekly); on change call `resetPeriod` and store the new key.
- [ ] **Step 5:** i18n keys `todo.*` and `xp.*` in all 9 locales.
- [ ] **Step 6:** Verify lint + tsc + build. Manual: create todo with 2 sub-tasks, check both → XP appears in sidebar badge; uncheck → XP drops; reload persists; simulate next day → items reset.
- [ ] **Step 7:** Commit: `feat: todos page with sub-tasks, XP, and dialogs`.

### Task 3.3: XP badge + nav wiring

**Files:**
- Modify: `src/components/layout/nav-items.tsx` (add `{ href: "/todos", labelKey: "nav.todos", icon: CheckSquare }`)
- Create: `src/components/todo/xp-badge.tsx`
- Modify: `src/components/layout/app-sidebar.tsx` (render XP badge)
- Modify: `src/messages/*.json`

- [ ] **Step 1:** `XpBadge`: `useQuery(api.todos.getXp)` gated on auth; `hidden` when signed out; shows a sparkle/star icon + number.
- [ ] **Step 2:** Mount under the nav in `AppSidebar` (visible desktop). Add `nav.todos` key to all 9 locales.
- [ ] **Step 3:** Verify lint + tsc + build. Commit: `feat: XP badge in sidebar and todos nav item`.

---

## Phase 4: Obsidian-like Tree Visualization

### Task 4.1: `getFullTree` query

**Files:**
- Create: `convex/tree.ts`

**Interfaces:**
- Consumes: generated types.
- Produces:
```ts
export type TreeNode = {
  id: string;
  type: "trunk" | "limb" | "branch" | "twig" | "leaf";
  name: string;
  colorTheme?: string;
  children: TreeNode[];
};
export const getFullTree = query({
  args: {},
  handler: async (ctx): Promise<{ rootTwigs: TreeNode[]; trunks: TreeNode[] }> => { ... },
});
```
`rootTwigs` = twigs with no `branchId` (each carrying its leaves); each `trunk` nests `limbs → branches → twigs → leaves`, all ordered by position. Leaves carry their leaf payload fields (`timerDuration`) for detail links. Consumed as `api.tree.getFullTree`.

- [ ] **Step 1:** Single handler fetches all 5 tables (user-scoped), builds nested `TreeNode[]` in memory (5 maps keyed by parent id), returns in position order. One round-trip.
- [ ] **Step 2:** Run `npx convex codegen`; verify tsc + build.
- [ ] **Step 3:** Commit: `feat: single-query full tree aggregation`.

### Task 4.2: Recursive tree component

**Files:**
- Create: `src/components/tree/tree-view.tsx`
- Create: `src/components/tree/tree-node.tsx`
- Modify: `src/messages/*.json`

**Interfaces:**
- Consumes: `api.tree.getFullTree` (4.1), `TreeNode` shape, `@/i18n/routing` Link.

- [ ] **Step 1:** `TreeView`: root container; renders `rootTwigs` group + each trunk. `TreeNode`: recursive; icon per type (trunk/limb/branch/twig/leaf), name, child-count badge, expand/collapse with framer-motion `AnimatePresence`; default-expand trunk level, collapse deeper.
- [ ] **Step 2:** Node click → link to detail: trunks→`/trunks`, limbs→`/limbs?trunkId=`, branches→`/branches?limbId=`, twigs→`/twigs/[twigId]`, leaves→`/leaves/[leafId]`. Twigs show their color dot.
- [ ] **Step 3:** a11y: nodes are `<button>`s (or `aria-expanded` + role) with keyboard focus; label = name.
- [ ] **Step 4:** i18n keys `tree.*` (title, empty states, expand/collapse tooltips) in all 9 locales.
- [ ] **Step 5:** Verify lint + tsc + build. Manual: expand/collapse animation, deep nesting, empty state, dark mode, RTL (`he`/`ar`).
- [ ] **Step 6:** Commit: `feat: recursive interactive tree component`.

### Task 4.3: Integrate tree into `/trunks`

**Files:**
- Modify: `src/app/[locale]/trunks/page.tsx`
- Modify: `src/messages/*.json`

- [ ] **Step 1:** Add a segmented view toggle on `/trunks` — **List** (Phase 1 list) | **Tree** (Phase 4 visualization), persisted in a `useState` (optional: URL search param). Default: Tree.
- [ ] **Step 2:** Tree view renders `<TreeView />`; keep list view as-is.
- [ ] **Step 3:** Verify lint + tsc + build. Commit: `feat: tree visualization toggle on trunks page`.

---

## Post-Implementation

- [ ] Update `todo.md`: check off "Design a new UI (bottom nav/sidebar)", trunk/limbs/branches, twigs-branch edit, Todos+XP, and the interactive tree. Keep "Simulated Tree" under long-term with a note that Phase 4 lands the static interactive tree.
- [ ] Update `AGENTS.md`: new routes (`/trunks`, `/limbs`, `/branches`, `/todos`), updated proxy matcher, tree-vocabulary notes (Phase 1–4 done), the `PLAN.md` single-copy location.
- [ ] Final verification on `develop`: `pnpm lint`, `npx tsc --noEmit`, `pnpm build`.

## Gotchas (documented decisions)

- **Rollover edge:** stale `todoItems.isCompleted` can survive if localStorage resets (device switch). XP stays correct (query-computed from `todoCompletions`); the next `resetPeriod` call heals checkboxes. Acceptable for personal scale.
- **`getFullTree` scale:** fine for personal usage; revisit pagination only if data grows.
- **Timezone:** period boundaries use server-local time, consistent with the existing `completions` code.
- **`/twig` dashboard** continues to list *all* twigs (nested included) — backward compatible; organization lives in `/trunks` + tree.
