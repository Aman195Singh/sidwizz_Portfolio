/**
 * SIDD.WHIZZ — Organizer Notification Center Workspace
 * Clean, light-themed notification hub for event organizers & corporate clients.
 * Matches the portfolio UI/UX with crimson accents, light cards, and clear typography.
 */

import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  Search,
  CheckCheck,
  Pin,
  Calendar,
  MessageSquare,
  Ticket,
  CreditCard,
  Users,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Layers,
} from "lucide-react";
import { useNotifications } from "@/lib/notification-client";
import type { EnrichedNotification, NotificationPriority } from "@/lib/notification-types";

type OrganizerTab =
  | "all"
  | "admin_messages"
  | "booking"
  | "events"
  | "attendees"
  | "payments"
  | "team"
  | "features";

export const OrganizerNotificationWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OrganizerTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const {
    notifications,
    unreadCount,
    isLoading,
    refresh,
    markAsRead,
    markAllAsRead,
    togglePin,
  } = useNotifications({
    ...(activeTab !== "all" ? { tab: activeTab } : {}),
    priority: priorityFilter,
    search: searchQuery,
  });

  const displayList = notifications.filter((item) => {
    if (activeTab === "admin_messages" && item.category !== "admin_messages") return false;
    if (activeTab === "booking" && item.category !== "booking") return false;
    if (activeTab === "events" && item.category !== "events") return false;
    if (activeTab === "attendees" && item.category !== "attendees") return false;
    if (activeTab === "payments" && item.category !== "payments") return false;
    if (activeTab === "team" && item.category !== "team") return false;
    if (activeTab === "features" && item.category !== "features") return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow eyebrow-line">Host Bookings, Enquiries &amp; Stage Updates</p>
          <h2 className="display mt-2 text-2xl sm:text-3xl text-foreground">
            Organizer <span className="text-primary">Notification Hub</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Live updates on your bookings, Sid&apos;s proposals, attendee registrations, and stage schedules
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => refresh()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary transition cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
            <span>Refresh</span>
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

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-border overflow-x-auto no-scrollbar pb-2">
        {[
          { key: "all", label: "All Alerts", icon: Layers },
          { key: "admin_messages", label: "Admin Messages", icon: MessageSquare },
          { key: "booking", label: "Bookings & Proposals", icon: Calendar },
          { key: "events", label: "Live Events", icon: Sparkles },
          { key: "attendees", label: "Attendees & Tickets", icon: Ticket },
          { key: "payments", label: "Quotations & Invoicing", icon: CreditCard },
          { key: "team", label: "Team Activity", icon: Users },
          { key: "features", label: "Platform Features", icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as OrganizerTab)}
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

      {/* Filter and Search Bar */}
      <div className="panel-card shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-card border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-primary transition-all shadow-2xs"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical / Urgent</option>
            <option value="high">High Priority</option>
            <option value="medium">Normal</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading && notifications.length === 0 ? (
          <div className="panel-card p-12 text-center space-y-3">
            <div className="w-8 h-8 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-xs text-muted-foreground">Loading notifications...</p>
          </div>
        ) : displayList.length === 0 ? (
          <div className="panel-card p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground">No notifications</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              You are all caught up! Updates regarding your event bookings and messages will appear here.
            </p>
          </div>
        ) : (
          displayList.map((item) => (
            <OrganizerNotificationCard
              key={item.id}
              item={item}
              onMarkRead={() => markAsRead(item.id, !item.isRead)}
              onTogglePin={() => togglePin(item.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

// ============================================================================
// ORGANIZER NOTIFICATION CARD SUBCOMPONENT
// ============================================================================

interface OrganizerNotificationCardProps {
  item: EnrichedNotification;
  onMarkRead: () => void;
  onTogglePin: () => void;
}

const OrganizerNotificationCard: React.FC<OrganizerNotificationCardProps> = ({
  item,
  onMarkRead,
  onTogglePin,
}) => {
  const getIcon = () => {
    switch (item.category) {
      case "booking":
        return <Calendar className="w-4 h-4 text-primary" />;
      case "admin_messages":
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      case "attendees":
        return <Ticket className="w-4 h-4 text-blue-600" />;
      case "payments":
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case "team":
        return <Users className="w-4 h-4 text-cyan-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-primary" />;
    }
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case "critical":
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-destructive/15 text-destructive border border-destructive/25 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Urgent
          </span>
        );
      case "high":
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-amber-500/15 text-amber-800 border border-amber-500/25 uppercase tracking-wider">
            High Priority
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
              <span className="text-[11px] text-muted-foreground font-medium">
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
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0 pt-2 sm:pt-0">
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
              <span>{item.actionLabel || "View"}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
