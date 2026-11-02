# 10 — Deployment, CI and Backup

## Environments
Local → Preview → Production. Use separate Neon branches/projects and credentials where practical. Do not let preview mutate production data.

## CI gates
Install from lockfile; lint; typecheck; unit/integration tests; build; secret scan; dependency audit; migration review; E2E smoke.

## Migration deployment
Generate and commit migration. Review SQL. Test on dev branch. Test on preview branch. Confirm backup/recovery. Apply production migration under owner approval. Do not use schema push as production process.

## Backup/recovery
Confirm Neon plan's restore/PITR retention and limits in Console; do not assume. Export essential content and media metadata on a defined cadence. Object storage files need a separate backup/export plan. Test database and object restoration before relying on it.

## Rollback
Application rollback: redeploy previous build. Database: prefer forward fix; destructive rollback requires explicit plan/backup. Storage: versioning/backup strategy must be verified; do not assume object versioning exists.

## Incident
Contain, rotate compromised keys, preserve logs, assess affected data, restore, notify as required, document root cause and remediation.
