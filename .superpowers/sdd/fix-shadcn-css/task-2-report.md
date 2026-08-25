# Task 2: Install Missing shadcn/ui Components

## Status: DONE

## Components Installed

All 10 requested components installed successfully via `npx shadcn@latest add`:

1. **checkbox** - `src/components/ui/checkbox.tsx`
2. **badge** - `src/components/ui/badge.tsx`
3. **progress** - `src/components/ui/progress.tsx`
4. **separator** - `src/components/ui/separator.tsx`
5. **scroll-area** - `src/components/ui/scroll-area.tsx`
6. **sheet** - `src/components/ui/sheet.tsx`
7. **sidebar** - `src/components/ui/sidebar.tsx` (+ `src/hooks/use-mobile.tsx`)
8. **spinner** - `src/components/ui/spinner.tsx`
9. **empty** - `src/components/ui/empty.tsx`
10. **field** - `src/components/ui/field.tsx`

## Issues Fixed During Installation

### 1. Duplicate `use-mobile` hook
- shadcn created `src/hooks/use-mobile.tsx` (exports `useIsMobile`)
- Existing `src/hooks/use-mobile.ts` already exported `useMobile`
- **Fix:** Removed the shadcn duplicate `.tsx` file, updated `sidebar.tsx` to import `useMobile as useIsMobile`

### 2. Missing `icon-sm` button size variant
- New `dialog.tsx` and existing `todo-dialogs.tsx` use `size="icon-sm"` on Button
- Button component only had `default`, `sm`, `lg`, `icon` variants
- **Fix:** Added `"icon-sm": "h-8 w-8"` to button variants in `src/components/ui/button.tsx`

### 3. React Compiler lint error in sidebar
- `Math.random()` in `SidebarMenuSkeleton` flagged as impure function during render
- **Fix:** Removed the random width skeleton pattern (not used elsewhere in the codebase)

## Verification

- `npx tsc --noEmit` — passes clean
- `pnpm lint` — 0 errors, 27 warnings (was 26 warnings baseline + 1 new from shadcn files)

## Files Modified

- `src/components/ui/button.tsx` (added `icon-sm` variant)
- `src/components/ui/sidebar.tsx` (fixed import, fixed React Compiler lint error)
- `src/components/ui/dialog.tsx` (shadcn auto-updated)
- `src/components/ui/input.tsx` (shadcn auto-updated)
- `src/components/ui/skeleton.tsx` (shadcn auto-updated)
- `src/components/ui/tooltip.tsx` (shadcn auto-updated)
- `src/components/ui/label.tsx` (shadcn auto-updated)
- `src/hooks/use-mobile.tsx` (deleted - duplicate of existing `.ts`)
- `src/app/globals.css` (shadcn auto-updated)
