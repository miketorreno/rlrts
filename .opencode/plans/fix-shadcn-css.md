# Fix shadcn/ui CSS Variables + Design System

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore shadcn/ui CSS variables, establish a distinctive visual identity, and install all missing components needed for the redesign.

**Architecture:** All CSS variables are commented out in `src/app/globals.css`. Every shadcn/ui component references semantic tokens that resolve to nothing. The fix: define a complete, nature-inspired theme using OKLCH colors, register with Tailwind v4's `@theme inline` block, and install missing components.

**Tech Stack:** Tailwind CSS v4, shadcn/ui v4, OKLCH color format, next-themes.

**Root Cause:** `src/app/globals.css` has only `@import "tailwindcss"` with all theme variables commented out.

**Design Direction (from frontend-design skill):** The app uses tree anatomy vocabulary (trunks, limbs, branches, twigs, leaves). The visual identity should echo this — organic, grounded, with growth as the central metaphor. NOT the generic AI defaults (cream+serif, black+acid-green, newspaper-column).

---

## Design Tokens

### Color Palette — "Canopy"

A nature-inspired palette that feels grounded and alive, not literal or childish:

| Token | Light | Dark | Role |
|-------|-------|------|------|
| `background` | `oklch(0.985 0.002 240)` (near-white, cool) | `oklch(0.145 0.005 260)` (deep charcoal) | Page surface |
| `foreground` | `oklch(0.145 0.01 260)` (near-black) | `oklch(0.93 0.005 240)` (soft white) | Primary text |
| `card` | `oklch(1 0 0)` (pure white) | `oklch(0.18 0.006 260)` (dark card) | Card surfaces |
| `card-foreground` | `oklch(0.145 0.01 260)` | `oklch(0.93 0.005 240)` | Card text |
| `primary` | `oklch(0.45 0.15 155)` (deep forest green) | `oklch(0.65 0.18 155)` (bright forest) | Primary actions |
| `primary-foreground` | `oklch(0.99 0 0)` (white) | `oklch(0.13 0.02 155)` (dark on bright) | Text on primary |
| `secondary` | `oklch(0.94 0.01 120)` (warm sage) | `oklch(0.22 0.015 155)` (dark sage) | Secondary actions |
| `secondary-foreground` | `oklch(0.25 0.02 155)` | `oklch(0.9 0.01 120)` | Text on secondary |
| `muted` | `oklch(0.95 0.005 240)` (cool gray) | `oklch(0.22 0.008 260)` (dark gray) | Muted backgrounds |
| `muted-foreground` | `oklch(0.52 0.01 260)` | `oklch(0.6 0.008 240)` | Muted text |
| `accent` | `oklch(0.92 0.02 85)` (warm amber) | `oklch(0.25 0.03 85)` (dark amber) | Hover/accent states |
| `accent-foreground` | `oklch(0.25 0.05 85)` | `oklch(0.92 0.02 85)` | Text on accent |
| `destructive` | `oklch(0.55 0.2 25)` (red) | `oklch(0.65 0.22 25)` (bright red) | Destructive actions |
| `destructive-foreground` | `oklch(0.99 0 0)` | `oklch(0.15 0.02 25)` | Text on destructive |
| `border` | `oklch(0.88 0.006 240)` | `oklch(0.3 0.008 260)` | Borders |
| `input` | `oklch(0.88 0.006 240)` | `oklch(0.3 0.008 260)` | Input borders |
| `ring` | `oklch(0.45 0.15 155)` (matches primary) | `oklch(0.65 0.18 155)` | Focus rings |
| `popover` | `oklch(1 0 0)` | `oklch(0.18 0.006 260)` | Popover surfaces |
| `popover-foreground` | `oklch(0.145 0.01 260)` | `oklch(0.93 0.005 240)` | Popover text |
| `chart-1` | `oklch(0.45 0.15 155)` (forest) | `oklch(0.65 0.18 155)` | Chart primary |
| `chart-2` | `oklch(0.65 0.15 85)` (amber) | `oklch(0.75 0.15 85)` | Chart secondary |
| `chart-3` | `oklch(0.55 0.12 200)` (teal) | `oklch(0.7 0.12 200)` | Chart tertiary |
| `chart-4` | `oklch(0.6 0.1 300)` (mauve) | `oklch(0.72 0.1 300)` | Chart quaternary |
| `chart-5` | `oklch(0.5 0.12 50)` (terracotta) | `oklch(0.68 0.12 50)` | Chart quinary |
| `sidebar` | `oklch(0.97 0.003 155)` (faint sage) | `oklch(0.16 0.008 260)` (dark sidebar) | Sidebar background |
| `sidebar-foreground` | `oklch(0.145 0.01 260)` | `oklch(0.93 0.005 240)` | Sidebar text |
| `sidebar-primary` | `oklch(0.45 0.15 155)` | `oklch(0.65 0.18 155)` | Sidebar active item |
| `sidebar-accent` | `oklch(0.92 0.02 85)` | `oklch(0.25 0.03 85)` | Sidebar hover |
| `radius` | `0.625rem` (10px) | — | Border radius base |

