import { z } from "zod";

/**
 * SIDD.WHIZZ — Enterprise 3-Plane RBAC, Feature Entitlement & Data Scope Schema
 *
 * Plane 1: Granular Permissions (Action Authorization)
 * Plane 2: Feature Entitlements (Module Availability)
 * Plane 3: Data Access Scope (Object / Tenant Boundary)
 */

export type LegacyPortalRole = "admin" | "client" | "member";

export type SystemRoleKey =
  | "super_admin"
  | "operations_admin"
  | "cms_publisher"
  | "cms_editor"
  | "organizer"
  | "member";

export type AccountStatus = "active" | "pending_approval" | "suspended" | "deactivated";

export type DataScope = "GLOBAL" | "ORGANIZATION" | "ASSIGNED" | "OWN";

export type PermissionModule =
  | "System & Security"
  | "Users"
  | "Roles & Entitlements"
  | "CMS"
  | "Media"
  | "Enquiries"
  | "Booking"
  | "Events & Tickets"
  | "Analytics & Finance"
  | "Data Governance";

export interface PermissionDefinition {
  key: PermissionKey;
  module: PermissionModule;
  label: string;
  description: string;
  isCritical: boolean;
}

export const PERMISSION_CATALOG = [
  // System & Security (Protected)
  {
    key: "super_admin.manage",
    module: "System & Security",
    label: "Super Admin Governance",
    description: "Full platform governance including managing other Super Admins.",
    isCritical: true,
  },
  {
    key: "security.settings.manage",
    module: "System & Security",
    label: "Security & Auth Policy",
    description: "Manage global session policies, rate limits, and security settings.",
    isCritical: true,
  },
  {
    key: "system.diagnostics.view",
    module: "System & Security",
    label: "Database & System Diagnostics",
    description: "View Neon PostgreSQL health, schema diagnostics, and server telemetry.",
    isCritical: false,
  },

  // Users
  {
    key: "user.view",
    module: "Users",
    label: "View Users Directory",
    description: "Inspect user accounts, profiles, verification state, and login timestamps.",
    isCritical: false,
  },
  {
    key: "user.invite",
    module: "Users",
    label: "Invite & Provision Users",
    description: "Invite new staff, organizers, or members into controlled roles.",
    isCritical: false,
  },
  {
    key: "user.approve_organizer",
    module: "Users",
    label: "Approve Organizer Applications",
    description: "Review, approve, or reject pending corporate/event organizer signups.",
    isCritical: false,
  },
  {
    key: "user.suspend",
    module: "Users",
    label: "Suspend / Reactivate Accounts",
    description: "Suspend, deactivate, reactivate accounts, and revoke active sessions.",
    isCritical: false,
  },
  {
    key: "user.assign_role",
    module: "Users",
    label: "Assign User Roles & Scopes",
    description: "Assign non-critical roles, permission overrides, and data scopes.",
    isCritical: false,
  },
  {
    key: "role.assign_super_admin",
    module: "Roles & Entitlements",
    label: "Assign Super Admin Role",
    description: "Grant or revoke Super Admin privileges (locked to Super Admin).",
    isCritical: true,
  },
  {
    key: "role.manage",
    module: "Roles & Entitlements",
    label: "Create & Edit Custom Roles",
    description: "Create custom roles, clone templates, and update role permissions.",
    isCritical: true,
  },
  {
    key: "feature.manage",
    module: "Roles & Entitlements",
    label: "Manage Feature Entitlements",
    description: "Enable or disable platform modules per role, organization, or user.",
    isCritical: false,
  },
  {
    key: "audit.view",
    module: "System & Security",
    label: "View Security & Audit Logs",
    description: "Inspect immutable security, access, and record change audit trails.",
    isCritical: false,
  },

  // CMS
  {
    key: "cms.view",
    module: "CMS",
    label: "View CMS Workspace",
    description: "Open CMS page trees, previews, and revision history.",
    isCritical: false,
  },
  {
    key: "cms.edit",
    module: "CMS",
    label: "Edit CMS Drafts & Styles",
    description: "Edit page section content, controlled design tokens, and save drafts.",
    isCritical: false,
  },
  {
    key: "cms.publish",
    module: "CMS",
    label: "Publish & Rollback Website",
    description: "Publish drafts to the live website, schedule releases, and rollback revisions.",
    isCritical: false,
  },
  {
    key: "cms.forms.manage",
    module: "CMS",
    label: "Manage Contact Form Builder",
    description: "Configure public contact form fields, validations, and routing.",
    isCritical: false,
  },

  // Media
  {
    key: "cms.manage_media",
    module: "Media",
    label: "Upload & Manage Media Assets",
    description: "Upload, organize, tag, crop, and replace stage photos, reels, and riders.",
    isCritical: false,
  },
  {
    key: "media.delete",
    module: "Media",
    label: "Delete Unused Media",
    description: "Delete unused media assets after passing CMS usage safeguards.",
    isCritical: false,
  },

  // Enquiries
  {
    key: "enquiries.view",
    module: "Enquiries",
    label: "View Contact Enquiries Inbox",
    description: "Read incoming event enquiries and contact form submissions.",
    isCritical: false,
  },
  {
    key: "enquiries.manage",
    module: "Enquiries",
    label: "Manage & Assign Enquiries",
    description: "Update lead status, add internal notes, assign staff, and convert to bookings.",
    isCritical: false,
  },

  // Booking
  {
    key: "booking.view",
    module: "Booking",
    label: "View Host Bookings",
    description: "View host booking requests, run-of-show schedules, and contracts within scope.",
    isCritical: false,
  },
  {
    key: "booking.create",
    module: "Booking",
    label: "Create Booking Request",
    description: "Submit new host/anchor booking requests.",
    isCritical: false,
  },
  {
    key: "booking.approve",
    module: "Booking",
    label: "Approve / Review Bookings",
    description: "Approve, request changes, or issue formal stage contracts.",
    isCritical: false,
  },
  {
    key: "booking.cancel",
    module: "Booking",
    label: "Cancel / Decline Bookings",
    description: "Cancel or decline booking engagements within authorized scope.",
    isCritical: false,
  },

  // Events & Tickets
  {
    key: "event.view",
    module: "Events & Tickets",
    label: "View Events",
    description: "View event schedules, capacities, and attendee operations.",
    isCritical: false,
  },
  {
    key: "event.create",
    module: "Events & Tickets",
    label: "Create & Edit Events",
    description: "Create or update event listings and run-of-show details.",
    isCritical: false,
  },
  {
    key: "event.publish",
    module: "Events & Tickets",
    label: "Publish Public Events",
    description: "Approve and publish events for attendee registration.",
    isCritical: false,
  },
  {
    key: "event.delete",
    module: "Events & Tickets",
    label: "Archive Events",
    description: "Archive or unpublish event listings safely.",
    isCritical: false,
  },
  {
    key: "ticket.register",
    module: "Events & Tickets",
    label: "Register & Access QR Passes",
    description: "Register for published events and manage attendee QR passes.",
    isCritical: false,
  },
  {
    key: "ticket.checkin",
    module: "Events & Tickets",
    label: "Verify & Check-In Tickets",
    description: "Validate attendee QR passes at venue gates.",
    isCritical: false,
  },

  // Analytics & Finance
  {
    key: "analytics.view",
    module: "Analytics & Finance",
    label: "View Web & Event Analytics",
    description: "Access traffic trends, conversion funnels, and audience insights.",
    isCritical: false,
  },
  {
    key: "analytics.export",
    module: "Analytics & Finance",
    label: "Export Analytics Reports",
    description: "Download CSV/PDF performance and conversion reports.",
    isCritical: false,
  },
  {
    key: "finance.view",
    module: "Analytics & Finance",
    label: "View Commercials & Invoices",
    description: "View booking fees, retainers, and invoice statuses within scope.",
    isCritical: false,
  },
  {
    key: "finance.manage",
    module: "Analytics & Finance",
    label: "Manage Retainers & Contracts",
    description: "Record advance payments, update commercial terms, and issue invoices.",
    isCritical: false,
  },
  {
    key: "finance.refund",
    module: "Analytics & Finance",
    label: "Authorize Refunds",
    description: "Approve commercial credit notes or ticket refunds.",
    isCritical: true,
  },

  // Data Governance
  {
    key: "data.records.manage",
    module: "Data Governance",
    label: "Controlled Record Archive & Restore",
    description: "Inspect, soft-delete (archive), and restore platform records safely.",
    isCritical: true,
  },
  {
    key: "data.export",
    module: "Data Governance",
    label: "Export Operational Datasets",
    description: "Export authorized CSV/JSON datasets with full audit logging.",
    isCritical: false,
  },
] as const;

