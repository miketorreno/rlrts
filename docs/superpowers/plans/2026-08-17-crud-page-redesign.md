# CRUD Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Trunks, Limbs, Branches, and Todos pages visually consistent with a shared page template, card design, and empty/skeleton states.

**Architecture:** Update each page's list and item components to follow a shared visual pattern. No new components are created — we modify existing ones in place. The Twig (calendar) page is excluded.

**Tech Stack:** Next.js 16 App Router, React, Tailwind CSS v4, shadcn/ui, lucide-react icons, next-intl (9 locales), Convex (backend), pnpm

**Spec:** Design spec approved in chat — consistent header bar, icon buttons, same card style, consistent empty states across all four CRUD pages.

## Global Constraints

- Package manager: pnpm only
- Navigation: `Link`/`useRouter`/`usePathname` from `@/i18n/routing` ONLY — never `next/link` or `next/router`
- Every new UI string in ALL 9 locale files `src/messages/{en,de,es,fr,ru,he,ar,hi,zh}.json` with identical key structure
- RTL-safe markup for he/ar (logical properties, no hardcoded left/right)
- No comments unless explicitly needed
- No new lint warnings (baseline: ~26 warnings)
- Verification per task: `pnpm lint` (0 errors), `npx tsc --noEmit`, `pnpm build`
- Do NOT commit untracked `PROMPT.md`

---

### Task 1: Trunk Page Redesign (establishes the pattern)

**Files:**
- Modify: `src/components/trunk/trunk-item.tsx`
- Modify: `src/components/trunk/trunk-list.tsx`

**Interfaces:**
- Consumes: `api.trunks.*` (existing), `Doc<"trunks">` type
- Produces: visual pattern that Tasks 2-4 replicate

- [ ] **Step 1: Update trunk-item.tsx — new card layout**

Replace the current card with:
```tsx
<Card className="rounded-xl border p-3 shadow-sm transition-colors hover:bg-muted/50">
  <div className="flex items-center justify-between gap-3">
    <div className="min-w-0 flex-1">
      <h2 className="text-base font-medium truncate">{trunk.name}</h2>
      <p className="text-sm text-muted-foreground">
        {t("limbCount", { count: trunk._count?.limbs ?? 0 })}
      </p>
    </div>
    <div className="flex shrink-0 items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onEdit}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  </div>
</Card>
```

- [ ] **Step 2: Run tsc + lint to verify no errors**

Run: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3`
Expected: 0 errors, ~26 warnings

- [ ] **Step 3: Update trunk-list.tsx — header, skeleton, empty state**

Add page header at the top of the list content:
```tsx
<div className="mb-6 flex items-center justify-between gap-4">
  <div className="flex items-center gap-2">
    <h1 className="text-lg font-semibold">{t("title")}</h1>
    <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
      {sortedTrunks.length}
    </span>
  </div>
  <Button onClick={() => setNewOpen(true)}>
    <PlusCircle className="h-4 w-4" />
    {t("addTrunk")}
  </Button>
</div>
```

Update skeleton to match new card:
```tsx
<div className="flex flex-col gap-3">
  {[1, 2, 3].map((i) => (
    <Card key={i} className="rounded-xl border p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex gap-1">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    </Card>
  ))}
</div>
```

Update empty state:
```tsx
<div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16">
  <p className="text-sm text-muted-foreground">{t("emptyState")}</p>
  <Button variant="outline" onClick={() => setNewOpen(true)}>
    <PlusCircle className="h-4 w-4" />
    {t("addTrunk")}
  </Button>
</div>
```

Update items list gap from `gap-4` to `gap-3`.

Remove the `py-16` centered add button at the bottom (it's now in the header).

- [ ] **Step 4: Verify tsc + lint + build**

Run: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3 && pnpm build 2>&1 | grep -E "Compiled|error" | head -5`
Expected: clean, 0 errors, build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/components/trunk/
git commit -m "refactor: redesign trunk page with consistent card layout"
```

---

### Task 2: Limb Page Redesign (follows Task 1 pattern)

**Files:**
- Modify: `src/components/limb/limb-item.tsx`
- Modify: `src/components/limb/limb-list.tsx`

**Interfaces:**
- Consumes: same pattern as Task 1, plus trunk selector
- Produces: visual pattern for hierarchy pages

- [ ] **Step 1: Update limb-item.tsx — mirror trunk-item card layout**

Same card structure as trunk-item: `rounded-xl border p-3 shadow-sm hover:bg-muted/50`, icon buttons (Pencil + Trash2 in ghost variant), `text-base font-medium` name, `text-sm text-muted-foreground` subtitle ("{n} branches").

- [ ] **Step 2: Update limb-list.tsx — header, skeleton, empty state**

Same header pattern as trunk-list: title + count badge + add button. Same skeleton. Same dashed-border empty state. Keep the trunk selector dropdown (Label + SelectTrigger) above the header, with `mb-4`.

- [ ] **Step 3: Verify tsc + lint + build**

Run: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3 && pnpm build 2>&1 | grep -E "Compiled|error" | head -5`

