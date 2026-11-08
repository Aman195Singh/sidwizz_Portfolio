/**
 * SIDD.WHIZZ — Organizer Notification Center Workspace
 * Dedicated notification hub for event organizers & corporate clients.
 * Manages bookings, quotations, admin messages, attendee check-ins, and feature updates.
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-display flex items-center gap-2">
              Organizer Notification Hub
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-crimson/20 border border-crimson/40 text-crimson">
                  {unreadCount} Unread
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
              Live updates on your bookings, Sid&apos;s proposals, attendee registrations, and stage schedules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => refresh()}
            className="px-3 py-2 text-xs font-medium rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
            <span>Refresh</span>
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 transition-all shadow-md"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto no-scrollbar pb-1">
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
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? "bg-amber-500 text-neutral-950 font-bold shadow-md"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-neutral-900/40 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-all"
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
          <div className="p-12 text-center rounded-2xl bg-neutral-900/30 border border-white/5 space-y-3">
            <div className="w-8 h-8 mx-auto rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
            <p className="text-xs text-neutral-400">Loading notifications...</p>
          </div>
        ) : displayList.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-neutral-900/30 border border-white/10 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">No notifications</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
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
        return <Calendar className="w-4 h-4 text-amber-400" />;
      case "admin_messages":
        return <MessageSquare className="w-4 h-4 text-purple-400" />;
      case "attendees":
        return <Ticket className="w-4 h-4 text-blue-400" />;
      case "payments":
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case "team":
        return <Users className="w-4 h-4 text-cyan-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-300" />;
    }
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case "critical":
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-red-500/20 text-red-300 border border-red-500/30 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Urgent
          </span>
        );
      case "high":
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
            High Priority
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
          ? "bg-neutral-900/80 border-amber-500/40 shadow-sm shadow-amber-500/5"
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
              <span className="text-[11px] text-neutral-500">
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
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0 pt-2 sm:pt-0">
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
              className={`w-3.5 h-3.5 ${item.isRead ? "text-neutral-500" : "text-amber-400"}`}
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
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 ml-1"
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

