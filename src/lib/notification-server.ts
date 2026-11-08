/**
 * SIDD.WHIZZ — Centralized Notification Engine & Server Functions
 * Enterprise multi-role delivery (Admin, Organizer, Member) with
 * Neon DB and Vercel Hosting infrastructure alerts.
 */

import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";
import type {
  EnrichedNotification,
  InfrastructureAlert,
  NotificationCategory,
  NotificationPreferences,
  NotificationPriority,
  NotificationRecord,
  NotificationRecipientRecord,
  NotificationSummaryDTO,
  SerializablePrimitive,
  UserRole,
} from "@/lib/notification-types";
import { requireServerAuth } from "@/lib/auth-server";

// ============================================================================
// IN-MEMORY / POSTGRES PERSISTENT SERVER STATE
// ============================================================================

interface ServerNotificationState {
  bootstrapped: boolean;
  neonSynced: boolean;
  notifications: Map<string, NotificationRecord>;
  recipients: Map<string, NotificationRecipientRecord>;
  preferences: Map<string, NotificationPreferences>;
  infraAlerts: InfrastructureAlert[];
}

const serverNotifState: ServerNotificationState = {
  bootstrapped: false,
  neonSynced: false,
  notifications: new Map(),
  recipients: new Map(),
  preferences: new Map(),
  infraAlerts: [],
};

function getDatabaseUrl(): string {
  if (typeof process === "undefined") return "";
  return (process.env?.["DATABASE_URL"] || process.env?.["DIRECT_URL"] || "").trim();
}

function getNeonClient() {
  const url = getDatabaseUrl();
  if (!url) return null;
  try {
    return neon(url);
  } catch {
    return null;
  }
}

// ============================================================================
// BOOTSTRAP DEFAULT SEED NOTIFICATIONS
// ============================================================================

