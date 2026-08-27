# Task 6: Redesign Public Pages — Landing, About, Pricing

## Goal

Redesign the three public-facing pages (landing, about, pricing) to use the Canopy design system with shadcn/ui components, animated tree hierarchy visualization, proper RTL support, and polished layout.

## Files to Modify

- `src/app/[locale]/page.tsx` — Landing page hero + features
- `src/app/[locale]/about/page.tsx` — About page team/tech sections
- `src/app/[locale]/pricing/page.tsx` — Pricing tiers + feature comparison

## Requirements

1. **Landing page**: Hero with animated tree hierarchy (Trunks → Limbs → Branches → Twigs → Leaves) using framer-motion, feature cards via shadcn Card, CTA via shadcn Button
2. **About page**: Team/tech sections using shadcn Card + Avatar, tech stack using shadcn Badge
3. **Pricing page**: Pricing tiers using shadcn Card, feature comparison using shadcn Badge, Separator between pricing and features
4. **RTL**: Fix manual `isRTL` checks to use Tailwind `rtl:` modifier (layout already applies `rtl` class to body)
5. **No regressions**: `tsc --noEmit` and `pnpm lint` must pass

## Verification

- `npx tsc --noEmit` — 0 errors
- `pnpm lint` — 0 errors, ~25 warnings (pre-existing)