export type PermissionKey = (typeof PERMISSION_CATALOG)[number]["key"];

export const ALL_PERMISSION_KEYS: PermissionKey[] = PERMISSION_CATALOG.map((p) => p.key);

export const CRITICAL_PERMISSION_KEYS = new Set<PermissionKey>(
  PERMISSION_CATALOG.filter((p) => p.isCritical).map((p) => p.key)
);

export const FEATURE_CATALOG = [
  {
    key: "feature.booking_management",
    label: "Booking Management",
    description: "Host booking requests, date locking, and run-of-show workflows.",
    staffOnly: false,
  },
  {
    key: "feature.event_management",
    label: "Event Management",
    description: "Event creation, venue specs, and publishing controls.",
    staffOnly: false,
  },
  {
    key: "feature.attendee_management",
    label: "Attendee Management",
    description: "Guest lists, VIP allocations, and check-in operations.",
    staffOnly: false,
  },
  {
    key: "feature.ticket_management",
    label: "Ticket Management",
    description: "QR-code passes, registration tiers, and attendee self-service.",
    staffOnly: false,
  },
  {
    key: "feature.team_management",
    label: "Team & Role Management",
    description: "User directory, role assignments, approvals, and team governance.",
    staffOnly: false,
  },
  {
    key: "feature.financial_management",
    label: "Financial Management",
    description: "Commercial contracts, advance retainers, and payout tracking.",
    staffOnly: false,
  },
  {
    key: "feature.analytics",
    label: "Analytics",
    description: "Traffic visualizations, conversion funnels, and audience insights.",
    staffOnly: false,
  },
  {
    key: "feature.reports",
    label: "Data Exports & Reports",
    description: "Controlled CSV/JSON dataset exports and operational summaries.",
    staffOnly: false,
  },
  {
    key: "feature.cms",
    label: "Website CMS (Authorized Staff Only)",
    description: "Public page editor, design tokens, media picker, and contact form builder.",
    staffOnly: true,
  },
] as const;