export async function ensureNotificationEngineBootstrapped(): Promise<void> {
  if (serverNotifState.bootstrapped) return;
  serverNotifState.bootstrapped = true;

  const now = Date.now();
  const timeOffset = (mins: number) => new Date(now - mins * 60 * 1000).toISOString();

  // 1. Initial Master Notifications
  const initialNotifications: NotificationRecord[] = [
    // --- ADMIN NOTIFICATIONS ---
    {
      id: "notif_adm_01",
      title: "New High-Priority Booking Request",
      message: "Tata Motors Conclave 2026 requested Siddharth Maurya for a 2-day national summit in Mumbai.",
      category: "booking",
      priority: "high",
      roleTarget: "admin",
      eventType: "booking.created",
      entityType: "booking",
      entityId: "BK-902",
      link: "/admin?tab=booking",
      actionLabel: "Review Booking Request",
      metadata: { budget: "₹8,50,000", client: "Tata Motors Leadership Council" },
      createdAt: timeOffset(12),
    },
    {
      id: "notif_adm_02",
      title: "Organizer Application Submitted",
      message: "Horizon Live Conclaves Pvt Ltd applied for verified organizer accreditation. Review GST and company credentials.",
      category: "enquiries",
      priority: "high",
      roleTarget: "admin",
      eventType: "organizer.applied",
      entityType: "user",
      entityId: "usr_client_pending_01",
      link: "/admin?tab=users",
      actionLabel: "Review Application",
      metadata: { company: "Horizon Live Conclaves Pvt Ltd", contact: "Vikram Malhotra" },
      createdAt: timeOffset(35),
    },
    {
      id: "notif_adm_03",
      title: "Neon Database Compute Alert",
      message: "Neon serverless compute consumption reached 82% threshold during live registration spike.",
      category: "infrastructure",
      priority: "critical",
      roleTarget: "admin",
      eventType: "infra.neon.compute_threshold",
      entityType: "infrastructure",
      entityId: "neon_alert_01",
      link: "/admin?tab=notifications",
      actionLabel: "View Infrastructure Health",
      metadata: { metric: "compute_units", value: "82%", region: "aws-ap-southeast-1" },
      createdAt: timeOffset(65),
    },
    {
      id: "notif_adm_04",
      title: "CMS Home Page Published Successfully",
      message: "6 section updates and new typography theme tokens were promoted to production website.",
      category: "cms",
      priority: "success",
      roleTarget: "admin",
      eventType: "cms.published",
      entityType: "cms_page",
      entityId: "home",
      link: "/admin?tab=cms",
      actionLabel: "Open CMS Studio",
      metadata: { publishedBy: "Siddharth Maurya", version: 4 },
      createdAt: timeOffset(120),
    },
    {
      id: "notif_adm_05",
      title: "Vercel Production Deployment Ready",
      message: "Vercel build #65.11 for commit c006c62 successfully deployed to edge network across 18 regions.",
      category: "infrastructure",
      priority: "low",
      roleTarget: "admin",
      eventType: "infra.vercel.deploy_success",
      entityType: "infrastructure",
      entityId: "dpl_vercel_01",
      link: "https://sidwizz-portfolio.vercel.app",
      actionLabel: "Visit Live Deployment",
      metadata: { domain: "sidwizz-portfolio.vercel.app", commit: "c006c62" },
      createdAt: timeOffset(180),
    },
    {
      id: "notif_adm_06",
      title: "Organizer Sent Technical Rider Query",
      message: "Priya Sharma (Tech Summit) sent a message regarding custom wireless mic frequencies and stage monitor setup.",
      category: "messages",
      priority: "medium",
      roleTarget: "admin",
      eventType: "message.organizer",
      entityType: "message",
      entityId: "msg_org_01",
      link: "/admin?tab=booking",
      actionLabel: "Open Conversation",
      metadata: { organizer: "Priya Sharma", event: "Apex Global Tech Summit" },
      createdAt: timeOffset(240),
    },

    // --- ORGANIZER NOTIFICATIONS (usr_client_01 - Priya Sharma) ---
    {
      id: "notif_org_01",
      title: "Stage Booking Confirmed by Admin",
      message: "Siddharth Maurya has officially accepted and locked the keynote emcee slot for Apex Global Tech Summit 2026.",
      category: "booking",
      priority: "success",
      roleTarget: "client",
      targetUserId: "usr_client_01",
      targetOrganizationId: "org_apex_01",
      eventType: "booking.confirmed",
      entityType: "booking",
      entityId: "BK-901",
      link: "/organizer?tab=bookings",
      actionLabel: "View Confirmed Booking",
      metadata: { eventDate: "2026-03-18", venue: "Jio World Convention Centre, Mumbai" },
      createdAt: timeOffset(20),
    },
    {
      id: "notif_org_02",
      title: "Host Technical Stage Rider Attached",
      message: "Management team uploaded the audio, lighting, and hospitality rider for Siddharth Maurya.",
      category: "events",
      priority: "medium",
      roleTarget: "client",
      targetUserId: "usr_client_01",
      targetOrganizationId: "org_apex_01",
      eventType: "event.rider_updated",
      entityType: "event",
      entityId: "EVT-TECH-01",
      link: "/organizer?tab=events",
      actionLabel: "Download Stage Rider",
      metadata: { riderUrl: "/assets/host-stage-rider.pdf" },
      createdAt: timeOffset(90),
    },
    {
      id: "notif_org_03",
      title: "Attendee Registration Milestone: 500+",
      message: "Apex Global Tech Summit crossed 500 confirmed registrations. QR digital passes are dispatching.",
      category: "attendees",
      priority: "low",
      roleTarget: "client",
      targetUserId: "usr_client_01",
      targetOrganizationId: "org_apex_01",
      eventType: "event.registrations_milestone",
      entityType: "event",
      entityId: "EVT-TECH-01",
      link: "/organizer?tab=booking",
      actionLabel: "View Attendees List",
      metadata: { totalAttendees: 520, capacity: 800 },
      createdAt: timeOffset(150),
    },
    {
      id: "notif_org_04",
      title: "Payment Receipt Verified",
      message: "Advance token transfer for BK-901 was successfully verified by finance operations.",
      category: "payments",
      priority: "success",
      roleTarget: "client",
      targetUserId: "usr_client_01",
      targetOrganizationId: "org_apex_01",
      eventType: "payment.verified",
      entityType: "booking",
      entityId: "BK-901",
      link: "/organizer?tab=bookings",
      actionLabel: "View Invoice",
      metadata: { amount: "₹2,50,000", invoiceNo: "INV-2026-0042" },
      createdAt: timeOffset(300),
    },
    {
      id: "notif_org_05",
      title: "Direct Message from Siddharth Maurya",
      message: "\"Reviewed the run-of-show and keynote speaker lineup. The schedule looks high-energy and exciting!\"",
      category: "admin_messages",
      priority: "medium",
      roleTarget: "client",
      targetUserId: "usr_client_01",
      targetOrganizationId: "org_apex_01",
      eventType: "message.admin",
      entityType: "message",
      entityId: "msg_host_01",
      link: "/organizer?tab=booking",
      actionLabel: "View Message",
      metadata: { from: "Siddharth Maurya" },
      createdAt: timeOffset(400),
    },

    // --- MEMBER NOTIFICATIONS (usr_member_01 - Amit Verma) ---
    {
      id: "notif_mem_01",
      title: "Your VIP Digital Pass is Ready",
      message: "Pass confirmed for Apex Global Tech Summit 2026. Keep your unique QR ticket handy at the gate.",
      category: "tickets",
      priority: "high",
      roleTarget: "member",
      targetUserId: "usr_member_01",
      eventType: "ticket.generated",
      entityType: "ticket",
      entityId: "TCK-VIP-8812",
      link: "/profile",
      actionLabel: "Open My QR Pass",
      metadata: { passType: "VIP Stage Front", gate: "South Pavilion Entry Gate 3" },
      createdAt: timeOffset(25),
    },
    {
      id: "notif_mem_02",
      title: "Event Schedule & Stage Timing Update",
      message: "Auditorium doors open at 09:00 AM. Opening keynote by Siddharth Maurya begins promptly at 10:00 AM.",
      category: "event_updates",
      priority: "medium",
      roleTarget: "member",
      targetUserId: "usr_member_01",
      eventType: "event.schedule_published",
      entityType: "event",
      entityId: "EVT-TECH-01",
      link: "/profile",
      actionLabel: "View Itinerary",
      metadata: { startTime: "10:00 AM IST", date: "2026-03-18" },
      createdAt: timeOffset(180),
    },
    {
      id: "notif_mem_03",
      title: "Welcome to SIDD.WHIZZ Community",
      message: "Your attendee profile is active. You will receive priority notifications for celebrity summits, festivals, and exclusive stage conclaves.",
      category: "platform",
      priority: "low",
      roleTarget: "member",
      targetUserId: "usr_member_01",
      eventType: "account.welcome",
      entityType: "user",
      entityId: "usr_member_01",
      link: "/profile",
      actionLabel: "View Profile",
      metadata: { membershipTier: "General Delegate" },
      createdAt: timeOffset(500),
    },
  ];

  for (const n of initialNotifications) {
    serverNotifState.notifications.set(n.id, n);
  }

  // 2. Link initial recipients
  const initialRecipients: NotificationRecipientRecord[] = [
    // Admin recipients
    { id: "rcp_adm_01", notificationId: "notif_adm_01", userId: "usr_admin_01", readAt: null, archivedAt: null, isPinned: true, isStarred: true, createdAt: timeOffset(12) },
    { id: "rcp_adm_02", notificationId: "notif_adm_02", userId: "usr_admin_01", readAt: null, archivedAt: null, isPinned: true, isStarred: false, createdAt: timeOffset(35) },
    { id: "rcp_adm_03", notificationId: "notif_adm_03", userId: "usr_admin_01", readAt: null, archivedAt: null, isPinned: false, isStarred: true, createdAt: timeOffset(65) },
    { id: "rcp_adm_04", notificationId: "notif_adm_04", userId: "usr_admin_01", readAt: timeOffset(30), archivedAt: null, isPinned: false, isStarred: false, createdAt: timeOffset(120) },
    { id: "rcp_adm_05", notificationId: "notif_adm_05", userId: "usr_admin_01", readAt: timeOffset(100), archivedAt: null, isPinned: false, isStarred: false, createdAt: timeOffset(180) },
    { id: "rcp_adm_06", notificationId: "notif_adm_06", userId: "usr_admin_01", readAt: null, archivedAt: null, isPinned: false, isStarred: false, createdAt: timeOffset(240) },

    // Organizer recipients (Priya Sharma)
    { id: "rcp_org_01", notificationId: "notif_org_01", userId: "usr_client_01", readAt: null, archivedAt: null, isPinned: true, isStarred: true, createdAt: timeOffset(20) },
    { id: "rcp_org_02", notificationId: "notif_org_02", userId: "usr_client_01", readAt: null, archivedAt: null, isPinned: false, isStarred: false, createdAt: timeOffset(90) },
    { id: "rcp_org_03", notificationId: "notif_org_03", userId: "usr_client_01", readAt: timeOffset(40), archivedAt: null, isPinned: false, isStarred: false, createdAt: timeOffset(150) },
    { id: "rcp_org_04", notificationId: "notif_org_04", userId: "usr_client_01", readAt: null, archivedAt: null, isPinned: false, isStarred: false, createdAt: timeOffset(300) },
    { id: "rcp_org_05", notificationId: "notif_org_05", userId: "usr_client_01", readAt: timeOffset(200), archivedAt: null, isPinned: false, isStarred: false, createdAt: timeOffset(400) },

    // Member recipients (Amit Verma)
    { id: "rcp_mem_01", notificationId: "notif_mem_01", userId: "usr_member_01", readAt: null, archivedAt: null, isPinned: true, isStarred: true, createdAt: timeOffset(25) },
    { id: "rcp_mem_02", notificationId: "notif_mem_02", userId: "usr_member_01", readAt: null, archivedAt: null, isPinned: false, isStarred: false, createdAt: timeOffset(180) },
    { id: "rcp_mem_03", notificationId: "notif_mem_03", userId: "usr_member_01", readAt: timeOffset(300), archivedAt: null, isPinned: false, isStarred: false, createdAt: timeOffset(500) },
  ];

  for (const r of initialRecipients) {
    serverNotifState.recipients.set(r.id, r);
  }

  // 3. Infrastructure Telemetry Seed
  serverNotifState.infraAlerts = [
    {
      id: "inf_neon_01",
      service: "neon",
      type: "compute_threshold",
      severity: "critical",
      title: "Neon Compute Scaling Spike",
      summary: "Serverless compute surged to 82% CU allocation during simultaneous user logins.",
      details: { region: "aws-ap-southeast-1", activeConnections: 14, computeUnits: "0.82 / 1.0" },
      timestamp: timeOffset(65),
      resolved: false,
    },
    {
      id: "inf_neon_02",
      service: "neon",
      type: "edge_latency",
      severity: "low",
      title: "Connection Pool Healthy",
      summary: "Database connection pool response latency normalized to 18ms.",
      details: { averageLatencyMs: 18, pooler: "pgbouncer-serverless" },
      timestamp: timeOffset(250),
      resolved: true,
    },
    {
      id: "inf_vercel_01",
      service: "vercel",
      type: "deployment_success",
      severity: "success",
      title: "Vercel Production Edge Deployment Live",
      summary: "Nitro SSR worker deployed across all global edge points with 0 cold-start errors.",
      details: { deploymentUrl: "https://sidwizz-portfolio.vercel.app", buildTimeSec: 8.4 },
      timestamp: timeOffset(180),
      resolved: true,
    },
    {
      id: "inf_vercel_02",
      service: "vercel",
      type: "domain_check",
      severity: "low",
      title: "SSL Certificates Verified",
      summary: "Automated Let's Encrypt TLS certificate renewed for sidwizz-portfolio.vercel.app.",
      details: { issuer: "Let's Encrypt Authority", expires: "2027-02-08" },
      timestamp: timeOffset(600),
      resolved: true,
    },
  ];

  // 4. Default user preferences
  const defaultUserIds = ["usr_admin_01", "usr_client_01", "usr_member_01"];
  for (const uid of defaultUserIds) {
    serverNotifState.preferences.set(uid, {
      userId: uid,
      inAppEnabled: true,
      emailEnabled: true,
      pushEnabled: false,
      soundEnabled: true,
      criticalAlertsAlwaysOn: true,
      categorySettings: {
        booking: { inApp: true, email: true, push: true },
        enquiries: { inApp: true, email: true, push: true },
        cms: { inApp: true, email: false, push: false },
        infrastructure: { inApp: true, email: true, push: true },
        messages: { inApp: true, email: true, push: false },
        tickets: { inApp: true, email: true, push: true },
        security: { inApp: true, email: true, push: true },
      },
      updatedAt: new Date().toISOString(),
    });
  }

  // 5. Sync from Neon DB if available
  await syncFromNeon();
}

