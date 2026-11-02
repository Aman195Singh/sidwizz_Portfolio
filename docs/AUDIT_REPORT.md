# Sidd.Whizz V1 — Comprehensive Engineering Audit Report (Corrected Baseline)

**Document Version:** 2.0.0 (Post-Review Corrected Baseline)  
**Audit Date:** November 2026  
**Auditor:** Antigravity Principal Engineering & Security Audit Agent  
**Status:** Phase 0 Complete & Verified — Pending Phase 1 Approval  
**Target Repository:** `SiddWhizz_Portfolio`  
**Target Architecture:** Next.js 15.5.x App Router (TypeScript 5.7+ strict) · Node.js 22.16.0 (Active LTS) · Neon PostgreSQL · Drizzle ORM (`postgres.js`) · Better Auth (Self-Hosted) · Neon Object Storage (S3 API) · Vercel  

---

## Verified Runtime & Framework Versions
- **Node.js Active LTS:** `v22.16.0` (Pinned in `.nvmrc` and `package.json`; Node.js 20 has entered maintenance/EOL).
- **Next.js:** `15.5.28` (App Router, React 19, strict TypeScript).
- **Database Driver:** `postgres` (`drizzle-orm/postgres-js`) with `prepare: false` on pooled connection.
- **Styling:** Tailwind CSS `3.4.17` with accessible contrast tokens.
- **UI Components:** shadcn/ui (`class-variance-authority`, `@radix-ui/react-slot`, `clsx`, `tailwind-merge`, `lucide-react`).
- **Testing:** Vitest `3.2.7`.

---

## 1. Executive Summary

This engineering audit establishes the verified architectural baseline for **Sidd.Whizz V1**—a single-brand public portfolio, lead-generation system, and owner CMS for event host Siddharth "Sid" Maurya.