export type FeatureKey = (typeof FEATURE_CATALOG)[number]["key"];

export const ALL_FEATURE_KEYS: FeatureKey[] = FEATURE_CATALOG.map((f) => f.key);

export interface RoleRecord {
  id: string;
  key: string;
  name: string;
  description: string;
  isSystemProtected: boolean;
  status: "active" | "archived";
  permissions: PermissionKey[];
  defaultFeatures: FeatureKey[];
  defaultScope: DataScope;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_SYSTEM_ROLES: RoleRecord[] = [
  {
    id: "role_super_admin",
    key: "super_admin",
    name: "Super Admin",
    description: "Full platform, security, CMS publishing, financial, and user governance access.",
    isSystemProtected: true,
    status: "active",
    permissions: [...ALL_PERMISSION_KEYS],
    defaultFeatures: [...ALL_FEATURE_KEYS],
    defaultScope: "GLOBAL",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "role_operations_admin",
    key: "operations_admin",
    name: "Operations Admin",
    description: "Manages bookings, enquiries, events, organizer approvals, and operational teams.",
    isSystemProtected: true,
    status: "active",
    permissions: [
      "system.diagnostics.view",
      "user.view",
      "user.invite",
      "user.approve_organizer",
      "user.suspend",
      "user.assign_role",
      "audit.view",
      "cms.view",
      "cms.manage_media",
      "enquiries.view",
      "enquiries.manage",
      "booking.view",
      "booking.create",
      "booking.approve",
      "booking.cancel",
      "event.view",
      "event.create",
      "event.publish",
      "event.delete",
      "ticket.register",
      "ticket.checkin",
      "analytics.view",
      "analytics.export",
      "finance.view",
      "finance.manage",
      "data.export",
    ],
    defaultFeatures: [
      "feature.booking_management",
      "feature.event_management",
      "feature.attendee_management",
      "feature.ticket_management",
      "feature.team_management",
      "feature.financial_management",
      "feature.analytics",
      "feature.reports",
    ],
    defaultScope: "GLOBAL",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "role_cms_publisher",
    key: "cms_publisher",
    name: "CMS Publisher",
    description: "Reviews, approves, schedules, publishes, and rolls back public website content & forms.",
    isSystemProtected: true,
    status: "active",
    permissions: [
      "cms.view",
      "cms.edit",
      "cms.publish",
      "cms.forms.manage",
      "cms.manage_media",
      "media.delete",
      "analytics.view",
    ],
    defaultFeatures: ["feature.cms", "feature.analytics"],
    defaultScope: "GLOBAL",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "role_cms_editor",
    key: "cms_editor",
    name: "CMS Editor",
    description: "Edits public website drafts, uploads media, and previews pages without live publish rights.",
    isSystemProtected: true,
    status: "active",
    permissions: ["cms.view", "cms.edit", "cms.manage_media"],
    defaultFeatures: ["feature.cms"],
    defaultScope: "GLOBAL",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "role_organizer",
    key: "organizer",
    name: "Organizer",
    description: "Approved corporate brand or event agency managing their own host bookings & event attendees.",
    isSystemProtected: true,
    status: "active",
    permissions: [
      "booking.view",
      "booking.create",
      "booking.cancel",
      "event.view",
      "event.create",
      "ticket.register",
      "ticket.checkin",
      "finance.view",
      "analytics.view",
    ],
    defaultFeatures: [
      "feature.booking_management",
      "feature.event_management",
      "feature.attendee_management",
      "feature.ticket_management",
      "feature.financial_management",
    ],
    defaultScope: "ORGANIZATION",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "role_member",
    key: "member",
    name: "Member",
    description: "Community delegate or event attendee with personal QR passes and profile access.",
    isSystemProtected: true,
    status: "active",
    permissions: ["event.view", "ticket.register"],
    defaultFeatures: ["feature.ticket_management"],
    defaultScope: "OWN",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

export interface UserPermissionOverride {
  permissionKey: PermissionKey;
  effect: "allow" | "deny";
  reason: string;
  grantedBy: string;
  createdAt: string;
}

export interface FeatureEntitlementRule {
  id: string;
  featureKey: FeatureKey;
  targetType: "global" | "role" | "organization" | "user";
  targetId: string;
  isEnabled: boolean;
  updatedBy?: string;
  updatedAt: string;
}

/**
 * Maps granular RBAC role keys to existing 3-portal navigation ("admin" | "client" | "member")
 * so all existing UI portals (/admin, /organizer, /profile) work seamlessly.
 */
export function mapRoleKeysToPortalRole(roleKeys: string[]): LegacyPortalRole {
  const staffRoles = new Set(["super_admin", "operations_admin", "cms_publisher", "cms_editor", "admin"]);
  if (roleKeys.some((r) => staffRoles.has(r))) return "admin";
  if (roleKeys.includes("organizer") || roleKeys.includes("client")) return "client";
  return "member";
}

export function isStaffRoleKey(roleKey: string): boolean {
  return ["super_admin", "operations_admin", "cms_publisher", "cms_editor", "admin"].includes(roleKey);
}

/**
 * Plane 1 Evaluator: Effective Permissions = (Union of Active Assigned Role Permissions + Explicit Allow) - Explicit Deny
 * Protected Invariant: Active `super_admin` always retains `super_admin.manage` to prevent accidental self-lockout.
 */
export function computeEffectivePermissions(params: {
  assignedRoles: RoleRecord[];
  overrides: UserPermissionOverride[];
}): PermissionKey[] {
  const isSuperAdmin = params.assignedRoles.some(
    (r) => r.key === "super_admin" && r.status === "active"
  );

  const allowed = new Set<PermissionKey>();
  for (const role of params.assignedRoles) {
    if (role.status !== "active") continue;
    for (const perm of role.permissions) {
      allowed.add(perm);
    }
  }

  for (const ov of params.overrides) {
    if (ov.effect === "allow") {
      allowed.add(ov.permissionKey);
    }
  }

  for (const ov of params.overrides) {
    if (ov.effect === "deny") {
      if (isSuperAdmin && CRITICAL_PERMISSION_KEYS.has(ov.permissionKey)) {
        continue; // Cannot strip core security locks from an active Super Admin via override
      }
      allowed.delete(ov.permissionKey);
    }
  }

  return Array.from(allowed);
}

/**
 * Plane 2 Evaluator: Hierarchical Feature Entitlements
 * Precedence: User Override -> Organization Override -> Role Default -> Global Flag
 * Staff-only features (`feature.cms`) are never granted to non-staff accounts.
 */
export function computeEffectiveFeatures(params: {
  assignedRoles: RoleRecord[];
  organizationIds: string[];
  userId: string;
  rules: FeatureEntitlementRule[];
}): FeatureKey[] {
  const hasStaffRole = params.assignedRoles.some((r) => isStaffRoleKey(r.key) && r.status === "active");
  const enabled = new Set<FeatureKey>();

  // 1. Seed from assigned active roles
  for (const role of params.assignedRoles) {
    if (role.status !== "active") continue;
    for (const f of role.defaultFeatures) {
      enabled.add(f);
    }
  }

  // 2. Apply role-level rules
  const roleKeys = new Set(params.assignedRoles.map((r) => r.key));
  for (const rule of params.rules) {
    if (rule.targetType === "global") {
      if (!rule.isEnabled) enabled.delete(rule.featureKey);
    } else if (rule.targetType === "role" && roleKeys.has(rule.targetId)) {
      if (rule.isEnabled) enabled.add(rule.featureKey);
      else enabled.delete(rule.featureKey);
    }
  }

  // 3. Apply organization-level rules
  const orgSet = new Set(params.organizationIds);
  for (const rule of params.rules) {
    if (rule.targetType === "organization" && orgSet.has(rule.targetId)) {
      if (rule.isEnabled) enabled.add(rule.featureKey);
      else enabled.delete(rule.featureKey);
    }
  }

  // 4. Apply user-level rules (highest specificity)
  for (const rule of params.rules) {
    if (rule.targetType === "user" && rule.targetId === params.userId) {
      if (rule.isEnabled) enabled.add(rule.featureKey);
      else enabled.delete(rule.featureKey);
    }
  }

  // Enforce staffOnly boundary on CMS
  if (!hasStaffRole) {
    for (const def of FEATURE_CATALOG) {
      if (def.staffOnly) enabled.delete(def.key);
    }
  }

  return Array.from(enabled);
}

/**
 * Plane 3 Evaluator: Object / Tenant Data Scope Check
 */
export function checkObjectScopeAccess(params: {
  actorId: string;
  actorScope: DataScope;
  actorOrgIds: string[];
  actorScopedEventIds?: string[] | undefined;
  resourceOwnerUserId?: string | null | undefined;
  resourceOrgId?: string | null | undefined;
  resourceAssignedUserId?: string | null | undefined;
  resourceEventId?: string | null | undefined;
}): boolean {
  if (params.actorScope === "GLOBAL") return true;

  if (params.actorScope === "ORGANIZATION") {
    if (params.resourceOrgId && params.actorOrgIds.includes(params.resourceOrgId)) {
      return true;
    }
    if (params.resourceOwnerUserId && params.resourceOwnerUserId === params.actorId) {
      return true;
    }
    return false;
  }

  if (params.actorScope === "ASSIGNED") {
    if (params.resourceAssignedUserId && params.resourceAssignedUserId === params.actorId) {
      return true;
    }
    if (
      params.resourceEventId &&
      params.actorScopedEventIds &&
      params.actorScopedEventIds.includes(params.resourceEventId)
    ) {
      return true;
    }
    if (params.resourceOwnerUserId && params.resourceOwnerUserId === params.actorId) {
      return true;
    }
    return false;
  }

  // OWN scope
  return Boolean(params.resourceOwnerUserId && params.resourceOwnerUserId === params.actorId);
}

/**
 * Anti-Escalation & Anti-Lockout Invariants
 */
export function validateSuperAdminInvariants(params: {
  actorId: string;
  actorIsSuperAdmin: boolean;
  targetUserId: string;
  targetCurrentlySuperAdmin: boolean;
  nextRoleKeys?: string[] | undefined;
  nextAccountStatus?: AccountStatus | undefined;
  requestedCriticalPermissions?: PermissionKey[] | undefined;
  activeSuperAdminCount: number;
}): { ok: true } | { ok: false; error: string } {
  // Rule 1: Nobody can self-escalate their own roles or critical permissions unless already Super Admin
  if (params.actorId === params.targetUserId && !params.actorIsSuperAdmin && params.nextRoleKeys) {
    return {
      ok: false,
      error: "Security policy forbids modifying your own role assignments.",
    };
  }

  // Rule 2: Non-Super-Admins cannot touch existing Super Admin accounts or grant super_admin / critical permissions
  if (!params.actorIsSuperAdmin) {
    if (params.targetCurrentlySuperAdmin) {
      return {
        ok: false,
        error: "Only a Super Admin can modify or suspend a Super Admin account.",
      };
    }
    if (params.nextRoleKeys?.includes("super_admin")) {
      return {
        ok: false,
        error: "Only an existing Super Admin can assign the Super Admin role.",
      };
    }
    if (params.requestedCriticalPermissions && params.requestedCriticalPermissions.length > 0) {
      return {
        ok: false,
        error: `Protected critical permissions (${params.requestedCriticalPermissions.join(", ")}) require Super Admin authorization.`,
      };
    }
  }

  // Rule 3: Never allow demoting, suspending, or deactivating the LAST active Super Admin
  if (params.targetCurrentlySuperAdmin && params.activeSuperAdminCount <= 1) {
    const removingSuperAdminRole =
      params.nextRoleKeys !== undefined && !params.nextRoleKeys.includes("super_admin");
    const disablingAccount =
      params.nextAccountStatus !== undefined && params.nextAccountStatus !== "active";

    if (removingSuperAdminRole || disablingAccount) {
      return {
        ok: false,
        error: "Anti-lockout safeguard: Cannot demote or suspend the last active Super Admin account.",
      };
    }
  }

  return { ok: true };
}

// ============================================================================
// ZOD VALIDATION CONTRACTS (Shared Client + Server Trust Boundary Schemas)
// ============================================================================

export const LoginInputSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(255),
  password: z.string().min(1, "Password is required.").max(256),
});

export const MemberSignupInputSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(255),
  password: z.string().min(8, "Password must be at least 8 characters.").max(256),
  phone: z.string().trim().max(32).optional(),
});

