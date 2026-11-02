# Sidd.Whizz V1 — Demo Data & Development Content Strategy

**Document Version:** 1.0.0  
**Status:** Approved Architecture Standard  
**Target Environments:** Local Development · CI / Automated Testing · Neon Dev Branches · Vercel Preview Deployments  

---

## 1. Development Data Policy

For the entirety of the development, integration, and testing lifecycle of Sidd.Whizz V1:

1. **Strictly Synthetic Content:** All content, media, events, client attributions, testimonials, metrics, and communications must be 100% fictional and synthetic.
2. **Zero Inferred Claims:** No real achievements, awards, client relationships, or celebrity associations may be invented or attributed to Siddharth Maurya during development.
3. **No Real Owner Information During Development:** The owner will provide real business content, verified bios, approved photos, official testimonials, and legal copy at the final content integration stage, immediately prior to production launch. No requests for real owner data will be made during Phases 0 through 6.
4. **Explicit Demo Labeling:** All synthetic events, client names, organizations, case studies, and testimonials must be visibly marked with `[DEMO]` or `[SAMPLE]` in titles or metadata.
5. **Neutral / Licensed Media Placeholders:** No actual photographs of Siddharth Maurya or unauthorized client event photos will be used. Placeholders will consist of royalty-free, CC0/Unsplash-licensed concert/stage photography or locally generated SVG/neutral gradient placeholders.

---

## 2. Synthetic Data Scope & Specifications

| Content Domain | Fixture File (`src/data/demo/`) | Database Seed Script (`database/seeds/`) | Synthetic Specifications & Constraints |
| :--- | :--- | :--- | :--- |
| **Profile & About** | `profile.json` | `profile.seed.ts` | Persona: "Siddharth 'Sid' Maurya [DEMO PROFILE]". Structured sections: Hero introduction, 15-year hosting philosophy, 4 core competencies, 3 spoken languages. Explicitly flagged as synthetic. |
| **Services** | `services.json` | `services.seed.ts` | 4 distinct service categories: Corporate Annual Summits, Tech Conferences & Keynotes, Prestigious Awards Galas, Live Festival Emceeing. Includes structured JSON inclusions and scope descriptions. |
| **Portfolio & Events** | `events.json` | `events.seed.ts` | 6 comprehensive case studies with slugs: `global-tech-summit-2025-demo`, `future-mobility-conclave-demo`, `fintech-innovators-gala-demo`, etc. Rich structured case studies: Brief, Role, Challenge, Approach, Outcome. |
| **Gallery Assets** | `gallery.json` | `media.seed.ts` | 12 high-resolution royalty-free event/stage photographs. Seeded with dimensions, alt text, photographer credits, and `rights_status: 'approved'`. |
| **Videos** | `videos.json` | `videos.seed.ts` | 4 showreel entries referencing public standard test videos (YouTube/Vimeo creative commons embeds). Dedicated placeholder poster media assets. |
| **Testimonials** | `testimonials.json` | `testimonials.seed.ts` | 5 realistic organizer reviews from fictional entities ("Apex Global Summits [DEMO]", "Horizon Interactive [DEMO]"). Pre-set with `permission_confirmed: true` and `status: 'published'`. |
| **Media Kit** | `media-kit.json` | `media-kit.seed.ts` | High-level talking points, downloadable sample PDF fixture link, high-res portrait download links (using placeholders), and verified synthetic speaking topics. |
| **Blog Articles** | `blog.json` | `blog.seed.ts` | 3 thought-leadership articles with rich JSON body: stage presence, pacing multi-track conferences, crisis management on live stages. Tagged and categorized. |
| **Availability Calendar** | `availability.json` | `availability.seed.ts` | Dynamic current-month + 60-day calendar entries in `Asia/Kolkata` timezone: 10 Available dates, 4 Tentative dates, 6 Unavailable dates (with synthetic public notes). |
| **Booking Enquiries** | `booking.json` | `enquiries.seed.ts` | 8 realistic booking leads across pipeline stages: `new` (2), `contacted` (2), `quoted` (2), `accepted` (1), `declined` (1). Complete with reference codes (`BK-2026-DEMO-01`). |
| **Contact Messages** | `contact.json` | `contact.seed.ts` | 5 general inquiries spanning collaboration, press requests, and speaking invitations. Categorized across statuses. |
| **Admin Overview Metrics**| N/A (computed) | N/A (computed) | Dashboard analytics derived directly and deterministically from active database records; no synthetic hardcoded KPI counters. |

