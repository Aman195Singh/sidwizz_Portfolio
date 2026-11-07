import { createServerFn } from "@tanstack/react-start";
import { getRequestIP, setResponseStatus } from "@tanstack/react-start/server";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";
import { requireServerAuth } from "@/lib/auth-server";
import { checkServerRateLimit } from "@/lib/server-crypto";

/**
 * Server-Only Neon PostgreSQL Executor (@neondatabase/serverless)
 *
 * Strictly executes on the server with:
 * - Zero database credentials or cluster hostnames leaked to browser bundles
 * - Runtime Zod schema validation at every RPC boundary
 * - 4-Gate RBAC authorization on all protected mutations
 * - Atomic HTTP batch transactions (`sql.transaction`) for multi-statement writes
 */

let socialTableInitialized = false;

function getServerNeonClient() {
  const connectionString =
    (typeof process !== "undefined" &&
      (process.env?.["DATABASE_URL"] || process.env?.["DIRECT_URL"])) ||
    "";
  if (!connectionString.trim()) {
    return { sql: null, connectionString: "" };
  }
  try {
    return { sql: neon(connectionString.trim()), connectionString: connectionString.trim() };
  } catch {
    return { sql: null, connectionString: "" };
  }
}

function redactHost(hostname: string): string {
  const parts = hostname.split(".");
  if (parts.length <= 2) return "configured-postgres-host";
  const first = parts[0] || "ep";
  const maskedFirst = first.length > 8 ? `${first.slice(0, 6)}***` : `${first}***`;
  return [maskedFirst, ...parts.slice(1)].join(".");
}

export const checkNeonDbServerFn = createServerFn({ method: "GET" }).handler(async () => {
  // Restricted strictly to authorized staff with `system.diagnostics.view`
  await requireServerAuth({ permission: "system.diagnostics.view" });

  const timestamp = new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" });
  const { sql, connectionString } = getServerNeonClient();

  if (!sql || !connectionString) {
    return {
      isConfigured: false,
      status: "not_configured" as const,
      host: "not-configured (server memory store active)",
      database: "siddwhizz_dev",
      sslMode: "require",
      message:
        "Running on resilient server-side store. Configure DATABASE_URL in server environment variables for live PostgreSQL persistence.",
      tables: [] as string[],
      lastChecked: timestamp,
    };
  }

  try {
    const parsedUrl = new URL(connectionString.replace(/^postgresql:/, "http:"));
    const rows = await sql.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
    );
    const tableNames = (rows as Record<string, unknown>[]).map((r) => String(r["table_name"]));

    return {
      isConfigured: true,
      status: "connected" as const,
      host: redactHost(parsedUrl.hostname),
      database: parsedUrl.pathname.replace(/^\//, "") || "postgres",
      sslMode: parsedUrl.searchParams.get("sslmode") || "require",
      message: `Connected securely via Authenticated Server RPC (${tableNames.length} public schema tables verified).`,
      tables: tableNames,
      lastChecked: timestamp,
    };
  } catch {
    return {
      isConfigured: true,
      status: "connection_error" as const,
      host: "redacted-cluster-endpoint",
      database: "postgres",
      sslMode: "require",
      message: "Database connection check encountered a transient network error.",
      tables: [] as string[],
      lastChecked: timestamp,
    };
  }
});

// ============================================================================
// ZOD SCHEMAS FOR OPERATIONAL MUTATIONS
// ============================================================================

const ServerEnquirySchema = z.object({
  id: z.string().trim().min(2).max(64),
  eventName: z.string().trim().min(2).max(200),
  clientName: z.string().trim().min(2).max(120),
  organization: z.string().trim().max(160).default(""),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(5).max(48),
  cleanPhone: z.string().trim().max(32).default(""),
  date: z.string().trim().max(64).default(""),
  city: z.string().trim().min(2).max(100),
  venue: z.string().trim().max(200).default(""),
  crowdSize: z.string().trim().max(80).default(""),
  format: z.string().trim().min(2).max(120),
  budget: z.string().trim().max(100).default(""),
  status: z.enum(["New", "In Discussion", "Confirmed", "Declined"]).default("New"),
  brief: z.string().trim().max(3000).default(""),
  honeypotWebsite: z.string().max(0).optional(), // Anti-bot honeypot must be empty
});

export type ServerEnquiryInput = z.input<typeof ServerEnquirySchema>;

