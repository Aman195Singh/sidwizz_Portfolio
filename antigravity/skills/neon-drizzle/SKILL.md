---
name: neon-drizzle
description: Implement and maintain Neon PostgreSQL schemas, Drizzle ORM and safe migrations for Sidd.Whizz.
---
# Neon + Drizzle Skill
1. Inspect current schema and migration history.
2. Use pooled endpoint for application traffic; direct endpoint for migration tooling if required.
3. Keep DB URLs server-only.
4. Generate migrations; never silently edit already-applied migration.
5. Review SQL and indexes.
6. Test against dev branch, then preview.
7. Use `drizzle-kit push` only for disposable local experiments; use committed migrations for deployment.
8. Verify backup/recovery before destructive changes.
9. Regenerate types if project uses generated DB types.
10. Never apply production migrations without explicit approval.
