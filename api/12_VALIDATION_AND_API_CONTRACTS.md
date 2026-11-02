# 12 — API Contracts

Public: `submitBookingEnquiry`, `submitContactMessage`; public published-content queries; `getPublicAvailability`.
Admin: CRUD, upload presign/verification, set availability, update lead status/notes, publish/unpublish.
Every admin operation validates Better Auth session and owner profile server-side.

Never accept public `status`, `owner_notes`, `reference_code`, `user_id`, `role`, storage object key or arbitrary provider URL without server validation.

Use Zod at trust boundaries. Rich text allowlists nodes. Validate email, URL protocol, date/timezone, slug, provider ID, file MIME/size/signature and object key. Persist form record before notification. Return safe errors only.