export const OrganizerApplicationInputSchema = z.object({
  name: z.string().trim().min(2, "Contact name is required.").max(120),
  email: z.string().trim().email("Official work email is required.").max(255),
  password: z.string().min(8, "Password must be at least 8 characters.").max(256),
  phone: z.string().trim().min(7, "Contact phone number is required.").max(32),
  organizationName: z.string().trim().min(2, "Company or agency name is required.").max(160),
  organizationType: z
    .enum([
      "Corporate Brand",
      "Event Management Agency",
      "Tech Summit / Conference",
      "Festival / Live Promoter",
      "Luxury Wedding / Family Office",
      "University / Institution",
    ])
    .default("Corporate Brand"),
  websiteOrSocial: z.string().trim().max(255).optional(),
  expectedEventFormats: z.array(z.string().trim().max(80)).max(8).default([]),
  notes: z.string().trim().max(1000).optional(),
});

export const InviteProvisionUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(32).optional(),
  organizationName: z.string().trim().max(160).optional(),
  roleKeys: z.array(z.string().trim().min(2).max(64)).min(1),
  dataScope: z.enum(["GLOBAL", "ORGANIZATION", "ASSIGNED", "OWN"]),
  temporaryPassword: z.string().min(8).max(256).optional(),
  emailVerified: z.boolean().default(true),
});

