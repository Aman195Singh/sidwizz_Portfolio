# Official references — verify again during implementation

- Neon connection guide: https://neon.com/docs/get-started/connect-neon
- Neon connection pooling: https://neon.com/docs/connect/connection-pooling
- Neon Object Storage: https://neon.com/docs/object-storage/overview
- Neon Object Storage authentication: https://neon.com/docs/object-storage/authentication
- Neon Object Storage S3 API: https://neon.com/docs/object-storage/s3-api
- Neon plans/pricing: https://neon.com/docs/introduction/plans
- Drizzle + Neon: https://orm.drizzle.team/docs/connect-neon
- Drizzle migrations: https://orm.drizzle.team/docs/migrations
- Better Auth Drizzle adapter: https://better-auth.com/docs/adapters/drizzle
- Better Auth PostgreSQL: https://better-auth.com/docs/adapters/postgresql
- Better Auth database concepts: https://better-auth.com/docs/concepts/database
- Better Auth security: https://better-auth.com/docs/concepts/security
- Next.js App Router: https://nextjs.org/docs/app
- Vercel environments: https://vercel.com/docs/deployments/environments

## Current checks informing this pack
- Neon Object Storage is S3-compatible and Neon announced GA on Aug 6, 2026. Confirm plan pricing/limits in Console.
- Neon credentials for Object Storage use scoped storage permissions; keep credentials server-side.
- Neon recommends pooled endpoints for serverless app traffic; use direct connection for migration/admin tasks where required.
- Better Auth supports PostgreSQL and Drizzle adapters; generate schema using its CLI and review migrations.
