import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Archive,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Database,
  Download,
  Edit3,
  Eye,
  EyeOff,
  FileJson,
  Filter,
  Globe,
  KeyRound,
  Layers,
  Lock,
  LogOut,
  Mail,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  adminRevokeSessionsServerFn,
  controlledRecordActionServerFn,
  getUserManagementSnapshotServerFn,
  inviteOrProvisionUserServerFn,
  reviewOrganizerApplicationServerFn,
  saveRoleDefinitionServerFn,
  toggleFeatureEntitlementServerFn,
  updateUserAccessControlServerFn,
  updateUserStatusServerFn,
  type ActiveSessionRecord,
  type AuditLogEntry,
  type ControlledGovernanceRecord,
  type OrganizationRecord,
  type OrganizerApplicationRecord,
  type PublicAdminUserDTO,
} from "@/lib/auth-server";
import {
  CRITICAL_PERMISSION_KEYS,
  FEATURE_CATALOG,
  isStaffRoleKey,
  PERMISSION_CATALOG,
  type AccountStatus,
  type DataScope,
  type FeatureEntitlementRule,
  type FeatureKey,
  type PermissionKey,
  type PermissionModule,
  type RoleRecord,
} from "@/lib/rbac-schema";

export type UserManagementSection =
  | "overview"
  | "directory"
  | "approvals"
  | "roles"
  | "features"
  | "scopes"
  | "governance"
  | "audit"
  | "security";

type DirectorySubFilter = "all" | "staff" | "organizers" | "members" | "suspended";

type UserDrawerTab =
  | "overview"
  | "roles"
  | "permissions"
  | "features"
  | "scopes"
  | "activity"
  | "security";

type EnrichedRoleRecord = RoleRecord & {
  assignedUserCount: number;
  assignedAvatars: Array<{ id: string; name: string; avatar?: string | undefined }>;
};

interface SnapshotData {
  users: PublicAdminUserDTO[];
  roles: EnrichedRoleRecord[];
  featureRules: FeatureEntitlementRule[];
  organizations: OrganizationRecord[];
  applications: OrganizerApplicationRecord[];
  activeSessions: Array<Omit<ActiveSessionRecord, "tokenHash">>;
  auditLogs: AuditLogEntry[];
  controlledRecords: ControlledGovernanceRecord[];
}

const PERMISSION_MODULES: PermissionModule[] = [
  "System & Security",
  "Users",
  "Roles & Entitlements",
  "CMS",
  "Media",
  "Enquiries",
  "Booking",
  "Events & Tickets",
  "Analytics & Finance",
  "Data Governance",
];

const ROLE_PRESET_TEMPLATES: Array<{
  label: string;
  key: string;
  name: string;
  description: string;
  defaultScope: DataScope;
  permissions: PermissionKey[];
  defaultFeatures: FeatureKey[];
}> = [
  {
    label: "Stage Coordinator",
    key: "stage_coordinator",
    name: "Stage Coordinator",
    description: "Assigned event logistics, attendee check-in, and technical rider coordination.",
    defaultScope: "ASSIGNED",
    permissions: [
      "booking.view",
      "event.view",
      "ticket.register",
      "ticket.checkin",
      "cms.manage_media",
    ],
    defaultFeatures: [
      "feature.booking_management",
      "feature.event_management",
      "feature.attendee_management",
      "feature.ticket_management",
    ],
  },
  {
    label: "Finance & Contracts Controller",
    key: "finance_controller",
    name: "Finance Controller",
    description: "Commercial contracts, advance retainers, invoices, and revenue exports.",
    defaultScope: "GLOBAL",
    permissions: [
      "booking.view",
      "enquiries.view",
      "finance.view",
      "finance.manage",
      "analytics.view",
      "analytics.export",
      "data.export",
    ],
    defaultFeatures: [
      "feature.booking_management",
      "feature.financial_management",
      "feature.analytics",
      "feature.reports",
    ],
  },
  {
    label: "PR & Brand Press Manager",
    key: "press_manager",
    name: "Press & Media Manager",
    description: "Drafts press bios, manages stage media assets, and prepares CMS updates.",
    defaultScope: "GLOBAL",
    permissions: ["cms.view", "cms.edit", "cms.manage_media"],
    defaultFeatures: ["feature.cms", "feature.analytics"],
  },
];

function formatShortDate(iso?: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  const first = parts[0]?.[0] ?? "U";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

function downloadCsvFile(filename: string, headers: string[], rows: string[][]): void {
  const escapeCell = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.map(escapeCell).join(","), ...rows.map((r) => r.map(escapeCell).join(","))].join(
    "\n"
  );
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function StatusBadge({ status }: { status: AccountStatus }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
        Active
      </span>
    );
  }
  if (status === "pending_approval") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
        Pending Review
      </span>
    );
  }
  if (status === "suspended") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[11px] font-bold text-rose-700">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
        Suspended
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-300 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
      Deactivated
    </span>
  );
}

