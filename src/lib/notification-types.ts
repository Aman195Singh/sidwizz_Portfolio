/**
 * SIDD.WHIZZ — Notification Manager Type Definitions
 * Enterprise-grade multi-role notification architecture for Admin, Organizer, and Member.
 */

export type UserRole = "admin" | "client" | "member";

export type NotificationPriority = "critical" | "high" | "medium" | "low" | "success";

export type AdminNotificationCategory =
  | "enquiries"
  | "booking"
  | "cms"
  | "infrastructure"
  | "messages"
  | "security"
  | "developer";

export type OrganizerNotificationCategory =
  | "booking"
  | "events"
  | "attendees"
  | "payments"
  | "team"
  | "features"
  | "admin_messages";

export type MemberNotificationCategory =
  | "registrations"
  | "tickets"
  | "event_updates"
  | "messages"
  | "security"
  | "platform";

export type NotificationCategory =
  | AdminNotificationCategory
  | OrganizerNotificationCategory
  | MemberNotificationCategory;

export type NotificationEntityType =
  | "booking"
  | "enquiry"
  | "event"
  | "ticket"
  | "cms_page"
  | "user"
  | "infrastructure"
  | "message"
  | "system";

export type SerializablePrimitive = string | number | boolean | null;

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  roleTarget: UserRole | "all";
  targetUserId?: string | null | undefined;
  targetOrganizationId?: string | null | undefined;
  eventType: string;
  entityType?: NotificationEntityType | undefined;
  entityId?: string | null | undefined;
  link?: string | undefined;
  actionLabel?: string | undefined;
  metadata?: Record<string, SerializablePrimitive> | undefined;
  createdAt: string;
  expiresAt?: string | null | undefined;
}

export interface NotificationRecipientRecord {
  id: string;
  notificationId: string;
  userId: string;
  readAt: string | null;
  archivedAt: string | null;
  isPinned: boolean;
  isStarred: boolean;
  internalNote?: string | undefined;
  createdAt: string;
}

export interface EnrichedNotification extends NotificationRecord {
  recipientId: string;
  readAt: string | null;
  archivedAt: string | null;
  isPinned: boolean;
  isStarred: boolean;
  internalNote?: string | undefined;
  isRead: boolean;
  isArchived: boolean;
}

export interface NotificationPreferences {
  userId: string;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  soundEnabled: boolean;
  criticalAlertsAlwaysOn: boolean;
  categorySettings: Record<string, {
    inApp: boolean;
    email: boolean;
    push: boolean;
  }>;
  updatedAt: string;
}

export interface InfrastructureAlert {
  id: string;
  service: "neon" | "vercel";
  type:
    | "compute_threshold"
    | "storage_threshold"
    | "connection_failure"
    | "billing_threshold"
    | "deployment_success"
    | "deployment_failed"
    | "build_error"
    | "domain_check"
    | "edge_latency";
  severity: NotificationPriority;
  title: string;
  summary: string;
  details: Record<string, SerializablePrimitive>;
  timestamp: string;
  resolved: boolean;
}

export interface NotificationSummaryDTO {
  unreadCount: number;
  criticalCount: number;
  highCount: number;
  totalActive: number;
  latestUnread: EnrichedNotification[];
}
