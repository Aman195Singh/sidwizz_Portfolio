# 11 — API Contracts and Validation

## Public actions
`submitBookingEnquiry`, `submitContactMessage`.

## Public queries
`getPublishedServices`, `getPublishedEvents`, `getPublishedEventBySlug`, `getPublicGallery`, `getPublishedVideos`, `getApprovedTestimonials`, `getPublishedBlogPosts`, `getPublishedBlogPostBySlug`, `getPublicAvailability`.

## Admin actions
CRUD content; upload authorization; set availability; update booking/contact status; publish/unpublish. Every privileged mutation calls `requireOwner()`.

## Validation
Zod at server boundary. Trim strings, max lengths, lowercase email, validate URL protocol, slug format and collision, date/timezone, rich-text node allowlist, provider ID, upload MIME/extension/size/object key. Never accept public `status`, `owner_notes`, `reference_code`, `user_id` or `role`.

## Error codes
VALIDATION_ERROR, UNAUTHENTICATED, FORBIDDEN, NOT_FOUND, CONFLICT, RATE_LIMITED, UPLOAD_REJECTED, PROVIDER_FAILURE, INTERNAL_ERROR.

## Revalidation
Revalidate only affected public paths after publish/unpublish. Admin and preview never cached publicly.