export const UpdateUserStatusSchema = z.object({
  userId: z.string().min(2).max(64),
  status: z.enum(["active", "suspended", "deactivated"]),
  reason: z.string().trim().min(5, "Audit reason (min 5 characters) is required.").max(500),
});

export const ReviewOrganizerApplicationSchema = z.object({
  applicationId: z.string().min(2).max(64),
  decision: z.enum(["approved", "changes_requested", "rejected"]),
  reason: z.string().trim().min(4, "Review note is required.").max(500),
});

export const UpdateUserAccessSchema = z.object({
  userId: z.string().min(2).max(64),
  roleKeys: z.array(z.string().min(2).max(64)).min(1),
  dataScope: z.enum(["GLOBAL", "ORGANIZATION", "ASSIGNED", "OWN"]),
  organizationIds: z.array(z.string().max(64)).default([]),
  scopedEventIds: z.array(z.string().max(64)).default([]),
  permissionOverrides: z
    .array(
      z.object({
        permissionKey: z.string() as z.ZodType<PermissionKey>,
        effect: z.enum(["allow", "deny"]),
        reason: z.string().trim().min(3).max(300),
      })
    )
    .default([]),
  userFeatureOverrides: z
    .array(
      z.object({
        featureKey: z.string() as z.ZodType<FeatureKey>,
        isEnabled: z.boolean(),
      })
    )
    .default([]),
  auditNote: z.string().trim().max(400).optional(),
});

