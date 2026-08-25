# Final Cleanups Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve all remaining stale TODOs, fix documentation, and clean up orphaned code.

**Architecture:** Small, targeted fixes across 4 files. No new features, no new components.

**Tech Stack:** Tailwind v4 (CSS classes only), README markdown.

**Spec:** Audit findings from comprehensive project review.

## Global Constraints

- Package manager: pnpm only
- Verification after every task: `pnpm lint` (0 errors) + `npx tsc --noEmit` + `pnpm build`

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/app/[locale]/page.tsx` | MODIFY | Unhide landing page preview section |
| `src/components/twig/import-export.tsx` | MODIFY | Remove stale TODO comment |
| `src/components/twig/month-grid-view.tsx` | MODIFY | Remove empty className |
| `README.md` | MODIFY | Fix npm → pnpm, add Convex dev step |

---

## Tasks

### Task 1: Landing Page Preview + Import/Export + Empty ClassName

**Files:**
- Modify: `src/app/[locale]/page.tsx`
- Modify: `src/components/twig/import-export.tsx`
- Modify: `src/components/twig/month-grid-view.tsx`

- [ ] **Step 1:** In `src/app/[locale]/page.tsx`:
  - Find the hidden preview section (around line 128-133)
  - Remove the `hidden` class from the wrapper div
  - Add `grid` class if not present (for CSS grid to work with grid-cols)
  - Verify the 4 image assets exist in `public/` (screen.png, screen-dark.png, screen-mobile.png, screen-mobile-dark.png). If any are missing, leave the section hidden and note which assets are missing.
  - Remove the TODO comment

- [ ] **Step 2:** In `src/components/twig/import-export.tsx`:
  - Find the TODO comment at line 55 ("remove or add md:hidden back one day")
  - Remove the TODO comment entirely — the button should stay visible on all screen sizes (no separate desktop toolbar duplicates it)

- [ ] **Step 3:** In `src/components/twig/month-grid-view.tsx`:
  - Find the empty `className=""` at line 108-109
  - Remove the `className` attribute entirely (empty string is a no-op)

- [ ] **Step 4:** Verify: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`

- [ ] **Step 5:** Commit: `chore: resolve stale TODOs in landing page, import-export, and month-grid`

---

### Task 2: README Fix

**Files:**
- Modify: `README.md`

- [ ] **Step 1:** Read README.md

- [ ] **Step 2:** Make these changes:
  - Line 42: Change `npm install` → `pnpm install`
  - Line 48: Change `npm run dev` → `pnpm dev`
  - After the dev command, add a note: `# In a second terminal, run: npx convex dev`
  - Optionally add a note about `.env.local` setup from `.env.example`

- [ ] **Step 3:** Verify: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3` (no code changes, just docs)

- [ ] **Step 4:** Commit: `docs: fix npm to pnpm in README and add Convex dev step`

---

## Task Dependencies

Both tasks are independent and can run in parallel.