### Typography

- **Display:** System font stack (Inter/Geist via CSS variables) — clean, modern, not distracting
- **Body:** Same stack at normal weight — consistency over contrast
- **Monospace:** Geist Mono for data/numbers

### Signature Element

The tree hierarchy visualization (trunks → limbs → branches → twigs → leaves) is the product's signature. The design should make this hierarchy feel alive — not a static list, but a growing structure. The TreeView component with framer-motion animations is already the most distinctive UI element; the redesign should elevate it.

---

## Tasks

### Task 1: Restore CSS Variables in globals.css

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: Complete shadcn/ui CSS variable definitions for light and dark mode using the "Canopy" palette
- All existing shadcn/ui components will immediately render correctly

- [ ] **Step 1:** Read current `src/app/globals.css`
- [ ] **Step 2:** Replace the entire file with:
  - `:root` block with all light mode variables (OKLCH format per design tokens above)
  - `.dark` block with all dark mode variables
  - `@theme inline` block mapping each `--color-*` to `var(--*)`
  - Preserve existing Google Fonts CSS variables (`--font-geist-sans`, `--font-geist-mono`)
  - Add `--radius` variable
- [ ] **Step 3:** Run `pnpm build 2>&1 | grep -E "Compiled|error" | head -5`
- [ ] **Step 4:** Commit: `fix(css): restore shadcn/ui CSS variables with Canopy design system`

---

### Task 2: Install Missing shadcn/ui Components

**Files:**
- Create: `src/components/ui/checkbox.tsx`
- Create: `src/components/ui/badge.tsx`
- Create: `src/components/ui/progress.tsx`
- Create: `src/components/ui/separator.tsx`
- Create: `src/components/ui/scroll-area.tsx`
- Create: `src/components/ui/sheet.tsx`
- Create: `src/components/ui/sidebar.tsx`
- Create: `src/components/ui/spinner.tsx`
- Create: `src/components/ui/empty.tsx`
- Create: `src/components/ui/field.tsx`

**Interfaces:**
- Produces: All shadcn/ui components needed for the redesign

- [ ] **Step 1:** Install all missing components:
  ```bash
  npx shadcn@latest add checkbox badge progress separator scroll-area sheet sidebar spinner empty field
  ```
- [ ] **Step 2:** Verify each component was added correctly
- [ ] **Step 3:** Run `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
- [ ] **Step 4:** Commit: `feat(ui): install missing shadcn/ui components`

---

### Task 3: Update Existing shadcn/ui Components

**Files:**
- Modify: `src/components/ui/toast.tsx` (uses old forwardRef pattern)

**Interfaces:**
- Produces: All shadcn/ui components use modern patterns

- [ ] **Step 1:** Read existing shadcn/ui components in `src/components/ui/`
- [ ] **Step 2:** Check for old patterns (forwardRef, React.ComponentPropsWithoutRef, missing data-slot)
- [ ] **Step 3:** If toast.tsx needs updating, use `npx shadcn@latest add toast --diff` to see upstream changes, then smart-merge
- [ ] **Step 4:** Run `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
- [ ] **Step 5:** Commit: `chore(ui): update shadcn/ui components to modern patterns`

---

## Task Dependencies

```
Task 1 (CSS variables) — independent, do first
Task 2 (Install components) — independent
Task 3 (Update components) — independent
```
