# 12 — Security Threat Model

Assets: Neon DB, Better Auth sessions, owner account, private enquiries, unpublished content, private media, Neon storage credentials, email credentials.

Threats/controls:
- Broken access control/IDOR: server-side owner checks on every mutation and record scope checks.
- Public signup abuse: disable signup; provision owner securely.
- Session theft: secure cookies, HTTPS, short session policy, secret rotation and logout tests.
- CSRF/origin: trusted origins and framework protections; validate origin on custom cookie-auth mutations.
- SQL injection: parameterized Drizzle queries; never concatenate user SQL.
- XSS: structured rich text, safe URL allowlist, no arbitrary iframe/HTML.
- Upload abuse: size/type/signature checks, random object key, private defaults, short-lived presigned URLs.
- Secret leakage: server-only env, gitignore, secret scan, rotate on exposure.
- Spam/DoS: rate limit forms/login, honeypot, body limits, pagination.
- Data exposure: explicit public projections, no raw private rows in RSC props, test public endpoints.
- Storage exposure: bucket access mode, scoped creds, signed URLs, no S3 secrets in browser.

Release gate: no critical/high issue; test public vs owner access, upload permissions, session expiry, secret scan and private field leakage.
