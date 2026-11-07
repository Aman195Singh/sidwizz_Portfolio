import { describe, expect, it } from "vitest";
import {
  DEFAULT_SYSTEM_ROLES,
  checkObjectScopeAccess,
  computeEffectiveFeatures,
  computeEffectivePermissions,
  validateSuperAdminInvariants,
  type FeatureEntitlementRule,
} from "@/lib/rbac-schema";
import {
  checkServerRateLimit,
  generateSecureToken,
  hashPassword,
  verifyPassword,
} from "@/lib/server-crypto";
import { getLiveNeonTables } from "@/lib/db";

describe("Milestone 1 — Security, Cryptography & 3-Plane RBAC Invariants", () => {
  it("hashes and verifies passwords with salted PBKDF2-HMAC-SHA256 and rejects wrong secrets", async () => {
    const secret = "StageAnchor#2026!Secure";
    const hash1 = await hashPassword(secret);
    const hash2 = await hashPassword(secret);

    expect(hash1).toMatch(/^pbkdf2_sha256\$210000\$/);
    // Unique random salt guarantees distinct hashes for identical passwords
    expect(hash1).not.toBe(hash2);

    expect(await verifyPassword(secret, hash1)).toBe(true);
    expect(await verifyPassword("WrongPassword123!", hash1)).toBe(false);
    expect(await verifyPassword(secret, "malformed_hash")).toBe(false);
  });

  it("enforces sliding-window rate limits and generates high-entropy tokens", () => {
    const token = generateSecureToken(24);
    expect(token.length).toBeGreaterThanOrEqual(32);

    const bucketKey = `test-login-${Date.now()}`;
    expect(checkServerRateLimit({ key: bucketKey, maxRequests: 2, windowMs: 60_000 }).allowed).toBe(
      true
    );
    expect(checkServerRateLimit({ key: bucketKey, maxRequests: 2, windowMs: 60_000 }).allowed).toBe(
      true
    );
    const third = checkServerRateLimit({ key: bucketKey, maxRequests: 2, windowMs: 60_000 });
    expect(third.allowed).toBe(false);
    expect(third.retryAfterSec).toBeGreaterThan(0);
  });

  it("computes Plane 1 effective permissions with explicit DENY precedence and Super Admin lock protection", () => {
    const opsRole = DEFAULT_SYSTEM_ROLES.find((r) => r.key === "operations_admin")!;
    const cmsEditorRole = DEFAULT_SYSTEM_ROLES.find((r) => r.key === "cms_editor")!;
    const superAdminRole = DEFAULT_SYSTEM_ROLES.find((r) => r.key === "super_admin")!;

    const staffEffective = computeEffectivePermissions({
      assignedRoles: [opsRole, cmsEditorRole],
      overrides: [
        {
          permissionKey: "cms.publish",
          effect: "allow",
          reason: "Temporary release lead",
          grantedBy: "admin@siddwhizz.com",
          createdAt: "2026-11-07T00:00:00Z",
        },
        {
          permissionKey: "user.suspend",
          effect: "deny",
          reason: "Restricted during onboarding",
          grantedBy: "admin@siddwhizz.com",
          createdAt: "2026-11-07T00:00:00Z",
        },
      ],
    });

    expect(staffEffective).toContain("cms.edit");
    expect(staffEffective).toContain("cms.publish");
    expect(staffEffective).not.toContain("user.suspend");

    // Critical permissions cannot be stripped from an active Super Admin via deny override
    const saEffective = computeEffectivePermissions({
      assignedRoles: [superAdminRole],
      overrides: [
        {
          permissionKey: "super_admin.manage",
          effect: "deny",
          reason: "Accidental lockout attempt",
          grantedBy: "admin@siddwhizz.com",
          createdAt: "2026-11-07T00:00:00Z",
        },
      ],
    });
    expect(saEffective).toContain("super_admin.manage");
    expect(saEffective).toContain("role.manage");
  });

  it("enforces Plane 2 hierarchical feature entitlements and blocks non-staff from Website CMS", () => {
    const organizerRole = DEFAULT_SYSTEM_ROLES.find((r) => r.key === "organizer")!;
    const editorRole = DEFAULT_SYSTEM_ROLES.find((r) => r.key === "cms_editor")!;

    const rules: FeatureEntitlementRule[] = [
      {
        id: "r1",
        featureKey: "feature.cms",
        targetType: "user",
        targetId: "usr_org_1",
        isEnabled: true,
        updatedBy: "admin@siddwhizz.com",
        updatedAt: "2026-11-07T00:00:00Z",
      },
      {
        id: "r2",
        featureKey: "feature.financial_management",
        targetType: "organization",
        targetId: "org_1",
        isEnabled: false,
        updatedBy: "admin@siddwhizz.com",
        updatedAt: "2026-11-07T00:00:00Z",
      },
    ];

    const orgUserFeatures = computeEffectiveFeatures({
      assignedRoles: [organizerRole],
      organizationIds: ["org_1"],
      userId: "usr_org_1",
      rules,
    });

    // Organizer never gets staffOnly Website CMS even if a user rule attempts to enable it
    expect(orgUserFeatures).not.toContain("feature.cms");
    // Organization-level disable removes financial_management
    expect(orgUserFeatures).not.toContain("feature.financial_management");
    expect(orgUserFeatures).toContain("feature.booking_management");

    const staffFeatures = computeEffectiveFeatures({
      assignedRoles: [editorRole],
      organizationIds: [],
      userId: "usr_editor_1",
      rules: [],
    });
    expect(staffFeatures).toContain("feature.cms");
  });

  it("enforces Plane 3 object-level data scopes (IDOR prevention across tenants and attendees)", () => {
    // Organization A cannot access Organization B's booking
    expect(
      checkObjectScopeAccess({
        actorId: "usr_priya",
        actorScope: "ORGANIZATION",
        actorOrgIds: ["org_techcorp"],
        resourceOrgId: "org_rival_agency",
        resourceOwnerUserId: "usr_other",
      })
    ).toBe(false);

    // Organization A CAN access Organization A's booking
    expect(
      checkObjectScopeAccess({
        actorId: "usr_priya",
        actorScope: "ORGANIZATION",
        actorOrgIds: ["org_techcorp"],
        resourceOrgId: "org_techcorp",
      })
    ).toBe(true);

    // ASSIGNED coordinator can only access scoped event IDs
    expect(
      checkObjectScopeAccess({
        actorId: "usr_coord",
        actorScope: "ASSIGNED",
        actorOrgIds: [],
        actorScopedEventIds: ["EVT-101"],
        resourceEventId: "EVT-101",
      })
    ).toBe(true);
    expect(
      checkObjectScopeAccess({
        actorId: "usr_coord",
        actorScope: "ASSIGNED",
        actorOrgIds: [],
        actorScopedEventIds: ["EVT-101"],
        resourceEventId: "EVT-999",
      })
    ).toBe(false);

    // OWN attendee scope strictly restricts to own user ID
    expect(
      checkObjectScopeAccess({
        actorId: "usr_amit",
        actorScope: "OWN",
        actorOrgIds: [],
        resourceOwnerUserId: "usr_amit",
      })
    ).toBe(true);
    expect(
      checkObjectScopeAccess({
        actorId: "usr_amit",
        actorScope: "OWN",
        actorOrgIds: [],
        resourceOwnerUserId: "usr_someone_else",
      })
    ).toBe(false);
  });

  it("blocks privilege escalation and protects the last active Super Admin from lockout", () => {
    // Non-Super-Admin cannot assign super_admin
    const escalationAttempt = validateSuperAdminInvariants({
      actorId: "usr_ops",
      actorIsSuperAdmin: false,
      targetUserId: "usr_new",
      targetCurrentlySuperAdmin: false,
      nextRoleKeys: ["super_admin"],
      activeSuperAdminCount: 1,
    });
    expect(escalationAttempt.ok).toBe(false);

    // Non-Super-Admin cannot modify their own roles
    const selfEditAttempt = validateSuperAdminInvariants({
      actorId: "usr_ops",
      actorIsSuperAdmin: false,
      targetUserId: "usr_ops",
      targetCurrentlySuperAdmin: false,
      nextRoleKeys: ["operations_admin", "cms_publisher"],
      activeSuperAdminCount: 1,
    });
    expect(selfEditAttempt.ok).toBe(false);

    // Last active Super Admin cannot be demoted or suspended even by themselves
    const lockoutDemote = validateSuperAdminInvariants({
      actorId: "usr_sid",
      actorIsSuperAdmin: true,
      targetUserId: "usr_sid",
      targetCurrentlySuperAdmin: true,
      nextRoleKeys: ["operations_admin"],
      activeSuperAdminCount: 1,
    });
    expect(lockoutDemote.ok).toBe(false);

    const lockoutSuspend = validateSuperAdminInvariants({
      actorId: "usr_sid",
      actorIsSuperAdmin: true,
      targetUserId: "usr_sid",
      targetCurrentlySuperAdmin: true,
      nextAccountStatus: "suspended",
      activeSuperAdminCount: 1,
    });
    expect(lockoutSuspend.ok).toBe(false);
  });

  it("keeps client database metadata sanitized with zero leaked Neon credentials", () => {
    const tables = getLiveNeonTables();
    const serialized = JSON.stringify(tables);
    expect(tables.some((t) => t.name === "audit_logs")).toBe(true);
    expect(serialized).not.toContain("neondb_owner");
    expect(serialized).not.toContain("npg_");
    expect(serialized).not.toContain("ep-cool-morning");
  });
});

