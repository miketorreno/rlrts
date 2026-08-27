# Redesign App with shadcn/ui — Beautiful UI

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign all pages (except twig/twigs) with a distinctive, beautiful UI using shadcn/ui. Replace custom layout components with shadcn Sidebar, standardize forms, fix inline patterns, and create a cohesive visual identity rooted in the product's tree anatomy metaphor.

**Architecture:** The app already uses shadcn/ui extensively. This plan replaces remaining custom components, standardizes patterns, and elevates the visual design from functional to beautiful.

**Tech Stack:** shadcn/ui v4, Tailwind CSS v4, framer-motion (preserved), lucide-react icons.

**Exclusions:** `src/app/[locale]/twig/` and `src/app/[locale]/twigs/` are NOT touched.

**Design Principles (from frontend-design skill):**
- **Ground it in the subject:** The tree hierarchy (trunks → limbs → branches → twigs → leaves) is the product's soul. Make it feel alive.
- **Typography carries personality:** Clean, modern system fonts with deliberate weight/spacing choices.
- **Structure is information:** The hierarchy numbering and nesting should encode the relationship, not decorate it.
- **Leverage motion deliberately:** framer-motion animations should serve the tree metaphor — growth, expansion, organic movement.
- **Spend boldness in one place:** The tree visualization is the signature element. Everything around it should be quiet and disciplined.

---

## Tasks

### Task 1: Replace Custom Sidebar with shadcn Sidebar

**Files:**
- Modify: `src/components/layout/app-sidebar.tsx`
- Modify: `src/components/sidebar-provider.tsx`
- Modify: `src/components/root-wrapper.tsx`

**Interfaces:**
- Produces: shadcn Sidebar component replacing custom sidebar implementation

- [ ] **Step 1:** Read current sidebar components
- [ ] **Step 2:** Read shadcn Sidebar docs: `npx shadcn@latest docs sidebar`
- [ ] **Step 3:** Rewrite `app-sidebar.tsx` using shadcn Sidebar API:
  - `SidebarProvider` for state (replaces custom `SidebarContext`)
  - `Sidebar` with `collapsible="icon"` for collapse mode
  - `SidebarHeader` for logo/brand (XIcon)
  - `SidebarContent` with `SidebarGroup`/`SidebarMenu` for nav items
  - `SidebarFooter` for XP badge and user info
  - Preserve localStorage persistence for collapse state
  - Use Canopy design tokens (faint sage sidebar background)
- [ ] **Step 4:** Update `root-wrapper.tsx` to use shadcn `SidebarProvider`
- [ ] **Step 5:** Run `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
- [ ] **Step 6:** Commit: `refactor(layout): replace custom sidebar with shadcn Sidebar`

---

### Task 2: Standardize Forms with FieldGroup/Field Pattern

**Files:**
- Modify: `src/components/trunk/trunk-dialogs.tsx`
- Modify: `src/components/limb/limb-dialogs.tsx`
- Modify: `src/components/branch/branch-dialogs.tsx`
- Modify: `src/components/todo/todo-dialogs.tsx`
- Modify: `src/components/leaf/details/leaf-edit-form.tsx`
- Modify: `src/components/onboarding/step-create-*.tsx` (5 files)

**Interfaces:**
- Produces: All forms use shadcn FieldGroup/Field pattern

**shadcn Rules Applied:**
- Forms use `FieldGroup` + `Field`. Never raw `div` with `space-y-*` for form layout.
- Field validation uses `data-invalid` + `aria-invalid`.

- [ ] **Step 1:** Read shadcn forms docs: `npx shadcn@latest docs field`
- [ ] **Step 2:** Update each dialog/form to use FieldGroup/Field pattern
- [ ] **Step 3:** Replace raw `<input type="checkbox">` in todo-item.tsx with shadcn Checkbox
- [ ] **Step 4:** Run `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
- [ ] **Step 5:** Commit: `refactor(forms): standardize with shadcn FieldGroup/Field pattern`

---

### Task 3: Redesign Dashboard — The Growth Overview

**Files:**
- Modify: `src/app/[locale]/dashboard/page.tsx`
- Modify: `src/components/dashboard/hero-stats.tsx`
- Modify: `src/components/dashboard/entity-counts.tsx`
- Modify: `src/components/dashboard/completion-charts.tsx`
- Modify: `src/components/dashboard/activity-feed.tsx`