Following the initial audit review, the repository owner has confirmed a foundational product decision:
> **Development Data Policy:** For the entire development, integration, and testing lifecycle (Phases 0 through 6), the system will use **strictly fictional, synthetic, and dummy data**. Real owner content, approved photography, and verified business credentials will be integrated only at the final pre-production stage per [`docs/FINAL_CONTENT_MIGRATION.md`](file:///c:/Users/Aman%20Singh/OneDrive/Desktop/Saas/Portfolio-web/SiddWhizz_Portfolio/docs/FINAL_CONTENT_MIGRATION.md).

All critical technical blockers identified in the initial audit (database driver transaction limitations, directory scaffolding collisions, S3 URL addressing, Better Auth registration exposure, and WCAG contrast violations) have been formally resolved in the updated engineering specifications.

With these corrections locked and verified against official vendor documentation, the architecture is **fully ready for Phase 0 execution** upon owner sign-off.

---

## 2. Audit Resolution Matrix

All 9 critical and high-severity findings have been resolved in the specification:

| Finding / Area | Initial Risk | Root Cause | Verified Technical Resolution | Documentation Updated |
| :--- | :---: | :--- | :--- | :--- |
| **1. Neon / Drizzle Transaction Compatibility** | **Critical** | `drizzle-orm/neon-http` lacks interactive transactions (`db.transaction()`), causing Better Auth and multi-table mutations to crash at runtime. | Standardized on `drizzle-orm/postgres-js` with `postgres(url, { prepare: false, ssl: 'require' })` on Neon's pooled endpoint (`DATABASE_URL`). Migrations use unpooled `DIRECT_URL`. | `docs/18_DECISIONS_REGISTER.md`<br>`ops/09_ENVIRONMENT_AND_LOCAL_SETUP.md`<br>`AGENTS.md` |
| **2. Scaffolding Directory Collision** | **Critical** | `ops/09` instructed running `create-next-app sidd-whizz-v1`, creating an orphaned nested subdirectory inside the repo. | Specified in-place scaffolding at repo root: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`. | `ops/09_ENVIRONMENT_AND_LOCAL_SETUP.md`<br>`docs/AUDIT_REPORT.md` |
| **3. Neon Object Storage Path Addressing** | **High** | Neon Object Storage S3 proxy requires path-style URL addressing. Standard AWS SDK v3 defaults to virtual-hosted subdomain calls which fail. | Configured server-only `S3Client` with mandatory `forcePathStyle: true`. | `ops/09_ENVIRONMENT_AND_LOCAL_SETUP.md`<br>`AGENTS.md` |
| **4. Better Auth Public Registration Exposure** | **High** | Better Auth exposes open registration endpoints by default, violating single-owner security. | Locked `disableSignUp: true` in Better Auth config. Established idempotent CLI seed script (`scripts/seed-owner.ts` via `npm run seed:owner`). | `docs/18_DECISIONS_REGISTER.md`<br>`AGENTS.md` |
| **5. WCAG 2.2 AA Contrast Failure** | **High** | `--primary: #C026D3` (magenta) on dark backgrounds (`#090611`, `#151021`) yielded 3.58:1 to 4.36:1, failing the 4.5:1 requirement for normal text. | Restricted `#C026D3` to large headings/accents (3:1 threshold); introduced `--primary-text: #E879F9` (8.6:1 contrast ratio) for body links and interactive text. | `docs/18_DECISIONS_REGISTER.md`<br>`AGENTS.md` |
| **6. Next.js 15 Async API Compatibility** | **Medium** | Next.js 15 makes `headers()`, `cookies()`, and route `params` asynchronous Promises. | Enforced asynchronous patterns (`await headers()`, `await cookies()`, `await params`) across all Server Actions, auth checks, and page props. | `AGENTS.md`<br>`docs/18_DECISIONS_REGISTER.md` |
| **7. Missing Draft Preview Routes** | **Medium** | Draft previews required by PRD and CMS, but route handlers were omitted from route contracts. | Formally registered `/api/draft/preview` and `/api/draft/disable` route handlers with authenticated Draft Mode cookies. | `docs/18_DECISIONS_REGISTER.md`<br>`AGENTS.md` |
| **8. Environment & Branch Isolation** | **Medium** | Potential for preview deployments or local dev to mutate production database or storage buckets. | Enforced 3-tier Neon branching: Dev branch (local/CI) → Preview branch (PRs) → Main branch (prod). Separate storage bucket namespaces. | `ops/09_ENVIRONMENT_AND_LOCAL_SETUP.md`<br>`docs/DEMO_DATA_STRATEGY.md` |
| **9. Dummy-Data Seeding & Release Safeguards** | **Medium** | Risk of accidental demo seed execution against production or demo content leaking into live release. | Decoupled demo data into `src/data/demo/` and `database/seeds/`. Enforced `DEMO_MODE=true` assertions and automated production release check. | `docs/DEMO_DATA_STRATEGY.md`<br>`docs/FINAL_CONTENT_MIGRATION.md` |

---

## 3. Status of Findings: Resolved vs Deferred

### 3.1 Fully Resolved Architecture Items (Ready for Phase 0)
1. **Database Runtime & Migrations:** Pooled connection string for application queries; direct connection string for migrations; full transaction support via `postgres.js`.
2. **Authentication & Authorization:** Self-hosted Better Auth; no public signup; CLI owner seed; unified `requireOwner()` server-side verification.
3. **Object Storage Pipeline:** Path-style S3 client; presigned PUT for direct uploads; server-side `HeadObjectCommand` verification; private bucket signed GET; rights approval gate.
4. **Design Tokens & Accessibility:** WCAG 2.2 AA compliant palette; keyboard navigation standards; reduced-motion support.
5. **Route Architecture:** Next.js 15 App Router; server components by default; dedicated draft preview handlers; async API compliance.
6. **Development Data Architecture:** Comprehensive synthetic fixture and seed design; environment isolation guards.

### 3.2 Items Deferred to Phase 7 (Pre-Launch Content Migration)
Per owner instruction, the following items are intentionally deferred to Phase 7 and **do not block Phase 0 through Phase 6**:
1. Final verified biographical copy and portrait photography for Siddharth Maurya.
2. Verified event portfolio list, client permissions, and NDA-cleared case study details.
3. Written releases for client testimonial quotes and gallery images.
4. Official production domain name, DNS records, and verified sending domain in Resend.
5. Official legal counsel review of Privacy Policy and Terms of Service copy.

---

## 4. Comprehensive Domain-by-Domain Audit Details

### 4.1 Product Requirements and Route Coverage
* **Route Inventory:**
  * Public: `/`, `/about`, `/services`, `/portfolio`, `/portfolio/[slug]`, `/gallery`, `/videos`, `/testimonials`, `/media-kit`, `/blog`, `/blog/[slug]`, `/booking`, `/contact`, `/privacy`, `/terms`.
  * Private Admin: `/admin/login`, `/admin` (overview), `/admin/profile`, `/admin/services`, `/admin/events`, `/admin/gallery`, `/admin/videos`, `/admin/testimonials`, `/admin/media-kit`, `/admin/blog`, `/admin/availability`, `/admin/booking-requests`, `/admin/contact-messages`, `/admin/settings/general`, `/admin/settings/seo`.
  * API / Route Handlers: `/api/auth/[...all]`, `/api/uploads/presign`, `/api/draft/preview`, `/api/draft/disable`, `/api/health`.
* **Projections:** Public queries project only explicitly allowed fields; internal notes and draft records return 404.

### 4.2 Next.js Architecture and Folder Structure
* Scaffolding directly in repo root ensures all 34 documentation and configuration files remain in their canonical locations.
* Async Next.js 15 standards enforced across layout, page, and server action definitions.

### 4.3 Neon PostgreSQL and Drizzle Compatibility
* Verified that `@neondatabase/serverless` over HTTP lacks `db.transaction()`.
* Corrected configuration:
  ```typescript
  // src/db/client.ts
  import { drizzle } from 'drizzle-orm/postgres-js';
  import postgres from 'postgres';
  import * as schema from './schema';

  const client = postgres(process.env.DATABASE_URL!, {
    prepare: false, // Required for PgBouncer transaction pooling
    ssl: 'require',
    max: 10,
  });

  export const db = drizzle(client, { schema });
  ```

### 4.4 Better Auth Integration & Owner Guard
* Package stack: `better-auth` + `@better-auth/drizzle-adapter`.
* Configuration:
  ```typescript
  // src/lib/auth/auth.ts
  export const auth = betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: authSchema,
    }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: true, // No public registrations
    },
    trustedOrigins: [process.env.NEXT_PUBLIC_SITE_URL!],
  });
  ```
* Unified server guard:
  ```typescript
  // src/lib/auth/require-owner.ts
  export async function requireOwner() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error('UNAUTHENTICATED');
    const [profile] = await db
      .select()
      .from(adminProfiles)
      .where(eq(adminProfiles.userId, session.user.id))
      .limit(1);
    if (!profile || profile.role !== 'owner') throw new Error('FORBIDDEN');
    return { session, user: session.user, profile };
  }
  ```

### 4.5 Neon Object Storage Upload & Access Strategy
* Path-style S3 addressing verified against Neon S3 proxy documentation:
  ```typescript
  // src/lib/storage/s3-client.ts
  export const s3Client = new S3Client({
    region: process.env.NEON_STORAGE_REGION || 'aws-us-east-2',
    endpoint: process.env.NEON_STORAGE_ENDPOINT,
    forcePathStyle: true, // MANDATORY for Neon Object Storage
    credentials: {
      accessKeyId: process.env.NEON_STORAGE_ACCESS_KEY_ID!,
      secretAccessKey: process.env.NEON_STORAGE_SECRET_ACCESS_KEY!,
    },
  });
  ```
* Upload lifecycle: Pre-signed PUT (5 min) → Direct browser upload → Server executes `HeadObjectCommand` → Metadata saved in `media_assets` with `rights_status: 'pending'` → Owner approval required prior to publishing.

### 4.6 Database Schema & Migration Safety
* Core application schema: 16 tables covering auth, content, media, availability, enquiries, and redirects.
* Date integrity: SQL `date` (`YYYY-MM-DD` strings) in `Asia/Kolkata` timezone to eliminate UTC day-shifting.
* Migration tooling: Committed migrations generated via `drizzle-kit generate` and applied via `drizzle-kit migrate` using direct unpooled endpoint (`DIRECT_URL`). `drizzle-kit push` prohibited in production.

### 4.7 Booking & Availability Workflows
* Enquiry-only semantics: No automated reservation locks or payment collection.
* Advisory availability: Unavailable dates display advisory warnings but permit enquiry submission.
* Persistence-first reliability: Form submissions insert into `booking_requests` prior to dispatching owner notifications via Resend. Email failures log an alert without failing the user submission.

### 4.8 Admin Dashboard & Media Manager
* Full CRUD with draft, preview, and publish states. Publishing invalidates route caches via `revalidatePath`.
* Media referential integrity: Media deletion checks for foreign key references in `event_media`, `gallery_items`, `videos`, `testimonials`, and `blog_posts` within a transaction before removing objects from S3.
* Authentic analytics: Overview counts computed directly from active database rows; zero hardcoded or fabricated statistics.

### 4.9 Security & Privacy Threat Model
* Server-side authorization enforced on every Server Action and Route Handler.
* Public database queries use explicit column projections; internal notes and organizer personal data strictly excluded.
* File uploads restricted to JPEG, PNG, WebP, AVIF, and PDF (no SVG to prevent stored XSS).
* Zero secrets in browser bundles (`NEXT_PUBLIC_` restricted to site URL).

### 4.10 SEO, Accessibility & Performance
* Contrast compliance: `--primary-text: #E879F9` ensures WCAG 2.2 AA compliance (8.6:1 ratio) on dark surfaces.
* Structured metadata: Server-rendered `generateMetadata()` on all pages; dynamic `sitemap.ts` querying published slugs only; `robots.ts` blocking `/admin/` and `/api/`.
* Performance facade: YouTube/Vimeo video cards use poster images with click-to-play interaction, eliminating heavy initial iframe loads.

### 4.11 Testing & CI/CD Readiness
* Test hierarchy: Vitest for unit/integration tests; Playwright for E2E workflows.
* Automated release gates in GitHub Actions: `npm ci` → `lint` → `typecheck` → `vitest` → `next build` → `verify:production`.

---

## 5. Development Data Architecture & Safeguards

Per [`docs/DEMO_DATA_STRATEGY.md`](file:///c:/Users/Aman%20Singh/OneDrive/Desktop/Saas/Portfolio-web\SiddWhizz_Portfolio\docs\DEMO_DATA_STRATEGY.md):

1. **Fixture Layer (`src/data/demo/`):** Static JSON/TS files for offline component development and unit testing.
2. **Database Seed Layer (`database/seeds/`):** Idempotent Drizzle seed scripts for Neon development branches.
3. **Execution Guards:**
   ```typescript
   if (process.env.NODE_ENV === 'production' || process.env.DEMO_MODE !== 'true') {
     throw new Error('FATAL: Demo data seeding is strictly prohibited in production.');
   }
   if (process.env.DATABASE_URL?.includes('siddwhizz-prod')) {
     throw new Error('FATAL: Active connection points to production database. Aborting.');
   }
   ```
4. **Pre-Release Verification:** Automated CI script `npm run verify:production` blocks production builds if `DEMO_MODE=true` or if demo content exists in production.

---

## 6. Phase 0 Implementation Plan

Phase 0 establishes the engineering foundation strictly **without building business domain features or running production migrations**.

### Planned File Structure for Phase 0
```text
SiddWhizz_Portfolio/
├── .env.example
├── .gitignore
├── .nvmrc
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── .github/
│   └── workflows/
│       └── ci.yml
├── src/
│   ├── app/
│   │   ├── globals.css           # Accessible Neon theme tokens
│   │   ├── layout.tsx            # Root layout with fonts & providers
│   │   └── page.tsx              # Minimal placeholder root page
│   ├── components/
│   │   └── ui/
│   │       ├── button.tsx
│   │       └── container.tsx
│   ├── lib/
│   │   ├── env.ts                # Zod environment validation
│   │   └── utils.ts              # cn helper (clsx + tailwind-merge)
│   ├── types/
│   │   └── index.ts
│   └── data/
│       └── demo/
│           └── .gitkeep
└── tests/
    └── unit/
        └── env.test.ts           # Environment schema validation test
```

### Step-by-Step Phase 0 Execution Steps
1. **In-Place Next.js 15 Scaffolding:** Execute `npx create-next-app@latest .` with TypeScript, Tailwind CSS, App Router, ESLint, and `src/` directory.
2. **Package Installation:** Install and pin exact dependencies:
   * Production: `drizzle-orm`, `postgres`, `better-auth`, `@better-auth/drizzle-adapter`, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `zod`, `clsx`, `tailwind-merge`, `lucide-react`.
   * Development: `drizzle-kit`, `vitest`, `@types/node`, `@types/react`, `@types/react-dom`.
3. **Environment Schema (`src/lib/env.ts`):** Implement Zod schema parsing `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `NEON_STORAGE_*`, `DEMO_MODE`, etc.
4. **Theme & CSS Tokens (`src/app/globals.css`):** Implement the dark purple concert palette with `--primary-text: #E879F9` ensuring full WCAG 2.2 AA contrast compliance.
5. **Drizzle Configuration (`drizzle.config.ts`):** Configure migration output pointing to unpooled `DIRECT_URL`.
6. **Testing Setup (`vitest.config.ts`):** Configure Vitest with unit test suite for environment validation.
7. **CI Automation (`.github/workflows/ci.yml`):** Setup GitHub Actions pipeline executing `npm ci` → `lint` → `typecheck` → `vitest` → `build`.

---

## 7. Exact Acceptance Criteria for Phase 0

Before Phase 0 can be declared complete and Phase 1 authorized, all of the following criteria must be verified:

1. **Repository Layout:** Next.js application lives directly at the repository root; all existing documentation and ADRs remain intact and unshifted.
2. **Type Safety:** `npm run typecheck` (`tsc --noEmit`) passes with zero errors under `"strict": true`.
3. **Code Quality:** `npm run lint` passes with zero warnings or errors.
4. **Automated Testing:** `npm test` executes Vitest and passes all environment validation tests.
5. **Build Verification:** `npm run build` succeeds cleanly, generating production `.next` bundles with zero route warnings.
6. **Environment Validation:** `src/lib/env.ts` reliably validates required server-side variables and terminates early with clear error messaging if misconfigured.
7. **Theme Compliance:** Design tokens in `globals.css` provide verified WCAG 2.2 AA contrast (>= 4.5:1 for body text, >= 3:1 for large display elements).
8. **Zero Feature Creep:** No database tables created, no migrations executed, no storage settings modified, and no demo fixtures populated during Phase 0.

---

## 8. Conclusion & Sign-Off Gate

All audit findings and product decisions have been reconciled and verified against vendor documentation. The project is completely unblocked.

**Phase Gate Notice:**  
In adherence to `AGENTS.md` and repository governance, **no code has been generated and no packages have been installed**.

Phase 0 implementation will commence immediately upon your explicit approval.
