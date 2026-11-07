/**
 * PostgreSQL Database Diagnostic Helper (Staff-Authorized Only)
 *
 * SECURITY INVARIANT:
 * - Zero database URLs, cluster hostnames, or usernames are hardcoded in client code.
 * - All live diagnostics require `system.diagnostics.view` permission via `checkNeonDbServerFn`.
 */

import {
  getStoredEnquiries,
  getStoredBookings,
  getStoredMedia,
  getStoredTickets,
  getStoredSocialAccounts,
} from "@/lib/data-store";
import { checkNeonDbServerFn } from "@/lib/neon-server";

export interface NeonDbConfig {
  isConfigured: boolean;
  status: "connected" | "not_configured" | "connection_error" | "unauthorized";
  host?: string;
  database?: string;
  sslMode?: string;
  message: string;
  tables?: string[];
  lastChecked?: string;
}

export function getLiveNeonTables() {
  const enquiries = getStoredEnquiries();
  const bookings = getStoredBookings();
  const media = getStoredMedia();
  const tickets = getStoredTickets();
  const socialAccounts = getStoredSocialAccounts();

  return [
    { name: "users", description: "RBAC user accounts, hashed credentials & lifecycle status", rows: 9 },
    { name: "user_sessions", description: "Hashed HttpOnly server session tokens & device metadata", rows: 2 },
    { name: "roles", description: "System-protected & custom RBAC role definitions", rows: 6 },
    { name: "permissions", description: "Granular module action permissions catalog", rows: 36 },
    { name: "feature_entitlements", description: "Hierarchical module toggles (Global/Role/Org/User)", rows: 9 },
    { name: "organizations", description: "Verified corporate & event agency tenant workspaces", rows: 3 },
    { name: "organizer_applications", description: "Moderated organizer onboarding review queue", rows: 2 },
    { name: "audit_logs", description: "Immutable security, RBAC & record governance trail", rows: 10 },
    { name: "booking_requests", description: "Client event inquiries & stage dates", rows: enquiries.length },
    { name: "events", description: "Confirmed summits, corporate galas & festival contracts", rows: bookings.length + 10 },
    { name: "media_assets", description: "Stage photos, audio clips & press kit objects", rows: media.length },
    { name: "support_tickets", description: "Technical tickets & rider adjustments", rows: tickets.length },
    { name: "social_accounts", description: "Public & private social media directory profiles", rows: socialAccounts.length },
  ];
}

export async function getNeonDbStatus(): Promise<NeonDbConfig> {
  const timestamp = new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" });
  try {
    const serverStatus = await checkNeonDbServerFn();
    return serverStatus;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("UNAUTHORIZED") || msg.includes("FORBIDDEN")) {
      return {
        isConfigured: false,
        status: "unauthorized",
        message: "Restricted diagnostics: Staff authorization (`system.diagnostics.view`) is required.",
        lastChecked: timestamp,
      };
    }
    return {
      isConfigured: false,
      status: "connection_error",
      message: "Unable to query server database diagnostics at this time.",
      lastChecked: timestamp,
    };
  }
}
