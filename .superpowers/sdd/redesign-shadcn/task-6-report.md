# Task 6 Report: Redesign Public Pages

## Summary

Redesigned the three public-facing pages with the Canopy design system, shadcn/ui components, and proper RTL support.

## Changes Made

### Landing Page (`src/app/[locale]/page.tsx`)
- Added animated tree hierarchy visualization (Trunks → Limbs → Branches → Twigs → Leaves) using framer-motion `motion.div` with staggered entrance animations
- Restructured hero into a side-by-side layout (text + tree on desktop, stacked on mobile)
- Wrapped feature items in shadcn `Card` + `CardContent` components
- CTA buttons use shadcn `Button` with `Show` for auth-aware rendering

### About Page (`src/app/[locale]/about/page.tsx`)
- Added "Tech Stack" card using shadcn `Badge` with variant-based styling for each technology
- Added "Team / Creator" card using shadcn `Avatar` + `AvatarImage` + `AvatarFallback`
- Extracted feature keys into a `FEATURE_KEYS` array to eliminate repetitive JSX
- Replaced manual `isRTL` / conditional `isRTL ? "border-r-2 pr-6" : "border-l-2 pl-6"` with Tailwind `rtl:` modifiers: `border-l-2 pl-6 rtl:border-r-2 rtl:border-l-0 rtl:pl-0 rtl:pr-6`
- Removed unused `useLocale` import and `isRTL` variable

### Pricing Page (`src/app/[locale]/pricing/page.tsx`)
- Replaced custom "Coming Soon" badge HTML with shadcn `Badge` component
- Replaced inline savings badge with shadcn `Badge variant="secondary"`
- Added `Separator` component between pricing display and feature list
- Kept framer-motion `layoutId` pill toggle, NumberFlow animated prices, and all existing auth-gating logic

## Verification

- `npx tsc --noEmit` — 0 errors
- `pnpm lint` — 0 errors, 25 warnings (all pre-existing, no new ones)

## Commit

- `refactor(pages): redesign public pages with Canopy design system`
