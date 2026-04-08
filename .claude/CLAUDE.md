# Wijn Weteling - Project Conventions

## Structure
Turborepo monorepo. All Next.js code lives in `apps/web/`.

## Commands
- `pnpm dev` — Start dev server + worker (turbo)
- `pnpm build` — Build for production (turbo)
- `pnpm lint` — Run ESLint + type check (turbo)
- `pnpm check-types` — Type check apps/web
- `pnpm generate` — Generate ZenStack ORM client from schema
- `pnpm db:push` — Push schema changes to database
- `pnpm db:seed` — Seed database
- `pnpm scrape` — Run wine shop scrapers
- `pnpm worker` — Start background job worker (pg-boss)
- `docker compose up -d` — Start PostgreSQL + Mailcatcher

## Architecture
- **Framework**: Next.js 16 (App Router) with React 19
- **Database**: PostgreSQL 17 via ZenStack ORM (schema in `apps/web/lib/db/schema.zmodel`)
- **Auth**: BetterAuth with email/password (config in `apps/web/lib/auth.ts`, client in `apps/web/lib/auth-client.ts`)
- **Queue**: pg-boss for background jobs (scraping, Vivino enrichment)
- **Styling**: Tailwind CSS v4 with wine-themed CSS variables (burgundy, cream, gold)
- **Fonts**: Playfair Display (headings), Inter (body)

## Conventions
- Use `@/*` path alias for imports (resolves relative to `apps/web/`)
- ZenStack schema defines access control policies (@@allow rules)
- Use `db` for raw database access, `authDb(user)` for policy-enforced access
- Dutch language for UI text, English for code/comments
- All queue job types defined in `apps/web/lib/queue/types.ts` with Zod validation
- UI primitives in `apps/web/components/ui/` using CVA for variants

## Environment
- DATABASE_URL: postgres://postgres:postgres@localhost:5440/wijn
- BETTER_AUTH_SECRET: set in .env.local
- BETTER_AUTH_BASE_URL: http://localhost:3010
