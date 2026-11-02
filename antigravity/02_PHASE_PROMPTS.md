# Phase Prompts — One at a time

## Phase 0
Implement repository foundation only. Verify current official docs and pin compatible versions. Do not build product features.

## Phase 1
Create Neon dev connection, Drizzle schema/migrations and Better Auth integration. Generate auth schema with current Better Auth CLI. Verify app driver and Better Auth adapter compatibility. Provision one owner securely; no public signup. Test session and owner guards. Do not touch production.

## Phase 2
Implement Neon Object Storage integration. Verify S3 endpoint/credential scope. Create server-only client and short-lived presigned upload flow. Validate file type/size and verify uploaded object before DB insert. Test private/public access and expired URLs.

## Phase 3
Build design tokens, public shell and reusable components with the approved neon-purple theme and accessible states.

## Phase 4
Build public routes in groups. Published content only, explicit projections, metadata, empty/not-found/error states.

## Phase 5
Build owner-only admin CRUD, media manager, rights gate, draft/preview/publish and revalidation.

## Phase 6
Build availability, booking/contact forms and queues. Enquiry is not confirmation. Persist before email.

## Phase 7
Run tests, security review, responsive/accessibility/SEO/performance audits, backup/restore checks and preview release. Wait for explicit production approval.