function ScopeBadge({ scope }: { scope: DataScope }) {
  const styles: Record<DataScope, string> = {
    GLOBAL: "bg-primary/10 text-primary border-primary/25",
    ORGANIZATION: "bg-indigo-50 text-indigo-700 border-indigo-200",
    ASSIGNED: "bg-amber-50 text-amber-700 border-amber-200",
    OWN: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 font-display text-[10px] font-extrabold uppercase tracking-wider ${styles[scope]}`}
    >
      {scope}
    </span>
  );
}

export function AdminUserManagement({
  onPendingCountChange,
}: {
  onPendingCountChange?: (count: number) => void;
}) {
  const { user: currentUser, hasPermission, refreshSession } = useAuth();

  const [activeSection, setActiveSection] = useState<UserManagementSection>("overview");
  const [snapshot, setSnapshot] = useState<SnapshotData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Directory filters
  const [dirSubFilter, setDirSubFilter] = useState<DirectorySubFilter>("all");
  const [userSearch, setUserSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Invite / Provision Modal state
  const [inviteOpen, setInviteOpen] = useState<boolean>(false);
  const [invName, setInvName] = useState<string>("");
  const [invEmail, setInvEmail] = useState<string>("");
  const [invPhone, setInvPhone] = useState<string>("");
  const [invOrg, setInvOrg] = useState<string>("");
  const [invRoleKeys, setInvRoleKeys] = useState<string[]>(["operations_admin"]);
  const [invScope, setInvScope] = useState<DataScope>("GLOBAL");
  const [invTempPassword, setInvTempPassword] = useState<string>("");
  const [showTempPass, setShowTempPass] = useState<boolean>(false);
  const [isSubmittingInvite, setIsSubmittingInvite] = useState<boolean>(false);

  // 7-Tab User Detail Slide-Over Sheet state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<UserDrawerTab>("overview");
  const [editRoleKeys, setEditRoleKeys] = useState<string[]>([]);
  const [editScope, setEditScope] = useState<DataScope>("OWN");
  const [editOrgIds, setEditOrgIds] = useState<string[]>([]);
  const [editScopedEventsText, setEditScopedEventsText] = useState<string>("");
  const [editOverrides, setEditOverrides] = useState<
    Record<string, { effect: "inherit" | "allow" | "deny"; reason: string }>
  >({});
  const [editFeatureMap, setEditFeatureMap] = useState<Record<string, "inherit" | "on" | "off">>({});
  const [accessAuditNote, setAccessAuditNote] = useState<string>("");
  const [statusReason, setStatusReason] = useState<string>("");
  const [isSavingUserAccess, setIsSavingUserAccess] = useState<boolean>(false);

  // Organizer Approval Review Modal state
  const [appFilter, setAppFilter] = useState<string>("pending_review");
  const [reviewModalApp, setReviewModalApp] = useState<OrganizerApplicationRecord | null>(null);
  const [reviewDecision, setReviewDecision] = useState<
    "approved" | "changes_requested" | "rejected"
  >("approved");
  const [reviewReason, setReviewReason] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  // Roles & Permissions Hub state (AdminOs style)
  const [roleSearch, setRoleSearch] = useState<string>("");
  const [roleDrawerOpen, setRoleDrawerOpen] = useState<boolean>(false);
  const [editingRoleOriginalKey, setEditingRoleOriginalKey] = useState<string | null>(null);
  const [roleKeyVal, setRoleKeyVal] = useState<string>("");
  const [roleNameVal, setRoleNameVal] = useState<string>("");
  const [roleDescVal, setRoleDescVal] = useState<string>("");
  const [roleScopeVal, setRoleScopeVal] = useState<DataScope>("ORGANIZATION");
  const [roleStatusVal, setRoleStatusVal] = useState<"active" | "archived">("active");
  const [rolePermsVal, setRolePermsVal] = useState<PermissionKey[]>([]);
  const [roleFeaturesVal, setRoleFeaturesVal] = useState<FeatureKey[]>([]);
  const [isSavingRole, setIsSavingRole] = useState<boolean>(false);
  const roleJsonInputRef = useRef<HTMLInputElement>(null);

  // Feature Entitlements Matrix state
  const [featureTargetMode, setFeatureTargetMode] = useState<"role" | "organization">("role");

  // Controlled Data Governance Manager state
  const [govEntityFilter, setGovEntityFilter] = useState<string>("all");
  const [govLifecycleFilter, setGovLifecycleFilter] = useState<"active" | "archived" | "all">(
    "active"
  );
  const [govSearch, setGovSearch] = useState<string>("");
  const [govActionTarget, setGovActionTarget] = useState<{
    record: ControlledGovernanceRecord;
    action: "archive" | "restore";
  } | null>(null);
  const [govReason, setGovReason] = useState<string>("");
  const [isSubmittingGov, setIsSubmittingGov] = useState<boolean>(false);

  // Audit Logs state
  const [auditSearch, setAuditSearch] = useState<string>("");
  const [auditModuleFilter, setAuditModuleFilter] = useState<string>("all");
  const [auditSeverityFilter, setAuditSeverityFilter] = useState<string>("all");
  const [inspectingAudit, setInspectingAudit] = useState<AuditLogEntry | null>(null);

  const actorIsSuperAdmin = Boolean(currentUser?.roleKeys.includes("super_admin"));

  const loadSnapshot = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      setLoadError(null);
      try {
        const res = await getUserManagementSnapshotServerFn();
        setSnapshot({
          users: res.users,
          roles: res.roles,
          featureRules: res.featureRules,
          organizations: res.organizations,
          applications: res.applications,
          activeSessions: res.activeSessions,
          auditLogs: res.auditLogs,
          controlledRecords: res.controlledRecords,
        });
        const pendingApps = res.applications.filter((a) => a.status === "pending_review").length;
        onPendingCountChange?.(pendingApps);
      } catch (err) {
        setLoadError(
          err instanceof Error ? err.message : "Failed to load User Management telemetry."
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [onPendingCountChange]
  );

  useEffect(() => {
    void loadSnapshot(false);
  }, [loadSnapshot]);

  // Close drawers/modals on Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (inspectingAudit) setInspectingAudit(null);
        else if (govActionTarget) setGovActionTarget(null);
        else if (reviewModalApp) setReviewModalApp(null);
        else if (inviteOpen) setInviteOpen(false);
        else if (roleDrawerOpen) setRoleDrawerOpen(false);
        else if (selectedUserId) setSelectedUserId(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    inspectingAudit,
    govActionTarget,
    reviewModalApp,
    inviteOpen,
    roleDrawerOpen,
    selectedUserId,
  ]);

  const selectedUser = useMemo(
    () => snapshot?.users.find((u) => u.id === selectedUserId) ?? null,
    [snapshot, selectedUserId]
  );

  // Hydrate 7-tab user drawer form state when selecting a user
  const openUserDrawer = (u: PublicAdminUserDTO, initialTab: UserDrawerTab = "overview") => {
    setSelectedUserId(u.id);
    setDrawerTab(initialTab);
    setEditRoleKeys([...u.roleKeys]);
    setEditScope(u.dataScope);
    setEditOrgIds([...u.organizationIds]);
    setEditScopedEventsText(u.scopedEventIds.join(", "));
    setStatusReason("");
    setAccessAuditNote("");

    const ovMap: Record<string, { effect: "inherit" | "allow" | "deny"; reason: string }> = {};
    for (const ov of u.permissionOverrides) {
      ovMap[ov.permissionKey] = { effect: ov.effect, reason: ov.reason };
    }
    setEditOverrides(ovMap);

    const fMap: Record<string, "inherit" | "on" | "off"> = {};
    if (snapshot) {
      for (const rule of snapshot.featureRules) {
        if (rule.targetType === "user" && rule.targetId === u.id) {
          fMap[rule.featureKey] = rule.isEnabled ? "on" : "off";
        }
      }
    }
    setEditFeatureMap(fMap);
  };

  // Filtered directory users
  const activeUsersOnly = useMemo(
    () => (snapshot?.users ?? []).filter((u) => !u.deletedAt),
    [snapshot]
  );

  const filteredUsers = useMemo(() => {
    return activeUsersOnly.filter((u) => {
      if (dirSubFilter === "staff" && u.portalRole !== "admin") return false;
      if (dirSubFilter === "organizers" && u.portalRole !== "client") return false;
      if (dirSubFilter === "members" && u.portalRole !== "member") return false;
      if (
        dirSubFilter === "suspended" &&
        u.accountStatus !== "suspended" &&
        u.accountStatus !== "deactivated"
      ) {
        return false;
      }

      if (statusFilter !== "all" && u.accountStatus !== statusFilter) return false;
      if (roleFilter !== "all" && !u.roleKeys.includes(roleFilter)) return false;

      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        const hit =
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.organizationName ?? "").toLowerCase().includes(q) ||
          u.roleNames.some((rn) => rn.toLowerCase().includes(q));
        if (!hit) return false;
      }
      return true;
    });
  }, [activeUsersOnly, dirSubFilter, statusFilter, roleFilter, userSearch]);

  const pendingApprovalsCount = useMemo(
    () => (snapshot?.applications ?? []).filter((a) => a.status === "pending_review").length,
    [snapshot]
  );

  const filteredRoles = useMemo(() => {
    const list = snapshot?.roles ?? [];
    if (!roleSearch.trim()) return list;
    const q = roleSearch.toLowerCase();
    return list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.key.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.permissions.some((p) => p.toLowerCase().includes(q))
    );
  }, [snapshot, roleSearch]);

  const filteredControlledRecords = useMemo(() => {
    const list = snapshot?.controlledRecords ?? [];
    return list.filter((r) => {
      if (govEntityFilter !== "all" && r.entityType !== govEntityFilter) return false;
      if (govLifecycleFilter === "active" && r.deletedAt) return false;
      if (govLifecycleFilter === "archived" && !r.deletedAt) return false;
      if (govSearch.trim()) {
        const q = govSearch.toLowerCase();
        const hit =
          r.title.toLowerCase().includes(q) ||
          r.subtitle.toLowerCase().includes(q) ||
          r.ownerOrOrg.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [snapshot, govEntityFilter, govLifecycleFilter, govSearch]);

  const filteredAuditLogs = useMemo(() => {
    const list = snapshot?.auditLogs ?? [];
    return list.filter((log) => {
      if (auditModuleFilter !== "all" && log.module !== auditModuleFilter) return false;
      if (auditSeverityFilter !== "all" && log.severity !== auditSeverityFilter) return false;
      if (auditSearch.trim()) {
        const q = auditSearch.toLowerCase();
        const hit =
          log.summary.toLowerCase().includes(q) ||
          log.actorEmail.toLowerCase().includes(q) ||
          log.actionKey.toLowerCase().includes(q) ||
          log.entityId.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [snapshot, auditModuleFilter, auditSeverityFilter, auditSearch]);

  // =========================================================================
  // MUTATION HANDLERS
  // =========================================================================

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invName.trim() || !invEmail.trim() || invRoleKeys.length === 0) {
      toast.error("Name, email, and at least one assigned role are required.");
      return;
    }
    setIsSubmittingInvite(true);
    try {
      const payload = {
        name: invName.trim(),
        email: invEmail.trim(),
        roleKeys: invRoleKeys,
        dataScope: invScope,
        emailVerified: true,
        ...(invPhone.trim() ? { phone: invPhone.trim() } : {}),
        ...(invOrg.trim() ? { organizationName: invOrg.trim() } : {}),
        ...(invTempPassword.trim().length >= 8
          ? { temporaryPassword: invTempPassword.trim() }
          : {}),
      };
      const res = await inviteOrProvisionUserServerFn({ data: payload });
      if (!res.success) {
        toast.error(res.error || "Could not provision user.");
        return;
      }
      toast.success(
        `Provisioned ${invEmail.trim()} (${res.inviteReference ?? "active"}). Audit trail recorded.`
      );
      setInviteOpen(false);
      setInvName("");
      setInvEmail("");
      setInvPhone("");
      setInvOrg("");
      setInvTempPassword("");
      await loadSnapshot(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to invite user.");
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const handleStatusTransition = async (
    targetUser: PublicAdminUserDTO,
    nextStatus: "active" | "suspended" | "deactivated"
  ) => {
    const cleanReason =
      statusReason.trim() ||
      (nextStatus === "active"
        ? "Account verified and reactivated by administrator."
        : `Account ${nextStatus} via Admin User Governance.`);
    if (cleanReason.length < 5) {
      toast.error("Please enter an audit reason (minimum 5 characters).");
      return;
    }
    try {
      const res = await updateUserStatusServerFn({
        data: {
          userId: targetUser.id,
          status: nextStatus,
          reason: cleanReason,
        },
      });
      if (!res.success) {
        toast.error(res.error || "Status update rejected by security policy.");
        return;
      }
      toast.success(`${targetUser.name} is now ${nextStatus}.`);
      setStatusReason("");
      await loadSnapshot(true);
      if (targetUser.id === currentUser?.id) {
        await refreshSession();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update account status.");
    }
  };

  const handleSaveUserAccess = async () => {
    if (!selectedUser) return;
    if (editRoleKeys.length === 0) {
      toast.error("Every user must retain at least one assigned role.");
      return;
    }
    setIsSavingUserAccess(true);
    try {
      const permissionOverrides = Object.entries(editOverrides)
        .filter(([, v]) => v.effect === "allow" || v.effect === "deny")
        .map(([k, v]) => ({
          permissionKey: k as PermissionKey,
          effect: v.effect as "allow" | "deny",
          reason: v.reason.trim() || "Explicit per-user administrative override",
        }));

      const userFeatureOverrides = Object.entries(editFeatureMap)
        .filter(([, state]) => state === "on" || state === "off")
        .map(([fk, state]) => ({
          featureKey: fk as FeatureKey,
          isEnabled: state === "on",
        }));

      const scopedEventIds = editScopedEventsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await updateUserAccessControlServerFn({
        data: {
          userId: selectedUser.id,
          roleKeys: editRoleKeys,
          dataScope: editScope,
          organizationIds: editOrgIds,
          scopedEventIds,
          permissionOverrides,
          userFeatureOverrides,
          ...(accessAuditNote.trim() ? { auditNote: accessAuditNote.trim() } : {}),
        },
      });

      if (!res.success) {
        toast.error(res.error || "Access control update blocked.");
        return;
      }
      toast.success(`Saved RBAC roles, permissions, features & scope for ${selectedUser.name}.`);
      setAccessAuditNote("");
      await loadSnapshot(true);
      if (selectedUser.id === currentUser?.id) {
        await refreshSession();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update user access.");
    } finally {
      setIsSavingUserAccess(false);
    }
  };

  const handleSubmitOrganizerReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalApp) return;
    const reasonText =
      reviewReason.trim() ||
      (reviewDecision === "approved"
        ? "Verified corporate event partner credentials."
        : "Additional organization verification details required.");
    if (reasonText.length < 4) {
      toast.error("Please provide a review note (at least 4 characters).");
      return;
    }
    setIsSubmittingReview(true);
    try {
      const res = await reviewOrganizerApplicationServerFn({
        data: {
          applicationId: reviewModalApp.id,
          decision: reviewDecision,
          reason: reasonText,
        },
      });
      if (!res.success) {
        toast.error(res.error || "Could not record application review.");
        return;
      }
      toast.success(
        `Organizer application for "${reviewModalApp.organizationName}" marked ${reviewDecision.replace("_", " ")}.`
      );
      setReviewModalApp(null);
      setReviewReason("");
      await loadSnapshot(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Application review failed.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const openCreateRoleDrawer = (preset?: (typeof ROLE_PRESET_TEMPLATES)[number]) => {
    setEditingRoleOriginalKey(null);
    setRoleKeyVal(preset?.key ?? "");
    setRoleNameVal(preset?.name ?? "");
    setRoleDescVal(preset?.description ?? "");
    setRoleScopeVal(preset?.defaultScope ?? "ORGANIZATION");
    setRoleStatusVal("active");
    setRolePermsVal(preset ? [...preset.permissions] : ["booking.view", "event.view"]);
    setRoleFeaturesVal(preset ? [...preset.defaultFeatures] : ["feature.booking_management"]);
    setRoleDrawerOpen(true);
  };

  const openEditRoleDrawer = (role: EnrichedRoleRecord) => {
    setEditingRoleOriginalKey(role.key);
    setRoleKeyVal(role.key);
    setRoleNameVal(role.name);
    setRoleDescVal(role.description);
    setRoleScopeVal(role.defaultScope);
    setRoleStatusVal(role.status);
    setRolePermsVal([...role.permissions]);
    setRoleFeaturesVal([...role.defaultFeatures]);
    setRoleDrawerOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = roleKeyVal
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "_");
    if (cleanKey.length < 2 || roleNameVal.trim().length < 2) {
      toast.error("Role name and lowercase key are required.");
      return;
    }
    setIsSavingRole(true);
    try {
      const res = await saveRoleDefinitionServerFn({
        data: {
          key: cleanKey,
          name: roleNameVal.trim(),
          description: roleDescVal.trim() || "Custom platform RBAC role.",
          status: roleStatusVal,
          permissions: rolePermsVal,
          defaultFeatures: roleFeaturesVal,
          defaultScope: roleScopeVal,
        },
      });
      if (!res.success) {
        toast.error(res.error || "Unable to save role.");
        return;
      }
      toast.success(`Role "${roleNameVal.trim()}" saved and synchronized.`);
      setRoleDrawerOpen(false);
      await loadSnapshot(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Role save failed.");
    } finally {
      setIsSavingRole(false);
    }
  };

  const handleImportRolesJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const items = Array.isArray(parsed) ? parsed : [parsed];
        let importedCount = 0;
        for (const item of items) {
          if (item && typeof item.key === "string" && typeof item.name === "string") {
            const res = await saveRoleDefinitionServerFn({
              data: {
                key: item.key.toLowerCase().replace(/[^a-z0-9_]+/g, "_"),
                name: item.name,
                description: String(item.description || "Imported RBAC role definition"),
                status: "active",
                permissions: Array.isArray(item.permissions) ? item.permissions : [],
                defaultFeatures: Array.isArray(item.defaultFeatures) ? item.defaultFeatures : [],
                defaultScope:
                  item.defaultScope === "GLOBAL" ||
                  item.defaultScope === "ORGANIZATION" ||
                  item.defaultScope === "ASSIGNED" ||
                  item.defaultScope === "OWN"
                    ? item.defaultScope
                    : "ORGANIZATION",
              },
            });
            if (res.success) importedCount += 1;
          }
        }
        toast.success(`Imported ${importedCount} role definition(s) into RBAC catalog.`);
        await loadSnapshot(true);
      } catch {
        toast.error("Invalid JSON role file format.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleToggleFeatureCell = async (
    featureKey: FeatureKey,
    targetType: "role" | "organization",
    targetId: string,
    nextEnabled: boolean
  ) => {
    try {
      const res = await toggleFeatureEntitlementServerFn({
        data: {
          featureKey,
          targetType,
          targetId,
          isEnabled: nextEnabled,
        },
      });
      if (!res.success) {
        toast.error(res.error || "Feature toggle blocked.");
        return;
      }
      toast.success(`${nextEnabled ? "Enabled" : "Disabled"} module entitlement.`);
      await loadSnapshot(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to toggle feature.");
    }
  };

  const handleRevokeSession = async (opts: { sessionId?: string; targetUserId?: string }) => {
    try {
      const res = await adminRevokeSessionsServerFn({
        data: {
          ...(opts.sessionId ? { sessionId: opts.sessionId } : {}),
          ...(opts.targetUserId ? { targetUserId: opts.targetUserId } : {}),
        },
      });
      if (res.success) {
        toast.success("Session(s) immediately invalidated and logged to Security Audit.");
        await loadSnapshot(true);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke session.");
    }
  };

  const handleConfirmGovernanceAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!govActionTarget) return;
    if (govReason.trim().length < 5) {
      toast.error("Please provide an audit reason (minimum 5 characters).");
      return;
    }
    setIsSubmittingGov(true);
    try {
      const res = await controlledRecordActionServerFn({
        data: {
          entityType: govActionTarget.record.entityType,
          recordId: govActionTarget.record.id,
          action: govActionTarget.action,
          reason: govReason.trim(),
        },
      });
      if (!res.success) {
        toast.error(res.error || "Governance action denied.");
        return;
      }
      toast.success(
        `Record ${govActionTarget.action === "archive" ? "archived (soft-deleted)" : "restored"} with immutable audit entry.`
      );
      setGovActionTarget(null);
      setGovReason("");
      await loadSnapshot(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Governance action failed.");
    } finally {
      setIsSubmittingGov(false);
    }
  };

  const handleAuthorizedGovernanceExport = async () => {
    try {
      await controlledRecordActionServerFn({
        data: {
          entityType:
            govEntityFilter !== "all"
              ? (govEntityFilter as ControlledGovernanceRecord["entityType"])
              : "users",
          recordId: "dataset_batch",
          action: "export_log",
          reason: `Authorized Admin CSV export (${filteredControlledRecords.length} rows)`,
        },
      });
      downloadCsvFile(
        `siddwhizz-governance-${govEntityFilter}-${new Date().toISOString().slice(0, 10)}.csv`,
        ["Record ID", "Entity Table", "Title", "Owner / Organization", "Status", "Lifecycle", "Created"],
        filteredControlledRecords.map((r) => [
          r.id,
          r.entityType,
          r.title,
          r.ownerOrOrg,
          r.status,
          r.deletedAt ? `Archived (${r.deletedAt})` : "Active",
          r.createdAt,
        ])
      );
      toast.success("Authorized dataset exported and recorded in Audit Logs.");
      await loadSnapshot(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export authorization required.");
    }
  };

  if (isLoading && !snapshot) {
    return (
      <div className="panel-card p-10 text-center space-y-3">
        <RefreshCw className="mx-auto h-7 w-7 animate-spin text-primary" />
        <p className="font-display text-sm font-extrabold uppercase tracking-wider text-foreground">
          Loading Enterprise RBAC &amp; User Governance...
        </p>
        <p className="text-xs text-muted-foreground">
          Verifying server session, effective permissions, and audit telemetry.
        </p>
      </div>
    );
  }

  if (loadError || !snapshot) {
    return (
      <div className="panel-card p-8 text-center space-y-4">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h3 className="font-display text-lg font-black text-foreground">
          User Management Access Restricted
        </h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          {loadError || "Your role does not hold user.view authorization."}
        </p>
        <button
          type="button"
          onClick={() => void loadSnapshot(false)}
          className="btn-red text-xs px-4 py-2"
        >
          Retry Verification
        </button>
      </div>
    );
  }

  const navItems: Array<{
    id: UserManagementSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    permission?: PermissionKey;
  }> = [
    { id: "overview", label: "Overview", icon: ShieldCheck },
    { id: "directory", label: "Users", icon: Users, badge: activeUsersOnly.length },
    {
      id: "approvals",
      label: "Approvals",
      icon: UserCheck,
      ...(pendingApprovalsCount > 0 ? { badge: pendingApprovalsCount } : {}),
    },
    { id: "roles", label: "Roles & Permissions", icon: KeyRound, badge: snapshot.roles.length },
    { id: "features", label: "Feature Access", icon: Layers },
    { id: "scopes", label: "Data Scopes", icon: Building2 },
    { id: "governance", label: "Data Manager", icon: Database },
    { id: "audit", label: "Audit Logs", icon: Activity, permission: "audit.view" },
    {
      id: "security",
      label: "Sessions & Security",
      icon: Lock,
      badge: snapshot.activeSessions.length,
    },
  ];

  const isEditingProtectedSuperAdminRole = editingRoleOriginalKey === "super_admin";

  return (
    <div className="space-y-6">
      {/* ================================================================= */}
      {/* TOP HEADER & SUB-NAVIGATION RAIL                                  */}
      {/* ================================================================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow eyebrow-line">Identity, RBAC &amp; Data Governance</p>
          <h2 className="display mt-2 text-2xl sm:text-3xl">
            User &amp; <span className="text-primary">Access Control Hub.</span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void loadSnapshot(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary transition cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            Sync Telemetry
          </button>

          {hasPermission("user.invite") && (
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="btn-red rounded-xl px-4 py-2 text-xs cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" /> Provision User
            </button>
          )}
        </div>
      </div>

      {/* Sub-navigation bar */}
      <div
        role="tablist"
        aria-label="User Management Sections"
        className="flex items-center gap-1.5 overflow-x-auto pb-1 thin-scrollbar border-b border-border"
      >
        {navItems
          .filter((item) => !item.permission || hasPermission(item.permission))
          .map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-t-xl border-b-2 px-3.5 py-2.5 text-xs font-bold transition cursor-pointer focus-visible:ring-2 focus-visible:ring-primary ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                      item.id === "approvals" && item.badge > 0
                        ? "bg-primary text-primary-foreground"
                        : active
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
      </div>

      {/* ================================================================= */}
      {/* 1. OVERVIEW SECTION                                               */}
      {/* ================================================================= */}
      {activeSection === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="panel-card card-lift">
              <div className="panel-card-header py-3 px-5 flex items-center justify-between">
                <span className="font-display text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Active Platform Users
                </span>
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="panel-card-body p-5">
                <p className="font-display text-3xl font-black text-foreground">
                  {activeUsersOnly.length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {activeUsersOnly.filter((u) => u.portalRole === "admin").length} Staff •{" "}
                  {activeUsersOnly.filter((u) => u.portalRole === "client").length} Organizers •{" "}
                  {activeUsersOnly.filter((u) => u.portalRole === "member").length} Members
                </p>
              </div>
            </div>

            <div className="panel-card card-lift">
              <div className="panel-card-header py-3 px-5 flex items-center justify-between">
                <span className="font-display text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Organizer Approvals
                </span>
                <UserCheck className="h-4 w-4 text-amber-600" />
              </div>
              <div className="panel-card-body p-5">
                <p className="font-display text-3xl font-black text-foreground">
                  {pendingApprovalsCount}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveSection("approvals")}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  Review onboarding queue <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="panel-card card-lift">
              <div className="panel-card-header py-3 px-5 flex items-center justify-between">
                <span className="font-display text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  RBAC Roles &amp; Perms
                </span>
                <KeyRound className="h-4 w-4 text-foreground" />
              </div>
              <div className="panel-card-body p-5">
                <p className="font-display text-3xl font-black text-foreground">
                  {snapshot.roles.length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {PERMISSION_CATALOG.length} permissions • {FEATURE_CATALOG.length} module gates
                </p>
              </div>
            </div>

            <div className="panel-card card-lift">
              <div className="panel-card-header py-3 px-5 flex items-center justify-between">
                <span className="font-display text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Live HttpOnly Sessions
                </span>
                <Shield className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="panel-card-body p-5">
                <p className="font-display text-3xl font-black text-foreground">
                  {snapshot.activeSessions.length}
                </p>
                <p className="mt-1 text-xs text-emerald-700 font-semibold">
                  PBKDF2-SHA256 + Anti-Lockout Active
                </p>
              </div>
            </div>
          </div>

          {/* Quick Governance Grid + Recent Audit Trail */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="panel-card lg:col-span-1">
              <div className="panel-card-header">
                <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-foreground">
                  Quick Governance Actions
                </h3>
              </div>
              <div className="panel-card-body space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection("directory");
                    setDirSubFilter("all");
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-secondary/50 p-3.5 text-left hover:border-primary/40 hover:bg-accent transition cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-bold text-foreground">Manage All User Accounts</p>
                    <p className="text-[11px] text-muted-foreground">
                      7-tab drawer for roles, overrides &amp; scopes
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-primary shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection("roles")}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-secondary/50 p-3.5 text-left hover:border-primary/40 hover:bg-accent transition cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-bold text-foreground">Roles &amp; Permissions Hub</p>
                    <p className="text-[11px] text-muted-foreground">
                      Clone preset templates or build custom roles
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-primary shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection("features")}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-secondary/50 p-3.5 text-left hover:border-primary/40 hover:bg-accent transition cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-bold text-foreground">Module Entitlements Matrix</p>
                    <p className="text-[11px] text-muted-foreground">
                      Toggle Booking, Events, Finance, Analytics &amp; CMS
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-primary shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection("governance")}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-secondary/50 p-3.5 text-left hover:border-primary/40 hover:bg-accent transition cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      Controlled Record Governance
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Safe soft-delete archive, restore &amp; audited exports
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-primary shrink-0" />
                </button>
              </div>
            </div>

            <div className="panel-card lg:col-span-2">
              <div className="panel-card-header flex items-center justify-between">
                <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-foreground">
                  Recent Immutable Security &amp; Access Stream
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveSection("audit")}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  View Full Audit Log
                </button>
              </div>
              <div className="panel-card-body divide-y divide-border p-0">
                {snapshot.auditLogs.slice(0, 5).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between hover:bg-secondary/30"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                            entry.severity === "critical"
                              ? "bg-rose-100 text-rose-800"
                              : entry.severity === "warning"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {entry.actionKey}
                        </span>
                        <span className="text-xs font-semibold text-foreground truncate">
                          {entry.summary}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Actor: <span className="font-medium text-foreground">{entry.actorEmail}</span>{" "}
                        • Module: {entry.module} • IP: {entry.ipAddress}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatDateTime(entry.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. USERS DIRECTORY SECTION                                        */}
      {/* ================================================================= */}
      {activeSection === "directory" && (
        <div className="space-y-4">
          {/* Role Segment Chips */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: "all", label: "All Users", count: activeUsersOnly.length },
                  {
                    id: "staff",
                    label: "Admin & Staff",
                    count: activeUsersOnly.filter((u) => u.portalRole === "admin").length,
                  },
                  {
                    id: "organizers",
                    label: "Organizers",
                    count: activeUsersOnly.filter((u) => u.portalRole === "client").length,
                  },
                  {
                    id: "members",
                    label: "Members / Attendees",
                    count: activeUsersOnly.filter((u) => u.portalRole === "member").length,
                  },
                  {
                    id: "suspended",
                    label: "Suspended / Deactivated",
                    count: activeUsersOnly.filter(
                      (u) => u.accountStatus === "suspended" || u.accountStatus === "deactivated"
                    ).length,
                  },
                ] as const
              ).map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setDirSubFilter(pill.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                    dirSubFilter === pill.id
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border border-border bg-card text-foreground/80 hover:border-primary/40"
                  }`}
                >
                  {pill.label} ({pill.count})
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                downloadCsvFile(
                  `siddwhizz-users-${new Date().toISOString().slice(0, 10)}.csv`,
                  [
                    "User ID",
                    "Full Name",
                    "Email",
                    "Roles",
                    "Account Status",
                    "Data Scope",
                    "Organization",
                    "Created",
                  ],
                  filteredUsers.map((u) => [
                    u.id,
                    u.name,
                    u.email,
                    u.roleNames.join(" | "),
                    u.accountStatus,
                    u.dataScope,
                    u.organizationName ?? "—",
                    u.createdAt,
                  ])
                );
                toast.success(`Exported ${filteredUsers.length} user row(s) to CSV.`);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-accent cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
          </div>

          {/* Search & Filters */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="relative sm:col-span-2">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                name="user_directory_search"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name, email, company, or assigned role..."
                className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <select
              aria-label="Filter by role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
            >
              <option value="all">All RBAC Roles</option>
              {snapshot.roles.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by account status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
            >
              <option value="all">All Account Statuses</option>
              <option value="active">Active</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="suspended">Suspended</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>

          {/* Accessible @container Responsive Table */}
          <h3 id="users-directory-heading" className="sr-only">
            Platform Users Directory Table
          </h3>
          <div
            tabIndex={0}
            role="region"
            aria-labelledby="users-directory-heading"
            className="rbac-table-region shadow-xs"
          >
            <table className="rbac-table text-xs">
              <thead>
                <tr>
                  <th scope="col">User Identity</th>
                  <th scope="col">Assigned Roles</th>
                  <th scope="col">Data Scope</th>
                  <th scope="col">Organization</th>
                  <th scope="col">Status</th>
                  <th scope="col">Last Login</th>
                  <th scope="col" className="text-right">
                    Governance
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-muted-foreground">
                      No user accounts match the active filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td data-label="Identity">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-primary/10 font-display text-xs font-extrabold text-primary">
                            {u.avatar ? (
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              getInitials(u.name)
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-foreground truncate flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.emailVerified && (
                                <CheckCircle2
                                  className="h-3.5 w-3.5 text-emerald-600 shrink-0"
                                  aria-label="Verified Email"
                                />
                              )}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td data-label="Roles">
                        <div className="flex flex-wrap gap-1">
                          {u.roleNames.map((rn) => (
                            <span
                              key={rn}
                              className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                                rn === "Super Admin"
                                  ? "bg-ink text-ink-foreground"
                                  : "bg-secondary text-foreground border border-border"
                              }`}
                            >
                              {rn}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td data-label="Scope">
                        <ScopeBadge scope={u.dataScope} />
                      </td>

                      <td data-label="Organization">
                        <span className="font-medium text-foreground/90">
                          {u.organizationName || "Individual"}
                        </span>
                      </td>

                      <td data-label="Status">
                        <StatusBadge status={u.accountStatus} />
                      </td>

                      <td data-label="Last Login">
                        <span className="text-muted-foreground">
                          {formatShortDate(u.lastLoginAt)}
                        </span>
                      </td>

                      <td data-label="Actions" className="text-right">
                        <button
                          type="button"
                          onClick={() => openUserDrawer(u, "overview")}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:border-primary hover:text-primary focus-visible:ring-2 focus-visible:ring-primary transition cursor-pointer"
                        >
                          Inspect &amp; Access <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 3. PENDING ORGANIZER APPROVALS SECTION                            */}
      {/* ================================================================= */}
      {activeSection === "approvals" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: "pending_review", label: "Pending Review" },
                  { id: "changes_requested", label: "Changes Requested" },
                  { id: "approved", label: "Approved" },
                  { id: "rejected", label: "Rejected" },
                  { id: "all", label: "All Applications" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAppFilter(tab.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                    appFilter === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-foreground/80 hover:border-primary/40"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Approved organizers automatically receive a verified Organization tenant &amp;{" "}
              <code className="rounded bg-muted px-1 py-0.5">ORGANIZATION</code> scope.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {snapshot.applications
              .filter((a) => appFilter === "all" || a.status === appFilter)
              .map((app) => (
                <div key={app.id} className="panel-card flex flex-col justify-between">
                  <div className="panel-card-header flex items-center justify-between gap-2">
                    <div>
                      <span className="font-display text-xs font-black uppercase tracking-wider text-foreground">
                        {app.organizationName}
                      </span>
                      <span className="ml-2 rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-muted-foreground border border-border">
                        {app.organizationType}
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        app.status === "approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : app.status === "rejected"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {app.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>

                  <div className="panel-card-body space-y-3 text-xs">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">
                          Applicant Contact
                        </p>
                        <p className="font-bold text-foreground">{app.applicantName}</p>
                        <p className="text-muted-foreground">{app.applicantEmail}</p>
                        <p className="text-muted-foreground">{app.applicantPhone}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">
                          Website / Verification Link
                        </p>
                        <p className="font-medium text-primary break-all">
                          {app.websiteOrSocial || "Not provided"}
                        </p>
                        <p className="mt-2 text-[10px] font-bold uppercase text-muted-foreground">
                          Submitted
                        </p>
                        <p className="text-muted-foreground">{formatDateTime(app.createdAt)}</p>
                      </div>
                    </div>

                    {app.expectedEventFormats.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {app.expectedEventFormats.map((fmt) => (
                          <span
                            key={fmt}
                            className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-foreground border border-border"
                          >
                            {fmt}
                          </span>
                        ))}
                      </div>
                    )}

                    {app.notes && (
                      <div className="rounded-xl border border-border bg-secondary/40 p-3 text-foreground/90">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">
                          Booking &amp; Event Brief
                        </p>
                        {app.notes}
                      </div>
                    )}

                    {app.reviewReason && (
                      <p className="text-[11px] text-muted-foreground italic">
                        Last review ({app.reviewedBy}): &ldquo;{app.reviewReason}&rdquo;
                      </p>
                    )}

                    {hasPermission("user.approve_organizer") && (
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                        <button
                          type="button"
                          onClick={() => {
                            setReviewModalApp(app);
                            setReviewDecision("approved");
                            setReviewReason(
                              "Verified corporate organizer credentials and activated tenant workspace."
                            );
                          }}
                          className="btn-red rounded-lg px-3.5 py-2 text-xs cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve &amp; Activate
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setReviewModalApp(app);
                            setReviewDecision("changes_requested");
                            setReviewReason("");
                          }}
                          className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 cursor-pointer"
                        >
                          Request Info
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setReviewModalApp(app);
                            setReviewDecision("rejected");
                            setReviewReason("");
                          }}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

            {snapshot.applications.filter((a) => appFilter === "all" || a.status === appFilter)
              .length === 0 && (
              <div className="panel-card p-10 text-center lg:col-span-2">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
                <p className="font-display text-sm font-black uppercase text-foreground">
                  No Organizer Applications in This Queue
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  New corporate &amp; event agency applications submitted via /signup appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 4. ROLES & PERMISSIONS HUB (AdminOs Enterprise Layout)            */}
      {/* ================================================================= */}
      {activeSection === "roles" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* Left 8 Cols: Header Actions + 3 KPI Cards */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-xs">
                <div>
                  <h3 className="font-display text-lg font-black uppercase tracking-tight text-foreground">
                    Roles &amp; Permissions
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Manage access control, action permissions, and user role assignments across
                    SIDD.WHIZZ
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      downloadCsvFile(
                        `siddwhizz-roles-${new Date().toISOString().slice(0, 10)}.csv`,
                        [
                          "Role Key",
                          "Role Name",
                          "Description",
                          "Default Scope",
                          "Assigned Users",
                          "Permissions Count",
                          "Status",
                        ],
                        snapshot.roles.map((r) => [
                          r.key,
                          r.name,
                          r.description,
                          r.defaultScope,
                          String(r.assignedUserCount),
                          String(r.permissions.length),
                          r.status,
                        ])
                      );
                      toast.success("Exported RBAC roles matrix to CSV.");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-accent cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" /> Export
                  </button>

                  {hasPermission("role.manage") && (
                    <button
                      type="button"
                      onClick={() => openCreateRoleDrawer()}
                      className="btn-red rounded-xl px-4 py-2 text-xs cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Create Role
                    </button>
                  )}
                </div>
              </div>

              {/* 3 AdminOs KPI Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Shield className="h-4 w-4" />
                    </span>
                    <span className="font-display text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      Total Roles
                    </span>
                  </div>
                  <p className="mt-3 font-display text-3xl font-black text-foreground">
                    {snapshot.roles.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-700">
                      <Users className="h-4 w-4" />
                    </span>
                    <span className="font-display text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      Assigned Users
                    </span>
                  </div>
                  <p className="mt-3 font-display text-3xl font-black text-foreground">
                    {activeUsersOnly.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-700">
                      <Clock className="h-4 w-4" />
                    </span>
                    <span className="font-display text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      Pending Reviews
                    </span>
                  </div>
                  <p className="mt-3 font-display text-3xl font-black text-foreground">
                    {pendingApprovalsCount}
                  </p>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Quick Actions Card (Use Template + Import Roles JSON) */}
            <div className="lg:col-span-4 rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <p className="font-display text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Quick Actions
                </p>
                <div className="mt-3 space-y-2.5">
                  {ROLE_PRESET_TEMPLATES.slice(0, 2).map((tpl) => (
                    <button
                      key={tpl.key}
                      type="button"
                      disabled={!hasPermission("role.manage")}
                      onClick={() => openCreateRoleDrawer(tpl)}
                      className="flex w-full items-center justify-between rounded-xl border border-border bg-secondary/40 px-3.5 py-2.5 text-left hover:border-primary/40 hover:bg-accent disabled:opacity-50 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Sparkles className="h-4 w-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">
                            Template: {tpl.label}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            Start from preset permissions
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                  ))}

                  <input
                    ref={roleJsonInputRef}
                    type="file"
                    accept="application/json,.json"
                    onChange={handleImportRolesJson}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={!hasPermission("role.manage")}
                    onClick={() => roleJsonInputRef.current?.click()}
                    className="flex w-full items-center justify-between rounded-xl border border-border bg-secondary/40 px-3.5 py-2.5 text-left hover:border-primary/40 hover:bg-accent disabled:opacity-50 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileJson className="h-4 w-4 text-foreground shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-foreground">Import Roles</p>
                        <p className="text-[11px] text-muted-foreground">Import from JSON schema</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Searchable Roles Table */}
          <div className="panel-card">
            <div className="panel-card-header flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-display text-xs font-extrabold uppercase tracking-wider text-foreground">
                Role Definitions &amp; Active Assignments
              </span>
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  name="role_matrix_search"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  value={roleSearch}
                  onChange={(e) => setRoleSearch(e.target.value)}
                  placeholder="Search roles, keys, permissions..."
                  className="w-full rounded-xl border border-border bg-white py-2 pl-9 pr-3 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <h4 id="roles-matrix-heading" className="sr-only">
              Roles and Permissions Matrix Table
            </h4>
            <div
              tabIndex={0}
              role="region"
              aria-labelledby="roles-matrix-heading"
              className="rbac-table-region border-0 rounded-none"
            >
              <table className="rbac-table text-xs">
                <thead>
                  <tr>
                    <th scope="col">Role Name</th>
                    <th scope="col">Description</th>
                    <th scope="col">Users</th>
                    <th scope="col">Default Scope</th>
                    <th scope="col">Created At</th>
                    <th scope="col">Current Status</th>
                    <th scope="col" className="text-right">
                      Configure
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.map((role) => (
                    <tr key={role.key}>
                      <td data-label="Role Name">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                              role.key === "super_admin"
                                ? "bg-ink text-ink-foreground"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {role.isSystemProtected ? (
                              <Lock className="h-3.5 w-3.5" />
                            ) : (
                              <KeyRound className="h-3.5 w-3.5" />
                            )}
                          </span>
                          <div>
                            <p className="font-bold text-foreground">{role.name}</p>
                            <p className="font-mono text-[10px] text-muted-foreground">
                              {role.key} • {role.permissions.length} perms
                            </p>
                          </div>
                        </div>
                      </td>

                      <td data-label="Description">
                        <p className="max-w-xs text-muted-foreground line-clamp-2">
                          {role.description}
                        </p>
                      </td>

                      <td data-label="Users">
                        <div className="flex items-center -space-x-2">
                          {role.assignedAvatars.map((av) => (
                            <div
                              key={av.id}
                              title={av.name}
                              className="grid h-7 w-7 place-items-center overflow-hidden rounded-full border-2 border-white bg-secondary text-[10px] font-bold text-foreground shadow-2xs"
                            >
                              {av.avatar ? (
                                <img
                                  src={av.avatar}
                                  alt={av.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                getInitials(av.name)
                              )}
                            </div>
                          ))}
                          <span className="ml-2 inline-flex items-center rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-extrabold text-indigo-700">
                            {role.assignedUserCount} user{role.assignedUserCount === 1 ? "" : "s"}
                          </span>
                        </div>
                      </td>

                      <td data-label="Default Scope">
                        <ScopeBadge scope={role.defaultScope} />
                      </td>

                      <td data-label="Created At">
                        <span className="text-muted-foreground">
                          {formatShortDate(role.createdAt)}
                        </span>
                      </td>

                      <td data-label="Current Status">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            role.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-300"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              role.status === "active" ? "bg-emerald-600" : "bg-slate-500"
                            }`}
                          />
                          {role.status === "active" ? "Active" : "Archived"}
                        </span>
                      </td>

                      <td data-label="Configure" className="text-right">
                        <button
                          type="button"
                          onClick={() => openEditRoleDrawer(role)}
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:border-primary hover:text-primary cursor-pointer"
                        >
                          {role.key === "super_admin" ? (
                            <>
                              <Eye className="h-3.5 w-3.5" /> Inspect
                            </>
                          ) : (
                            <>
                              <Edit3 className="h-3.5 w-3.5" /> Edit Role
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 5. FEATURE ACCESS CONTROL MATRIX                                  */}
      {/* ================================================================= */}
      {activeSection === "features" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-black uppercase text-foreground">
                Platform Module Entitlements (Plane 2)
              </h3>
              <p className="text-xs text-muted-foreground">
                Enable or disable major functional modules across Roles or Corporate Organizations.
                Note: <strong>Website CMS</strong> is strictly restricted to internal staff roles.
              </p>
            </div>

            <div className="inline-flex rounded-xl border border-border bg-card p-1">
              <button
                type="button"
                onClick={() => setFeatureTargetMode("role")}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  featureTargetMode === "role"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                By Role ({snapshot.roles.length})
              </button>
              <button
                type="button"
                onClick={() => setFeatureTargetMode("organization")}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  featureTargetMode === "organization"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                By Organization ({snapshot.organizations.length})
              </button>
            </div>
          </div>

          <h4 id="feature-matrix-heading" className="sr-only">
            Feature Entitlements Matrix
          </h4>
          <div
            tabIndex={0}
            role="region"
            aria-labelledby="feature-matrix-heading"
            className="rbac-table-region shadow-xs"
          >
            <table className="rbac-table text-xs">
              <thead>
                <tr>
                  <th scope="col">Module / Capability</th>
                  {featureTargetMode === "role"
                    ? snapshot.roles.map((r) => (
                        <th key={r.key} scope="col" className="text-center">
                          {r.name}
                        </th>
                      ))
                    : snapshot.organizations.map((o) => (
                        <th key={o.id} scope="col" className="text-center">
                          {o.name}
                        </th>
                      ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_CATALOG.map((feat) => (
                  <tr key={feat.key}>
                    <td data-label="Module">
                      <div>
                        <p className="font-bold text-foreground flex items-center gap-1.5">
                          <span>{feat.label}</span>
                          {feat.staffOnly && (
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-primary">
                              Staff Only
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{feat.description}</p>
                      </div>
                    </td>

                    {featureTargetMode === "role"
                      ? snapshot.roles.map((role) => {
                          const staffBlocked = feat.staffOnly && !isStaffRoleKey(role.key);
                          const enabled = !staffBlocked && role.defaultFeatures.includes(feat.key);
                          const locked =
                            role.key === "super_admin" ||
                            staffBlocked ||
                            !hasPermission("feature.manage");

                          return (
                            <td
                              key={`${feat.key}-${role.key}`}
                              data-label={role.name}
                              className="text-center"
                            >
                              <button
                                type="button"
                                role="switch"
                                aria-checked={enabled}
                                aria-label={`${feat.label} for ${role.name}`}
                                disabled={locked}
                                onClick={() =>
                                  void handleToggleFeatureCell(
                                    feat.key,
                                    "role",
                                    role.key,
                                    !enabled
                                  )
                                }
                                className={`inline-flex h-6 w-11 items-center rounded-full p-0.5 transition ${
                                  enabled ? "bg-primary" : "bg-slate-200"
                                } ${locked ? "opacity-45 cursor-not-allowed" : "cursor-pointer"}`}
                              >
                                <span
                                  className={`h-5 w-5 rounded-full bg-white shadow-xs transition-transform ${
                                    enabled ? "translate-x-5" : "translate-x-0"
                                  }`}
                                />
                              </button>
                            </td>
                          );
                        })
                      : snapshot.organizations.map((org) => {
                          const orgRule = snapshot.featureRules.find(
                            (r) =>
                              r.targetType === "organization" &&
                              r.targetId === org.id &&
                              r.featureKey === feat.key
                          );
                          const enabled = feat.staffOnly
                            ? false
                            : orgRule
                            ? orgRule.isEnabled
                            : true;
                          const locked = feat.staffOnly || !hasPermission("feature.manage");

                          return (
                            <td
                              key={`${feat.key}-${org.id}`}
                              data-label={org.name}
                              className="text-center"
                            >
                              <button
                                type="button"
                                role="switch"
                                aria-checked={enabled}
                                aria-label={`${feat.label} for ${org.name}`}
                                disabled={locked}
                                onClick={() =>
                                  void handleToggleFeatureCell(
                                    feat.key,
                                    "organization",
                                    org.id,
                                    !enabled
                                  )
                                }
                                className={`inline-flex h-6 w-11 items-center rounded-full p-0.5 transition ${
                                  enabled ? "bg-primary" : "bg-slate-200"
                                } ${locked ? "opacity-45 cursor-not-allowed" : "cursor-pointer"}`}
                              >
                                <span
                                  className={`h-5 w-5 rounded-full bg-white shadow-xs transition-transform ${
                                    enabled ? "translate-x-5" : "translate-x-0"
                                  }`}
                                />
                              </button>
                            </td>
                          );
                        })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 6. OBJECT-LEVEL DATA SCOPES & ORGANIZATIONS                       */}
      {/* ================================================================= */}
      {activeSection === "scopes" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                {
                  scope: "GLOBAL" as const,
                  title: "Global Platform Scope",
                  desc: "Unrestricted visibility across all tenants, bookings, CMS pages, and users. Reserved for Super Admin & senior staff.",
                },
                {
                  scope: "ORGANIZATION" as const,
                  title: "Organization Tenant Scope",
                  desc: "Strict tenant isolation. Organizers only view/manage bookings, events, attendees, and invoices belonging to their verified company.",
                },
                {
                  scope: "ASSIGNED" as const,
                  title: "Assigned Event Scope",
                  desc: "Scoped strictly to explicitly assigned event IDs or enquiries for event-day coordinators and stage producers.",
                },
                {
                  scope: "OWN" as const,
                  title: "Personal Self-Service Scope",
                  desc: "Default attendee boundary. Users can only access their own profile, registered QR tickets, and saved preferences.",
                },
              ] as const
            ).map((card) => (
              <div key={card.scope} className="panel-card p-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <ScopeBadge scope={card.scope} />
                  <span className="text-xs font-black text-foreground">
                    {activeUsersOnly.filter((u) => u.dataScope === card.scope).length} users
                  </span>
                </div>
                <h4 className="font-display text-xs font-extrabold uppercase text-foreground">
                  {card.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>

          <div className="panel-card">
            <div className="panel-card-header flex items-center justify-between">
              <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-foreground">
                Verified Partner Organizations &amp; Tenant Boundaries
              </h3>
              <span className="text-xs font-bold text-muted-foreground">
                {snapshot.organizations.filter((o) => !o.deletedAt).length} Active Tenants
              </span>
            </div>
            <h4 id="org-tenants-heading" className="sr-only">
              Organizations Tenant Directory
            </h4>
            <div
              tabIndex={0}
              role="region"
              aria-labelledby="org-tenants-heading"
              className="rbac-table-region border-0 rounded-none"
            >
              <table className="rbac-table text-xs">
                <thead>
                  <tr>
                    <th scope="col">Organization</th>
                    <th scope="col">Category</th>
                    <th scope="col">Tenant Slug</th>
                    <th scope="col">Bound Users</th>
                    <th scope="col">Verification</th>
                    <th scope="col">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.organizations
                    .filter((o) => !o.deletedAt)
                    .map((org) => (
                      <tr key={org.id}>
                        <td data-label="Organization" className="font-bold text-foreground">
                          {org.name}
                        </td>
                        <td data-label="Category">{org.orgType}</td>
                        <td data-label="Slug">
                          <code className="rounded bg-secondary px-2 py-0.5 text-[11px]">
                            {org.slug}
                          </code>
                        </td>
                        <td data-label="Users">
                          {
                            activeUsersOnly.filter((u) => u.organizationIds.includes(org.id))
                              .length
                          }
                        </td>
                        <td data-label="Verification">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" /> {org.verificationStatus}
                          </span>
                        </td>
                        <td data-label="Created" className="text-muted-foreground">
                          {formatShortDate(org.createdAt)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 7. CONTROLLED DATA GOVERNANCE MANAGER (NO RAW SQL)                */}
      {/* ================================================================= */}
      {activeSection === "governance" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-display text-xs font-extrabold uppercase tracking-wider text-foreground">
                  Safe Operational Data Governance (Zero Raw SQL Policy)
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Browse platform records safely, perform reversible soft-deletes (archive) &amp;
                  restores, or run audited CSV exports. Destructive arbitrary SQL execution is
                  disabled by architecture.
                </p>
              </div>
            </div>
            {hasPermission("data.export") && (
              <button
                type="button"
                onClick={() => void handleAuthorizedGovernanceExport()}
                className="btn-red shrink-0 rounded-xl px-4 py-2 text-xs cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" /> Audited Export CSV
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="relative sm:col-span-2">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                name="governance_record_search"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={govSearch}
                onChange={(e) => setGovSearch(e.target.value)}
                placeholder="Search records by ID, title, email, or organization..."
                className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <select
              aria-label="Filter by entity table"
              value={govEntityFilter}
              onChange={(e) => setGovEntityFilter(e.target.value)}
              className="rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-semibold text-foreground"
            >
              <option value="all">All Controlled Entities</option>
              <option value="users">users</option>
              <option value="organizations">organizations</option>
              <option value="bookings">bookings</option>
              <option value="events">events</option>
              <option value="enquiries">enquiries</option>
              <option value="social_accounts">social_accounts</option>
            </select>

            <select
              aria-label="Filter by archive lifecycle"
              value={govLifecycleFilter}
              onChange={(e) =>
                setGovLifecycleFilter(e.target.value as "active" | "archived" | "all")
              }
              className="rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-semibold text-foreground"
            >
              <option value="active">Active Records Only</option>
              <option value="archived">Archived (Soft-Deleted)</option>
              <option value="all">All Records</option>
            </select>
          </div>

          <h4 id="governance-records-heading" className="sr-only">
            Controlled Database Governance Records
          </h4>
          <div
            tabIndex={0}
            role="region"
            aria-labelledby="governance-records-heading"
            className="rbac-table-region shadow-xs"
          >
            <table className="rbac-table text-xs">
              <thead>
                <tr>
                  <th scope="col">Entity Table</th>
                  <th scope="col">Record Summary</th>
                  <th scope="col">Owner / Tenant</th>
                  <th scope="col">Lifecycle</th>
                  <th scope="col" className="text-right">
                    Controlled Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredControlledRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-muted-foreground">
                      No controlled records found in this lifecycle view.
                    </td>
                  </tr>
                ) : (
                  filteredControlledRecords.map((rec) => (
                    <tr key={`${rec.entityType}:${rec.id}`}>
                      <td data-label="Entity">
                        <code className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-bold text-foreground border border-border">
                          {rec.entityType}
                        </code>
                      </td>
                      <td data-label="Summary">
                        <p className="font-bold text-foreground">{rec.title}</p>
                        <p className="text-[11px] text-muted-foreground">{rec.subtitle}</p>
                      </td>
                      <td data-label="Owner">{rec.ownerOrOrg}</td>
                      <td data-label="Lifecycle">
                        {rec.deletedAt ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                            Archived {formatShortDate(rec.deletedAt)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                            Active ({rec.status})
                          </span>
                        )}
                      </td>
                      <td data-label="Action" className="text-right">
                        {hasPermission("data.records.manage") ? (
                          rec.deletedAt ? (
                            <button
                              type="button"
                              onClick={() => {
                                setGovActionTarget({ record: rec, action: "restore" });
                                setGovReason("");
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                            >
                              <RotateCcw className="h-3.5 w-3.5" /> Restore
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setGovActionTarget({ record: rec, action: "archive" });
                                setGovReason("");
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                            >
                              <Archive className="h-3.5 w-3.5" /> Soft Archive
                            </button>
                          )
                        ) : (
                          <span className="text-[11px] text-muted-foreground">Read-only</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 8. IMMUTABLE AUDIT LOGS SECTION                                   */}
      {/* ================================================================= */}
      {activeSection === "audit" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="relative sm:col-span-2">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                name="audit_log_search"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Filter audit trail by actor email, action key, or summary..."
                className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <select
              aria-label="Filter audit module"
              value={auditModuleFilter}
              onChange={(e) => setAuditModuleFilter(e.target.value)}
              className="rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-semibold text-foreground"
            >
              <option value="all">All Modules</option>
              <option value="Users">Users</option>
              <option value="Roles & Entitlements">Roles &amp; Entitlements</option>
              <option value="System & Security">System &amp; Security</option>
              <option value="Data Governance">Data Governance</option>
              <option value="CMS">CMS</option>
            </select>

            <select
              aria-label="Filter audit severity"
              value={auditSeverityFilter}
              onChange={(e) => setAuditSeverityFilter(e.target.value)}
              className="rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-semibold text-foreground"
            >
              <option value="all">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <h4 id="audit-logs-heading" className="sr-only">
            Immutable Security and Access Audit Logs
          </h4>
          <div
            tabIndex={0}
            role="region"
            aria-labelledby="audit-logs-heading"
            className="rbac-table-region shadow-xs"
          >
            <table className="rbac-table text-xs">
              <thead>
                <tr>
                  <th scope="col">Timestamp</th>
                  <th scope="col">Actor</th>
                  <th scope="col">Action</th>
                  <th scope="col">Summary</th>
                  <th scope="col">Severity</th>
                  <th scope="col" className="text-right">
                    State Diff
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id}>
                    <td data-label="Timestamp" className="whitespace-nowrap text-muted-foreground">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td data-label="Actor">
                      <p className="font-bold text-foreground">{log.actorEmail}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {log.actorRole} • {log.ipAddress}
                      </p>
                    </td>
                    <td data-label="Action">
                      <code className="rounded bg-secondary px-2 py-0.5 text-[11px] font-bold">
                        {log.actionKey}
                      </code>
                    </td>
                    <td data-label="Summary" className="max-w-md">
                      {log.summary}
                    </td>
                    <td data-label="Severity">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                          log.severity === "critical"
                            ? "bg-rose-100 text-rose-800"
                            : log.severity === "warning"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td data-label="Diff" className="text-right">
                      <button
                        type="button"
                        onClick={() => setInspectingAudit(log)}
                        className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-bold text-foreground hover:border-primary hover:text-primary cursor-pointer"
                      >
                        Inspect JSON
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 9. SESSIONS & SECURITY SECTION                                    */}
      {/* ================================================================= */}
      {activeSection === "security" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="panel-card p-5 space-y-1.5">
              <p className="font-display text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                Session Transport
              </p>
              <p className="font-display text-sm font-black text-foreground">
                HttpOnly + SameSite=Lax
              </p>
              <p className="text-xs text-muted-foreground">
                Zero client localStorage session tokens; SHA-256 hashed server session store.
              </p>
            </div>
            <div className="panel-card p-5 space-y-1.5">
              <p className="font-display text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                Password Hashing
              </p>
              <p className="font-display text-sm font-black text-foreground">
                PBKDF2-HMAC-SHA256 (210k)
              </p>
              <p className="text-xs text-muted-foreground">
                OWASP-compliant salted derivation + constant-time verification.
              </p>
            </div>
            <div className="panel-card p-5 space-y-1.5">
              <p className="font-display text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                Escalation Guard
              </p>
              <p className="font-display text-sm font-black text-foreground">
                Super Admin Anti-Lockout
              </p>
              <p className="text-xs text-muted-foreground">
                Blocks demoting, archiving, or suspending the last active Super Admin.
              </p>
            </div>
            <div className="panel-card p-5 space-y-1.5">
              <p className="font-display text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                Mutation Defense
              </p>
              <p className="font-display text-sm font-black text-foreground">
                Origin CSRF + Rate Limiter
              </p>
              <p className="text-xs text-muted-foreground">
                Cross-origin POST rejection and sliding-window brute-force throttling.
              </p>
            </div>
          </div>

          <div className="panel-card">
            <div className="panel-card-header flex items-center justify-between">
              <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-foreground">
                Active Authenticated Sessions ({snapshot.activeSessions.length})
              </h3>
            </div>
            <h4 id="active-sessions-heading" className="sr-only">
              Active User Sessions Table
            </h4>
            <div
              tabIndex={0}
              role="region"
              aria-labelledby="active-sessions-heading"
              className="rbac-table-region border-0 rounded-none"
            >
              <table className="rbac-table text-xs">
                <thead>
                  <tr>
                    <th scope="col">User</th>
                    <th scope="col">Device &amp; Client</th>
                    <th scope="col">IP Address</th>
                    <th scope="col">Last Active</th>
                    <th scope="col">Expires</th>
                    <th scope="col" className="text-right">
                      Revoke
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.activeSessions.map((sess) => (
                    <tr key={sess.id}>
                      <td data-label="User">
                        <p className="font-bold text-foreground">{sess.userName}</p>
                        <p className="text-[11px] text-muted-foreground">{sess.userEmail}</p>
                      </td>
                      <td data-label="Device">
                        <p className="font-semibold text-foreground">{sess.deviceLabel}</p>
                        <p className="max-w-xs truncate text-[10px] text-muted-foreground">
                          {sess.userAgent}
                        </p>
                      </td>
                      <td data-label="IP">{sess.ipAddress}</td>
                      <td data-label="Last Active">{formatDateTime(sess.lastActiveAt)}</td>
                      <td data-label="Expires">{formatShortDate(sess.expiresAt)}</td>
                      <td data-label="Revoke" className="text-right">
                        {hasPermission("user.suspend") && (
                          <button
                            type="button"
                            onClick={() => void handleRevokeSession({ sessionId: sess.id })}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
                          >
                            <LogOut className="h-3.5 w-3.5" /> Force Sign-Out
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* SLIDE-OVER DRAWER: 7-TAB USER DETAIL & ACCESS CONTROL             */}
      {/* ================================================================= */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-ink/60 backdrop-blur-xs"
          onClick={() => setSelectedUserId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Manage ${selectedUser.name}`}
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-2xl flex-col bg-card shadow-2xl border-l border-border"
          >
            {/* Drawer Header */}
            <div className="flex items-start justify-between gap-4 border-b border-border bg-secondary/50 px-6 py-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-primary/40 bg-primary/10 font-display text-sm font-black text-primary">
                  {selectedUser.avatar ? (
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials(selectedUser.name)
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-black text-foreground truncate">
                      {selectedUser.name}
                    </h3>
                    <StatusBadge status={selectedUser.accountStatus} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{selectedUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserId(null)}
                aria-label="Close user drawer"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 7 Drawer Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-4 pt-2 thin-scrollbar">
              {(
                [
                  { id: "overview", label: "Overview" },
                  { id: "roles", label: "Roles" },
                  { id: "permissions", label: "Permissions" },
                  { id: "features", label: "Feature Access" },
                  { id: "scopes", label: "Data Access" },
                  { id: "activity", label: "Activity" },
                  { id: "security", label: "Security" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDrawerTab(t.id)}
                  className={`shrink-0 border-b-2 px-3 py-2 text-xs font-bold transition cursor-pointer ${
                    drawerTab === t.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {drawerTab === "overview" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="panel-inner-tile">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">
                        Portal Classification
                      </p>
                      <p className="mt-1 font-display text-sm font-black uppercase text-foreground">
                        {selectedUser.portalRole === "admin"
                          ? "Admin / Internal Staff"
                          : selectedUser.portalRole === "client"
                          ? "Event Organizer"
                          : "Member / Attendee"}
                      </p>
                    </div>
                    <div className="panel-inner-tile">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">
                        Organization &amp; Phone
                      </p>
                      <p className="mt-1 font-bold text-foreground">
                        {selectedUser.organizationName || "Individual Account"}
                      </p>
                      <p className="text-muted-foreground">
                        {selectedUser.phone || "No phone on file"}
                      </p>
                    </div>
                  </div>

                  <div className="panel-inner-tile space-y-2">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">
                      Effective Capabilities Summary
                    </p>
                    <p className="text-foreground">
                      Holds <strong>{selectedUser.effectivePermissions.length}</strong> active
                      permissions across <strong>{selectedUser.effectiveFeatures.length}</strong>{" "}
                      enabled modules under <ScopeBadge scope={selectedUser.dataScope} /> boundary.
                    </p>
                  </div>

                  {hasPermission("user.suspend") && (
                    <div className="rounded-xl border border-border p-4 space-y-3">
                      <p className="font-display text-xs font-extrabold uppercase text-foreground">
                        Account Lifecycle Controls
                      </p>
                      <input
                        type="text"
                        value={statusReason}
                        onChange={(e) => setStatusReason(e.target.value)}
                        placeholder="Mandatory audit reason (min 5 characters)..."
                        className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs"
                      />
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.accountStatus !== "active" && (
                          <button
                            type="button"
                            onClick={() => void handleStatusTransition(selectedUser, "active")}
                            className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                          >
                            Activate Account
                          </button>
                        )}
                        {selectedUser.accountStatus !== "suspended" && (
                          <button
                            type="button"
                            onClick={() => void handleStatusTransition(selectedUser, "suspended")}
                            className="rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 cursor-pointer"
                          >
                            Suspend &amp; Sign Out
                          </button>
                        )}
                        {selectedUser.accountStatus !== "deactivated" && (
                          <button
                            type="button"
                            onClick={() =>
                              void handleStatusTransition(selectedUser, "deactivated")
                            }
                            className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {drawerTab === "roles" && (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Assign one or more RBAC roles. Super Admin assignments are strictly restricted
                    to existing Super Admins, and the last active Super Admin cannot be demoted.
                  </p>
                  <div className="space-y-2.5">
                    {snapshot.roles.map((r) => {
                      const checked = editRoleKeys.includes(r.key);
                      const lockedSuperAdmin = r.key === "super_admin" && !actorIsSuperAdmin;
                      return (
                        <label
                          key={r.key}
                          className={`flex items-start gap-3 rounded-xl border p-3.5 transition ${
                            checked
                              ? "border-primary bg-primary/5"
                              : "border-border bg-card hover:bg-secondary/40"
                          } ${lockedSuperAdmin ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <input
                            type="checkbox"
                            disabled={lockedSuperAdmin}
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditRoleKeys((prev) => [...prev, r.key]);
                              } else {
                                setEditRoleKeys((prev) => prev.filter((k) => k !== r.key));
                              }
                            }}
                            className="mt-0.5 h-4 w-4 accent-primary"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-foreground">{r.name}</span>
                              <ScopeBadge scope={r.defaultScope} />
                            </div>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              {r.description}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {drawerTab === "permissions" && (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Explicit <strong>DENY</strong> always overrides inherited role grants. Critical
                    security permissions require Super Admin privilege.
                  </p>
                  {PERMISSION_MODULES.map((mod) => {
                    const modPerms = PERMISSION_CATALOG.filter((p) => p.module === mod);
                    return (
                      <div key={mod} className="rounded-xl border border-border overflow-hidden">
                        <div className="bg-secondary px-4 py-2 font-display text-[11px] font-extrabold uppercase tracking-wider text-foreground">
                          {mod}
                        </div>
                        <div className="divide-y divide-border">
                          {modPerms.map((perm) => {
                            const currentOv = editOverrides[perm.key]?.effect ?? "inherit";
                            const inheritedFromRole = snapshot.roles
                              .filter((r) => editRoleKeys.includes(r.key))
                              .some((r) => r.permissions.includes(perm.key));
                            const criticalLocked = perm.isCritical && !actorIsSuperAdmin;

                            return (
                              <div
                                key={perm.key}
                                className="flex flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div className="min-w-0">
                                  <p className="font-bold text-foreground flex items-center gap-1.5">
                                    <span>{perm.label}</span>
                                    {inheritedFromRole && (
                                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                        Role Grant
                                      </span>
                                    )}
                                    {perm.isCritical && (
                                      <Lock className="h-3 w-3 text-primary" />
                                    )}
                                  </p>
                                  <p className="font-mono text-[10px] text-muted-foreground">
                                    {perm.key}
                                  </p>
                                </div>

                                <select
                                  aria-label={`Override for ${perm.label}`}
                                  disabled={criticalLocked}
                                  value={currentOv}
                                  onChange={(e) => {
                                    const nextEffect = e.target.value as
                                      | "inherit"
                                      | "allow"
                                      | "deny";
                                    setEditOverrides((prev) => ({
                                      ...prev,
                                      [perm.key]: {
                                        effect: nextEffect,
                                        reason:
                                          prev[perm.key]?.reason ??
                                          `Admin ${nextEffect} override`,
                                      },
                                    }));
                                  }}
                                  className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-bold"
                                >
                                  <option value="inherit">Inherit Role</option>
                                  <option value="allow">Explicit ALLOW</option>
                                  <option value="deny">Explicit DENY</option>
                                </select>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {drawerTab === "features" && (
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    Configure per-user module entitlement overrides on top of role &amp;
                    organization defaults.
                  </p>
                  {FEATURE_CATALOG.map((feat) => {
                    const userHasStaffRole = editRoleKeys.some((rk) => isStaffRoleKey(rk));
                    const blockedForNonStaff = feat.staffOnly && !userHasStaffRole;
                    const currentVal = editFeatureMap[feat.key] ?? "inherit";

                    return (
                      <div
                        key={feat.key}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border p-3.5"
                      >
                        <div>
                          <p className="font-bold text-foreground">{feat.label}</p>
                          <p className="text-[11px] text-muted-foreground">{feat.description}</p>
                        </div>
                        <select
                          aria-label={`Feature ${feat.label}`}
                          disabled={blockedForNonStaff}
                          value={blockedForNonStaff ? "off" : currentVal}
                          onChange={(e) =>
                            setEditFeatureMap((prev) => ({
                              ...prev,
                              [feat.key]: e.target.value as "inherit" | "on" | "off",
                            }))
                          }
                          className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-bold"
                        >
                          <option value="inherit">Inherit Default</option>
                          <option value="on">Force Enable</option>
                          <option value="off">Force Disable</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}

              {drawerTab === "scopes" && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-display text-[11px] font-extrabold uppercase text-foreground mb-1.5">
                      Object-Level Data Scope Boundary
                    </label>
                    <select
                      value={editScope}
                      onChange={(e) => setEditScope(e.target.value as DataScope)}
                      className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-bold"
                    >
                      <option value="GLOBAL">GLOBAL — All Platform Records (Staff Only)</option>
                      <option value="ORGANIZATION">
                        ORGANIZATION — Bound Organization Tenant Records Only
                      </option>
                      <option value="ASSIGNED">
                        ASSIGNED — Explicitly Assigned Event / Booking IDs Only
                      </option>
                      <option value="OWN">OWN — Personal Self-Created Records Only</option>
                    </select>
                  </div>

                  <div>
                    <p className="font-display text-[11px] font-extrabold uppercase text-foreground mb-1.5">
                      Organization Memberships
                    </p>
                    <div className="space-y-2">
                      {snapshot.organizations
                        .filter((o) => !o.deletedAt)
                        .map((org) => {
                          const checked = editOrgIds.includes(org.id);
                          return (
                            <label
                              key={org.id}
                              className="flex items-center gap-2.5 rounded-xl border border-border p-3 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditOrgIds((prev) => [...prev, org.id]);
                                  } else {
                                    setEditOrgIds((prev) => prev.filter((id) => id !== org.id));
                                  }
                                }}
                                className="h-4 w-4 accent-primary"
                              />
                              <span className="font-bold text-foreground">{org.name}</span>
                              <span className="text-[11px] text-muted-foreground">
                                ({org.orgType})
                              </span>
                            </label>
                          );
                        })}
                    </div>
                  </div>

                  <div>
                    <label className="block font-display text-[11px] font-extrabold uppercase text-foreground mb-1.5">
                      Scoped Event / Booking IDs (Comma-Separated for ASSIGNED Scope)
                    </label>
                    <input
                      type="text"
                      value={editScopedEventsText}
                      onChange={(e) => setEditScopedEventsText(e.target.value)}
                      placeholder="e.g., EVT-301, BKG-204"
                      className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs"
                    />
                  </div>
                </div>
              )}

              {drawerTab === "activity" && (
                <div className="space-y-2.5">
                  {snapshot.auditLogs
                    .filter(
                      (l) =>
                        l.entityId === selectedUser.id || l.actorEmail === selectedUser.email
                    )
                    .slice(0, 20)
                    .map((log) => (
                      <div key={log.id} className="rounded-xl border border-border p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <code className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-bold">
                            {log.actionKey}
                          </code>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDateTime(log.createdAt)}
                          </span>
                        </div>
                        <p className="text-foreground">{log.summary}</p>
                      </div>
                    ))}
                </div>
              )}

              {drawerTab === "security" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="panel-inner-tile">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">
                        Active Sessions
                      </p>
                      <p className="mt-1 font-display text-xl font-black text-foreground">
                        {selectedUser.activeSessionCount}
                      </p>
                    </div>
                    <div className="panel-inner-tile">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">
                        Last Known IP
                      </p>
                      <p className="mt-1 font-mono text-sm font-bold text-foreground">
                        {selectedUser.lastLoginIp || "—"}
                      </p>
                    </div>
                  </div>

                  {hasPermission("user.suspend") && (
                    <button
                      type="button"
                      onClick={() => void handleRevokeSession({ targetUserId: selectedUser.id })}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" /> Revoke All Active Sessions for{" "}
                      {selectedUser.name}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Save Footer for RBAC Tabs */}
            {(drawerTab === "roles" ||
              drawerTab === "permissions" ||
              drawerTab === "features" ||
              drawerTab === "scopes") &&
              hasPermission("user.assign_role") && (
                <div className="border-t border-border bg-secondary/40 px-6 py-4 space-y-2.5">
                  <input
                    type="text"
                    value={accessAuditNote}
                    onChange={(e) => setAccessAuditNote(e.target.value)}
                    placeholder="Optional audit note for this access change..."
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedUserId(null)}
                      className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSavingUserAccess}
                      onClick={() => void handleSaveUserAccess()}
                      className="btn-red rounded-xl px-5 py-2 text-xs cursor-pointer"
                    >
                      {isSavingUserAccess ? "Saving RBAC..." : "Save Access Policy"}
                    </button>
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: PROVISION / INVITE USER                                    */}
      {/* ================================================================= */}
      {inviteOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 backdrop-blur-xs"
          onClick={() => setInviteOpen(false)}
        >
          <form
            onSubmit={handleInviteSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-black uppercase text-foreground">
                Invite &amp; Provision Platform Account
              </h3>
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                aria-label="Close invite modal"
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block font-bold text-foreground mb-1">Full Name *</label>
                <input
                  type="text"
                  name="provision_full_name"
                  autoComplete="name"
                  required
                  value={invName}
                  onChange={(e) => setInvName(e.target.value)}
                  placeholder="e.g., Nisha Verma"
                  className="w-full rounded-xl border border-border bg-card px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-bold text-foreground mb-1">Official Email *</label>
                <input
                  type="email"
                  name="provision_email"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  required
                  value={invEmail}
                  onChange={(e) => setInvEmail(e.target.value)}
                  placeholder="nisha@siddwhizz.com"
                  className="w-full rounded-xl border border-border bg-card px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-bold text-foreground mb-1">Phone (Optional)</label>
                <input
                  type="tel"
                  name="provision_phone"
                  autoComplete="tel"
                  value={invPhone}
                  onChange={(e) => setInvPhone(e.target.value)}
                  placeholder="+91 98200 00000"
                  className="w-full rounded-xl border border-border bg-card px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-bold text-foreground mb-1">
                  Organization / Team
                </label>
                <input
                  type="text"
                  name="provision_org"
                  autoComplete="organization"
                  value={invOrg}
                  onChange={(e) => setInvOrg(e.target.value)}
                  placeholder="SIDD.WHIZZ Editorial"
                  className="w-full rounded-xl border border-border bg-card px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block font-bold text-foreground mb-1">Initial Role *</label>
                <select
                  value={invRoleKeys[0] ?? "operations_admin"}
                  onChange={(e) => {
                    const rk = e.target.value;
                    setInvRoleKeys([rk]);
                    const matched = snapshot.roles.find((r) => r.key === rk);
                    if (matched) setInvScope(matched.defaultScope);
                  }}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 font-semibold"
                >
                  {snapshot.roles
                    .filter((r) => actorIsSuperAdmin || r.key !== "super_admin")
                    .map((r) => (
                      <option key={r.key} value={r.key}>
                        {r.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Data Scope *</label>
                <select
                  value={invScope}
                  onChange={(e) => setInvScope(e.target.value as DataScope)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 font-semibold"
                >
                  <option value="GLOBAL">GLOBAL</option>
                  <option value="ORGANIZATION">ORGANIZATION</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="OWN">OWN</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">
                Initial Password (Optional — auto-generated if blank)
              </label>
              <div className="relative">
                <input
                  type={showTempPass ? "text" : "password"}
                  name="provision_temp_password"
                  autoComplete="new-password"
                  value={invTempPassword}
                  onChange={(e) => setInvTempPassword(e.target.value)}
                  placeholder="Minimum 8 characters if set manually"
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 pr-10"
                />
                <button
                  type="button"
                  aria-label={showTempPass ? "Hide password" : "Show password"}
                  aria-pressed={showTempPass}
                  onClick={() => setShowTempPass((p) => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showTempPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="rounded-xl border border-border px-4 py-2 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingInvite}
                className="btn-red rounded-xl px-5 py-2 text-xs cursor-pointer"
              >
                {isSubmittingInvite ? "Provisioning..." : "Provision User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================================================================= */}
      {/* DRAWER: CREATE / EDIT RBAC ROLE                                   */}
      {/* ================================================================= */}
      {roleDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-ink/60 backdrop-blur-xs"
          onClick={() => setRoleDrawerOpen(false)}
        >
          <form
            onSubmit={handleSaveRole}
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-xl flex-col bg-card shadow-2xl border-l border-border text-xs"
          >
            <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-6 py-4">
              <div>
                <h3 className="font-display text-base font-black uppercase text-foreground">
                  {editingRoleOriginalKey ? `Role: ${roleNameVal}` : "Create Custom RBAC Role"}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Configure action permissions, default module entitlements, and scope boundary.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRoleDrawerOpen(false)}
                aria-label="Close role drawer"
                className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {isEditingProtectedSuperAdminRole && (
                <div className="rounded-xl border border-primary/30 bg-primary/10 p-3.5 flex items-start gap-2.5">
                  <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-foreground font-medium">
                    <strong>Protected System Role:</strong> Super Admin retains immutable full
                    platform governance and cannot be stripped of permissions or archived.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-foreground mb-1">Role Display Name *</label>
                  <input
                    type="text"
                    required
                    disabled={isEditingProtectedSuperAdminRole}
                    value={roleNameVal}
                    onChange={(e) => {
                      setRoleNameVal(e.target.value);
                      if (!editingRoleOriginalKey) {
                        setRoleKeyVal(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "_")
                            .replace(/^_|_$/g, "")
                        );
                      }
                    }}
                    placeholder="e.g., Stage Coordinator"
                    className="w-full rounded-xl border border-border bg-card px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">Role Key (slug) *</label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingRoleOriginalKey)}
                    value={roleKeyVal}
                    onChange={(e) => setRoleKeyVal(e.target.value)}
                    placeholder="stage_coordinator"
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">Description *</label>
                <input
                  type="text"
                  required
                  disabled={isEditingProtectedSuperAdminRole}
                  value={roleDescVal}
                  onChange={(e) => setRoleDescVal(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">Default Scope</label>
                  <select
                    disabled={isEditingProtectedSuperAdminRole}
                    value={roleScopeVal}
                    onChange={(e) => setRoleScopeVal(e.target.value as DataScope)}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 font-bold"
                  >
                    <option value="GLOBAL">GLOBAL</option>
                    <option value="ORGANIZATION">ORGANIZATION</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="OWN">OWN</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-foreground mb-1">Status</label>
                  <select
                    disabled={isEditingProtectedSuperAdminRole}
                    value={roleStatusVal}
                    onChange={(e) => setRoleStatusVal(e.target.value as "active" | "archived")}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 font-bold"
                  >
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Default Features */}
              <div>
                <p className="font-display text-[11px] font-extrabold uppercase text-foreground mb-2">
                  Default Enabled Modules
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {FEATURE_CATALOG.map((f) => {
                    const checked = roleFeaturesVal.includes(f.key);
                    return (
                      <label
                        key={f.key}
                        className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          disabled={isEditingProtectedSuperAdminRole}
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRoleFeaturesVal((prev) => [...prev, f.key]);
                            } else {
                              setRoleFeaturesVal((prev) => prev.filter((k) => k !== f.key));
                            }
                          }}
                          className="h-3.5 w-3.5 accent-primary"
                        />
                        <span className="font-semibold text-foreground">{f.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Grouped Permissions */}
              <div className="space-y-3">
                <p className="font-display text-[11px] font-extrabold uppercase text-foreground">
                  Action Permissions ({rolePermsVal.length} selected)
                </p>
                {PERMISSION_MODULES.map((mod) => {
                  const perms = PERMISSION_CATALOG.filter((p) => p.module === mod);
                  return (
                    <div key={mod} className="rounded-xl border border-border p-3 space-y-2">
                      <p className="font-display text-[10px] font-extrabold uppercase tracking-wider text-primary">
                        {mod}
                      </p>
                      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                        {perms.map((p) => {
                          const checked = rolePermsVal.includes(p.key);
                          const critLocked =
                            isEditingProtectedSuperAdminRole ||
                            (CRITICAL_PERMISSION_KEYS.has(p.key) && !actorIsSuperAdmin);
                          return (
                            <label
                              key={p.key}
                              className="flex items-start gap-2 rounded-lg p-1.5 hover:bg-secondary/50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                disabled={critLocked}
                                checked={checked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setRolePermsVal((prev) => [...prev, p.key]);
                                  } else {
                                    setRolePermsVal((prev) => prev.filter((k) => k !== p.key));
                                  }
                                }}
                                className="mt-0.5 h-3.5 w-3.5 accent-primary"
                              />
                              <span>
                                <span className="font-bold text-foreground block">{p.label}</span>
                                <span className="font-mono text-[10px] text-muted-foreground">
                                  {p.key}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {!isEditingProtectedSuperAdminRole && (
              <div className="border-t border-border bg-secondary/40 px-6 py-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRoleDrawerOpen(false)}
                  className="rounded-xl border border-border bg-card px-4 py-2 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingRole}
                  className="btn-red rounded-xl px-5 py-2 text-xs cursor-pointer"
                >
                  {isSavingRole ? "Saving Role..." : "Save Role Definition"}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: ORGANIZER APPLICATION REVIEW                               */}
      {/* ================================================================= */}
      {reviewModalApp && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 backdrop-blur-xs"
          onClick={() => setReviewModalApp(null)}
        >
          <form
            onSubmit={handleSubmitOrganizerReview}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 text-xs"
          >
            <h3 className="font-display text-base font-black uppercase text-foreground">
              {reviewDecision === "approved"
                ? "Approve Organizer & Activate Tenant"
                : reviewDecision === "changes_requested"
                ? "Request Additional Verification"
                : "Reject Organizer Application"}
            </h3>
            <p className="text-muted-foreground">
              Organization: <strong>{reviewModalApp.organizationName}</strong> (
              {reviewModalApp.applicantEmail})
            </p>
            <div>
              <label className="block font-bold text-foreground mb-1">
                Review Note / Reason *
              </label>
              <textarea
                rows={3}
                required
                value={reviewReason}
                onChange={(e) => setReviewReason(e.target.value)}
                placeholder="Enter decision note recorded in audit log & visible to applicant..."
                className="w-full rounded-xl border border-border bg-card p-3"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewModalApp(null)}
                className="rounded-xl border border-border px-4 py-2 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingReview}
                className="btn-red rounded-xl px-5 py-2 text-xs cursor-pointer"
              >
                {isSubmittingReview ? "Recording..." : "Confirm Decision"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: CONTROLLED GOVERNANCE CONFIRMATION                         */}
      {/* ================================================================= */}
      {govActionTarget && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 backdrop-blur-xs"
          onClick={() => setGovActionTarget(null)}
        >
          <form
            onSubmit={handleConfirmGovernanceAction}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 text-xs"
          >
            <h3 className="font-display text-base font-black uppercase text-foreground">
              {govActionTarget.action === "archive"
                ? "Confirm Soft-Delete (Archive)"
                : "Confirm Record Restoration"}
            </h3>
            <p className="text-muted-foreground">
              Target: <strong>{govActionTarget.record.title}</strong> (
              <code>{govActionTarget.record.entityType}</code>)
            </p>
            <div>
              <label className="block font-bold text-foreground mb-1">
                Mandatory Audit Reason *
              </label>
              <input
                type="text"
                required
                value={govReason}
                onChange={(e) => setGovReason(e.target.value)}
                placeholder="Explain why this record is being archived or restored..."
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setGovActionTarget(null)}
                className="rounded-xl border border-border px-4 py-2 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingGov}
                className="btn-red rounded-xl px-5 py-2 text-xs cursor-pointer"
              >
                {isSubmittingGov ? "Applying..." : "Confirm & Audit"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: AUDIT BEFORE / AFTER JSON DIFF INSPECTOR                   */}
      {/* ================================================================= */}
      {inspectingAudit && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 backdrop-blur-xs"
          onClick={() => setInspectingAudit(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-sm font-black uppercase text-foreground">
                  Immutable Audit State Diff
                </h3>
                <p className="text-muted-foreground mt-0.5">
                  {inspectingAudit.actionKey} • {formatDateTime(inspectingAudit.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingAudit(null)}
                aria-label="Close audit inspector"
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="rounded-xl bg-secondary p-3 font-medium text-foreground">
              {inspectingAudit.summary}
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="font-display text-[10px] font-extrabold uppercase text-muted-foreground mb-1">
                  Before State
                </p>
                <pre className="max-h-60 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-[11px] text-slate-200">
                  {JSON.stringify(inspectingAudit.beforeState ?? null, null, 2)}
                </pre>
              </div>
              <div>
                <p className="font-display text-[10px] font-extrabold uppercase text-muted-foreground mb-1">
                  After State
                </p>
                <pre className="max-h-60 overflow-auto rounded-xl border border-border bg-slate-950 p-3 text-[11px] text-emerald-300">
                  {JSON.stringify(inspectingAudit.afterState ?? null, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