async function syncFromNeon() {
  const sql = getNeonClient();
  if (!sql || serverNotifState.neonSynced) return;

  try {
    const notifRows = await sql`
      SELECT id, title, message, category, priority, role_target, target_user_id,
             target_organization_id, event_type, entity_type, entity_id, link,
             action_label, metadata, created_at, expires_at
      FROM notifications
      ORDER BY created_at DESC
      LIMIT 200;
    `;

    if (Array.isArray(notifRows) && notifRows.length > 0) {
      for (const r of notifRows) {
        const row = r as Record<string, unknown>;
        const id = String(row["id"]);
        serverNotifState.notifications.set(id, {
          id,
          title: String(row["title"]),
          message: String(row["message"]),
          category: String(row["category"]) as NotificationCategory,
          priority: String(row["priority"]) as NotificationPriority,
          roleTarget: String(row["role_target"]) as UserRole | "all",
          targetUserId: row["target_user_id"] ? String(row["target_user_id"]) : null,
          targetOrganizationId: row["target_organization_id"] ? String(row["target_organization_id"]) : null,
          eventType: String(row["event_type"]),
          entityType: row["entity_type"] as NotificationRecord["entityType"],
          entityId: row["entity_id"] ? String(row["entity_id"]) : null,
          link: row["link"] ? String(row["link"]) : undefined,
          actionLabel: row["action_label"] ? String(row["action_label"]) : undefined,
          metadata: (row["metadata"] as Record<string, SerializablePrimitive>) || {},
          createdAt: String(row["created_at"]),
          expiresAt: row["expires_at"] ? String(row["expires_at"]) : null,
        });
      }
    }

    serverNotifState.neonSynced = true;
  } catch {
    // If migration hasn't run yet or table not created, safely use in-memory state
  }
}

