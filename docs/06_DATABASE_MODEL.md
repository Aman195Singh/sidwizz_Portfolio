# 06 — Database Model and Drizzle Schema Plan

## Tables
### Better Auth tables
Use Better Auth CLI/schema generation for the pinned Better Auth version. Core entities typically include `user`, `session`, `account`, `verification`. Do not hand-invent the schema; generate using the installed Better Auth CLI, review it and commit the generated Drizzle schema/migration.

### Application tables
- `admin_profiles`: Better Auth user ID FK, display name, role (owner only V1).
- `site_settings`: key unique, JSON value, is_public.
- `profile_sections`: section_key unique, content JSON, status.
- `services`: title, slug unique, summary, description JSON, sort order, active, status.
- `events`: title, slug unique, event_type, event_date date, city, public venue, case_study JSON, featured, order, status.
- `media_assets`: object_key unique, media_type, original filename, alt text, caption, rights_status, dimensions, created_by.
- `event_media`: composite event/media PK, sort order.
- `gallery_items`: media FK, category, title, order, status.
- `videos`: provider allowlist, provider_video_id, poster_media_id, category, order, status.
- `testimonials`: quote, person/org fields, permission_confirmed, status.
- `blog_posts`: title, slug unique, excerpt, body JSON, cover media, author, category/tags, SEO fields, published_at, status.
- `availability_days`: unique date, status, public_note, internal_note.
- `booking_requests`: reference_code unique, organizer, email, phone, event data, message, status, owner_notes, consent_at.
- `contact_messages`: name, email, subject, message, status, consent_at.
- `slug_redirects`: old_slug, route_type, destination_path, unique old_slug + route_type (if slug changes are supported).

## Rules
UUID primary keys, timestamps in UTC. Event/availability dates use SQL `date` and are interpreted in Asia/Kolkata. Do not convert date-only values through UTC midnight in ways that shift the day.

## Indexes
Unique slug/reference/date constraints; status/order indexes for public content; booking status + created_at; contact status + created_at; published_at; media foreign keys.

## Auth schema separation
Keep Better Auth tables in a dedicated schema such as `auth` if supported by the chosen Drizzle adapter/config, or prefix table names consistently. Avoid table-name collisions. Generate auth schema with Better Auth CLI, then include it in Drizzle migration workflow. Do not run Better Auth's auto-migrate against production without reviewing generated SQL.

## Migration policy
Development: `drizzle-kit generate` then `drizzle-kit migrate`; use `push` only for disposable local experimentation. Production: commit migration files, review SQL, backup, deploy migration in release pipeline, then deploy app. Never use `push` as production migration strategy.
