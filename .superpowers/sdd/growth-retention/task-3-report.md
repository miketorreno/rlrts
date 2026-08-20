# Task 3: Onboarding Flow — Implementation Report

## Status: DONE

## Summary
Implemented a 5-step first-run onboarding wizard for new users. When a new user visits `/trunks` with no trunks and no completed onboarding, they see a guided wizard that walks them through creating one entity at each level of the hierarchy: trunk → limb → branch → twig → leaf.

## Files Created
- `src/components/onboarding/onboarding-wizard.tsx` — Main wizard container with progress indicator and step routing
- `src/components/onboarding/step-create-trunk.tsx` — Name input + skip/create buttons
- `src/components/onboarding/step-create-limb.tsx` — Name input linked to created trunk
- `src/components/onboarding/step-create-branch.tsx` — Name input linked to created limb
- `src/components/onboarding/step-create-twig.tsx` — Name + color theme picker linked to created branch
- `src/components/onboarding/step-create-leaf.tsx` — Name input linked to created twig, final step completes onboarding

## Files Modified
- `convex/schema.ts` — Added `onboardingCompleted: v.optional(v.boolean())` to `xpProfiles` table
- `convex/xp.ts` — Added `getOnboardingStatus` query and `completeOnboarding` mutation
- `src/app/[locale]/trunks/page.tsx` — Added empty state detection; shows `<OnboardingWizard>` when `trunks.length === 0` and `onboardingCompleted` is false
- `src/messages/*.json` (all 9 locales) — Added `onboarding.*` i18n keys (title, step1-5, skip, done, progress, form labels/descriptions, placeholders)

## Verification
- `npx convex dev --once` — Regenerated codegen successfully
- `npx tsc --noEmit` — Clean pass, no errors
- `pnpm lint` — 0 errors, 27 warnings (all pre-existing)

## Design Decisions
1. **State management**: Wizard uses React `useState` to pass created entity IDs (trunk → limb → branch → twig) between steps
2. **Skip handling**: Every step has a skip button that advances to next step without creating an entity. If a parent was skipped, child steps show a message and a "Go Back" button
3. **Completion tracking**: `onboardingCompleted` stored on `xpProfiles` (optional boolean, defaults to false for existing users)
4. **Empty state detection**: Checks both `trunks.length === 0` AND `onboardingCompleted === false` — users with existing data or who completed onboarding see normal page

## Concerns
- Non-English translations were auto-generated and may have quality issues (Hebrew/Arabic have some placeholder artifacts). Native speaker review recommended.
- The wizard does not support going back to a previous step — each step is one-way. This is intentional for simplicity but could be enhanced.
- If a user skips all steps, they get an empty tree with no entities. The wizard still marks onboarding as complete.

---

## Review Fix Report

### Fixes Applied

**1. Missing form fields:**
- **Trunk** (`step-create-trunk.tsx`): Added color picker (`Select` with 17 Tailwind color options). Schema + mutation updated to accept optional `color`.
- **Limb** (`step-create-limb.tsx`): Added optional description `Input` field. Schema + mutation updated to accept optional `description`.
- **Twig** (`step-create-twig.tsx`): Added type selector (`once` / `many`) via `Select`. Schema + mutation updated to accept optional `type`.
- **Leaf** (`step-create-leaf.tsx`): Added optional description `Input` and numeric daily target count `Input`. Schema + mutation updated to accept optional `description` and `targetCount`.

**2. "Go Back" button relabeled:**
- All four child steps (limb, branch, twig, leaf) had a `t("goBack")` button that called `onSkip` (advancing forward). Relabeled to `t("continueWithout")` to match actual behavior. The skipMessage text was also shortened to remove the misleading "Go back to create it." sentence.

**3. Loading states during mutations:**
- All 5 step components now track `isSubmitting` state. Submit buttons are disabled and show a `Loader2` spinner during mutation calls. Form inputs are also disabled to prevent edits mid-submit. Double-click protection via `isSubmitting` guard at the top of `handleSubmit`.

**4. framer-motion step transitions:**
- `onboarding-wizard.tsx` now wraps step content in `<AnimatePresence mode="wait">` with a `<motion.div>` keyed on `step`. Animation: fade + 20px horizontal slide, 0.2s duration.

**5. Schema + backend mutations updated:**
- `convex/schema.ts`: Added `color` to trunks, `description` to limbs, `type` to twigs, `description` + `targetCount` to leaves (all optional).
- `convex/trunks.ts`, `convex/limbs.ts`, `convex/twigs.ts`, `convex/leaves.ts`: Create mutations updated to accept and persist new fields.

**6. i18n keys added:**
- `src/messages/en.json`: Added `continueWithout`, `trunkColor`, `limbDescriptionLabel`, `limbDescriptionPlaceholder`, `twigType`, `twigTypeOnce`, `twigTypeMany`, `leafDescriptionLabel`, `leafDescriptionPlaceholder`, `leafTargetCount`, `leafTargetCountPlaceholder`. Removed `goBack` key (no longer used).

### Verification
- `npx convex codegen` — Regenerated after schema changes, clean
- `npx tsc --noEmit` — Clean pass, no errors
- `pnpm lint` — 0 errors, 27 warnings (all pre-existing)