// ============================================================================
// HELPER: ENRICH NOTIFICATIONS FOR CALLER
// ============================================================================

function getEnrichedNotificationsForUser(userId: string, role: UserRole): EnrichedNotification[] {
  const results: EnrichedNotification[] = [];

  // Match all recipient records for this user
  for (const recip of serverNotifState.recipients.values()) {
    if (recip.userId !== userId) continue;
    const notif = serverNotifState.notifications.get(recip.notificationId);
    if (!notif) continue;

    // Filter role boundary
    if (notif.roleTarget !== "all" && notif.roleTarget !== role && role !== "admin") {
      continue;
    }

    results.push({
      ...notif,
      recipientId: recip.id,
      readAt: recip.readAt,
      archivedAt: recip.archivedAt,
      isPinned: recip.isPinned,
      isStarred: recip.isStarred,
      internalNote: recip.internalNote,
      isRead: Boolean(recip.readAt),
      isArchived: Boolean(recip.archivedAt),
    });
  }

  // If user is Admin, also surface any platform-wide or unassigned admin notifications
  if (role === "admin") {
    for (const notif of serverNotifState.notifications.values()) {
      if (notif.roleTarget === "admin" && !notif.targetUserId) {
        const hasRecipient = results.some((r) => r.id === notif.id);
        if (!hasRecipient) {
          // Auto-generate virtual recipient for admin
          results.push({
            ...notif,
            recipientId: `rcp_auto_${notif.id}_${userId}`,
            readAt: null,
            archivedAt: null,
            isPinned: notif.priority === "critical",
            isStarred: notif.priority === "high",
            isRead: false,
            isArchived: false,
          });
        }
      }
    }
  }

  // Sort: pinned first, then newest first
  return results.sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

// ============================================================================
// SERVER FUNCTION: GET NOTIFICATIONS (FULL LIST & FILTERED WORKSPACE)
// ============================================================================

const GetNotificationsQuerySchema = z.object({
  tab: z.string().optional().default("all"), // "all" | "unread" | "archived" | category
  search: z.string().optional().default(""),
  priority: z.string().optional(),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(50),
});

export const getNotificationsServerFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => GetNotificationsQuerySchema.parse(raw))
  .handler(async ({ data }) => {
    const auth = await requireServerAuth({});
    await ensureNotificationEngineBootstrapped();

    const userRole: UserRole = auth.session.role;
    let list = getEnrichedNotificationsForUser(auth.user.id, userRole);

    // Filter by tab
    if (data.tab === "unread") {
      list = list.filter((n) => !n.isRead && !n.isArchived);
    } else if (data.tab === "archived") {
      list = list.filter((n) => n.isArchived);
    } else if (data.tab !== "all") {
      // Filter by specific category
      list = list.filter((n) => !n.isArchived && n.category.toLowerCase() === data.tab.toLowerCase());
    } else {
      // All tab excludes archived by default
      list = list.filter((n) => !n.isArchived);
    }

    // Filter by priority
    if (data.priority && data.priority !== "all") {
      list = list.filter((n) => n.priority === data.priority);
    }

    // Filter by search query
    if (data.search.trim()) {
      const q = data.search.toLowerCase().trim();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q) ||
          n.category.toLowerCase().includes(q) ||
          n.eventType.toLowerCase().includes(q)
      );
    }

    const total = list.length;
    const startIndex = (data.page - 1) * data.limit;
    const items = list.slice(startIndex, startIndex + data.limit);

    return {
      items,
      total,
      page: data.page,
      limit: data.limit,
      unreadCount: getEnrichedNotificationsForUser(auth.user.id, userRole).filter((n) => !n.isRead && !n.isArchived).length,
    };
  });

