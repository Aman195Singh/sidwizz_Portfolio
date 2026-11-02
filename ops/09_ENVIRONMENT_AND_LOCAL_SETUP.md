# 09 — Environment and Local Setup

## Prerequisites
- Node.js version 20.x or 22.x LTS (pinned via `.nvmrc`)
- npm package manager
- Neon account with PostgreSQL and Object Storage enabled
- Vercel account linked to GitHub repository
- Antigravity IDE with approved plugins

---

## `.env.example`
```env
# Application & Environment
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
DEMO_MODE=true

# Database (Neon PostgreSQL)
# Pooled endpoint for application queries (PgBouncer)
DATABASE_URL=postgres://user:pass@ep-pooler.region.aws.neon.tech/neondb?sslmode=require
# Direct unpooled endpoint for migrations and DDL
DIRECT_URL=postgres://user:pass@ep-direct.region.aws.neon.tech/neondb?sslmode=require

# Authentication (Better Auth)
BETTER_AUTH_SECRET=generate_with_openssl_rand_hex_32
BETTER_AUTH_URL=http://localhost:3000
OWNER_INITIAL_EMAIL=admin@demo.siddwhizz.local
OWNER_INITIAL_PASSWORD=temporary_secure_dev_password

# Object Storage (Neon S3 API)
NEON_STORAGE_ENDPOINT=https://ep-storage.region.aws.neon.tech
NEON_STORAGE_REGION=aws-us-east-2
NEON_STORAGE_BUCKET_PUBLIC=siddwhizz-public-dev
NEON_STORAGE_BUCKET_PRIVATE=siddwhizz-private-dev
NEON_STORAGE_ACCESS_KEY_ID=
NEON_STORAGE_SECRET_ACCESS_KEY=

# Communications (Resend)
RESEND_API_KEY=re_dev_key
BOOKING_NOTIFICATION_EMAIL=leads@demo.siddwhizz.local
EMAIL_FROM=notifications@resend.dev
```

> [!CAUTION]
> Only `NEXT_PUBLIC_SITE_URL` is exposed to the browser. All database URLs, Better Auth secrets, S3 credentials, and API keys are strictly server-only. Never prefix secrets with `NEXT_PUBLIC_`.

---

## Phase 0 Scaffolding & Installation Commands

### 1. In-Place Root Scaffolding
Scaffold Next.js directly inside the repository root without creating a nested directory:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

### 2. Core Production Dependencies
```bash
npm install drizzle-orm postgres better-auth @better-auth/drizzle-adapter @aws-sdk/client-s3 @aws-sdk/s3-request-presigner zod
```

### 3. Development & Testing Dependencies
```bash
npm install -D drizzle-kit vitest @types/node @types/react @types/react-dom
```

---

## Technical Configuration Guidelines

### Database Client Configuration (`src/db/client.ts`)
Neon's pooled endpoint uses PgBouncer in transaction mode. To support Better Auth and application transactions, use `postgres.js` with prepared statements disabled:
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, {
  prepare: false, // MANDATORY for PgBouncer pooled connections
  ssl: 'require',
  max: 10,
});

export const db = drizzle(client, { schema });
```

### Drizzle Kit Configuration (`drizzle.config.ts`)
Migrations must run against the unpooled direct endpoint:
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DIRECT_URL!,
  },
});
```

### Neon Object Storage Client (`src/lib/storage/s3-client.ts`)
Neon Object Storage S3 proxies require path-style URL addressing:
```typescript
import { S3Client } from '@aws-sdk/client-s3';

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

---

## Local Development Workflow

1. **Create Dev Branch:** Provision a dedicated development branch in Neon Console or CLI (`neon branches create --name dev`).
2. **Environment Setup:** Copy `.env.example` to `.env.local` and populate development branch credentials.
3. **Generate Auth Schema:** Run `npx @better-auth/cli generate` and review output in `src/db/schema/auth-schema.ts`.
4. **App Schema Migrations:** Run `npx drizzle-kit generate` and `npx drizzle-kit migrate` against the dev branch.
5. **Seed Owner Account:** Run `npm run seed:owner` to provision the local owner user.
6. **Seed Synthetic Demo Data:** Run `npm run seed:demo` to populate the dev database with realistic test content (`DEMO_MODE=true` required).
7. **Start Dev Server:** Run `npm run dev` and navigate to `http://localhost:3000`.
8. **Run Test Suite:** Run `npm run test` (Vitest) and `npm run typecheck` (`tsc --noEmit`).
