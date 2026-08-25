# Tree Visualization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an Obsidian-like tree visualization to the `/trunks` page, showing the full trunks → limbs → branches → twigs → leaves hierarchy in an expandable/collapsible tree.

**Architecture:** (1) A `getFullTree` Convex query that fetches all 5 hierarchy tables in one round-trip and returns a nested `TreeNode[]` structure. (2) Recursive `TreeView`/`TreeNode` React components with framer-motion animations. (3) A segmented List/Tree toggle on the `/trunks` page.

**Tech Stack:** Convex queries, React recursive components, framer-motion (AnimatePresence), shadcn/ui (Card, Badge), lucide-react icons, next-intl i18n, Tailwind v4.

**Spec:** Phase 4 of `.agents/plans/PLAN.md` (Tasks 4.1-4.3)

## Global Constraints

- Package manager: pnpm only
- Navigation: use `Link`/`useRouter`/`usePathname` from `@/i18n/routing` — never `next/link` or `next/router`
- Every new user-facing string must be an i18n key in all 9 locale files
- RTL-safe: use `start`/`end` instead of `left`/`right`
- Verification after every task: `pnpm lint` (0 errors) + `npx tsc --noEmit` + `pnpm build`
- Convex backend must be running (`npx convex dev`) for codegen after schema/function changes

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `convex/tree.ts` | CREATE | `getFullTree` query — fetches all hierarchy in one round-trip |
| `src/components/tree/tree-view.tsx` | CREATE | Root container rendering trunks + root twigs |
| `src/components/tree/tree-node.tsx` | CREATE | Recursive node component with expand/collapse |
| `src/app/[locale]/trunks/page.tsx` | MODIFY | Add list/tree toggle |
| `src/messages/*.json` (×9) | MODIFY | Tree view i18n keys |

---

## Tasks

### Task 1: getFullTree Convex Query

**Files:**
- Create: `convex/tree.ts`

**Interfaces:**
- Produces: `getFullTree` query returning `{ trunks: TreeNode[], rootTwigs: TreeNode[] }`
- TreeNode type: `{ id: string, type: "trunk"|"limb"|"branch"|"twig"|"leaf", name: string, colorTheme?: string, children: TreeNode[] }`

- [ ] **Step 1:** Create `convex/tree.ts` with `getFullTree` query that:
  - Fetches all 5 user-scoped tables in parallel via `Promise.all`
  - Builds in-memory maps keyed by parent ID for O(1) lookup
  - Constructs nested TreeNode arrays sorted by position
  - Returns `{ trunks: TreeNode[], rootTwigs: TreeNode[] }` (root twigs are twigs with no branchId)

- [ ] **Step 2:** Run `npx convex dev` briefly to regenerate `convex/_generated/`

- [ ] **Step 3:** Verify: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`

- [ ] **Step 4:** Commit: `feat(tree): add getFullTree query for tree visualization`

---

### Task 2: Tree View Components

**Files:**
- Create: `src/components/tree/tree-node.tsx`
- Create: `src/components/tree/tree-view.tsx`

**Interfaces:**
- Consumes: `api.tree.getFullTree` from Task 1
- Consumes: `Link` from `@/i18n/routing`
- Produces: `TreeView` and `TreeNode` components

- [ ] **Step 1:** Create `src/components/tree/tree-node.tsx`:
  - Recursive component accepting `{ node: TreeNodeData, defaultExpanded?: boolean }`
  - Icon per type: TreePine (trunk), GitBranch (limb), Network (branch), CalendarDays (twig), Leaf (leaf)
  - Expand/collapse with framer-motion AnimatePresence (height: 0 → auto)
  - Chevron rotation animation on expand
  - Child count Badge when hasChildren
  - Color dot for twigs with colorTheme
  - Hover "View" link navigating to entity page via `Link` from `@/i18n/routing`
  - `aria-expanded` on buttons for accessibility
  - Indentation via `ps-6` on children container

- [ ] **Step 2:** Create `src/components/tree/tree-view.tsx`:
  - Client component querying `api.tree.getFullTree`
  - Card wrapper with CardHeader + CardContent
  - Renders trunks section (each trunk expanded by default)
  - Renders root twigs section (separated by border-t) if any exist
  - Empty state with i18n message
  - Loading state with skeleton or text

- [ ] **Step 3:** Verify: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`

- [ ] **Step 4:** Commit: `feat(tree): add TreeView and TreeNode components`

---

### Task 3: Integrate Tree Toggle + i18n

**Files:**
- Modify: `src/app/[locale]/trunks/page.tsx`
- Modify: `src/messages/*.json` (×9)

**Interfaces:**
- Consumes: `TreeView` from Task 2
- Consumes: existing `TrunkList` component
- Produces: Toggle between list and tree views on `/trunks`

- [ ] **Step 1:** Read current trunks page to understand structure

- [ ] **Step 2:** Add segmented toggle at top of trunks page:
  - Two buttons: "List" and "Tree" (using i18n keys)
  - State: `useState<"list" | "tree">("tree")` — default is Tree
  - Render `<TrunkList>` when list is selected, `<TreeView>` when tree is selected
  - Style as segmented control with active indicator (similar to pricing page pattern)

- [ ] **Step 3:** Add i18n keys to all 9 locale files:
  ```json
  {
    "trunks": {
      "treeView": "Tree View",
      "listView": "List View",
      "emptyTree": "No items yet. Create trunks, limbs, and branches to see your tree.",
      "rootTwigs": "Root Twigs"
    }
  }
  ```

- [ ] **Step 4:** Verify: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3` then `pnpm build 2>&1 | grep -E "Compiled|error" | head -5`

- [ ] **Step 5:** Commit: `feat(tree): add list/tree toggle to trunks page`

---

## Task Dependencies

```
Task 1 (getFullTree query)
  └─ Task 2 (Tree components)
       └─ Task 3 (Toggle + i18n)
```

All three tasks are sequential.