// ============================================================================
// SERVER FUNCTION: GET NOTIFICATION SUMMARY (BELL & QUICK DRAWER)
// ============================================================================

export const getNotificationSummaryServerFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => z.object({}).optional().parse(raw))
  .handler(async (): Promise<NotificationSummaryDTO> => {
    let authUser: { id: string; role: UserRole } | null = null;
    try {
      const auth = await requireServerAuth({});
      authUser = {
        id: auth.user.id,
        role: auth.session.role,
      };
    } catch {
      // Unauthenticated visitor: zero unread notifications
      return {
        unreadCount: 0,
        criticalCount: 0,
        highCount: 0,
        totalActive: 0,
        latestUnread: [],
      };
    }

    await ensureNotificationEngineBootstrapped();
    const all = getEnrichedNotificationsForUser(authUser.id, authUser.role);
    const unread = all.filter((n) => !n.isRead && !n.isArchived);
    const criticalCount = unread.filter((n) => n.priority === "critical").length;
    const highCount = unread.filter((n) => n.priority === "high").length;

    return {
      unreadCount: unread.length,
      criticalCount,
      highCount,
      totalActive: all.filter((n) => !n.isArchived).length,
      latestUnread: unread.slice(0, 6),
    };
  });

// ============================================================================
// SERVER FUNCTION: MARK NOTIFICATION READ / UNREAD
// ============================================================================