- [ ] **Step 4: Commit**

```bash
git add src/components/limb/
git commit -m "refactor: redesign limb page with consistent card layout"
```

---

### Task 3: Branch Page Redesign (follows Task 1 pattern)

**Files:**
- Modify: `src/components/branch/branch-item.tsx`
- Modify: `src/components/branch/branch-list.tsx`

**Interfaces:**
- Consumes: same pattern as Task 1, plus limb selector, BranchTwigs sub-component
- Produces: visual pattern for branches (most complex card)

- [ ] **Step 1: Update branch-item.tsx — card layout with BranchTwigs**

Same base card as trunk-item (rounded-xl, icon buttons, subtitle). Keep the BranchTwigs sub-section below the header row, separated by `border-t pt-3 mt-3`. BranchTwigs items stay as-is (button rows with colored dot).

- [ ] **Step 2: Update branch-list.tsx — header, skeleton, empty state**

Same header/skeleton/empty pattern. Keep limb selector dropdown above header.

- [ ] **Step 3: Verify tsc + lint + build**

Run: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3 && pnpm build 2>&1 | grep -E "Compiled|error" | head -5`

- [ ] **Step 4: Commit**

```bash
git add src/components/branch/
git commit -m "refactor: redesign branch page with consistent card layout"
```

---

### Task 4: Todo Page Redesign (align with Task 1 pattern)

**Files:**
- Modify: `src/components/todo/todo-item.tsx`
- Modify: `src/components/todo/todo-list.tsx`

**Interfaces:**
- Consumes: `api.todos.*` (existing), cadence grouping
- Produces: todo page aligned with others while keeping unique features

- [ ] **Step 1: Update todo-item.tsx — icon buttons, consistent card**

Keep existing features (cadence badge, XP badge, sub-task checkboxes, progress text) but align the card wrapper: `rounded-xl border p-3 shadow-sm hover:bg-muted/50`. Switch Edit/Delete from text buttons to ghost icon buttons (Pencil + Trash2) matching trunk-item.

- [ ] **Step 2: Update todo-list.tsx — header aligned, skeleton, empty state**

Update header to match the shared pattern: title (text-lg) + count badge + add button (top-right). Remove the inline XP badge from the header (XP is already shown in sidebar badge via XpBadge). Keep cadence grouping and collapsible sections. Update per-section empty state to use dashed border pattern. Update skeleton to match the shared pattern.

- [ ] **Step 3: Verify tsc + lint + build**

Run: `npx tsc --noEmit && pnpm lint 2>&1 | tail -3 && pnpm build 2>&1 | grep -E "Compiled|error" | head -5`

- [ ] **Step 4: Commit**

```bash
git add src/components/todo/
git commit -m "refactor: redesign todo page with consistent card layout"
```

---

### Task 5: Final Verification + i18n Check

**Files:**
- None (verification only)

- [ ] **Step 1: Run full verification suite**

```bash
npx tsc --noEmit && pnpm lint 2>&1 | tail -3 && pnpm build 2>&1 | grep -E "Compiled|error" | head -5
```
Expected: 0 lint errors, tsc clean, build succeeds

- [ ] **Step 2: Check i18n keys are consistent**

If any new strings were added (e.g., trunk limb count subtitle), verify they exist in all 9 locale files. Use a script to diff key sets:
```bash
for f in src/messages/*.json; do python3 -c "import json; print(sorted(json.load(open('$f')).keys()))" | md5sum; done | sort | head -9
```
All 9 should have identical top-level key structure.

- [ ] **Step 3: Commit any i18n fixes if needed**

```bash
git add src/messages/
git commit -m "fix: add missing i18n keys for CRUD page redesign"
```
