# 18 — Decisions Register

## Locked Architecture & Engineering Decisions

1. **Relational Database:** Neon PostgreSQL.
   - Application runtime traffic uses Neon pooled connection string (`DATABASE_URL`).
   - Migration and administrative DDL tasks use unpooled direct connection string (`DIRECT_URL`).
2. **Database Driver & ORM:** Drizzle ORM via `drizzle-orm/postgres-js` with `postgres(url, { prepare: false, ssl: 'require' })`.
   - Resolves the critical `neon-http` driver incompatibility by providing native interactive database transactions (`db.transaction()`) required by Better Auth and application operations.
3. **Admin Authentication:** Better Auth (self-hosted, Neon-backed via `@better-auth/drizzle-adapter`).
   - Public registrations strictly disabled (`disableSignUp: true`).
   - Single-owner provisioning executed via server-side CLI script (`scripts/seed-owner.ts`).
   - Session checking via unified `requireOwner()` helper using asynchronous `await headers()`.
4. **Object Storage:** Neon Object Storage (S3-compatible, branch-aware).
   - AWS SDK v3 `@aws-sdk/client-s3` configured with `forcePathStyle: true` server-only.
   - Presigned PUT URLs for direct browser uploads; server-side `HeadObjectCommand` verification before metadata persistence.
   - Presigned GET URLs (short-lived) for private bucket assets.
   - `rights_status: 'approved'` gate required before publishing any media asset.
5. **Frontend & Application Framework:** Next.js 15 App Router + React 19 + TypeScript.
   - Scaffolded directly in repository root (`.`).
   - Server Components by default; client components isolated for interactive widgets.
   - Fully compatible with Next.js 15 asynchronous APIs (`await headers()`, `await cookies()`, `await params`).
   - Authenticated Draft Mode routes registered at `/api/draft/preview` and `/api/draft/disable`.
6. **Design System & Accessibility:** Tailwind CSS + shadcn/ui + Lucide icons.
   - Aesthetic: Dark purple concert theme (`#090611`).
   - WCAG 2.2 AA Contrast Compliance: `--primary-text: #E879F9` (8.6:1 ratio) applied to body links and small interactive text; `--primary: #C026D3` restricted to large headers and non-text visual accents.
7. **Business Timezone & Date Modeling:** `Asia/Kolkata` (UTC+05:30).
   - Calendar dates modeled as SQL `date` (`YYYY-MM-DD` string mode) to eliminate timezone shift bugs.
8. **Booking & Contact Workflow:**
   - Enquiry capture only (no automated payment, deposit, or calendar reservation locks).
   - Public availability is strictly advisory.
   - Persistence-first architecture: enquiries persist to Neon DB before triggering email notifications via Resend.
9. **Hosting & Environment Isolation:**
   - Deployed on Vercel.
   - Environment separation: Local Development → Neon Dev Branch; Preview Deployments → Neon Preview Branches; Production → Neon Production/Main Branch.
   - *Phase 1 Infrastructure Check:* Neon CLI documentation references branch name `production`, whereas Git and deployment conventions often use `main`. The exact branch mapping is left uncommitted for Phase 0 and will be verified by inspecting the actual Neon project branches in Phase 1 before applying any configuration.
10. **Development Data Policy:**
    - 100% synthetic/dummy data for all phases prior to production launch.
    - Decoupled into `src/data/demo/` (frontend fixtures) and `database/seeds/` (Neon dev seed scripts).
    - Seed scripts are deterministic and idempotent, and strictly reject execution if `NODE_ENV === 'production'` or `DEMO_MODE !== 'true'`.
    - Real owner information will not be requested or used during development.

---

## Decisions & Deliverables Deferred to Final Content Migration

The following owner-supplied assets and decisions are explicitly deferred to Phase 7 (Final Content Migration immediately before production launch), per `docs/FINAL_CONTENT_MIGRATION.md`:

1. **Official Brand Assets:** Production vector logo, high-resolution favicon, and official color palette calibration.
2. **Owner Photography & Headshots:** Professional portrait photos for Hero, About, and Media Kit.
3. **Biographical Text:** Approved short bio and comprehensive long bio for Siddharth Maurya.
4. **Services & Inclusions:** Verified service catalog, scope boundaries, and fee display preference.
5. **Event History & Case Studies:** Verified past events, dates, cities, public venues, and client permissions.
6. **Testimonials & Media Releases:** Written attribution releases for quotes and gallery rights.
7. **Operational Communications:** Target recipient email (`BOOKING_NOTIFICATION_EMAIL`) and verified sending domain in Resend (`EMAIL_FROM`).
8. **Contact & Social Links:** Official public business email, telephone/WhatsApp, and social media URLs.
9. **Legal copy:** Final Terms of Service and Privacy Policy copy approved by legal counsel.
10. **Production Domain:** Final custom domain DNS configuration.
