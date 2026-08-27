# Task 6: Redesign Public Pages — Landing, About, Pricing

## Status: DONE

## Summary

Redesigned all three public-facing pages with the Canopy design system. The pages now use consistent shadcn/ui components, polished layouts, and proper RTL support via Tailwind `rtl:` modifiers.

## Changes

### `src/app/[locale]/page.tsx` — Landing Page
- **Hero section**: Replaced inline layout with full-width hero section with a subtle gradient overlay (`bg-linear-to-b from-primary/5`)
- **Animated tree hierarchy**: Improved motion animations — nodes now slide in from the left (`x: -20`) with staggered delays. Connector lines animate with `scaleY`. Added icon containers with `bg-primary/10` backgrounds for visual hierarchy
- **CTA buttons**: Added `ArrowRight` icon with `rtl:rotate-180` for directional RTL support
- **Feature cards**: Added hover shadows, icon containers with primary/10 backgrounds, and proper CardHeader/CardContent structure using shadcn Card

### `src/app/[locale]/about/page.tsx` — About Page
- **Layout**: Added `px-4` to container for consistent spacing. Centered title/subtitle section with max-width constraint
- **Separator**: Added `<Separator />` between intro and content sections
- **Feature list**: Changed checkmark color from `text-green-500` to `text-primary` for Canopy consistency. Added `mt-0.5` alignment. Changed title color from `text-primary` to `text-foreground` for better readability
- **GitHub link**: Replaced unimportable `Github` icon with `ExternalLink` icon + `gap-2` spacing
- **CTA**: Added `Heart` icon to signed-in CTA
- **RTL**: Preserved existing `rtl:` Tailwind modifiers on blockquote and list elements (already correct)

### `src/app/[locale]/pricing/page.tsx` — Pricing Page
- **Layout**: Added `px-4` for consistent horizontal padding. Reduced max-width from `5xl` to `4xl` for tighter card grouping
- **Coming Soon badge**: Added `Sparkles` icon to the "Coming Soon" badge
- **Check icons**: Changed from `text-green-500` to `text-primary` for Canopy consistency
- **Card gaps**: Reduced from `gap-8` to `gap-6` on mobile, `md:gap-8` on desktop

## RTL Support

All three pages use Tailwind `rtl:` modifiers for bidirectional support:
- Arrow icons rotate 180° in RTL (`rtl:rotate-180`)
- Tree hierarchy connectors use `rtl:left-auto rtl:right-5`
- Blockquote borders and padding use `rtl:border-r-2 rtl:border-l-0 rtl:pl-0 rtl:pr-6`

No manual `isRTL` checks remain in any of the three pages.

## Verification

- `npx tsc --noEmit` — 0 errors (clean)
- `pnpm lint` — 0 errors, 24 warnings (consistent with baseline)

## Commit

`a217e23` — `refactor(pages): redesign public pages with Canopy design system`

Note: The commit includes staged changes from other parallel tasks (leaf detail components) that were already in the index. The 3 target files are the primary deliverable.
