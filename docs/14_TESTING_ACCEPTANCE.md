# 14 — Testing and Acceptance

## Unit
Zod schemas, slug rules, date-only timezone, booking transitions, availability fallback, public projection, rights gate.

## Integration
Drizzle CRUD, Better Auth login/session/owner guard, migration up/down strategy, storage presign/verify, private object access, form persistence, revalidation.

## E2E
1. Visitor Home → Services → Portfolio → Booking → submit → reference.
2. Owner login → create draft → preview → publish → public page updates.
3. Owner uploads media → rights approval → attach to event → publish.
4. Anonymous cannot read booking/contact/private notes.
5. Non-owner authenticated user cannot access admin.
6. Owner updates booking status and note; public cannot read it.
7. Unapproved testimonial/media cannot publish.
8. Expired signed URL cannot access private media.

## P0 gate
All public pages responsive; admin secure; CRUD/publish works; booking/contact persists; public availability private-safe; storage access correct; SEO/sitemap correct; no critical/high security finding; backup/restore and rollback reviewed.
