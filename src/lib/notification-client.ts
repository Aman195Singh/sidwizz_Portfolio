/**
 * SIDD.WHIZZ — Notification Manager Client Library & React Hooks
 * Reactive synchronization between Bell, Drawer, Workspaces, and Server Functions.
 */

import { useCallback, useEffect, useState } from "react";
import {
  archiveNotificationServerFn,
  getInfrastructureTelemetryServerFn,
  getNotificationPreferencesServerFn,
  getNotificationsServerFn,
  getNotificationSummaryServerFn,
  markAllNotificationsReadServerFn,
  markNotificationReadServerFn,
  simulateInfrastructureAlertServerFn,
  toggleNotificationPinServerFn,
  updateNotificationPreferencesServerFn,
} from "@/lib/notification-server";
import type {
  EnrichedNotification,
  InfrastructureAlert,
  NotificationPreferences,
  NotificationPriority,
  NotificationSummaryDTO,
  SerializablePrimitive,
} from "@/lib/notification-types";
import { useAuth } from "@/lib/auth";

export const NOTIFICATIONS_UPDATED_EVENT = "siddwhizz_notifications_updated";

/**
 * Trigger an instant reactive update across all notification components on this client.
 */
export function emitNotificationsUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT));
  }
}

/**
 * Lightweight hook for Header Bell & badge status.
 */
export function useNotificationSummary(options?: { pollIntervalMs?: number | undefined } | undefined) {
  const { isAuthenticated, user } = useAuth();
  const [summary, setSummary] = useState<NotificationSummaryDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setSummary(null);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const res = await getNotificationSummaryServerFn();
      if (res && typeof res.unreadCount === "number") {
        setSummary(res);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notification summary");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchSummary();

    const handleUpdate = () => {
      fetchSummary();
    };

    if (typeof window === "undefined") {
      return undefined;
    }

    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleUpdate);
    const interval = options?.pollIntervalMs
      ? window.setInterval(fetchSummary, options.pollIntervalMs)
      : null;

    return () => {
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleUpdate);
      if (interval) window.clearInterval(interval);
    };
  }, [fetchSummary, options?.pollIntervalMs]);

  return {
    summary,
    unreadCount: summary?.unreadCount || 0,
    criticalCount: summary?.criticalCount || 0,
    highCount: summary?.highCount || 0,
    isLoading,
    error,
    refresh: fetchSummary,
  };
}

export interface UseNotificationsOptions {
  tab?: string | undefined;
  priority?: string | undefined;
  search?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
  autoPollMs?: number | undefined;
}

/**
 * Full notification workspace hook for Drawer & Notification Centers.
 */
