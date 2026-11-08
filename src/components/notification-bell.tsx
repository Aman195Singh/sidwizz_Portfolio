/**
 * SIDD.WHIZZ — Notification Bell Component
 * High-visibility interactive bell with real-time unread counter & critical pulse.
 */

import React from "react";
import { Bell } from "lucide-react";
import { useNotificationSummary } from "@/lib/notification-client";

interface NotificationBellProps {
  isOpen?: boolean;
  onToggle: () => void;
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  isOpen = false,
  onToggle,
  className = "",
}) => {
  const { unreadCount, criticalCount } = useNotificationSummary({
    pollIntervalMs: 20000,
  });

  const hasCritical = criticalCount > 0;
  const displayCount = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      className={`relative inline-flex items-center justify-center p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 ${
        isOpen ? "bg-white/15 text-white" : ""
      } ${className}`}
    >
      <Bell className="w-5 h-5 transition-transform group-hover:rotate-12" />

      {unreadCount > 0 && (
        <span
          className={`absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[10px] font-bold text-white rounded-full border-2 border-neutral-950 shadow-md ${
            hasCritical
              ? "bg-red-600 animate-pulse ring-2 ring-red-500/50"
              : "bg-crimson"
          }`}
        >
          {displayCount}
        </span>
      )}
    </button>
  );
};

