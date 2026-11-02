# Sidd.Whizz V1 — Neon Engineering Pack

**Architecture locked by owner**
- Database: Neon PostgreSQL
- ORM/migrations: Drizzle ORM + Drizzle Kit
- Admin authentication: Better Auth (self-hosted in the Next.js app, backed by Neon via Drizzle)
- File storage: Neon Object Storage (S3-compatible)
- Frontend/backend: Next.js App Router + TypeScript
- UI: Tailwind CSS + shadcn/ui + Lucide
- Hosting: Vercel
- Business timezone: Asia/Kolkata

## Important architecture clarification
Neon is the PostgreSQL database and object-storage provider. Better Auth is the authentication library. Drizzle is the database access and migration layer. This pack selects **self-hosted Better Auth backed by the same Neon database** rather than Neon Managed Auth, to keep authentication configuration and admin behaviour inside the application repository. Revisit this only if the owner explicitly chooses managed auth.

Neon Object Storage is S3-compatible and GA according to current Neon documentation. Confirm actual plan pricing, storage, egress, bucket access mode, credential scopes and region in the Neon Console before production use. Keep credentials server-only. For production uploads, use short-lived presigned URLs or a server-mediated upload flow; never expose Neon S3 secret credentials to the browser.

## What is included
- Product requirements and route/page specs
- Design system and component inventory
- Next.js architecture and folder structure
- Drizzle schema model and migration workflow
- Better Auth setup contract and owner provisioning
- Neon Object Storage contract and access rules
- Booking/contact workflows and admin CMS behaviour
- Security threat model, validation and API contracts
- Testing/acceptance criteria, deployment, backup and release runbooks
- Antigravity repository rules, audit prompt, phase prompts and reusable skills

## How to use
1. Extract pack into the project repository root.
2. Copy `antigravity/AGENTS.md` to repository root as `AGENTS.md`.
3. Keep `.agents/skills/` under repository root.
4. Open the repository in Antigravity.
5. Run `antigravity/00_AUDIT_ONLY_PROMPT.md` first. It explicitly prohibits coding.
6. Have the agent verify current versions/docs and report any mismatch.
7. Resolve open decisions in `docs/18_DECISIONS_REGISTER.md`.
8. Approve Phase 0, then implement one phase at a time.
9. Never run production migrations or change production storage permissions without explicit approval and a backup/recovery plan.

## Environment variables
See `ops/09_ENVIRONMENT_AND_LOCAL_SETUP.md`. Do not commit `.env.local`. Never expose Neon database URL, Better Auth secret or S3 secret in browser code.

## Owner content required
Approved bio, services, verified event list, permitted client names, approved photos/videos, testimonial permissions, public contact details, notification email, privacy/terms copy and domain.

## Content integrity
Mockup metrics, sample testimonials, logos, event names, celebrity associations and dates are placeholders unless owner verifies and approves them.