export function useNotifications(options?: UseNotificationsOptions | undefined) {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState<EnrichedNotification[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [summary, setSummary] = useState<NotificationSummaryDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tab = options?.tab;
  const priority = options?.priority;
  const search = options?.search;
  const limit = options?.limit;
  const offset = options?.offset;
  const autoPollMs = options?.autoPollMs;

  const fetchList = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setNotifications([]);
      setTotal(0);
      setUnreadCount(0);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const [listRes, summaryRes] = await Promise.all([
        getNotificationsServerFn({
          data: {
            tab: tab || "all",
            priority: priority || "all",
            search: search || "",
            limit: limit ?? 50,
            offset: offset ?? 0,
          },
        }),
        getNotificationSummaryServerFn(),
      ]);

      if (listRes && typeof listRes === "object" && "notifications" in listRes) {
        setNotifications((listRes as { notifications: EnrichedNotification[] }).notifications || []);
        setTotal((listRes as { total: number }).total || 0);
        setUnreadCount((listRes as { unreadCount: number }).unreadCount || 0);
      }
      if (summaryRes) {
        setSummary(summaryRes);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, tab, priority, search, limit, offset]);

  useEffect(() => {
    fetchList();

    const handleUpdate = () => {
      fetchList();
    };

    if (typeof window === "undefined") {
      return undefined;
    }

    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleUpdate);
    const interval = autoPollMs ? window.setInterval(fetchList, autoPollMs) : null;

    return () => {
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleUpdate);
      if (interval) window.clearInterval(interval);
    };
  }, [fetchList, autoPollMs]);

  const markAsRead = async (notificationId: string, read: boolean = true, internalNote?: string | undefined) => {
    try {
      const res = await markNotificationReadServerFn({
        data: {
          notificationId,
          read,
          ...(internalNote !== undefined ? { internalNote } : {}),
        },
      });
      if (res.success) {
        // Optimistic local update
        setNotifications((prev) =>
          prev.map((n) => {
            if (n.id !== notificationId) return n;
            const updated: EnrichedNotification = {
              ...n,
              isRead: read,
              readAt: read ? new Date().toISOString() : null,
              ...(internalNote !== undefined ? { internalNote } : {}),
            };
            return updated;
          })
        );
        emitNotificationsUpdated();
        return true;
      }
      return false;
    } catch (err) {
      console.error("markAsRead error:", err);
      return false;
    }
  };

  const markAllAsRead = async (category?: string | undefined) => {
    try {
      const res = await markAllNotificationsReadServerFn({
        data: {
          ...(category !== undefined ? { category } : {}),
        },
      });
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => ({
            ...n,
            isRead: true,
            readAt: n.readAt || new Date().toISOString(),
          }))
        );
        emitNotificationsUpdated();
        return true;
      }
      return false;
    } catch (err) {
      console.error("markAllAsRead error:", err);
      return false;
    }
  };

  const archiveNotification = async (notificationId: string, unarchive: boolean = false) => {
    try {
      const res = await archiveNotificationServerFn({
        data: { notificationId, unarchive },
      });
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId
              ? { ...n, isArchived: !unarchive, archivedAt: unarchive ? null : new Date().toISOString() }
              : n
          )
        );
        emitNotificationsUpdated();
        return true;
      }
      return false;
    } catch (err) {
      console.error("archiveNotification error:", err);
      return false;
    }
  };

  const togglePin = async (notificationId: string) => {
    try {
      const res = await toggleNotificationPinServerFn({
        data: { notificationId },
      });
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isPinned: res.isPinned } : n
          )
        );
        emitNotificationsUpdated();
        return true;
      }
      return false;
    } catch (err) {
      console.error("togglePin error:", err);
      return false;
    }
  };

  return {
    notifications,
    total,
    unreadCount,
    summary,
    isLoading,
    error,
    refresh: fetchList,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    togglePin,
  };
}

/**
 * Hook for managing notification delivery preferences.
 */
export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrefs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getNotificationPreferencesServerFn();
      if (res && res.success && res.preferences) {
        setPreferences(res.preferences);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load preferences");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrefs();
  }, [fetchPrefs]);

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    try {
      const res = await updateNotificationPreferencesServerFn({
        data: updates,
      });
      if (res && res.success && res.preferences) {
        setPreferences(res.preferences);
        return true;
      }
      return false;
    } catch (err) {
      console.error("updatePreferences error:", err);
      return false;
    }
  };

  return {
    preferences,
    isLoading,
    error,
    refresh: fetchPrefs,
    updatePreferences,
  };
}

/**
 * Hook for Infrastructure (Neon DB & Vercel) telemetry & simulation.
 */
export function useInfrastructureTelemetry() {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [alerts, setAlerts] = useState<InfrastructureAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTelemetry = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getInfrastructureTelemetryServerFn();
      if (res && res.success) {
        setTelemetry(res.telemetry);
        setAlerts(res.alerts || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load telemetry");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  const simulateAlert = async (params: {
    service: "neon" | "vercel";
    alertType: string;
    title: string;
    summary: string;
    severity: NotificationPriority;
    details?: Record<string, SerializablePrimitive> | undefined;
  }) => {
    try {
      const res = await simulateInfrastructureAlertServerFn({ data: params });
      if (res && res.success) {
        emitNotificationsUpdated();
        await fetchTelemetry();
        return true;
      }
      return false;
    } catch (err) {
      console.error("simulateAlert error:", err);
      return false;
    }
  };

  return {
    telemetry,
    alerts,
    isLoading,
    error,
    refresh: fetchTelemetry,
    simulateAlert,
  };
}
