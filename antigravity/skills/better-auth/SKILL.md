---
name: better-auth
description: Configure Better Auth with Neon PostgreSQL and Drizzle for a single-owner Next.js admin.
---
# Better Auth Skill
1. Verify current Better Auth and adapter docs/version.
2. Generate schema using current Better Auth CLI.
3. Integrate through supported Drizzle/Postgres adapter and Neon-compatible driver.
4. Ensure no public signup; provision owner via secure one-time method.
5. Configure secret, URL, trusted origins and secure cookies.
6. Verify session server-side in every privileged mutation.
7. Add `requireOwner()` against application admin profile.
8. Rate-limit auth endpoints and test logout/expiry.
9. Keep secret server-only.
10. Do not mix self-hosted and Neon Managed Auth without ADR and approval.