export const SaveRoleDefinitionSchema = z.object({
  id: z.string().max(64).optional(),
  key: z
    .string()
    .trim()
    .min(2)
    .max(48)
    .regex(/^[a-z0-9_]+$/, "Role key must be lowercase letters, numbers, and underscores."),
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().min(4).max(300),
  status: z.enum(["active", "archived"]).default("active"),
  permissions: z.array(z.string() as z.ZodType<PermissionKey>),
  defaultFeatures: z.array(z.string() as z.ZodType<FeatureKey>),
  defaultScope: z.enum(["GLOBAL", "ORGANIZATION", "ASSIGNED", "OWN"]),
});

export const ToggleFeatureEntitlementSchema = z.object({
  featureKey: z.string() as z.ZodType<FeatureKey>,
  targetType: z.enum(["global", "role", "organization", "user"]),
  targetId: z.string().min(1).max(64),
  isEnabled: z.boolean(),
});

export const ControlledRecordActionSchema = z.object({
  entityType: z.enum([
    "users",
    "organizations",
    "bookings",
    "events",
    "enquiries",
    "social_accounts",
  ]),
  recordId: z.string().min(1).max(64),
  action: z.enum(["archive", "restore", "export_log"]),
  reason: z.string().trim().min(5, "Provide an audit reason (min 5 characters).").max(500),
});