export const insertNeonEnquiryServerFn = createServerFn({ method: "POST" })
  .validator((raw: ServerEnquiryInput) => ServerEnquirySchema.parse(raw))
  .handler(async ({ data }) => {
    if (data.honeypotWebsite) {
      // Silently drop automated bot submissions filling hidden honeypot
      return { synced: false };
    }

    let ip = "127.0.0.1";
    try {
      ip = getRequestIP({ xForwardedFor: true }) || "127.0.0.1";
    } catch {
      // ignore
    }

    const rate = checkServerRateLimit({
      key: `public_enquiry:${ip}`,
      maxRequests: 6,
      windowMs: 10 * 60 * 1000,
    });
    if (!rate.allowed) {
      try {
        setResponseStatus(429);
      } catch {
        // ignore
      }
      throw new Error(`Rate limit exceeded. Please wait ${rate.retryAfterSec}s before submitting another enquiry.`);
    }

    const { sql } = getServerNeonClient();
    if (!sql) return { synced: false };

    try {
      await sql.query(
        `INSERT INTO booking_requests (id, event_name, client_name, organization, email, phone, clean_phone, date, city, venue, crowd_size, format, budget, status, brief)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         ON CONFLICT (id) DO NOTHING;`,
        [
          data.id,
          data.eventName,
          data.clientName,
          data.organization,
          data.email,
          data.phone,
          data.cleanPhone,
          data.date,
          data.city,
          data.venue,
          data.crowdSize,
          data.format,
          data.budget,
          "New", // Public submissions always enter as 'New'
          data.brief,
        ]
      );
      return { synced: true };
    } catch {
      return { synced: false };
    }
  });

const UpdateEnquiryStatusSchema = z.object({
  id: z.string().trim().min(2).max(64),
  status: z.enum(["New", "In Discussion", "Confirmed", "Declined"]),
});

export const updateNeonEnquiryStatusServerFn = createServerFn({ method: "POST" })
  .validator((raw: z.input<typeof UpdateEnquiryStatusSchema>) =>
    UpdateEnquiryStatusSchema.parse(raw)
  )
  .handler(async ({ data }) => {
    await requireServerAuth({ isMutation: true, permission: "enquiries.manage" });
    const { sql } = getServerNeonClient();
    if (!sql) return { synced: false };

    try {
      await sql.query(`UPDATE booking_requests SET status = $1 WHERE id = $2 AND deleted_at IS NULL;`, [
        data.status,
        data.id,
      ]);
      return { synced: true };
    } catch {
      return { synced: false };
    }
  });

const ServerContractSchema = z.object({
  id: z.string().trim().min(2).max(64),
  enquiryId: z.string().trim().max(64).optional(),
  eventName: z.string().trim().min(2).max(200),
  clientName: z.string().trim().min(2).max(120),
  organization: z.string().trim().max(160),
  date: z.string().trim().min(4).max(64),
  time: z.string().trim().max(64),
  venue: z.string().trim().min(2).max(200),
  city: z.string().trim().min(2).max(100),
  format: z.string().trim().min(2).max(120),
  fee: z.string().trim().max(64),
  advancePaid: z.boolean(),
  status: z.enum(["Confirmed", "Completed", "Pending"]),
  contractRef: z.string().trim().min(2).max(128),
});

export type ServerContractInput = z.input<typeof ServerContractSchema>;

export const insertNeonContractServerFn = createServerFn({ method: "POST" })
  .validator((raw: ServerContractInput) => ServerContractSchema.parse(raw))
  .handler(async ({ data }) => {
    await requireServerAuth({
      isMutation: true,
      feature: "feature.booking_management",
      permission: "booking.approve",
    });

    const { sql } = getServerNeonClient();
    if (!sql) return { synced: false };

    try {
      await sql.query(
        `INSERT INTO events (id, enquiry_id, event_name, client_name, organization, date, time, venue, city, format, fee, advance_paid, status, contract_ref)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (id) DO UPDATE SET advance_paid = EXCLUDED.advance_paid, status = EXCLUDED.status, fee = EXCLUDED.fee;`,
        [
          data.id,
          data.enquiryId || null,
          data.eventName,
          data.clientName,
          data.organization,
          data.date,
          data.time,
          data.venue,
          data.city,
          data.format,
          data.fee,
          data.advancePaid,
          data.status,
          data.contractRef,
        ]
      );
      return { synced: true };
    } catch {
      return { synced: false };
    }
  });

