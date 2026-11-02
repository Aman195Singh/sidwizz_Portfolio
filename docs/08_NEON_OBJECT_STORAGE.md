# 08 — Neon Object Storage Specification

## Selected service
Neon Object Storage, S3-compatible. Confirm current General Availability status, region, bucket configuration, credential scopes, pricing, storage and egress allowance in Neon Console before implementation/production.

## Use cases
Public approved website images, gallery photos, posters, downloadable public media kit. Private originals or unreleased documents should use private bucket/access mode and never be exposed through public URLs.

## Bucket design
- `siddwhizz-public`: only approved public assets; public-read only if owner accepts public URL access.
- `siddwhizz-private`: private source files and restricted assets.
Use separate credentials/scopes where possible. Do not assume S3 ACL/bucket policy APIs are supported identically; Neon controls bucket visibility/access through Neon configuration.

## Credentials
Use scoped Neon storage credentials with least privilege. Keep S3 access key/secret server-only. Never send secret credentials to browser.

## Upload flow
1. Owner authenticated and authorized.
2. Client asks server for upload authorization.
3. Server validates declared MIME/size and generates random object key.
4. Server creates short-lived presigned PUT URL or streams file server-side.
5. Browser uploads directly to S3 endpoint.
6. Server verifies object exists, size/type metadata and ownership context.
7. Insert/update `media_assets` row with object key and rights state `pending`.
8. Owner adds alt text/caption and confirms rights.
9. Only `approved` assets can be attached to published content.

## Allowed media
Images: JPEG, PNG, WebP, AVIF. SVG disallowed unless sanitized through a trusted pipeline. PDF only for approved press kit. V1 videos should be external YouTube/Vimeo embeds; avoid large video uploads.

## Security and lifecycle
- Set size limits in app and storage configuration.
- Validate MIME and extension; inspect file signature where feasible.
- Generate object keys; do not use original filename as key.
- Strip EXIF/GPS from public images where feasible.
- Do not delete object while referenced by published content.
- Deletion workflow: check references → detach/archive → delete DB record → delete object, with recovery strategy.
- Use short-lived signed GET URLs for private objects.
- Public URLs must not reveal private bucket objects.
- Test anon read, owner upload, unauthorized upload, private object access, expired URL and orphan cleanup.