**Design Direction:**
The dashboard is the "growth overview" — a bird's-eye view of the user's habit ecosystem. The hero stats should feel like a living dashboard, not a spreadsheet. Use the Canopy palette: forest green for primary actions, amber for accents, muted sage for secondary elements.

**shadcn Rules Applied:**
- Use full Card composition: `CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter`
- Use `Badge` for status indicators
- Use `Progress` for progress bars
- Use `Separator` for dividers
- Use semantic colors, never raw `bg-green-500`

- [ ] **Step 1:** Read all dashboard components
- [ ] **Step 2:** Redesign `hero-stats.tsx`:
  - Replace gradient cards with shadcn Card + Badge
  - Use Canopy palette: `bg-primary` for main stat, `bg-accent` for secondary
  - Use shadcn Progress for XP progress bar
  - Add subtle hover states with `hover:shadow-md` transition
- [ ] **Step 3:** Redesign `entity-counts.tsx`:
  - Use shadcn Badge for count indicators
  - Use shadcn Card for each entity type
  - Add icon + label + count pattern
- [ ] **Step 4:** Redesign `completion-charts.tsx`:
  - Wrap charts in shadcn Card with CardHeader/CardTitle
  - Use Canopy chart colors (forest, amber, teal, mauve, terracotta)
- [ ] **Step 5:** Redesign `activity-feed.tsx`:
  - Use shadcn Card + Separator for feed items
  - Use shadcn Badge for event types
  - Add relative time display
- [ ] **Step 6:** Run `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
- [ ] **Step 7:** Commit: `refactor(dashboard): redesign with Canopy design system`

---

### Task 4: Redesign CRUD Pages — The Habit Hierarchy

**Files:**
- Modify: `src/components/trunk/trunk-item.tsx`
- Modify: `src/components/trunk/trunk-list.tsx`
- Modify: `src/components/limb/limb-item.tsx`
- Modify: `src/components/limb/limb-list.tsx`
- Modify: `src/components/branch/branch-item.tsx`
- Modify: `src/components/branch/branch-list.tsx`
- Modify: `src/components/todo/todo-item.tsx`
- Modify: `src/components/todo/todo-list.tsx`

**Design Direction:**
The CRUD pages represent the habit hierarchy — trunks are the foundations, limbs are categories, branches are schedules, leaves are habits. Each level should feel progressively more detailed and alive. Use consistent card patterns with subtle visual differentiation per level.

**shadcn Rules Applied:**
- Use `Empty` component for empty states (not custom markup)
- Use `Badge` for status indicators
- Use `Separator` for dividers
- Use `DropdownMenu` for actions (not inline buttons)
- Use `Skeleton` for loading (not custom animate-pulse divs)
- Items always inside their Group

- [ ] **Step 1:** Read all item and list components
- [ ] **Step 2:** Standardize item components:
  - Use shadcn Card with CardHeader/CardContent/CardFooter
  - Use shadcn Badge for status (active/inactive, cadence labels)
  - Use shadcn DropdownMenu for actions (edit, delete, reorder)
  - Add subtle left border color per level (trunks: forest, limbs: amber, branches: teal)
- [ ] **Step 3:** Standardize list components:
  - Use shadcn Empty for empty states
  - Use shadcn Skeleton for loading
  - Use consistent spacing with `gap-*` (not `space-y-*`)
- [ ] **Step 4:** Fix `authentication-wrapper.tsx` inline button → shadcn Button
- [ ] **Step 5:** Run `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
- [ ] **Step 6:** Commit: `refactor(crud): redesign hierarchy pages with Canopy design system`

---

### Task 5: Redesign Leaf Details — The Habit Deep Dive

**Files:**
- Modify: `src/components/leaf/leaf-details.tsx`
- Modify: `src/components/leaf/details/leaf-edit-form.tsx`
- Modify: `src/components/leaf/details/leaf-statistics.tsx`
- Modify: `src/components/leaf/details/leaf-analytics.tsx`
- Modify: `src/components/leaf/details/leaf-delete-dialog.tsx`