const MarkAdvancePaidSchema = z.object({
  id: z.string().trim().min(2).max(64),
});

export const markNeonAdvancePaidServerFn = createServerFn({ method: "POST" })
  .validator((raw: z.input<typeof MarkAdvancePaidSchema>) => MarkAdvancePaidSchema.parse(raw))
  .handler(async ({ data }) => {
    await requireServerAuth({
      isMutation: true,
      feature: "feature.financial_management",
      permission: "finance.manage",
    });

    const { sql } = getServerNeonClient();
    if (!sql) return { synced: false };

    try {
      await sql.query(
        `UPDATE events SET advance_paid = TRUE, status = 'Confirmed' WHERE id = $1 AND deleted_at IS NULL;`,
        [data.id]
      );
      return { synced: true };
    } catch {
      return { synced: false };
    }
  });

const ServerTicketSchema = z.object({
  id: z.string().trim().min(2).max(64),
  userEmail: z.string().trim().email().max(255),
  subject: z.string().trim().min(2).max(200),
  priority: z.string().trim().max(32),
  description: z.string().trim().min(2).max(2000),
  status: z.enum(["Open", "In Progress", "Resolved"]),
});

export type ServerTicketInput = z.input<typeof ServerTicketSchema>;

export const insertNeonTicketServerFn = createServerFn({ method: "POST" })
  .validator((raw: ServerTicketInput) => ServerTicketSchema.parse(raw))
  .handler(async ({ data }) => {
    await requireServerAuth({ isMutation: true });

    const { sql } = getServerNeonClient();
    if (!sql) return { synced: false };

    try {
      await sql.query(
        `INSERT INTO support_tickets (id, user_email, subject, priority, description, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;`,
        [data.id, data.userEmail, data.subject, data.priority, data.description, data.status]
      );
      return { synced: true };
    } catch {
      return { synced: false };
    }
  });

const ServerSocialAccountSchema = z.object({
  id: z.string().trim().min(2).max(64),
  platform: z.string().trim().min(1).max(40),
  customPlatformName: z.string().trim().max(80).optional(),
  accountName: z.string().trim().min(1).max(120),
  username: z.string().trim().min(1).max(120),
  profileUrl: z.string().trim().url().max(500),
  accountType: z.string().trim().min(1).max(40),
  isPrimaryOverall: z.boolean(),
  isPrimaryPlatform: z.boolean(),
  isVisible: z.boolean(),
  displayOrder: z.number().int().min(0).max(999),
  status: z.string().trim().max(32),
});

export type ServerSocialAccountInput = z.input<typeof ServerSocialAccountSchema>;

