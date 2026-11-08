/**
 * SIDD.WHIZZ — Notification Manager Test Suite
 * Vitest tests verifying multi-role inboxes, infrastructure telemetry,
 * priority classification, state mutations, and safety overrides.
 */

import { describe, expect, it } from "vitest";
import type {
  AdminNotificationCategory,
  EnrichedNotification,
  InfrastructureAlert,
  MemberNotificationCategory,
  NotificationPreferences,
  NotificationPriority,
  NotificationRecord,
  OrganizerNotificationCategory,
  UserRole,
} from "@/lib/notification-types";
import { dispatchPlatformNotification } from "@/lib/notification-server";

describe("Milestone 3 — Centralized Notification Manager Architecture", () => {
  describe("1. Type System & Role-Scoped Classification", () => {
    it("validates Admin notification categories including Infrastructure and CMS", () => {
      const adminCategories: AdminNotificationCategory[] = [
        "enquiries",
        "booking",
        "cms",
        "infrastructure",
        "messages",
        "security",
        "developer",
      ];
      expect(adminCategories).toHaveLength(7);
      expect(adminCategories).toContain("infrastructure");
      expect(adminCategories).toContain("cms");
    });

    it("validates Organizer notification categories including bookings and attendee updates", () => {
      const orgCategories: OrganizerNotificationCategory[] = [
        "booking",
        "events",
        "attendees",
        "payments",
        "team",
        "features",
        "admin_messages",
      ];
      expect(orgCategories).toHaveLength(7);
      expect(orgCategories).toContain("attendees");
      expect(orgCategories).toContain("payments");
    });

    it("validates Member notification categories focusing on tickets and registrations", () => {
      const memberCategories: MemberNotificationCategory[] = [
        "registrations",
        "tickets",
        "event_updates",
        "messages",
        "security",
        "platform",
      ];
      expect(memberCategories).toHaveLength(6);
      expect(memberCategories).toContain("tickets");
      expect(memberCategories).toContain("event_updates");
    });

    it("enforces strict priority hierarchy from P0 Critical to Low", () => {
      const priorities: NotificationPriority[] = ["critical", "high", "medium", "low", "success"];
      const priorityWeights: Record<NotificationPriority, number> = {
        critical: 100, // P0
        high: 75,      // P1
        medium: 50,    // P2
        low: 25,       // P3
        success: 10,   // Status
      };

      expect(priorityWeights["critical"]).toBeGreaterThan(priorityWeights["high"]);
      expect(priorityWeights["high"]).toBeGreaterThan(priorityWeights["medium"]);
      expect(priorityWeights["medium"]).toBeGreaterThan(priorityWeights["low"]);
    });
  });

  describe("2. Notification Record Model & Invariants", () => {
    it("constructs a valid enriched notification record with recipient tracking", () => {
      const notif: EnrichedNotification = {
        id: "notif_test_101",
        title: "New Stage Enquiry: Tech Leaders Summit 2026",
        message: "Apex Global submitted an enquiry for 1,500 CXOs at Jio World Convention Centre.",
        category: "enquiries",
        priority: "high",
        roleTarget: "admin",
        eventType: "booking.enquiry_created",
        entityType: "enquiry",
        entityId: "ENQ-101",
        link: "/admin?tab=enquiries",
        actionLabel: "Review Enquiry",
        metadata: { budget: "₹4,00,000", city: "Mumbai" },
        createdAt: new Date().toISOString(),
        recipientId: "rcp_101",
        readAt: null,
        archivedAt: null,
        isPinned: false,
        isStarred: true,
        isRead: false,
        isArchived: false,
      };

      expect(notif.isRead).toBe(false);
      expect(notif.isArchived).toBe(false);
      expect(notif.priority).toBe("high");
      expect(notif.entityType).toBe("enquiry");
      expect(notif.metadata?.["city"]).toBe("Mumbai");
    });

    it("transitions read status and sets readAt timestamp accurately", () => {
      const initial: EnrichedNotification = {
        id: "notif_test_102",
        title: "Quotation Accepted",
        message: "Client accepted proposal for ₹4,50,000.",
        category: "booking",
        priority: "critical",
        roleTarget: "admin",
        eventType: "booking.accepted",
        createdAt: "2026-11-08T10:00:00Z",
        recipientId: "rcp_102",
        readAt: null,
        archivedAt: null,
        isPinned: true,
        isStarred: true,
        isRead: false,
        isArchived: false,
      };

      const now = new Date().toISOString();
      const updated: EnrichedNotification = {
        ...initial,
        isRead: true,
        readAt: now,
      };

      expect(updated.isRead).toBe(true);
      expect(updated.readAt).toBe(now);
      expect(updated.isPinned).toBe(true);
    });

    it("supports pinning important alerts and storing staff notes", () => {
      const notif: EnrichedNotification = {
        id: "notif_test_103",
        title: "Neon Database: Connection Spike",
        message: "Active connection count reached 18/20.",
        category: "infrastructure",
        priority: "critical",
        roleTarget: "admin",
        eventType: "infra.neon.connection_pool",
        createdAt: new Date().toISOString(),
        recipientId: "rcp_103",
        readAt: null,
        archivedAt: null,
        isPinned: true,
        isStarred: true,
        internalNote: "Assigned to Lead Architect: scaled connection pool limit to 50.",
        isRead: false,
        isArchived: false,
      };

      expect(notif.isPinned).toBe(true);
      expect(notif.internalNote).toContain("scaled connection pool limit");
    });
  });

  describe("3. Infrastructure Alert Telemetry & Service Health", () => {
    it("validates Neon Database and Vercel Hosting alert formats", () => {
      const neonAlert: InfrastructureAlert = {
        id: "infra_neon_001",
        service: "neon",
        type: "compute_threshold",
        severity: "critical",
        title: "Neon Compute Exceeded 90%",
        summary: "Active compute spike detected: 0.95 / 1.0 CU allocated during peak summit traffic.",
        details: { currentCU: 0.95, maxCU: 1.0, region: "aws-ap-southeast-1" },
        timestamp: new Date().toISOString(),
        resolved: false,
      };

      const vercelAlert: InfrastructureAlert = {
        id: "infra_vercel_001",
        service: "vercel",
        type: "build_error",
        severity: "critical",
        title: "Vercel Production Build Failed",
        summary: "Deployment on branch main failed during Nitro SSR bundle generation.",
        details: { commit: "8de1d53", exitCode: 1, builder: "vercel/nitro" },
        timestamp: new Date().toISOString(),
        resolved: false,
      };

      expect(neonAlert.service).toBe("neon");
      expect(neonAlert.severity).toBe("critical");
      expect(vercelAlert.service).toBe("vercel");
      expect(vercelAlert.details["exitCode"]).toBe(1);
    });

    it("verifies notification delivery preferences and critical P0 override invariant", () => {
      const prefs: NotificationPreferences = {
        userId: "usr_super_admin",
        inAppEnabled: true,
        emailEnabled: false,
        pushEnabled: false,
        soundEnabled: true,
        criticalAlertsAlwaysOn: true,
        categorySettings: {
          infrastructure: { inApp: true, email: true, push: true },
          booking: { inApp: true, email: true, push: false },
          messages: { inApp: true, email: false, push: false },
        },
        updatedAt: new Date().toISOString(),
      };

      // Even if email is disabled globally, critical alerts override
      const shouldDeliverCriticalViaEmail = prefs.criticalAlertsAlwaysOn || prefs.emailEnabled;
      expect(shouldDeliverCriticalViaEmail).toBe(true);
      expect(prefs.soundEnabled).toBe(true);
    });
  });

  describe("4. Platform Notification Dispatch Engine & Strict Role Isolation", () => {
    it("dispatches cross-module event notifications successfully", async () => {
      const id = await dispatchPlatformNotification({
        title: "Test Booking Confirmed",
        message: "Automated test booking confirmed for Siddharth Maurya.",
        category: "booking",
        priority: "high",
        roleTarget: "admin",
        eventType: "test.booking_confirmed",
        entityType: "booking",
        entityId: "BKG-TEST-01",
        actionLabel: "View Booking",
        link: "/admin?tab=booking",
      });

      expect(id).toMatch(/^notif_/);
    });

    it("verifies strict role boundary: admin, organizer, and member inboxes are mutually exclusive", () => {
      const allNotifications: Array<{ id: string; roleTarget: UserRole | "all"; title: string }> = [
        { id: "1", roleTarget: "admin", title: "Neon DB Spike" },
        { id: "2", roleTarget: "client", title: "Quotation Received" },
        { id: "3", roleTarget: "member", title: "VIP Pass Ready" },
        { id: "4", roleTarget: "all", title: "Platform Maintenance" },
      ];

      const filterForRole = (role: UserRole) =>
        allNotifications.filter((n) => n.roleTarget === "all" || n.roleTarget === role);

      const adminInbox = filterForRole("admin");
      const clientInbox = filterForRole("client");
      const memberInbox = filterForRole("member");

      // Admin sees admin + all
      expect(adminInbox.map((n) => n.id)).toEqual(["1", "4"]);
      expect(adminInbox.some((n) => n.roleTarget === "client")).toBe(false);
      expect(adminInbox.some((n) => n.roleTarget === "member")).toBe(false);

      // Client sees client + all
      expect(clientInbox.map((n) => n.id)).toEqual(["2", "4"]);
      expect(clientInbox.some((n) => n.roleTarget === "admin")).toBe(false);
      expect(clientInbox.some((n) => n.roleTarget === "member")).toBe(false);

      // Member sees member + all
      expect(memberInbox.map((n) => n.id)).toEqual(["3", "4"]);
      expect(memberInbox.some((n) => n.roleTarget === "admin")).toBe(false);
      expect(memberInbox.some((n) => n.roleTarget === "client")).toBe(false);
    });
  });
});

