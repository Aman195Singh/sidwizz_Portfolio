/**
 * SIDD.WHIZZ — Admin Notification Center Workspace
 * Clean, light-themed notification manager matching the portfolio UI/UX.
 * Covers Bookings, CMS, Infrastructure (Neon DB & Vercel Hosting), Developer Logs, and Security.
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
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Terminal,
  HardDrive,
  Globe,
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
  } = useNotificationPreferences();

  // Hook for infrastructure telemetry
  const {
    telemetry,
    simulateAlert,
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow eyebrow-line">Platform Alerts &amp; System Health</p>
          <h2 className="display mt-2 text-2xl sm:text-3xl text-foreground">
            Admin <span className="text-primary">Notification Center</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Centralized operations hub for Bookings, CMS, Neon Database &amp; Vercel Hosting
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => refresh()}
            title="Refresh alerts"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary transition cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setSimModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-500/20 transition cursor-pointer shadow-xs"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Simulate Infra Alert</span>
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              className="btn-red !py-2 !px-4 text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Infrastructure Telemetry Quick Status Strip */}
      {telemetry && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="panel-card shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase">Neon Database</p>
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {telemetry.neon.status === "healthy" ? "Healthy (0.5 CU)" : "Alerting"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Latency</p>
              <p className="text-xs font-mono font-bold text-foreground">
                {telemetry.neon.queryLatencyMs}ms
              </p>
            </div>
          </div>

          <div className="panel-card shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase">Vercel Edge</p>
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  {telemetry.vercel.deploymentStatus === "ready" ? "Production Ready" : "Building"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Cache Hit</p>
              <p className="text-xs font-mono font-bold text-foreground">
                {telemetry.vercel.cacheHitRatio}%
              </p>
            </div>
          </div>

          <div className="panel-card shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase">Active Alerts</p>
                <p className="text-xs font-bold text-foreground">
                  {(summary?.criticalCount || 0) + (summary?.highCount || 0)} Total
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-amber-500/15 text-amber-800 border border-amber-500/25">
              {summary?.criticalCount || 0} Critical
            </span>
          </div>

          <div className="panel-card shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase">Storage Allocated</p>
                <p className="text-xs font-bold text-foreground">
                  {telemetry.neon.storageUsedMB} MB / 512 MB
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600">
              {((telemetry.neon.storageUsedMB / 512) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-border overflow-x-auto no-scrollbar pb-2">
        {[
          { key: "all", label: "All Alerts", icon: Layers },
          { key: "booking", label: "Bookings & Enquiries", icon: Calendar },
          { key: "cms", label: "CMS Publishing", icon: FileText },
          { key: "infrastructure", label: "Neon DB & Vercel", icon: Server },
          { key: "messages", label: "Messages & Support", icon: MessageSquare },
          { key: "developer", label: "Developer Logs", icon: Terminal },
          { key: "security", label: "Security Incidents", icon: ShieldAlert },
          { key: "archived", label: "Archived", icon: Archive },
          { key: "preferences", label: "Preferences", icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as AdminWorkspaceTab)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card border border-border text-foreground/80 hover:bg-accent hover:text-foreground"
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
        <div className="panel-card shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-base font-bold text-foreground font-display">Notification Delivery Preferences</h3>
              <p className="text-xs text-muted-foreground">Configure global channels and role delivery thresholds</p>
            </div>
            {preferences && (
              <span className="text-[11px] text-muted-foreground">
                Last updated: {new Date(preferences.updatedAt).toLocaleTimeString()}
              </span>
            )}
          </div>

          {preferences && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border bg-card space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Channels</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-accent cursor-pointer">
                    <span className="text-xs font-semibold text-foreground">In-App Notifications</span>
                    <input
                      type="checkbox"
                      checked={preferences.inAppEnabled}
                      onChange={(e) => updatePreferences({ inAppEnabled: e.target.checked })}
                      className="rounded border-input text-primary focus:ring-primary"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-accent cursor-pointer">
                    <span className="text-xs font-semibold text-foreground">Email Notification Digests</span>
                    <input
                      type="checkbox"
                      checked={preferences.emailEnabled}
                      onChange={(e) => updatePreferences({ emailEnabled: e.target.checked })}
                      className="rounded border-input text-primary focus:ring-primary"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-accent cursor-pointer">
                    <span className="text-xs font-semibold text-foreground">Browser Push Notifications</span>
                    <input
                      type="checkbox"
                      checked={preferences.pushEnabled}
                      onChange={(e) => updatePreferences({ pushEnabled: e.target.checked })}
                      className="rounded border-input text-primary focus:ring-primary"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-accent cursor-pointer">
                    <span className="text-xs font-semibold text-foreground">Audio Alert Chime</span>
                    <input
                      type="checkbox"
                      checked={preferences.soundEnabled}
                      onChange={(e) => updatePreferences({ soundEnabled: e.target.checked })}
                      className="rounded border-input text-primary focus:ring-primary"
                    />
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Safety &amp; Overrides</h4>
                <div className="p-3.5 rounded-lg border border-destructive/20 bg-destructive/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-destructive">Critical (P0) Override</span>
                    <input
                      type="checkbox"
                      checked={preferences.criticalAlertsAlwaysOn}
                      onChange={(e) => updatePreferences({ criticalAlertsAlwaysOn: e.target.checked })}
                      className="rounded border-destructive text-destructive focus:ring-destructive"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
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
          <div className="panel-card shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search alerts by title, message or event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Filter */}
              <div className="flex items-center rounded-xl border border-border bg-card p-1 shadow-2xs">
                {(["all", "unread", "read"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1 rounded-lg text-xs capitalize font-bold transition-colors cursor-pointer ${
                      statusFilter === s
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
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
                className="bg-card border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary transition-all shadow-2xs"
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
              <div className="panel-card p-12 text-center space-y-3">
                <div className="w-8 h-8 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-xs text-muted-foreground">Loading alerts...</p>
              </div>
            ) : displayList.length === 0 ? (
              <div className="panel-card p-12 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground">No notifications found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
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
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground font-display flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-amber-600" />
                Internal Staff Note
              </h3>
              <button
                type="button"
                onClick={() => setSelectedNotificationForNote(null)}
                className="text-muted-foreground hover:text-foreground text-lg leading-none"
              >
                &times;
              </button>
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">{selectedNotificationForNote.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{selectedNotificationForNote.message}</p>
            </div>
            <div>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Add staff notes, assigned technician, or resolution details..."
                rows={4}
                className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedNotificationForNote(null)}
                className="btn-outline !py-1.5 !px-3 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="btn-red !py-1.5 !px-4 text-xs cursor-pointer"
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
        return <Server className="w-4 h-4 text-blue-600" />;
      case "booking":
      case "enquiries":
        return <Calendar className="w-4 h-4 text-primary" />;
      case "cms":
        return <FileText className="w-4 h-4 text-emerald-600" />;
      case "security":
        return <ShieldAlert className="w-4 h-4 text-destructive" />;
      case "messages":
      case "admin_messages":
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      case "developer":
        return <Terminal className="w-4 h-4 text-neutral-600" />;
      default:
        return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case "critical":
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-destructive/15 text-destructive border border-destructive/25 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> P0 Critical
          </span>
        );
      case "high":
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-amber-500/15 text-amber-800 border border-amber-500/25 uppercase tracking-wider">
            P1 High
          </span>
        );
      case "medium":
        return (
          <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-blue-500/15 text-blue-800 border border-blue-500/25">
            Medium
          </span>
        );
      case "success":
        return (
          <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-emerald-500/15 text-emerald-800 border border-emerald-500/25">
            Resolved
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`panel-card p-4 transition-all ${
        !item.isRead
          ? "border-primary/40 bg-primary/[0.02] shadow-xs"
          : "border-border bg-card hover:border-neutral-300"
      } ${item.isPinned ? "ring-2 ring-amber-500/30" : ""}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${
              !item.isRead ? "bg-primary/10" : "bg-muted"
            }`}
          >
            {getIcon()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {getPriorityBadge(item.priority)}
              <span className="text-[11px] font-bold text-muted-foreground capitalize">
                {item.category.replace(/_/g, " ")}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-[11px] text-muted-foreground font-mono">
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
                !item.isRead ? "text-foreground" : "text-foreground/80"
              }`}
            >
              {item.title}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              {item.message}
            </p>

            {item.internalNote && (
              <div className="mt-2 text-xs text-amber-900 bg-amber-500/10 border border-amber-500/25 rounded-lg p-2 max-w-2xl">
                <span className="font-bold text-amber-900">Staff Note: </span>
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
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent text-xs flex items-center gap-1 cursor-pointer"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span className="hidden md:inline font-bold">Note</span>
          </button>

          <button
            type="button"
            onClick={onTogglePin}
            title={item.isPinned ? "Unpin alert" : "Pin alert"}
            className={`p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer ${
              item.isPinned ? "text-amber-500" : ""
            }`}
          >
            <Pin className={`w-3.5 h-3.5 ${item.isPinned ? "fill-amber-500" : ""}`} />
          </button>

          <button
            type="button"
            onClick={onMarkRead}
            title={item.isRead ? "Mark unread" : "Mark read"}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
          >
            <CheckCircle2
              className={`w-3.5 h-3.5 ${item.isRead ? "text-muted-foreground/60" : "text-primary"}`}
            />
          </button>

          <button
            type="button"
            onClick={onArchive}
            title={item.isArchived ? "Restore alert" : "Archive alert"}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer"
          >
            {item.isArchived ? (
              <ArchiveRestore className="w-3.5 h-3.5 text-blue-600" />
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
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/25 ml-1"
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
    <div className="fixed inset-0 bg-ink/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-foreground font-display">
              Simulate Infrastructure Alert
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none cursor-pointer">
            &times;
          </button>
        </div>

        {/* Quick Presets */}
        <div>
          <label className="text-xs font-bold text-muted-foreground block mb-2 uppercase">
            Select Test Scenario:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="p-2.5 text-left rounded-xl border border-border bg-card hover:bg-accent text-xs transition-colors cursor-pointer"
              >
                <span className="font-bold text-foreground block">{p.service.toUpperCase()}</span>
                <span className="text-[11px] text-muted-foreground line-clamp-1">{p.title}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">Target Service</label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value as "neon" | "vercel")}
                className="w-full bg-background border border-border rounded-xl p-2 text-xs text-foreground font-medium"
              >
                <option value="neon">Neon Database</option>
                <option value="vercel">Vercel Hosting</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as NotificationPriority)}
                className="w-full bg-background border border-border rounded-xl p-2 text-xs text-foreground font-medium"
              >
                <option value="critical">P0 Critical</option>
                <option value="high">P1 High</option>
                <option value="medium">Medium</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Alert Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-background border border-border rounded-xl p-2 text-xs text-foreground font-medium"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Summary Message</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="w-full bg-background border border-border rounded-xl p-2 text-xs text-foreground font-medium"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline !py-1.5 !px-3 text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-red !py-1.5 !px-4 text-xs flex items-center gap-1.5 cursor-pointer"
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