async function ensureSocialAccountsTableOnce(sql: {
  query: (q: string, params?: unknown[]) => Promise<unknown>;
}) {
  if (socialTableInitialized) return;
  socialTableInitialized = true;
  await sql.query(`
    CREATE TABLE IF NOT EXISTS social_accounts (
      id TEXT PRIMARY KEY,
      platform TEXT NOT NULL,
      custom_platform_name TEXT,
      account_name TEXT NOT NULL,
      username TEXT NOT NULL,
      profile_url TEXT NOT NULL,
      account_type TEXT NOT NULL,
      is_primary_overall BOOLEAN DEFAULT FALSE,
      is_primary_platform BOOLEAN DEFAULT FALSE,
      is_visible BOOLEAN DEFAULT TRUE,
      display_order INTEGER DEFAULT 1,
      status TEXT DEFAULT 'Saved',
      deleted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

export const insertNeonSocialAccountServerFn = createServerFn({ method: "POST" })
  .validator((raw: ServerSocialAccountInput) => ServerSocialAccountSchema.parse(raw))
  .handler(async ({ data }) => {
    await requireServerAuth({ isMutation: true, permission: "cms.edit" });
    const { sql } = getServerNeonClient();
    if (!sql) return { synced: false };

    try {
      await ensureSocialAccountsTableOnce(sql);

      // Execute multi-statement primary-flag + upsert atomically in a single ACID transaction!
      const queries = [];
      if (data.isPrimaryOverall) {
        queries.push(sql.query(`UPDATE social_accounts SET is_primary_overall = FALSE;`));
      }
      if (data.isPrimaryPlatform) {
        queries.push(
          sql.query(`UPDATE social_accounts SET is_primary_platform = FALSE WHERE platform = $1;`, [
            data.platform,
          ])
        );
      }
      queries.push(
        sql.query(
          `INSERT INTO social_accounts (
            id, platform, custom_platform_name, account_name, username,
            profile_url, account_type, is_primary_overall, is_primary_platform,
            is_visible, display_order, status, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
          ON CONFLICT (id) DO UPDATE SET
            platform = EXCLUDED.platform,
            custom_platform_name = EXCLUDED.custom_platform_name,
            account_name = EXCLUDED.account_name,
            username = EXCLUDED.username,
            profile_url = EXCLUDED.profile_url,
            account_type = EXCLUDED.account_type,
            is_primary_overall = EXCLUDED.is_primary_overall,
            is_primary_platform = EXCLUDED.is_primary_platform,
            is_visible = EXCLUDED.is_visible,
            display_order = EXCLUDED.display_order,
            status = EXCLUDED.status,
            updated_at = NOW();`,
          [
            data.id,
            data.platform,
            data.customPlatformName || null,
            data.accountName,
            data.username,
            data.profileUrl,
            data.accountType,
            data.isPrimaryOverall,
            data.isPrimaryPlatform,
            data.isVisible,
            data.displayOrder,
            data.status,
          ]
        )
      );

      await sql.transaction(queries);
      return { synced: true };
    } catch {
      return { synced: false };
    }
  });

const DeleteSocialAccountSchema = z.object({
  id: z.string().trim().min(2).max(64),
});

export const deleteNeonSocialAccountServerFn = createServerFn({ method: "POST" })
  .validator((raw: z.input<typeof DeleteSocialAccountSchema>) =>
    DeleteSocialAccountSchema.parse(raw)
  )
  .handler(async ({ data }) => {
    await requireServerAuth({ isMutation: true, permission: "cms.edit" });
    const { sql } = getServerNeonClient();
    if (!sql) return { synced: false };

    try {
      await sql.query(`DELETE FROM social_accounts WHERE id = $1;`, [data.id]);
      return { synced: true };
    } catch {
      return { synced: false };
    }
  });

const UpdateSocialVisibilitySchema = z.object({
  id: z.string().trim().min(2).max(64),
  isVisible: z.boolean(),
});

export const updateNeonSocialAccountVisibilityServerFn = createServerFn({ method: "POST" })
  .validator((raw: z.input<typeof UpdateSocialVisibilitySchema>) =>
    UpdateSocialVisibilitySchema.parse(raw)
  )
  .handler(async ({ data }) => {
    await requireServerAuth({ isMutation: true, permission: "cms.edit" });
    const { sql } = getServerNeonClient();
    if (!sql) return { synced: false };

    try {
      await sql.query(
        `UPDATE social_accounts SET is_visible = $1, updated_at = NOW() WHERE id = $2;`,
        [data.isVisible, data.id]
      );
      return { synced: true };
    } catch {
      return { synced: false };
    }
  });

const SetPrimarySocialSchema = z.object({
  id: z.string().trim().min(2).max(64),
  platform: z.string().trim().min(1).max(40),
  scope: z.enum(["platform", "overall"]),
});

export const setNeonPrimarySocialAccountServerFn = createServerFn({ method: "POST" })
  .validator((raw: z.input<typeof SetPrimarySocialSchema>) => SetPrimarySocialSchema.parse(raw))
  .handler(async ({ data }) => {
    await requireServerAuth({ isMutation: true, permission: "cms.edit" });
    const { sql } = getServerNeonClient();
    if (!sql) return { synced: false };

    try {
      if (data.scope === "overall") {
        await sql.transaction([
          sql.query(`UPDATE social_accounts SET is_primary_overall = FALSE;`),
          sql.query(
            `UPDATE social_accounts SET is_primary_overall = TRUE, is_primary_platform = TRUE, updated_at = NOW() WHERE id = $1;`,
            [data.id]
          ),
        ]);
      } else {
        await sql.transaction([
          sql.query(`UPDATE social_accounts SET is_primary_platform = FALSE WHERE platform = $1;`, [
            data.platform,
          ]),
          sql.query(
            `UPDATE social_accounts SET is_primary_platform = TRUE, updated_at = NOW() WHERE id = $1;`,
            [data.id]
          ),
        ]);
      }
      return { synced: true };
    } catch {
      return { synced: false };
    }
  });