export const markNotificationReadServerFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) =>
    z.object({
      notificationId: z.string(),
      markUnread: z.boolean().optional(),
    }).parse(raw)
  )
  .handler(async ({ data }) => {
    const auth = await requireServerAuth({ isMutation: true });
    await ensureNotificationEngineBootstrapped();

    let targetRecip = Array.from(serverNotifState.recipients.values()).find(
      (r) => r.notificationId === data.notificationId && r.userId === auth.user.id
    );

    if (!targetRecip) {
      // Create recipient record on the fly
      targetRecip = {
        id: `rcp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        notificationId: data.notificationId,
        userId: auth.user.id,
        readAt: data.markUnread ? null : new Date().toISOString(),
        archivedAt: null,
        isPinned: false,
        isStarred: false,
        createdAt: new Date().toISOString(),
      };
      serverNotifState.recipients.set(targetRecip.id, targetRecip);
    } else {
      targetRecip.readAt = data.markUnread ? null : new Date().toISOString();
    }

    const sql = getNeonClient();
    if (sql) {
      try {
        await sql`
          INSERT INTO notification_recipients (id, notification_id, user_id, read_at)
          VALUES (${targetRecip.id}, ${data.notificationId}, ${auth.user.id}, ${targetRecip.readAt})
          ON CONFLICT (notification_id, user_id)
          DO UPDATE SET read_at = ${targetRecip.readAt};
        `;
      } catch {
        // Safe fallback
      }
    }

    return { success: true, notificationId: data.notificationId, isRead: Boolean(targetRecip.readAt) };
  });

// ============================================================================
// SERVER FUNCTION: MARK ALL AS READ
// ============================================================================

export const markAllNotificationsReadServerFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => z.object({}).optional().parse(raw))
  .handler(async () => {
    const auth = await requireServerAuth({ isMutation: true });
    await ensureNotificationEngineBootstrapped();

    const nowStr = new Date().toISOString();
    const userRole: UserRole = auth.session.role;
    const userNotifications = getEnrichedNotificationsForUser(auth.user.id, userRole);

    for (const n of userNotifications) {
      let recip = Array.from(serverNotifState.recipients.values()).find(
        (r) => r.notificationId === n.id && r.userId === auth.user.id
      );
      if (!recip) {
        recip = {
          id: `rcp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
          notificationId: n.id,
          userId: auth.user.id,
          readAt: nowStr,
          archivedAt: null,
          isPinned: false,
          isStarred: false,
          createdAt: nowStr,
        };
        serverNotifState.recipients.set(recip.id, recip);
      } else {
        recip.readAt = nowStr;
      }
    }

    const sql = getNeonClient();
    if (sql) {
      try {
        await sql`
          UPDATE notification_recipients
          SET read_at = NOW()
          WHERE user_id = ${auth.user.id} AND read_at IS NULL;
        `;
      } catch {
        // Safe fallback
      }
    }

    return { success: true, count: userNotifications.length };
  });

// ============================================================================
// SERVER FUNCTION: ARCHIVE NOTIFICATION
// ============================================================================

export const archiveNotificationServerFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => z.object({ notificationId: z.string(), unarchive: z.boolean().optional() }).parse(raw))
  .handler(async ({ data }) => {
    const auth = await requireServerAuth({ isMutation: true });
    await ensureNotificationEngineBootstrapped();

    let targetRecip = Array.from(serverNotifState.recipients.values()).find(
      (r) => r.notificationId === data.notificationId && r.userId === auth.user.id
    );

    if (!targetRecip) {
      targetRecip = {
        id: `rcp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        notificationId: data.notificationId,
        userId: auth.user.id,
        readAt: new Date().toISOString(),
        archivedAt: data.unarchive ? null : new Date().toISOString(),
        isPinned: false,
        isStarred: false,
        createdAt: new Date().toISOString(),
      };
      serverNotifState.recipients.set(targetRecip.id, targetRecip);
    } else {
      targetRecip.archivedAt = data.unarchive ? null : new Date().toISOString();
    }

    return { success: true, notificationId: data.notificationId, isArchived: Boolean(targetRecip.archivedAt) };
  });

// ============================================================================
// SERVER FUNCTION: TOGGLE NOTIFICATION PIN
// ============================================================================

export const toggleNotificationPinServerFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => z.object({ notificationId: z.string() }).parse(raw))
  .handler(async ({ data }) => {
    const auth = await requireServerAuth({ isMutation: true });
    await ensureNotificationEngineBootstrapped();

    let targetRecip = Array.from(serverNotifState.recipients.values()).find(
      (r) => r.notificationId === data.notificationId && r.userId === auth.user.id
    );

    if (!targetRecip) {
      targetRecip = {
        id: `rcp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        notificationId: data.notificationId,
        userId: auth.user.id,
        readAt: null,
        archivedAt: null,
        isPinned: true,
        isStarred: false,
        createdAt: new Date().toISOString(),
      };
      serverNotifState.recipients.set(targetRecip.id, targetRecip);
    } else {
      targetRecip.isPinned = !targetRecip.isPinned;
    }

    return { success: true, notificationId: data.notificationId, isPinned: targetRecip.isPinned };
  });

