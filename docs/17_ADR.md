# 17 — Architecture Decision Records (ADRs)

- **ADR-001:** Neon PostgreSQL is the primary relational database for structured event and lead storage.
- **ADR-002:** Drizzle ORM is the schema definition and migration layer.
- **ADR-003:** Self-hosted Better Auth backed by Neon; single owner profile, disable public signup.
- **ADR-004:** Neon Object Storage (S3-compatible) for approved media and press assets.
- **ADR-005:** Single-owner admin role; no public account registration.
- **ADR-006:** Structured CMS and static route components, not an arbitrary drag-and-drop page builder.
- **ADR-007:** Booking enquiry workflow is lead-generation, not an automated payment or contract system.
- **ADR-008:** Business operations locked to Asia/Kolkata (IST) timezone.
- **ADR-009 (Frontend Engine Migration):** Adoption of **TanStack Start + Vite 8** with Nitro SSR engine. Replaces legacy Next.js 15 app router for superior developer experience, sub-second HMR on port 8080, type-safe file-based routing via `@tanstack/react-router`, and ultra-fast build times.
- **ADR-010 (Styling Engine):** Adoption of **Tailwind CSS v4** via `@tailwindcss/vite` and `@theme inline` in `src/styles.css` using the OKLCH color space for the high-contrast cinematic concert red/magenta and deep stage ink palette. Eliminates legacy `tailwind.config.ts`.
