# 01 — Product Requirements Document

## Product
Sidd.Whizz is a single-brand public portfolio and lead-generation website for event host/emcee/public speaker Siddharth “Sid” Maurya, with a protected owner dashboard for content, media, availability and enquiries.

## Goals
1. Explain who Sid is, what events he hosts and how to enquire.
2. Present verified work and approved media professionally.
3. Convert organizers into booking enquiries.
4. Let the owner update content without code edits.
5. Deliver a secure, fast, accessible and maintainable V1.

## Roles
- Public visitor / event organizer: browse pages, view approved work, check coarse availability, submit booking/contact enquiry.
- Owner/admin: authenticate, manage content/media, publish/unpublish, manage availability and enquiries.

No public signup. Single owner account for V1. No multi-tenant SaaS.

## P0 launch scope
Home, About, Services, Portfolio index/detail, Gallery, Videos, Testimonials, Media Kit, Blog index/detail, Booking, Contact, Privacy, Terms; secure owner login; structured CRUD; draft/preview/publish; Neon-backed content; Neon Object Storage; public availability; enquiry persistence; admin enquiry queue; SEO; accessibility; responsive UX; deployment and backup runbook.

## P1 / conditional
Media Kit PDF download if approved content is ready; basic privacy-conscious CTA event counts; bulk availability editing.

## Out of scope
Payments, deposits, invoices, contracts, e-signatures, Google Calendar sync, WhatsApp Business API, automatic booking confirmation, drag/drop page builder, public accounts, advanced CRM, multi-tenant SaaS, marketing automation.

## User journeys
Visitor: Home → Services → Portfolio → Booking → submit enquiry → reference/success.
Owner content: Login → editor → draft → preview → publish → public route updated.
Owner lead: Login → new enquiry → review → contact organizer externally → update status/private notes.
Availability: Owner sets state → public sees only date/status/public note.

## Success measures
Actual enquiry submissions, contact submissions and approved CTA click events only. Do not invent traffic, audience or event metrics.

## Definition of V1 complete
All P0 tests pass; owner can manage content without code; booking/contact records persist; anonymous users cannot read private records; storage credentials are not exposed; public availability reveals no internal details; production deployment, backup and rollback have been smoke-tested.
