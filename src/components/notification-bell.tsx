/**
 * SIDD.WHIZZ — Notification Bell Component
 * Styled to perfectly match the SiddWhizz header and navigation theme.
 * Real-time unread badge counter with crimson accent and critical pulse.
 */

import React from "react";
import { Bell } from "lucide-react";
import { useNotificationSummary } from "@/lib/notification-client";

interface NotificationBellProps {
  isOpen?: boolean | undefined;
  onToggle: () => void;
  className?: string | undefined;
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
      className={`relative inline-flex items-center justify-center h-10 w-10 rounded-full border border-border bg-card text-foreground hover:bg-accent hover:text-primary transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs cursor-pointer ${
        isOpen ? "bg-accent text-primary border-primary/50 ring-2 ring-primary/20" : ""
      } ${className}`}
      title={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
    >
      <Bell className="w-4 h-4 transition-transform group-hover:rotate-12" />

      {unreadCount > 0 && (
        <span
          className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-black text-white rounded-full border-2 border-background shadow-xs ${
            hasCritical
              ? "bg-destructive animate-pulse ring-2 ring-destructive/40"
              : "bg-primary"
          }`}
        >
          {displayCount}
        </span>
      )}
    </button>
  );
};