// ============================================================================
// SERVER FUNCTION: GET & UPDATE USER NOTIFICATION PREFERENCES
// ============================================================================

export const getNotificationPreferencesServerFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => z.object({}).optional().parse(raw))
  .handler(async (): Promise<{ success: boolean; preferences: NotificationPreferences }> => {
    const auth = await requireServerAuth({});
    await ensureNotificationEngineBootstrapped();

    let pref = serverNotifState.preferences.get(auth.user.id);
    if (!pref) {
      pref = {
        userId: auth.user.id,
        inAppEnabled: true,
        emailEnabled: true,
        pushEnabled: false,
        soundEnabled: true,
        criticalAlertsAlwaysOn: true,
        categorySettings: {
          booking: { inApp: true, email: true, push: true },
          enquiries: { inApp: true, email: true, push: true },
          cms: { inApp: true, email: false, push: false },
          infrastructure: { inApp: true, email: true, push: true },
          messages: { inApp: true, email: true, push: false },
          tickets: { inApp: true, email: true, push: true },
          security: { inApp: true, email: true, push: true },
        },
        updatedAt: new Date().toISOString(),
      };
      serverNotifState.preferences.set(auth.user.id, pref);
    }

    return { success: true, preferences: pref };
  });

const UpdatePreferencesSchema = z.object({
  inAppEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  soundEnabled: z.boolean().optional(),
  criticalAlertsAlwaysOn: z.boolean().optional(),
  categorySettings: z
    .record(
      z.string(),
      z.object({
        inApp: z.boolean(),
        email: z.boolean(),
        push: z.boolean(),
      })
    )
    .optional(),
});

export const updateNotificationPreferencesServerFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => UpdatePreferencesSchema.parse(raw))
  .handler(async ({ data }) => {
    const auth = await requireServerAuth({ isMutation: true });
    await ensureNotificationEngineBootstrapped();

    const current = serverNotifState.preferences.get(auth.user.id);
    const updated: NotificationPreferences = {
      userId: auth.user.id,
      inAppEnabled: data.inAppEnabled ?? current?.inAppEnabled ?? true,
      emailEnabled: data.emailEnabled ?? current?.emailEnabled ?? true,
      pushEnabled: data.pushEnabled ?? current?.pushEnabled ?? false,
      soundEnabled: data.soundEnabled ?? current?.soundEnabled ?? true,
      criticalAlertsAlwaysOn: data.criticalAlertsAlwaysOn ?? current?.criticalAlertsAlwaysOn ?? true,
      categorySettings: data.categorySettings ?? current?.categorySettings ?? {
        booking: { inApp: true, email: true, push: true },
        infrastructure: { inApp: true, email: true, push: true },
      },
      updatedAt: new Date().toISOString(),
    };

    serverNotifState.preferences.set(auth.user.id, updated);
    return { success: true, preferences: updated };
  });

// ============================================================================
// SERVER FUNCTION: GET INFRASTRUCTURE TELEMETRY & ALERTS (ADMIN-ONLY)
// ============================================================================

export const getInfrastructureTelemetryServerFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => z.object({}).optional().parse(raw))
  .handler(async () => {
    const auth = await requireServerAuth({});
    if (auth.session.role !== "admin") {
      setResponseStatus(403);
      throw new Error("Infrastructure telemetry is restricted to Super Admin.");
    }

    await ensureNotificationEngineBootstrapped();

    const dbConnected = Boolean(getDatabaseUrl());

    return {
      success: true,
      telemetry: {
        neon: {
          status: dbConnected ? "healthy" : "simulated_resilient",
          activeConnections: dbConnected ? 12 : 0,
          computeUsagePercent: 34,
          storageUsagePercent: 18,
          averageLatencyMs: 24,
          region: "aws-ap-southeast-1",
          databaseName: "neondb",
        },
        vercel: {
          status: "operational",
          deploymentStatus: "READY",
          domain: "sidwizz-portfolio.vercel.app",
          edgeRegionsActive: 18,
          sslStatus: "VALID",
          averageEdgeLatencyMs: 14,
          lastDeployedCommit: "c006c62",
        },
      },
      alerts: serverNotifState.infraAlerts,
    };
  });

