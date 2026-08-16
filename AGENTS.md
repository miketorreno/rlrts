# AGENTS.md

Next.js 16 (App Router) + Convex + Clerk + next-intl + Tailwind v4 habit tracker. Package manager is **pnpm** (README's `npm install` is stale).

## Commands

- `pnpm dev` — Next.js dev server. Convex is **not** in package.json scripts; run `npx convex dev` in a second terminal for the local backend (URL `http://127.0.0.1:3210`, set in `.env.local`). Both must be running to use the app.
- `pnpm lint` — eslint flat config (`eslint.config.mjs`). Repo currently has 0 errors / ~26 warnings; don't add new ones.
- No `typecheck` or `test` scripts exist. Typecheck with `npx tsc --noEmit`; it passes clean.
- `pnpm build` — full build incl. type checking; use it to verify before merging.

## Architecture

- All pages live under `src/app/[locale]/` (9 locales, default `en`, RTL for `he`/`ar`). Navigate with `Link`/`useRouter`/`usePathname` from `@/i18n/routing` — never `next/link` or `next/router`.
- `src/proxy.ts` (Clerk 7 uses `proxy.ts` at src root, not `middleware.ts`) composes `clerkMiddleware` + next-intl middleware with `localePrefix: "always"`. Protected routes: `/twig(.*)`, `/leaves(.*)`, `/trunks(.*)`, `/limbs(.*)`, `/branches(.*)`, `/todos(.*)`.
- Backend is Convex in `convex/`: tables `twigs`, `leaves`, `completions`, `trunks`, `limbs`, `branches`, `todos`, `todoItems`, `todoCompletions` (`convex/schema.ts`). Client code uses `useQuery`/`useMutation` from `convex/react` with `api.twigs.*`, `api.leaves.*`, `api.trunks.*`, `api.limbs.*`, `api.branches.*`, `api.todos.*`. Auth is Clerk-wired via `ConvexProviderWithClerk` in `src/app/providers.tsx`.
- `convex/_generated/` is committed. After changing schema or function signatures, regenerate with `npx convex dev` or `npx convex codegen` and commit the updated files, or type errors will result.

## Domain naming (tree anatomy)

The product uses tree vocabulary: `calendars` → **twigs**, `habits` → **leaves**, plus **trunks** / **limbs** / **branches** as the organizational hierarchy (fully implemented; the visual "tree" view is skipped/deferred). Always use this vocabulary in UI text, routes, and component names.

## Git workflow

- Branches: `main` = production (merged from `develop` via PR), `develop` = default/integration, `dev` = long-running WIP. No CI in this repo (no `.github/`), so verification is local: `pnpm lint` + `npx tsc --noEmit` + `pnpm build`.

## Gotchas

- Phase 0 (baseline cleanup) is complete: type errors in `src/app/providers.tsx` and `src/components/leaf/details/leaf-activity-twig.tsx` were fixed, lint errors were resolved (0 errors), and `trash/` was removed.
- `.env.local` is required and gitignored; see `.env.example` (Clerk keys, Convex URL). Clerk domain is `happy-ram-32.clerk.accounts.dev`.
