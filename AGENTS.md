# Sidd.Whizz V1 — Repository Agent Rules

Read README and relevant docs/ADRs before work. Inspect repository before assuming state.
If asked to audit/plan, do not code.
Implement only approved phase. Do not silently add SaaS, payments, calendar sync, WhatsApp API or page builder.

## Development Data Policy
For the entire development and testing period, use ONLY fictional, synthetic and dummy data.
Do not request real owner content during development; real owner information will be provided at the final content integration stage immediately before production launch.
Separate demo data from application logic:
- `src/data/demo/` for frontend demo fixtures.
- `database/seeds/` for synthetic database seed scripts.
- `docs/DEMO_DATA_STRATEGY.md` defines the data policy.
- `docs/FINAL_CONTENT_MIGRATION.md` defines the real-content replacement protocol.
All synthetic events, names, organizations, statistics and testimonials must be visibly marked as `[DEMO]`.
Do not invent real achievements or imply fictional brands are associated with Siddharth Maurya.
Use royalty-free, licensed placeholder imagery or neutral local placeholders. Do not generate or imply real photographs of the actual owner.
Seed scripts must be deterministic, idempotent, and MUST reject execution if targeted against production (`NODE_ENV === 'production'` or `DEMO_MODE !== 'true'`).

## Architecture & Code Standards
Use TypeScript strict. Next.js App Router (React 19 / Next.js 15+).
Server Components by default; client components strictly for interactivity.
In Next.js 15, `headers()`, `cookies()`, and route `params` are asynchronous Promises — always await them.
Keep DB/auth/storage SDKs server-only. Never expose database URLs, Better Auth secret, or S3 credentials to the client.
Every Server Action and Route Handler independently verifies Better Auth session and owner role (`requireOwner()`).
Disable public signup in Better Auth (`disableSignUp: true`); provision owner via `scripts/seed-owner.ts`.
Provide authenticated draft preview route handlers (`/api/draft/preview`, `/api/draft/disable`).

## Database & Storage Safety
Application traffic uses Neon pooled endpoint (`DATABASE_URL`) via `drizzle-orm/postgres-js` with `postgres(url, { prepare: false })` to support full interactive transactions for Better Auth and application workflows.
Migration tooling (`drizzle-kit`) must use the unpooled direct connection (`DIRECT_URL`).
Neon Object Storage integration with AWS SDK v3 must configure `forcePathStyle: true` server-only.
Use short-lived presigned URLs (PUT for upload, GET for private access) and server-side `HeadObjectCommand` verification.
Media deletion must verify zero foreign key references before deleting S3 objects.
Design system tokens must strictly satisfy WCAG 2.2 AA contrast requirements (use `--primary-text: #E879F9` for body/normal text).

## Execution Process
Use explicit public projections. Keep private enquiries, internal notes, and unpublished drafts strictly private.
For each task: objective → inspect → file plan → implement small slice → tests/lint/typecheck/build → report verified results and gaps → stop at phase gate. Do not claim completion without evidence.
