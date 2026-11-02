# 16 — Dependency and Version Policy

Do not freeze guessed package versions in this pack. At Phase 0:
1. Check current official Next.js, Node, Better Auth, Drizzle and Neon docs.
2. Pin stable versions in lockfile and Node version file.
3. Choose npm or pnpm once.
4. Use current Better Auth Drizzle adapter import path and CLI output.
5. Use Neon serverless driver/Drizzle adapter or supported node-postgres integration based on runtime and Better Auth compatibility.
6. App traffic: Neon pooled URL. Migrations: direct URL if required by migration tool.
7. Verify whether selected driver supports transactions/session features required by Better Auth.
8. Keep `drizzle-kit push` to disposable local experimentation; use generated migrations for preview/production.
9. Avoid adding packages without clear need.
