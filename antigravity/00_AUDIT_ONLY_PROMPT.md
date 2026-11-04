# Sidd.Whizz V1 — Audit Only, No Coding (TanStack Start + Vite)

Read root `AGENTS.md` and all documentation. Inspect the repository and verify current official documentation and package versions.

Do not create or modify application code or install unapproved packages during an audit.

Report:
1. Documentation inventory and repo status.
2. Route traceability: URL → `src/routes/*.tsx` → components (`src/components/site.tsx`, `src/components/ui/`) → test.
3. TanStack Start / Vite / Nitro SSR compatibility and build output verification.
4. Tailwind CSS v4 `@theme` tokens, contrast ratios (WCAG 2.2 AA), and responsive breakpoints (320px to 1920px).
5. Asset inventory in `src/assets/` and public assets in `public/` (favicons, `og-image.png`, `robots.txt`).
6. Open Graph and Twitter Card metadata across all public routes.
7. Booking enquiry and contact form validation (Zod schemas, input handling, status toasts).
8. Accessibility (keyboard focus visible, ARIA labels, semantic landmark elements).
9. Performance & Core Web Vitals (LCP hero image priority, CLS prevention, code splitting).
10. Testing suite status (`vitest run` in `src/test/app-routing.test.tsx`).
11. Phased plan with exact files, tests, and exit gates.

Rank risks as Critical / High / Medium / Low. Wait for owner approval before writing code.
