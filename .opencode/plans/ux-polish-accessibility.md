# UX Polish & Accessibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the tree view keyboard-accessible, audit dark mode across new components, and add error boundaries to isolate rendering failures.

**Architecture:** (1) Full WAI-ARIA TreeView implementation with roving tabindex and arrow-key navigation. (2) Dark mode class audit and fixes across hero-stats, tree-view, and landing page. (3) Add `error.tsx` at route segment level + a reusable ErrorBoundary component.

**Tech Stack:** React, WAI-ARIA tree pattern, Tailwind CSS v4, Next.js App Router error.tsx convention.

**Spec:** Audit findings — tree has `aria-expanded` but no keyboard handlers, no ARIA roles, no roving tabindex. Hero-stats use hardcoded gradients (fine in dark mode). Zero error boundaries exist.

---

## Tasks

### Task 1: Keyboard-Accessible Tree View

**Files:**
- Modify: `src/components/tree/tree-node.tsx`
- Modify: `src/components/tree/tree-view.tsx`

**Interfaces:**
- Produces: Full WAI-ARIA tree with arrow-key navigation, roving tabindex, keyboard-activated links

- [ ] **Step 1:** Add ARIA roles to tree structure:
  - `role="tree"` on the root container in `tree-view.tsx`
  - `role="group"` on each children `<ul>` in `tree-node.tsx`
  - `role="treeitem"` on each node row
  - `aria-level={depth}` prop threaded through from parent
  - `aria-setsize` and `aria-posinset` for sibling count/position
- [ ] **Step 2:** Implement roving tabindex pattern:
  - Only one node in the entire tree has `tabIndex={0}` at a time (the "active" node)
  - All other nodes get `tabIndex={-1}`
  - Track active node via `useState` in `tree-view.tsx`, pass down
  - On mount, first tree node gets `tabIndex={0}`
- [ ] **Step 3:** Add keyboard handlers:
  - `ArrowDown`: move focus to next visible node (next sibling, or first child if expanded)
  - `ArrowUp`: move focus to previous visible node (previous sibling, or parent)
  - `ArrowRight`: if collapsed → expand; if expanded → move to first child
  - `ArrowLeft`: if expanded → collapse; if leaf → move to parent
  - `Home`: move to first node in tree
  - `End`: move to last visible node
  - `Enter`: activate the "View" link
  - `Space`: toggle expand/collapse
- [ ] **Step 4:** Make "View" link keyboard-accessible:
  - Show on `focus-within` in addition to `group-hover`
  - `group-focus-within:opacity-100 group-focus-within:pointer-events-auto`
- [ ] **Step 5:** Add `aria-label` to each node combining type + name (e.g., "Trunk: Fitness")
- [ ] **Step 6:** Verify: manual keyboard test + `npx tsc --noEmit && pnpm lint`
- [ ] **Step 7:** Commit: `feat(a11y): add keyboard navigation and ARIA roles to tree view`

---

### Task 2: Dark Mode Audit

**Files:**
- Modify: `src/components/dashboard/hero-stats.tsx` (verify — likely fine)
- Modify: `src/components/tree/tree-node.tsx` (verify — uses theme tokens)
- Modify: `src/app/[locale]/page.tsx` (landing page preview section — check dark: variants)

**Interfaces:**
- Produces: Consistent dark mode appearance across all new components

- [ ] **Step 1:** Visually verify in dark mode (browser or screenshot) — run `pnpm dev` and check:
  - Dashboard hero-stats cards (gradient cards should look same in both modes — self-contained colors)
  - Tree view node hover states, badges, icons
  - Landing page preview images (screen-dark.png, screen-mobile-dark.png exist)
- [ ] **Step 2:** If landing page preview section uses `<Image>` — add dark: variant:
  ```tsx
  <Image src="/screen.png" className="block dark:hidden" ... />
  <Image src="/screen-dark.png" className="hidden dark:block" ... />
  ```
- [ ] **Step 3:** Verify tree-view empty state and loading skeleton render correctly in dark mode
- [ ] **Step 4:** Run: `pnpm lint && npx tsc --noEmit && pnpm build`
- [ ] **Step 5:** Commit: `fix(dark-mode): ensure new components render correctly in dark mode`

---

### Task 3: Error Boundaries

**Files:**
- Create: `src/components/ui/error-boundary.tsx` (reusable component)
- Create: `src/app/[locale]/error.tsx` (route-segment error boundary)
- Create: `src/app/[locale]/dashboard/error.tsx` (dashboard-specific boundary)
- Modify: `src/app/[locale]/layout.tsx` (wrap providers with global boundary)

**Interfaces:**
- Produces: Reusable ErrorBoundary + route-segment error.tsx files
- Consumes: Next.js App Router error boundary convention

- [ ] **Step 1:** Create `src/components/ui/error-boundary.tsx`:
  - React class component with `componentDidCatch` + `getDerivedStateFromError`
  - Renders card with error icon, "Something went wrong" message, retry button
  - Accepts optional `fallback` prop for custom rendering
  - Shows error details in development mode
- [ ] **Step 2:** Create `src/app/[locale]/error.tsx`:
  - Client component (`"use client"`)
  - Uses the reusable ErrorBoundary
  - Includes i18n strings for all 9 locales
- [ ] **Step 3:** Create `src/app/[locale]/dashboard/error.tsx`:
  - Client component
  - Dashboard-specific fallback with "Retry" button that calls `reset()`
  - More helpful message about data loading
- [ ] **Step 4:** Add i18n keys to all 9 locale files:
  - `errors.title`: "Something went wrong"
  - `errors.description`: "An unexpected error occurred. Please try again."
  - `errors.retry`: "Try Again"
  - `errors.dashboardError`: "Failed to load dashboard data"
- [ ] **Step 5:** Verify: `npx tsc --noEmit && pnpm lint && pnpm build`
- [ ] **Step 6:** Commit: `feat(error-handling): add error boundaries to route segments`

---

## Task Dependencies

```
Task 1 (Keyboard navigation) — independent
Task 2 (Dark mode audit) — independent
Task 3 (Error boundaries) — independent
```

All three tasks are independent and can run in parallel.
