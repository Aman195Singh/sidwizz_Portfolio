# 10 — Booking and Contact Workflows

## Booking fields
Required: organizer name, email, event date, event type, city, message, consent. Optional: phone/WhatsApp, venue, audience estimate. Strict max lengths.

## Submit flow
Client validation → server Zod validation → honeypot/rate limit → reject past date in Asia/Kolkata → read availability as advisory → create record with server-generated reference and status `new` → return reference → attempt owner notification email.
Persist enquiry before sending email. Email failure must not lose the record.

## Availability
Available/Tentative/Unavailable. Missing date row means “Check with us”. Public API returns no event/client/venue/internal note. No booking hold or concurrency guarantee exists in V1.

## Confirmation
Enquiry submission is not a confirmed booking. Owner must separately agree with organizer. Do not send confirmation language automatically.

## Contact
Persist before notification. Public user receives generic success; never show database/provider error. Add spam controls and retention policy.

## Duplicates
Disable submit while pending. Consider idempotency token or duplicate heuristic; do not silently discard submissions.
