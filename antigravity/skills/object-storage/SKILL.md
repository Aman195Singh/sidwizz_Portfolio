---
name: neon-object-storage
description: Safely implement Neon S3-compatible Object Storage uploads and public/private media lifecycle.
---
# Neon Object Storage Skill
1. Verify Neon Object Storage GA, region, endpoint, pricing, bucket access mode and scoped credential docs.
2. Create separate public and private buckets where supported/appropriate.
3. Keep S3 secrets server-only.
4. Use short-lived presigned upload URLs or server streaming.
5. Generate random object keys and enforce MIME/size/signature checks.
6. Verify uploaded object before DB metadata insert.
7. Require owner rights approval before publishing.
8. Prevent deleting referenced objects.
9. Test private access, URL expiry, unauthorized upload and orphan cleanup.
10. Document backup/export strategy separately from DB backup.
