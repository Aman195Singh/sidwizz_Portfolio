/**
 * SIDD.WHIZZ — Notification Drawer Component
 * Styled to seamlessly harmonize with the SiddWhizz light card & crimson theme.
 * Smooth right-sliding drawer with accessible focus trap, scroll lock, and deep workspace links.
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
    if (user.role === "admin") return "Open Full Admin Notification Center";
    if (user.role === "client") return "Open Full Organizer Notification Hub";
    return "Open Member Portal Inbox";
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-ink/40 backdrop-blur-xs z-40 transition-opacity duration-300 ${
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
        className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-[430px] bg-card border-l border-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-card flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id={titleId} className="text-base font-bold text-foreground font-display">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-primary/10 border border-primary/25 text-primary">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {user ? (
                  <span className="font-semibold">
                    {user.role === "admin" ? "Admin Alert Feed" : user.role === "client" ? "Organizer Updates" : "Member Activity"}
                  </span>
                ) : (
                  "Platform Alerts"
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                title="Mark all as read"
                className="px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-primary rounded-lg hover:bg-accent transition-colors flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">All read</span>
              </button>
            )}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close notifications panel"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="p-3 sm:px-4 border-b border-border bg-muted/40 space-y-2.5">
          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                activeFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("unread")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                activeFilter === "unread"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("bookings")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                activeFilter === "bookings"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              Bookings
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("system")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                activeFilter === "system"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              System
            </button>
          </div>

          {/* Search Field */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-border rounded-xl pl-8 pr-7 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
              <div className="w-7 h-7 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-xs text-muted-foreground">Loading notifications...</p>
            </div>
          ) : sortedNotifications.length === 0 ? (
            <div className="py-12 text-center space-y-3 px-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground">No notifications</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {searchQuery || activeFilter !== "all"
                  ? "No alerts match your current filter parameters."
                  : "You're all caught up! New updates will appear here."}
              </p>
              {(searchQuery || activeFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter("all");
                    setSearchQuery("");
                  }}
                  className="px-3 py-1 text-xs font-bold text-primary hover:underline cursor-pointer"
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
        <div className="p-3 sm:p-4 border-t border-border bg-card flex items-center justify-between gap-2">
          <Link
            to={getRoleWorkspaceLink()}
            search={{ tab: "notifications" } as any}
            onClick={onClose}
            className="btn-red !w-full !py-2.5 !text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
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
      case "tickets":
        return <Ticket className="w-4 h-4 text-blue-600" />;
      case "developer":
        return <Database className="w-4 h-4 text-neutral-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-primary" />;
    }
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case "critical":
        return (
          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-destructive/15 text-destructive border border-destructive/25 uppercase tracking-wider flex items-center gap-0.5">
            <AlertTriangle className="w-2.5 h-2.5" /> P0 Critical
          </span>
        );
      case "high":
        return (
          <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-amber-500/15 text-amber-800 border border-amber-500/25 uppercase tracking-wider">
            P1 High
          </span>
        );
      case "medium":
        return (
          <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-500/15 text-blue-800 border border-blue-500/25">
            Medium
          </span>
        );
      case "success":
        return (
          <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-emerald-500/15 text-emerald-800 border border-emerald-500/25">
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
          ? "bg-primary/[0.03] border-primary/35 shadow-xs hover:border-primary/60"
          : "bg-card border-border hover:border-neutral-300"
      } ${item.isPinned ? "ring-2 ring-amber-500/30" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Category Icon */}
        <div
          className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
            !item.isRead ? "bg-primary/10" : "bg-muted"
          }`}
        >
          {getIcon()}
        </div>

        {/* Card Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {getPriorityBadge(item.priority)}
              <span className="text-[11px] font-bold text-muted-foreground capitalize">
                {item.category.replace(/_/g, " ")}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onTogglePin}
                title={item.isPinned ? "Unpin alert" : "Pin alert"}
                className={`p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer ${
                  item.isPinned ? "text-amber-500" : ""
                }`}
              >
                <Pin className={`w-3.5 h-3.5 ${item.isPinned ? "fill-amber-500" : ""}`} />
              </button>
              <button
                type="button"
                onClick={onMarkRead}
                title={item.isRead ? "Mark as unread" : "Mark as read"}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${item.isRead ? "text-muted-foreground/60" : "text-primary"}`}
                />
              </button>
            </div>
          </div>

          <h4
            className={`text-xs font-bold leading-snug line-clamp-2 ${
              !item.isRead ? "text-foreground" : "text-foreground/80"
            }`}
          >
            {item.title}
          </h4>

          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {item.message}
          </p>

          {item.internalNote && (
            <div className="mt-1.5 text-[11px] text-amber-900 bg-amber-500/10 border border-amber-500/25 rounded-lg p-2">
              <span className="font-bold text-amber-900">Staff Note: </span>
              {item.internalNote}
            </div>
          )}

          {/* Action Link & Timestamp Footer */}
          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border/60">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
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
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-deep transition-colors"
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
