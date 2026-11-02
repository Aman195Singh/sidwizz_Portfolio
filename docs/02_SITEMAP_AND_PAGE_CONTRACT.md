# 02 — Sitemap and Route Contract

## Public
`/`, `/about`, `/services`, `/portfolio`, `/portfolio/[slug]`, `/gallery`, `/videos`, `/testimonials`, `/media-kit`, `/blog`, `/blog/[slug]`, `/booking`, `/contact`, `/privacy`, `/terms`.

## Private
`/admin/login`, `/admin`, `/admin/profile`, `/admin/services`, `/admin/events`, `/admin/gallery`, `/admin/videos`, `/admin/testimonials`, `/admin/media-kit`, `/admin/blog`, `/admin/availability`, `/admin/booking-requests`, `/admin/contact-messages`, `/admin/settings`.

All `/admin/**` routes are `noindex`. Draft preview is authenticated and `no-store`. Unpublished slugs must return not-found without revealing draft existence.

## Global shell
Header: brand, desktop/mobile navigation, booking CTA.
Footer: verified positioning, approved socials/contact, legal links.
Use semantic landmarks and one descriptive H1 per page.

## Slug rules
Lowercase URL-safe unique slugs. Prefer immutable slugs after publish. If changed, create redirect mapping and preserve canonical URL rules.

## Public data rule
Public page queries return explicit safe projections. Never serialize entire DB rows where private/internal fields may exist.
