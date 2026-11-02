# Phase Roadmap

## Verified Runtime & Framework Versions
- **Node.js:** `v22.16.0` (Active LTS; Node 20 is EOL/Maintenance)
- **Framework:** Next.js `15.2.x` App Router
- **Runtime Libraries:** React `19.0.x`, React DOM `19.0.x`
- **Language:** TypeScript `5.7.x` (strict mode enabled)
- **Styling:** Tailwind CSS `3.4.x`, PostCSS, Autoprefixer, Lucide React
- **Component Primitives:** shadcn/ui (`class-variance-authority`, `@radix-ui/react-slot`, `clsx`, `tailwind-merge`)
- **Testing:** Vitest `3.0.x`

## Phase Definitions
0. **Repo foundation [COMPLETE & VERIFIED]:** In-place Next.js 15.5.28, strict TS 5.7.3, ESLint (`✔ No warnings or errors`), Tailwind CSS 3.4.17, shadcn/ui base, env validation (5/5 unit tests passed), CI workflow, Next.js production build succeeded.
1. **Data/auth foundation [READY FOR APPROVAL]:** Inspect Neon project branches (resolve `production` vs `main` naming); configure dev branch; Drizzle schema/migrations with `postgres.js`; Better Auth schema/adapter (`disableSignUp: true`); owner provisioning CLI script (`scripts/seed-owner.ts`); authorization tests.
2. Storage foundation: Neon Object Storage buckets/credentials, server-only S3 client with `forcePathStyle: true`, presigned upload and verification (`HeadObjectCommand`), policies/lifecycle tests.
3. Design system and public shell: Accessible dark purple theme (`--primary-text: #E879F9`), navigation, responsive shell.
4. Public pages in groups: core; portfolio/media; trust/media kit; blog; booking/contact/legal (using synthetic demo data from `src/data/demo/`).
5. Admin CMS and media manager: CRUD, draft/preview/publish, media rights gate, revalidation.
6. Availability, booking/contact queues and optional email: Advisory calendar, persistence-first submission, Resend notification.
7. Final Content Migration, security review, a11y/SEO audits, backup verification, production launch.

Do not parallelize schema/auth/storage contracts. UI tasks may be parallelized after shared contracts are approved.
