# 07 — Server Authentication & RBAC Specification

> **Architecture Alignment Note (Verified Baseline):** Authentication and 4-Gate RBAC (`Session` → `Feature Entitlement` → `Permission` → `Data Scope`) run natively on **TanStack Start Server Functions (`@tanstack/react-start/server` `HttpOnly` cookies + PBKDF2-SHA256 password hashing + Neon PostgreSQL `user_sessions`)**—**not** Next.js. Legacy notes below are retained for historical context.

## Choice
Self-hosted Better Auth running in the Next.js application, with its data persisted in Neon PostgreSQL via Drizzle adapter. This is distinct from Neon Managed Auth. Do not mix both approaches in V1.

## V1 account policy
- One owner account.
- No public signup endpoint/UI.
- Create/invite owner through a one-time secure provisioning script or controlled CLI task.
- Disable signup routes after provisioning or configure trusted invitation-only flow.
- Use email/password with strong password; consider MFA only after confirming feature support/configuration and owner need.
- Secure cookies, trusted origins and CSRF/origin protection configured for production domain.
- Rate-limit login and password reset endpoints.

## Session/authorization
- Use Better Auth server API to validate session on server.
- `requireOwner()` loads current user and verifies matching `admin_profiles.role = 'owner'`.
- Route layout checks improve UX but every Server Action and Route Handler must also call authorization.
- Do not trust client role or user ID.
- Logout invalidates session; test expired/revoked sessions.

## Database integration
Use Better Auth Drizzle adapter with PostgreSQL provider and current official adapter import/API. Generate schema using `npx auth@latest generate` or the current documented Better Auth CLI. Review output and align with app schema. Keep Better Auth migrations and app migrations in a single reviewed deployment workflow; avoid two independent tools modifying the same schema concurrently.

## Security
Better Auth secret must be long, random and server-only. Set `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, trusted origins. Never put secrets in `NEXT_PUBLIC_` variables. Use generic auth error messages to reduce account enumeration.
