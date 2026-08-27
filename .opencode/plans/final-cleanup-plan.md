# Final Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the 4 remaining features: Tree Visualization, XP Multiplier Indicator, orphaned page cleanup, and minor cleanups.

**Architecture:** (1) Tree Visualization — new `convex/tree.ts` query + recursive `TreeView`/`TreeNode` components + list/tree toggle on `/trunks`. (2) XP Multiplier — add multiplier display to XpBadge, todo items, and leaf statistics. (3) Cleanup — remove orphaned page, fix stale TODOs, update README. (4) Minor fixes — landing page preview, import/export button, empty className.

**Tech Stack:** Convex queries, React recursive components, framer-motion (AnimatePresence), shadcn/ui, lucide-react icons, next-intl i18n, Tailwind v4.

**Spec:** Phase 4 of `.agents/plans/PLAN.md` + XP Design Spec + audit findings.

## Global Constraints

- Package manager: pnpm only
- Navigation: use `Link`/`useRouter`/`usePathname` from `@/i18n/routing`
- Every new user-facing string must be an i18n key in all 9 locale files
- RTL-safe: use `start`/`end` instead of `left`/`right`
- Verification after every task: `pnpm lint` (0 errors) + `npx tsc --noEmit` + `pnpm build`

---

## Tasks

### Task 1: getFullTree Convex Query

**Files:** Create: `convex/tree.ts`

- [ ] **Step 1:** Create `convex/tree.ts` with `getFullTree` query — fetches all 5 hierarchy tables in parallel, builds nested `TreeNode[]` structure using in-memory maps, returns `{ trunks, rootTwigs }`. TreeNode type: `{ id, type, name, colorTheme?, children }`.
- [ ] **Step 2:** Run `npx convex dev` to regenerate codegen
- [ ] **Step 3:** Verify: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
- [ ] **Step 4:** Commit: `feat(tree): add getFullTree query for tree visualization`

---

### Task 2: Tree View Components

**Files:** Create: `src/components/tree/tree-view.tsx`, `src/components/tree/tree-node.tsx`

- [ ] **Step 1:** Create `tree-node.tsx` — recursive component with: icon per type (TreePine/GitBranch/Network/CalendarDays/Leaf), expand/collapse with framer-motion AnimatePresence, chevron rotation animation, child count Badge, color dot for twigs, hover "View" link to navigate to the entity. Default expand at trunk level.
- [ ] **Step 2:** Create `tree-view.tsx` — root container querying `api.tree.getFullTree`, renders trunks + root twigs sections with Card wrapper
- [ ] **Step 3:** Verify: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
- [ ] **Step 4:** Commit: `feat(tree): add TreeView and TreeNode components`

---

### Task 3: Integrate Tree Toggle + i18n

**Files:** Modify: `src/app/[locale]/trunks/page.tsx`, `src/messages/*.json` (×9)

- [ ] **Step 1:** Read current trunks page
- [ ] **Step 2:** Add segmented toggle (List | Tree) at top of trunks page. Default: Tree. Uses `useState<"list" | "tree">("tree")`. Renders `<TrunkList>` or `<TreeView>` based on selection. Style as pill/segmented control.
- [ ] **Step 3:** Add i18n keys to all 9 locales: `trunks.treeView`, `trunks.listView`, `trunks.emptyTree`, `trunks.rootTwigs`
- [ ] **Step 4:** Verify: `npx tsc --noEmit && pnpm lint && pnpm build`
- [ ] **Step 5:** Commit: `feat(tree): add list/tree toggle to trunks page`

---

### Task 4: XP Multiplier Indicator

**Files:** Modify: `src/components/todo/xp-badge.tsx`, `src/components/todo/todo-item.tsx`, `src/components/leaf/details/leaf-statistics.tsx`

- [ ] **Step 1:** Read all three files
- [ ] **Step 2:** In `xp-badge.tsx`: import `streakMultiplier` from `@/lib/xp`, compute multiplier from `currentStreak`, show `{multiplier.toFixed(1)}x` badge next to flame icon when > 1
- [ ] **Step 3:** In `todo-item.tsx`: show effective XP with multiplier (e.g., "50 XP (1.3x)") instead of raw value when streak > 0. Pass streak as prop or query xp profile.
- [ ] **Step 4:** In `leaf-statistics.tsx`: add multiplier row to the 4-stat grid, derive from local `currentStreak` variable (already computed there)
- [ ] **Step 5:** Verify: `npx tsc --noEmit && pnpm lint && pnpm build`
- [ ] **Step 6:** Commit: `feat(xp): add streak multiplier indicator to UI`

---

### Task 5: Minor Cleanups

**Files:** Modify: `src/app/[locale]/page.tsx`, `src/components/twig/import-export.tsx`, `src/components/twig/month-grid-view.tsx`, `README.md`

- [ ] **Step 1:** In `page.tsx`: remove `hidden` class from preview section div (line 130). Add `grid` class if missing. Verify image assets exist in `public/`.
- [ ] **Step 2:** In `import-export.tsx`: resolve TODO at line 55 — keep button visible (remove TODO comment, no functional change needed since desktop toolbar doesn't duplicate it)
- [ ] **Step 3:** In `month-grid-view.tsx`: remove empty `className=""` from line 108-109 (remove the className attribute entirely)
- [ ] **Step 4:** In `README.md`: change `npm install` → `pnpm install` and `npm run dev` → `pnpm dev`. Add note about `npx convex dev` in second terminal.
- [ ] **Step 5:** Verify: `npx tsc --noEmit && pnpm lint && pnpm build`
- [ ] **Step 6:** Commit: `chore: resolve stale TODOs and fix README`

---

## Task Dependencies

```
Task 1 (getFullTree query)
  └─ Task 2 (Tree components)
       └─ Task 3 (Toggle + i18n)

Task 4 (XP multiplier) — independent
Task 5 (Cleanups) — independent
```

Tasks 4 and 5 are independent of Tasks 1-3 and of each other.