---

## 3. Data Architecture & Separation

Demo data is decoupled into two dedicated layers:

```text
SiddWhizz_Portfolio/
├── src/
│   └── data/
│       └── demo/                     # Client/Server offline fixtures for UI dev & unit testing
│           ├── profile.json
│           ├── services.json
│           ├── events.json
│           ├── gallery.json
│           ├── videos.json
│           ├── testimonials.json
│           ├── media-kit.json
│           ├── blog.json
│           ├── availability.json
│           └── enquiries.json
├── database/
│   └── seeds/                        # Database seed scripts for Neon development branches
│       ├── index.ts                  # Master idempotent runner with environment guards
│       ├── profile.seed.ts
│       ├── services.seed.ts
│       ├── events.seed.ts
│       ├── media.seed.ts
│       ├── testimonials.seed.ts
│       ├── blog.seed.ts
│       ├── availability.seed.ts
│       └── enquiries.seed.ts
└── scripts/
    └── seed-owner.ts                 # CLI owner authentication provisioner
```

### Determinism & Idempotency Rules
1. **Deterministic Identifiers:** All synthetic records utilize deterministic, fixed UUIDs (or predictable slug lookups) so that re-running seeds updates existing records via `onConflictDoUpdate` rather than creating duplicates.
2. **Sequential Dependencies:** `media.seed.ts` runs first to establish `media_assets` rows, allowing subsequent seeds (`events`, `gallery`, `videos`, `testimonials`, `blog`) to attach valid foreign keys without broken references.
3. **Strict Separation from Production:** Under no circumstances are demo fixtures imported or executed within production builds.

---

## 4. Environment Safeguards & Execution Controls

### 4.1 Master Seed Environment Guard (`database/seeds/index.ts`)
The seed execution entry point enforces strict runtime checks before touching the database:

```typescript
import { db } from '@/db/client';

export async function runMasterSeed() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDemoMode = process.env.DEMO_MODE === 'true';
  const dbUrl = process.env.DATABASE_URL || '';

  // Critical Safety Assertions
  if (isProduction || !isDemoMode) {
    throw new Error(
      'FATAL: Demo data seeding is strictly prohibited when NODE_ENV=production or DEMO_MODE!=true.'
    );
  }

  // Neon Branch URL Safety Check: Reject if connection string indicates production main branch
  if (dbUrl.includes('siddwhizz-prod') || dbUrl.includes('-main.')) {
    throw new Error(
      'FATAL: Active DATABASE_URL points to a production database branch. Aborting demo seed.'
    );
  }

  console.log('🌱 Environment checks passed. Seeding synthetic demo data...');
  // Execute seeds in dependency order...
}
```

### 4.2 Production Deployment Gate
A dedicated CI verification script (`scripts/verify-production-readiness.ts`) must run as a blocking release check in GitHub Actions and Vercel production build hooks:
1. Verifies `DEMO_MODE` is unset or explicitly `"false"`.
2. Inspects database connection target to ensure production branches are targeted only during authorized releases.
3. Scans published public content to confirm no `[DEMO]` flags exist in production database rows prior to go-live.

---

## 5. Media Asset Storage for Demo Content

1. **Storage Bucket Isolation:**
   - Development demo images will be uploaded to the `siddwhizz-public-dev` bucket on the Neon development branch.
   - S3 object keys follow a deterministic namespace: `demo/images/hero-demo.webp`, `demo/events/summit-2025.webp`, etc.
2. **Metadata Integrity:**
   - Every demo asset inserted into `media_assets` has `rights_status: 'approved'` and `alt_text: 'Demo placeholder image representing event stage setup'`.
3. **No Private Leaks:**
   - Demo booking enquiries will contain synthetic emails (`organizer1@demo-example.com`), preventing accidental notification delivery to real email addresses.

---

## 6. Developer Workflow Commands

| Command | Action | Environment Restriction |
| :--- | :--- | :--- |
| `npm run seed:demo` | Executes `database/seeds/index.ts` to populate dev DB | Dev/Local only (`DEMO_MODE=true` required) |
| `npm run seed:owner` | Creates initial test owner account in Better Auth | Dev/Local & one-time production setup |
| `npm run reset:dev-db` | Truncates application tables and re-seeds demo data | Dev/Local only |

