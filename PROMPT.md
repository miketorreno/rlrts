# Project Specification: Full-Stack Habit Tracker

You are an expert full-stack engineer. Build a production-ready, highly responsive, and localized Habit Tracker web application using the modern stack detailed below.

## Tech Stack

- **Framework:** Next.js 16 (App Router with React Server/Client Components)
- **Language:** TypeScript (Strict mode enabled)
- **Database & Backend:** Convex (Real-time data synchronization and backend functions)
- **Authentication:** Clerk (User management and JWT integration with Convex)
- **Internationalization:** next-intl (Multi-language support, default locale English)
- **Styling:** Tailwind CSS v4 (Using modern utility-first canonical syntax)
- **UI Components:** Lucide React (for icons) and Radix UI / shadcn-style accessible primitives.

---

## Core Features

1. **Authentication:** Secure sign-in and sign-up flows via Clerk. Sync Clerk user ID with Convex database records.
2. **Dashboard / Habit Grid:** View daily, weekly, and monthly habit completion grids. Real-time updates via Convex.
3. **Habit Management:** Create, edit, delete, and archive habits (Name, Description, Frequency, Target days, Color/Icon).
4. **Streak Tracking:** Automatic calculation of current streaks and longest streaks per habit.
5. **Localization (i18n):** Full support for English and at least one secondary language using `next-intl` routing structure (`/[locale]/...`).
6. **Responsive Design:** Mobile-first layout optimized with Tailwind CSS v4 grid/flexbox utilities and dark mode support.

---

## Architecture & File Structure Guidelines

- The product uses tree vocabulary (trunk, limbs, branches, twigs, leaves) for naming and organization.
- Use the Next.js `src/` directory.
- Implement `next-intl` middleware for locale handling.
- Configure Convex provider wrapped with Clerk authentication tokens (`convex/auth.config.ts`).
- Place Convex backend logic inside the `convex/` folder (`schema.ts`, `leaves.ts`, `users.ts`).
- Follow modern Tailwind v4 `@import "tailwindcss";` setup in global CSS rather than legacy v3 config layers where applicable.

---

## Implementation Instructions

1. **Initialize:** Understand the existing codebase.
2. **i18n Setup (`src/i18n/`):** Setup request configuration and translation JSON files for messages (`en.json`, etc.).
3. **UI Components:** Build a clean, modern dashboard with interactive habit completion checkmarks reflecting real-time optimistic state updates via Convex.
