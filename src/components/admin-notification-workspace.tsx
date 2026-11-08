/**
 * SIDD.WHIZZ — Admin Notification Center Workspace
 * Comprehensive notification manager for Super Admins covering Bookings,
 * CMS, Infrastructure (Neon DB & Vercel Hosting), Developer Logs, and Security.
 */

import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  Search,
  CheckCheck,
  Pin,
  Archive,
  ArchiveRestore,
  ExternalLink,
  Calendar,
  Database,
  Server,
  ShieldAlert,
  FileText,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Filter,
  RefreshCw,
  Sliders,
  Terminal,
  Activity,
  Cpu,
  HardDrive,
  Globe,
  PlusCircle,
  FileEdit,
  Clock,
  Layers,
} from "lucide-react";
import {
  useInfrastructureTelemetry,
  useNotificationPreferences,
  useNotifications,
} from "@/lib/notification-client";
import type {
  EnrichedNotification,
  NotificationPriority,
} from "@/lib/notification-types";

type AdminWorkspaceTab =
  | "all"
  | "booking"
  | "cms"
  | "infrastructure"
  | "messages"
  | "developer"
  | "security"
  | "archived"
  | "preferences";

export const AdminNotificationWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminWorkspaceTab>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotificationForNote, setSelectedNotificationForNote] = useState<EnrichedNotification | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [simModalOpen, setSimModalOpen] = useState(false);

  // Hook for notifications
  const {
    notifications,
    summary,
    unreadCount,
    isLoading,
    refresh,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    togglePin,
  } = useNotifications({
    tab: activeTab === "preferences" ? "all" : activeTab,
    priority: priorityFilter,
    search: searchQuery,
  });

  // Hook for preferences
  const {
    preferences,
    updatePreferences,
    isLoading: prefsLoading,
  } = useNotificationPreferences();

  // Hook for infrastructure telemetry
  const {
    telemetry,
    alerts: infraAlerts,
    simulateAlert,
    refresh: refreshTelemetry,
  } = useInfrastructureTelemetry();

  // Handle staff note submission
  const handleSaveNote = async () => {
    if (!selectedNotificationForNote) return;
    await markAsRead(selectedNotificationForNote.id, selectedNotificationForNote.isRead, noteInput);
    setSelectedNotificationForNote(null);
    setNoteInput("");
  };

  // Filter list by status & tab
  const displayList = notifications.filter((item) => {
    if (activeTab === "archived") return item.isArchived;
    if (item.isArchived) return false;

    if (statusFilter === "unread" && item.isRead) return false;
    if (statusFilter === "read" && !item.isRead) return false;

    if (activeTab === "booking" && item.category !== "booking" && item.category !== "enquiries") return false;
    if (activeTab === "cms" && item.category !== "cms") return false;
    if (activeTab === "infrastructure" && item.category !== "infrastructure") return false;
    if (activeTab === "messages" && item.category !== "messages" && item.category !== "admin_messages") return false;
    if (activeTab === "developer" && item.category !== "developer") return false;
    if (activeTab === "security" && item.category !== "security") return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-crimson/20 border border-crimson/40 flex items-center justify-center text-crimson shadow-inner">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-display flex items-center gap-2">
              Admin Notification Center
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-crimson/20 border border-crimson/40 text-crimson">
                  {unreadCount} Unread
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
              Centralized platform alert hub across Bookings, CMS, Neon Database & Vercel Hosting
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => refresh()}
            title="Refresh alerts"
            className="px-3 py-2 text-xs font-medium rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-crimson" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setSimModalOpen(true)}
            className="px-3 py-2 text-xs font-medium rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Simulate Infra Alert</span>
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-crimson hover:bg-red-700 text-white flex items-center gap-1.5 transition-all shadow-md"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Infrastructure Telemetry Quick Status Strip (When Neon/Vercel active) */}
      {telemetry && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-neutral-400">Neon Database</p>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {telemetry.neon.status === "healthy" ? "Healthy (0.5 CU)" : "Alerting"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-neutral-500">Latency</p>
              <p className="text-xs font-mono font-medium text-neutral-300">
                {telemetry.neon.queryLatencyMs}ms
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-neutral-400">Vercel Edge</p>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  {telemetry.vercel.deploymentStatus === "ready" ? "Production Ready" : "Building"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-neutral-500">Cache Hit</p>
              <p className="text-xs font-mono font-medium text-neutral-300">
                {telemetry.vercel.cacheHitRatio}%
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-neutral-400">Active High/P0 Alerts</p>
                <p className="text-xs font-bold text-white">
                  {(summary?.criticalCount || 0) + (summary?.highCount || 0)} Total
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {summary?.criticalCount || 0} Critical
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-neutral-400">Database Storage</p>
                <p className="text-xs font-bold text-white">
                  {telemetry.neon.storageUsedMB} MB / 512 MB
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400">
              {((telemetry.neon.storageUsedMB / 512) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto no-scrollbar pb-1">
        {[
          { key: "all", label: "All Notifications", icon: Layers },
          { key: "booking", label: "Bookings & Enquiries", icon: Calendar },
          { key: "cms", label: "CMS Publishing", icon: FileText },
          { key: "infrastructure", label: "Infrastructure (Neon/Vercel)", icon: Server },
          { key: "messages", label: "Messages & Support", icon: MessageSquare },
          { key: "developer", label: "Developer & System", icon: Terminal },
          { key: "security", label: "Security Alerts", icon: ShieldAlert },
          { key: "archived", label: "Archived", icon: Archive },
          { key: "preferences", label: "Alert Preferences", icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as AdminWorkspaceTab)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? "bg-white text-neutral-950 font-bold shadow-md"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Preferences Tab View */}
      {activeTab === "preferences" ? (
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white font-display">Notification Delivery Preferences</h3>
              <p className="text-xs text-neutral-400">Configure global channels and role delivery thresholds</p>
            </div>
            {preferences && (
              <span className="text-[11px] text-neutral-500">
                Last updated: {new Date(preferences.updatedAt).toLocaleTimeString()}
              </span>
            )}
          </div>

          {preferences && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-neutral-950/60 border border-white/10 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">Channels</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
                    <span className="text-xs text-white">In-App Notifications</span>
                    <input
                      type="checkbox"
                      checked={preferences.inAppEnabled}
                      onChange={(e) => updatePreferences({ inAppEnabled: e.target.checked })}
                      className="rounded border-white/20 bg-neutral-900 text-crimson focus:ring-crimson"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
                    <span className="text-xs text-white">Email Notification Digests</span>
                    <input
                      type="checkbox"
                      checked={preferences.emailEnabled}
                      onChange={(e) => updatePreferences({ emailEnabled: e.target.checked })}
                      className="rounded border-white/20 bg-neutral-900 text-crimson focus:ring-crimson"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
                    <span className="text-xs text-white">Browser Push Notifications</span>
                    <input
                      type="checkbox"
                      checked={preferences.pushEnabled}
                      onChange={(e) => updatePreferences({ pushEnabled: e.target.checked })}
                      className="rounded border-white/20 bg-neutral-900 text-crimson focus:ring-crimson"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
                    <span className="text-xs text-white">Audio Alert Chime</span>
                    <input
                      type="checkbox"
                      checked={preferences.soundEnabled}
                      onChange={(e) => updatePreferences({ soundEnabled: e.target.checked })}
                      className="rounded border-white/20 bg-neutral-900 text-crimson focus:ring-crimson"
                    />
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950/60 border border-white/10 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">Safety & Overrides</h4>
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-red-300">Critical (P0) Override</span>
                    <input
                      type="checkbox"
                      checked={preferences.criticalAlertsAlwaysOn}
                      onChange={(e) => updatePreferences({ criticalAlertsAlwaysOn: e.target.checked })}
                      className="rounded border-red-400 bg-neutral-900 text-red-600 focus:ring-red-600"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Always deliver critical infrastructure outages, database connection drops, and security incidents regardless of muted channels.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Filters Bar: Search, Status, Priority */}
          <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search alerts by title, message or event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson transition-all"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Filter */}
              <div className="flex items-center rounded-xl bg-neutral-950 border border-white/10 p-1">
                {(["all", "unread", "read"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1 rounded-lg text-xs capitalize font-medium transition-colors ${
                      statusFilter === s
                        ? "bg-white/15 text-white font-semibold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-crimson transition-all"
              >
                <option value="all">All Priorities</option>
                <option value="critical">P0 Critical</option>
                <option value="high">P1 High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Notifications Table / List */}
          <div className="space-y-3">
            {isLoading && notifications.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-neutral-900/30 border border-white/5 space-y-3">
                <div className="w-8 h-8 mx-auto rounded-full border-2 border-crimson border-t-transparent animate-spin" />
                <p className="text-xs text-neutral-400">Loading alerts...</p>
              </div>
            ) : displayList.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-neutral-900/30 border border-white/10 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-white">No notifications found</h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  {searchQuery || priorityFilter !== "all" || statusFilter !== "all"
                    ? "No notifications match your current filter parameters."
                    : "Inbox clear! System is running smoothly."}
                </p>
              </div>
            ) : (
              displayList.map((item) => (
                <AdminNotificationCard
                  key={item.id}
                  item={item}
                  onMarkRead={() => markAsRead(item.id, !item.isRead)}
                  onTogglePin={() => togglePin(item.id)}
                  onArchive={() => archiveNotification(item.id, item.isArchived)}
                  onOpenNote={() => {
                    setSelectedNotificationForNote(item);
                    setNoteInput(item.internalNote || "");
                  }}
                />
              ))
            )}
          </div>
        </>
      )}

      {/* Internal Note Modal */}
      {selectedNotificationForNote && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-neutral-950 border border-white/10 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-amber-400" />
                Internal Staff Note
              </h3>
              <button
                type="button"
                onClick={() => setSelectedNotificationForNote(null)}
                className="text-neutral-400 hover:text-white"
              >
                &times;
              </button>
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-300">{selectedNotificationForNote.title}</p>
              <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">{selectedNotificationForNote.message}</p>
            </div>
            <div>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Add staff notes, assigned technician, or resolution details..."
                rows={4}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedNotificationForNote(null)}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-crimson hover:bg-red-700 text-white"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulate Infrastructure Alert Modal */}
      {simModalOpen && (
        <SimulateAlertModal
          onClose={() => setSimModalOpen(false)}
          onSimulate={async (data) => {
            await simulateAlert(data);
            setSimModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// ============================================================================
// ADMIN NOTIFICATION ROW CARD
// ============================================================================

interface AdminNotificationCardProps {
  item: EnrichedNotification;
  onMarkRead: () => void;
  onTogglePin: () => void;
  onArchive: () => void;
  onOpenNote: () => void;
}

const AdminNotificationCard: React.FC<AdminNotificationCardProps> = ({
  item,
  onMarkRead,
  onTogglePin,
  onArchive,
  onOpenNote,
}) => {
  const getIcon = () => {
    switch (item.category) {
      case "infrastructure":
        return <Server className="w-4 h-4 text-cyan-400" />;
      case "booking":
      case "enquiries":
        return <Calendar className="w-4 h-4 text-amber-400" />;
      case "cms":
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case "security":
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case "messages":
      case "admin_messages":
        return <MessageSquare className="w-4 h-4 text-purple-400" />;
      case "developer":
        return <Terminal className="w-4 h-4 text-neutral-300" />;
      default:
        return <Bell className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case "critical":
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-red-500/20 text-red-300 border border-red-500/30 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> P0 Critical
          </span>
        );
      case "high":
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
            P1 High
          </span>
        );
      case "medium":
        return (
          <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Medium
          </span>
        );
      case "success":
        return (
          <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Resolved
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        !item.isRead
          ? "bg-neutral-900/80 border-crimson/40 shadow-sm shadow-crimson/5"
          : "bg-neutral-900/30 border-white/5 hover:border-white/10"
      } ${item.isPinned ? "ring-1 ring-amber-500/30" : ""}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center ${
              !item.isRead ? "bg-white/10" : "bg-white/5"
            }`}
          >
            {getIcon()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {getPriorityBadge(item.priority)}
              <span className="text-[11px] font-medium text-neutral-400 capitalize">
                {item.category.replace(/_/g, " ")}
              </span>
              <span className="text-neutral-600">•</span>
              <span className="text-[11px] text-neutral-500 font-mono">
                {new Date(item.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <h4
              className={`text-sm font-bold ${
                !item.isRead ? "text-white" : "text-neutral-300"
              }`}
            >
              {item.title}
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-2xl">
              {item.message}
            </p>

            {item.internalNote && (
              <div className="mt-2 text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 max-w-2xl">
                <span className="font-semibold text-amber-300">Staff Note: </span>
                {item.internalNote}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0 pt-2 sm:pt-0">
          <button
            type="button"
            onClick={onOpenNote}
            title="Add staff note"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 text-xs flex items-center gap-1"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Note</span>
          </button>

          <button
            type="button"
            onClick={onTogglePin}
            title={item.isPinned ? "Unpin alert" : "Pin alert"}
            className={`p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 ${
              item.isPinned ? "text-amber-400" : ""
            }`}
          >
            <Pin className={`w-3.5 h-3.5 ${item.isPinned ? "fill-amber-400" : ""}`} />
          </button>

          <button
            type="button"
            onClick={onMarkRead}
            title={item.isRead ? "Mark unread" : "Mark read"}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
          >
            <CheckCircle2
              className={`w-3.5 h-3.5 ${item.isRead ? "text-neutral-500" : "text-crimson"}`}
            />
          </button>

          <button
            type="button"
            onClick={onArchive}
            title={item.isArchived ? "Restore alert" : "Archive alert"}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
          >
            {item.isArchived ? (
              <ArchiveRestore className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <Archive className="w-3.5 h-3.5" />
            )}
          </button>

          {item.link && (
            <Link
              to={item.link.split("?")[0] as any}
              search={
                item.link.includes("?")
                  ? (Object.fromEntries(new URLSearchParams(item.link.split("?")[1])) as any)
                  : undefined
              }
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-crimson/20 text-crimson hover:bg-crimson/30 border border-crimson/30 ml-1"
            >
              <span>{item.actionLabel || "Inspect"}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SIMULATE ALERT MODAL
// ============================================================================

interface SimulateAlertModalProps {
  onClose: () => void;
  onSimulate: (data: {
    service: "neon" | "vercel";
    alertType: string;
    title: string;
    summary: string;
    severity: NotificationPriority;
  }) => Promise<void>;
}

const SimulateAlertModal: React.FC<SimulateAlertModalProps> = ({
  onClose,
  onSimulate,
}) => {
  const [service, setService] = useState<"neon" | "vercel">("neon");
  const [alertType, setAlertType] = useState("compute_threshold");
  const [title, setTitle] = useState("Neon Compute Exceeded 90%");
  const [summary, setSummary] = useState("Active compute spike detected: 0.95 / 1.0 CU allocated during peak summit traffic.");
  const [severity, setSeverity] = useState<NotificationPriority>("critical");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const presets = [
    {
      service: "neon" as const,
      alertType: "compute_threshold",
      title: "Neon Compute Exceeded 90%",
      summary: "Active compute spike detected: 0.95 / 1.0 CU allocated during peak summit traffic.",
      severity: "critical" as const,
    },
    {
      service: "neon" as const,
      alertType: "storage_threshold",
      title: "Database Storage at 88% Capacity",
      summary: "PostgreSQL table storage has reached 450 MB / 512 MB. Consider upgrading storage allocation.",
      severity: "high" as const,
    },
    {
      service: "vercel" as const,
      alertType: "build_error",
      title: "Vercel Production Build Failed",
      summary: "Deployment on branch main failed during Nitro SSR bundle generation. Error code: BUILD_SPAWN_1.",
      severity: "critical" as const,
    },
    {
      service: "vercel" as const,
      alertType: "edge_latency",
      title: "Vercel Edge Latency Spike (iad1)",
      summary: "P99 TTFB exceeded 450ms in US East region. Traffic rerouted through secondary edge pop.",
      severity: "high" as const,
    },
  ];

  const handleSelectPreset = (p: typeof presets[0]) => {
    setService(p.service);
    setAlertType(p.alertType);
    setTitle(p.title);
    setSummary(p.summary);
    setSeverity(p.severity);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSimulate({ service, alertType, title, summary, severity });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-neutral-950 border border-white/10 p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-display">
              Simulate Infrastructure Alert
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-white">
            &times;
          </button>
        </div>

        {/* Quick Presets */}
        <div>
          <label className="text-xs font-semibold text-neutral-400 block mb-2">
            Select Test Preset:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="p-2 text-left rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-neutral-300 transition-colors"
              >
                <span className="font-bold text-white block">{p.service.toUpperCase()}</span>
                <span className="text-[11px] text-neutral-400 line-clamp-1">{p.title}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-400 block mb-1">Target Service</label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value as "neon" | "vercel")}
                className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-white"
              >
                <option value="neon">Neon Database</option>
                <option value="vercel">Vercel Hosting</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-neutral-400 block mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as NotificationPriority)}
                className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-white"
              >
                <option value="critical">P0 Critical</option>
                <option value="high">P1 High</option>
                <option value="medium">Medium</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-1">Alert Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-white"
              required
            />
          </div>

          <div>
            <label className="text-xs text-neutral-400 block mb-1">Summary Message</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-white"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Firing Alert..." : "Fire Alert Now"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

