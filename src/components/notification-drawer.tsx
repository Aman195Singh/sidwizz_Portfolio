/**
 * SIDD.WHIZZ — Notification Drawer Component
 * Accessible right-sliding animated notification panel with live filtering,
 * scroll lock, keyboard shortcuts, priority badges, and deep workspace links.
 */

import React, { useEffect, useId, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  CheckCheck,
  X,
  Search,
  ExternalLink,
  Calendar,
  Database,
  Server,
  ShieldAlert,
  FileText,
  MessageSquare,
  Sparkles,
  Ticket,
  Pin,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
} from "lucide-react";
import { useNotifications } from "@/lib/notification-client";
import { useAuth } from "@/lib/auth";
import type { EnrichedNotification, NotificationPriority } from "@/lib/notification-types";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "bookings" | "system">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    togglePin,
    refresh,
  } = useNotifications(isOpen ? { autoPollMs: 10000 } : undefined);

  // Body scroll lock & Escape key handling
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus close button on open
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Client-side filter for fast interactive filtering inside drawer
  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === "unread" && item.isRead) return false;
    if (activeFilter === "bookings" && item.category !== "booking" && item.category !== "enquiries") return false;
    if (activeFilter === "system" && item.category !== "infrastructure" && item.category !== "security" && item.category !== "developer") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchMsg = item.message.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      if (!matchTitle && !matchMsg && !matchCat) return false;
    }
    return true;
  });

  // Sort: pinned first, then unread first, then by createdAt desc
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getRoleWorkspaceLink = () => {
    if (!isAuthenticated || !user) return "/";
    if (user.role === "admin") return "/admin";
    if (user.role === "client") return "/organizer";
    return "/profile";
  };

  const getWorkspaceTitle = () => {
    if (!isAuthenticated || !user) return "View Full Inbox";
    if (user.role === "admin") return "Open Admin Notification Center";
    if (user.role === "client") return "Open Organizer Notification Center";
    return "Open Member Portal";
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-[440px] bg-neutral-950 border-l border-white/10 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-neutral-900/60 backdrop-blur flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-crimson/20 border border-crimson/40 flex items-center justify-center text-crimson">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id={titleId} className="text-base font-bold text-white font-display">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-crimson/20 border border-crimson/30 text-crimson">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400">
                {user ? `${user.name} (${user.role.toUpperCase()})` : "Live platform alerts"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                title="Mark all as read"
                className="p-1.5 text-xs text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">All read</span>
              </button>
            )}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close notifications panel"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="p-3 sm:px-4 border-b border-white/10 bg-neutral-900/30 space-y-2.5">
          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                activeFilter === "all"
                  ? "bg-white text-neutral-950 font-semibold"
                  : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("unread")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                activeFilter === "unread"
                  ? "bg-crimson text-white font-semibold"
                  : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("bookings")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                activeFilter === "bookings"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold"
                  : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
              }`}
            >
              Bookings
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("system")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                activeFilter === "system"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
                  : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
              }`}
            >
              System
            </button>
          </div>

          {/* Search Field */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950/80 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Notification List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 sm:p-4 space-y-2.5">
          {isLoading && notifications.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 mx-auto rounded-full border-2 border-crimson border-t-transparent animate-spin" />
              <p className="text-xs text-neutral-400">Loading notifications...</p>
            </div>
          ) : sortedNotifications.length === 0 ? (
            <div className="py-12 text-center space-y-3 px-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-white">No notifications</h3>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                {searchQuery || activeFilter !== "all"
                  ? "No matching alerts found for your filter criteria."
                  : "You're all caught up! New bookings, system events, and messages will appear here."}
              </p>
              {(searchQuery || activeFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter("all");
                    setSearchQuery("");
                  }}
                  className="px-3 py-1 text-xs text-crimson hover:underline"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            sortedNotifications.map((item) => (
              <NotificationCard
                key={item.id}
                item={item}
                onMarkRead={() => markAsRead(item.id, !item.isRead)}
                onTogglePin={() => togglePin(item.id)}
                onCloseDrawer={onClose}
              />
            ))
          )}
        </div>

        {/* Drawer Footer with Role Workspace Link */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-neutral-900/60 backdrop-blur flex items-center justify-between gap-2">
          <Link
            to={getRoleWorkspaceLink()}
            search={{ tab: "notifications" } as any}
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/15 text-white transition-all border border-white/10 hover:border-white/20"
          >
            <span>{getWorkspaceTitle()}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>
    </>
  );
};