**Design Direction:**
The leaf detail page is the "habit deep dive" — the most information-dense page. It should feel like a personal habit dashboard, with clear sections for editing, statistics, and analytics. Use the Canopy palette to create visual hierarchy between sections.

- [ ] **Step 1:** Read all leaf detail components
- [ ] **Step 2:** Redesign `leaf-edit-form.tsx`:
  - Use FieldGroup/Field for form layout
  - Use shadcn Switch for toggle fields (active, reminders)
  - Use shadcn Select for dropdowns
- [ ] **Step 3:** Redesign `leaf-statistics.tsx`:
  - Use shadcn Card + Badge for stats
  - Use shadcn Progress for progress bars
  - Fix hardcoded `w-[800px]` → responsive width
- [ ] **Step 4:** Redesign `leaf-analytics.tsx`:
  - Wrap charts in shadcn Card
  - Fix `window.innerWidth` → CSS responsive classes
  - Use Canopy chart colors
- [ ] **Step 5:** Run `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
- [ ] **Step 6:** Commit: `refactor(leaf): redesign leaf details with Canopy design system`

---

### Task 6: Redesign Public Pages — Landing, About, Pricing

**Files:**
- Modify: `src/app/[locale]/page.tsx` (landing)
- Modify: `src/app/[locale]/about/page.tsx`
- Modify: `src/app/[locale]/pricing/page.tsx`

**Design Direction:**
The public pages are the "first impression" — they should feel polished, confident, and distinctive. The landing page should open with the product's core value proposition (habit tracking through the tree metaphor). Use the Canopy palette to create a cohesive brand experience.

**Frontend-Design Principles Applied:**
- **Hero is a thesis:** Open with the most characteristic thing — the tree hierarchy
- **Typography carries personality:** Deliberate type scale with weights/spacing
- **Structure is information:** Numbered steps should encode the hierarchy
- **Leverage motion deliberately:** Page-load sequence, scroll-triggered reveals

- [ ] **Step 1:** Read all three pages
- [ ] **Step 2:** Redesign landing page:
  - Hero section with tree hierarchy visualization (animated)
  - Feature cards using shadcn Card
  - CTA using shadcn Button
  - Fix RTL styling to use `rtl:` Tailwind modifier
- [ ] **Step 3:** Redesign about page:
  - Team/tech sections using shadcn Card + Avatar
  - Tech stack using shadcn Badge
- [ ] **Step 4:** Redesign pricing page:
  - Pricing tiers using shadcn Card
  - Feature comparison using shadcn Badge
  - Separator between tiers
- [ ] **Step 5:** Run `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
- [ ] **Step 6:** Commit: `refactor(pages): redesign public pages with Canopy design system`

---

### Task 7: Fix Inline Styled Patterns

**Files:**
- Modify: `src/components/authentication-wrapper.tsx` (inline button)
- Modify: `src/components/leaf/details/leaf-statistics.tsx` (hardcoded width)
- Modify: `src/components/leaf/details/leaf-analytics.tsx` (window.innerWidth)
- Various files with hardcoded color classes

**shadcn Rules Applied:**
- Use semantic colors (`bg-primary`, `text-muted-foreground`), never raw values (`bg-blue-500`)
- Use `cn()` for conditional classes
- No manual `z-index` on overlay components

- [ ] **Step 1:** Search for hardcoded color classes across the codebase
- [ ] **Step 2:** Replace with shadcn Badge variants or semantic tokens
- [ ] **Step 3:** Fix `authentication-wrapper.tsx` inline button → shadcn Button
- [ ] **Step 4:** Fix `leaf-statistics.tsx` hardcoded width → responsive
- [ ] **Step 5:** Fix `leaf-analytics.tsx` `window.innerWidth` → CSS responsive
- [ ] **Step 6:** Run `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
- [ ] **Step 7:** Commit: `fix(ui): replace inline styled patterns with shadcn conventions`

---

## Task Dependencies

```
Task 1 (Sidebar) — independent
Task 2 (Forms) — independent
Task 3 (Dashboard) — independent
Task 4 (CRUD pages) — independent
Task 5 (Leaf details) — independent
Task 6 (Public pages) — independent
Task 7 (Inline fixes) — independent
```

All tasks are independent and can run in parallel.
