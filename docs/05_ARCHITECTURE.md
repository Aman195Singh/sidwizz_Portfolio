# 05 — Technical Architecture

## Selected stack
Next.js App Router + React + TypeScript; Tailwind + shadcn/ui; Neon PostgreSQL; Drizzle ORM/Kit; Better Auth; Neon Object Storage (S3 API); Vercel.

## Runtime
Browser → Next.js server → Better Auth session verification / application authorization → Drizzle queries → Neon PostgreSQL.
File upload: Browser requests upload permission → Next.js server authorizes owner and creates short-lived presigned upload URL (or streams file server-side) → Neon Object Storage → server verifies upload metadata → DB stores object key/metadata.

## Folder map
```text
src/
  app/
    (public)/...
    (auth)/admin/login/page.tsx
    admin/(protected)/...
    api/auth/[...all]/route.ts
    api/uploads/presign/route.ts
    api/health/route.ts
    sitemap.ts
    robots.ts
  components/{ui,public,admin,forms,booking}/
  db/
    client.ts
    schema/
      auth-schema.ts
      content-schema.ts
      relations.ts
  lib/
    auth/{auth,session,require-owner}.ts
    storage/{s3-client,presign,validation}.ts
    validation/
    queries/
    actions/
    email/
    seo/
    security/
  types/
drizzle/
tests/{unit,integration,e2e}/
```

## Server/client boundaries
Server Components by default. Client Components only for menu, filters, lightbox, calendar and form interactions. Database drivers, Better Auth secret and S3 credentials remain server-only. Every server action and route handler independently verifies owner authorization.

## Database connection
Use Neon pooled connection string for app traffic; direct connection string for migrations/admin tasks when required. Keep `DATABASE_URL` and `DIRECT_URL` server-side. Confirm selected driver/ORM compatibility and pooling behaviour. Do not instantiate unbounded pools in serverless functions.

## Caching
Public published content may be cached with explicit revalidation after publish/unpublish. Admin data, sessions, preview and private enquiries must be dynamic/no-store. Never share private cache between users.

## Error handling
Stable codes: VALIDATION, UNAUTHENTICATED, FORBIDDEN, NOT_FOUND, CONFLICT, RATE_LIMITED, UPLOAD_REJECTED, PROVIDER_FAILURE, INTERNAL. Public messages must not expose stack traces or SQL/provider secrets.