// ============================================================================
// NOTIFICATION CARD SUBCOMPONENT
// ============================================================================

interface NotificationCardProps {
  item: EnrichedNotification;
  onMarkRead: () => void;
  onTogglePin: () => void;
  onCloseDrawer: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  item,
  onMarkRead,
  onTogglePin,
  onCloseDrawer,
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
      case "tickets":
        return <Ticket className="w-4 h-4 text-blue-400" />;
      case "developer":
        return <Database className="w-4 h-4 text-neutral-300" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-300" />;
    }
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case "critical":
        return (
          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-500/20 text-red-300 border border-red-500/30 uppercase tracking-wider flex items-center gap-0.5">
            <AlertTriangle className="w-2.5 h-2.5" /> P0 Critical
          </span>
        );
      case "high":
        return (
          <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
            P1 High
          </span>
        );
      case "medium":
        return (
          <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Medium
          </span>
        );
      case "success":
        return (
          <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Success
          </span>
        );
      default:
        return null;
    }
  };

  const formatRelativeTime = (iso: string) => {
    try {
      const now = Date.now();
      const diffMs = now - new Date(iso).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  };

  return (
    <div
      className={`group relative p-3 rounded-xl border transition-all ${
        !item.isRead
          ? "bg-neutral-900/90 border-crimson/40 shadow-sm shadow-crimson/5 hover:border-crimson"
          : "bg-neutral-900/40 border-white/5 hover:border-white/15"
      } ${item.isPinned ? "ring-1 ring-amber-500/30" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Category Icon */}
        <div
          className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
            !item.isRead ? "bg-white/10" : "bg-white/5"
          }`}
        >
          {getIcon()}
        </div>

        {/* Card Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {getPriorityBadge(item.priority)}
              <span className="text-[11px] font-medium text-neutral-400 capitalize">
                {item.category.replace(/_/g, " ")}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onTogglePin}
                title={item.isPinned ? "Unpin alert" : "Pin alert"}
                className={`p-1 rounded text-neutral-400 hover:text-white hover:bg-white/10 transition-colors ${
                  item.isPinned ? "text-amber-400" : ""
                }`}
              >
                <Pin className={`w-3.5 h-3.5 ${item.isPinned ? "fill-amber-400" : ""}`} />
              </button>
              <button
                type="button"
                onClick={onMarkRead}
                title={item.isRead ? "Mark as unread" : "Mark as read"}
                className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${item.isRead ? "text-neutral-500" : "text-crimson"}`}
                />
              </button>
            </div>
          </div>

          <h4
            className={`text-xs font-semibold leading-snug line-clamp-2 ${
              !item.isRead ? "text-white" : "text-neutral-300"
            }`}
          >
            {item.title}
          </h4>

          <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
            {item.message}
          </p>

          {item.internalNote && (
            <div className="mt-1.5 text-[11px] text-amber-200/80 bg-amber-500/10 border border-amber-500/20 rounded p-1.5">
              <span className="font-semibold text-amber-300">Staff Note: </span>
              {item.internalNote}
            </div>
          )}

          {/* Action Link & Timestamp Footer */}
          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/5">
            <div className="flex items-center gap-1 text-[10px] text-neutral-500">
              <Clock className="w-3 h-3" />
              <span>{formatRelativeTime(item.createdAt)}</span>
            </div>

            {item.link ? (
              <Link
                to={item.link.split("?")[0] as any}
                search={
                  item.link.includes("?")
                    ? (Object.fromEntries(new URLSearchParams(item.link.split("?")[1])) as any)
                    : undefined
                }
                onClick={onCloseDrawer}
                className="inline-flex items-center gap-1 text-xs font-semibold text-crimson hover:text-red-400 transition-colors"
              >
                <span>{item.actionLabel || "View Details"}</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