// ============================================================================
// SERVER FUNCTION: SIMULATE INFRASTRUCTURE ALERT (ADMIN TEST TRIGGER)
// ============================================================================

const SimulateAlertInputSchema = z.object({
  service: z.enum(["neon", "vercel"]),
  alertType: z.string(),
  severity: z.enum(["critical", "high", "medium", "low", "success"]),
  title: z.string().min(3),
  summary: z.string().min(5),
});

export const simulateInfrastructureAlertServerFn = createServerFn({ method: "POST" })
  .validator((raw: unknown) => SimulateAlertInputSchema.parse(raw))
  .handler(async ({ data }) => {
    const auth = await requireServerAuth({ isMutation: true });
    if (auth.session.role !== "admin") {
      setResponseStatus(403);
      throw new Error("Triggering infrastructure simulation is restricted to Super Admin.");
    }

    await ensureNotificationEngineBootstrapped();

    const alertId = `inf_sim_${Date.now()}`;
    const newAlert: InfrastructureAlert = {
      id: alertId,
      service: data.service,
      type: data.alertType as InfrastructureAlert["type"],
      severity: data.severity,
      title: data.title,
      summary: data.summary,
      details: {
        simulated: true,
        triggeredBy: auth.user.email,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    serverNotifState.infraAlerts.unshift(newAlert);

    // Also dispatch to Admin notification center
    const notifId = `notif_infra_${Date.now()}`;
    const notifRecord: NotificationRecord = {
      id: notifId,
      title: data.title,
      message: data.summary,
      category: "infrastructure",
      priority: data.severity,
      roleTarget: "admin",
      eventType: `infra.${data.service}.${data.alertType}`,
      entityType: "infrastructure",
      entityId: alertId,
      link: "/admin?tab=notifications",
      actionLabel: "View Infrastructure Health",
      metadata: { service: data.service, simulated: true },
      createdAt: new Date().toISOString(),
    };

    serverNotifState.notifications.set(notifId, notifRecord);

    // Assign to Super Admin
    const recipId = `rcp_${Date.now()}`;
    serverNotifState.recipients.set(recipId, {
      id: recipId,
      notificationId: notifId,
      userId: auth.user.id,
      readAt: null,
      archivedAt: null,
      isPinned: data.severity === "critical",
      isStarred: true,
      createdAt: new Date().toISOString(),
    });

    return { success: true, alert: newAlert, notification: notifRecord };
  });

// ============================================================================
// SERVER DISPATCH HELPER (CALLED INTERNALLY BY BOOKING, CMS & AUTH)
// ============================================================================

export async function dispatchPlatformNotification(params: {
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  roleTarget: UserRole | "all";
  targetUserId?: string | null | undefined;
  targetOrganizationId?: string | null | undefined;
  eventType: string;
  entityType?: NotificationRecord["entityType"] | undefined;
  entityId?: string | null | undefined;
  link?: string | undefined;
  actionLabel?: string | undefined;
  metadata?: Record<string, string | number | boolean | null> | undefined;
}): Promise<string> {
  await ensureNotificationEngineBootstrapped();

  const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const record: NotificationRecord = {
    id,
    title: params.title,
    message: params.message,
    category: params.category,
    priority: params.priority,
    roleTarget: params.roleTarget,
    targetUserId: params.targetUserId || null,
    targetOrganizationId: params.targetOrganizationId || null,
    eventType: params.eventType,
    ...(params.entityType !== undefined ? { entityType: params.entityType } : {}),
    entityId: params.entityId || null,
    link: params.link,
    actionLabel: params.actionLabel,
    ...(params.metadata ? { metadata: params.metadata } : {}),
    createdAt: new Date().toISOString(),
  };

  serverNotifState.notifications.set(id, record);

  // If directed to a specific user, create recipient
  if (params.targetUserId) {
    const rcpId = `rcp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    serverNotifState.recipients.set(rcpId, {
      id: rcpId,
      notificationId: id,
      userId: params.targetUserId,
      readAt: null,
      archivedAt: null,
      isPinned: params.priority === "critical",
      isStarred: params.priority === "high",
      createdAt: new Date().toISOString(),
    });
  }

  return id;
}

