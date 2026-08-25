# Growth & Retention Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add habit reminders, undo-delete for destructive actions, and a first-run onboarding flow to improve retention.

**Architecture:** (1) Browser notification API + Convex scheduled reminders. (2) Undo-delete via 5-second toast with action callback. (3) Onboarding wizard that guides new users through creating their first trunk → limb → branch → twig → leaf.

**Tech Stack:** Browser Notification API, Convex scheduler, shadcn/ui Toast, framer-motion, next-intl.

**Spec:** Audit findings — no notification infrastructure exists (timer-based auto-complete exists but no reminders). Zero undo for deletions. New users land on empty `/trunks` with no guidance.

---

## Tasks

### Task 1: Habit Reminders (Browser Notifications)

**Files:**
- Modify: `convex/schema.ts` (add `reminderTime` field to leaves)
- Modify: `convex/leaves.ts` (add scheduleReminder mutation)
- Create: `src/lib/notifications.ts` (browser notification helpers)
- Modify: `src/components/leaf/leaf-edit-form.tsx` (add reminder time picker)

**Interfaces:**
- Produces: `scheduleReminder` mutation, `requestNotificationPermission` helper, reminder time UI
- Consumes: Convex scheduler for timed notifications

- [ ] **Step 1:** Add `reminderTime` optional field to leaves schema (hour + minute, or null):
  ```ts
  reminderTime: v.optional(v.object({
    hour: v.number(),
    minute: v.number(),
  }))
  ```
- [ ] **Step 2:** Add `scheduleReminder` mutation in `convex/leaves.ts`:
  - Accepts leafId + hour/minute
  - Computes next occurrence timestamp
  - Schedules Convex function to fire at that time
  - Stores scheduled function ID on leaf
- [ ] **Step 3:** Create `src/lib/notifications.ts`:
  - `requestNotificationPermission()` — wraps `Notification.requestPermission()`
  - `showNotification(title, body)` — wraps `new Notification()`
  - `isNotificationSupported()` — feature detection
- [ ] **Step 4:** Create Convex scheduled function `sendReminder` that:
  - Looks up the leaf name
  - Calls `showNotification` via server-side push (or stores pending notification for client poll)
  - Reschedules for next day if recurring
- [ ] **Step 5:** Add reminder time picker to leaf edit form:
  - Toggle to enable/disable reminders
  - Hour/minute picker (select dropdowns or time input)
  - Calls `scheduleReminder` mutation on save
- [ ] **Step 6:** Add i18n keys to all 9 locales:
  - `leaves.reminder`: "Reminder"
  - `leaves.reminderEnabled`: "Daily reminder at"
  - `leaves.reminderDisabled`: "No reminder"
  - `leaves.reminderTime`: "Reminder time"
- [ ] **Step 7:** Verify: `npx tsc --noEmit && pnpm lint && pnpm build`
- [ ] **Step 8:** Commit: `feat(reminders): add browser notification reminders for habits`

---

### Task 2: Undo Delete

**Files:**
- Modify: `src/components/trunk/trunk-list.tsx` (or trunk-container.tsx)
- Modify: `src/components/limb/limb-container.tsx`
- Modify: `src/components/branch/branch-container.tsx`
- Modify: `src/components/twig/twig-container.tsx`

**Interfaces:**
- Produces: 5-second undo toast after delete actions
- Consumes: shadcn/ui toast system

- [ ] **Step 1:** Read existing delete handlers across trunk, limb, branch, twig containers
- [ ] **Step 2:** Modify delete handlers to:
  - Store the deleted item's data in a ref before deletion
  - Show a toast with "Undo" action button
  - On "Undo" click: re-create the item with original data
  - Auto-dismiss after 5 seconds (toast timeout)
- [ ] **Step 3:** Create a reusable `useUndoDelete` hook:
  ```ts
  function useUndoDelete() {
    // Returns { undoableDelete: (deleteFn, item, label) => void }
    // Manages pending deletes, toast display, and undo re-creation
  }
  ```
- [ ] **Step 4:** Add i18n keys to all 9 locales:
  - `common.deleted`: "{name} deleted"
  - `common.undo`: "Undo"
- [ ] **Step 5:** Verify: `npx tsc --noEmit && pnpm lint && pnpm build`
- [ ] **Step 6:** Commit: `feat(ux): add undo-delete for trunk, limb, branch, and twig`

---

### Task 3: Onboarding Flow

**Files:**
- Modify: `src/app/[locale]/trunks/page.tsx` (detect empty state)
- Create: `src/components/onboarding/onboarding-wizard.tsx`
- Create: `src/components/onboarding/step-create-trunk.tsx`
- Create: `src/components/onboarding/step-create-limb.tsx`
- Create: `src/components/onboarding/step-create-branch.tsx`
- Create: `src/components/onboarding/step-create-twig.tsx`
- Create: `src/components/onboarding/step-create-leaf.tsx`
- Modify: `convex/schema.ts` (add `onboardingCompleted` field to users or xpProfiles)

**Interfaces:**
- Produces: Multi-step wizard component, per-step sub-components, completion tracking
- Consumes: Existing Convex mutations (trunks.create, limbs.create, etc.)

- [ ] **Step 1:** Add `onboardingCompleted` boolean field to `xpProfiles` table in schema
- [ ] **Step 2:** Create `src/components/onboarding/onboarding-wizard.tsx`:
  - Multi-step wizard with progress indicator (step 1/5, 2/5, etc.)
  - Uses framer-motion for step transitions
  - Each step renders a mini form for creating one entity
  - "Skip" button on every step
  - "Done" button on final step marks onboarding complete
- [ ] **Step 3:** Create step components (each creates one entity type):
  - `step-create-trunk.tsx` — name + color picker
  - `step-create-limb.tsx` — name + description (linked to created trunk)
  - `step-create-branch.tsx` — name (linked to created limb)
  - `step-create-twig.tsx` — name + type (once/many) + linked to created branch
  - `step-create-leaf.tsx` — name + description + optional target count
- [ ] **Step 4:** Modify trunks page to detect empty state:
  - If `api.trunks.list` returns empty array AND `xpProfiles.onboardingCompleted` is false
  - Render `<OnboardingWizard>` instead of empty state
  - After completion, show normal trunks list
- [ ] **Step 5:** Add i18n keys to all 9 locales:
  - `onboarding.title`: "Welcome to RLR! Let's set up your first habit chain"
  - `onboarding.step1`: "Create a Trunk"
  - `onboarding.step2`: "Add a Limb"
  - `onboarding.step3`: "Add a Branch"
  - `onboarding.step4`: "Add a Twig (schedule)"
  - `onboarding.step5`: "Add a Leaf (habit)"
  - `onboarding.skip`: "Skip for now"
  - `onboarding.done`: "Get Started!"
  - `onboarding.progress`: "Step {current} of {total}"
- [ ] **Step 6:** Verify: `npx tsc --noEmit && pnpm lint && pnpm build`
- [ ] **Step 7:** Commit: `feat(onboarding): add first-run wizard for new users`

---

## Task Dependencies

```
Task 1 (Reminders) — independent
Task 2 (Undo delete) — independent
Task 3 (Onboarding) — independent
```

All three tasks are independent and can run in parallel.
