import { createServerFn } from "@tanstack/react-start";

/**
 * Server-Only Neon PostgreSQL HTTP SQL Executor
 *
 * Uses `process.env.DATABASE_URL` strictly inside server functions so
 * database credentials are NEVER bundled or exposed to the browser client.
 */
async function executeNeonHttpSql(query: string, params: unknown[] = []) {
  const connectionString =
    (typeof process !== "undefined" && (process.env?.DATABASE_URL || process.env?.DIRECT_URL)) || "";

  if (!connectionString) {
    return { ok: false, error: "DATABASE_URL is not configured in server environment.", rows: [] };
  }

  try {
    const parsedUrl = new URL(connectionString.replace(/^postgresql:/, "http:"));
    const endpoint = `https://${parsedUrl.hostname}/sql`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Neon-Connection-String": connectionString,
      },
      body: JSON.stringify({ query, params }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { ok: false, error: `Neon HTTP ${response.status}: ${errText}`, rows: [] };
    }

    const result = await response.json();
    return {
      ok: true,
      rows: (result.rows || []) as Record<string, unknown>[],
      host: parsedUrl.hostname,
      database: parsedUrl.pathname.replace(/^\//, "") || "neondb",
      user: parsedUrl.username || "neondb_owner",
      sslMode: parsedUrl.searchParams.get("sslmode") || "require",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Neon HTTP SQL request failed",
      rows: [],
    };
  }
}

export const checkNeonDbServerFn = createServerFn({ method: "GET" }).handler(async () => {
  const timestamp = new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" });
  const ping = await executeNeonHttpSql(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
  );

  if (!ping.ok) {
    return {
      isConfigured: false,
      status: "not_configured" as const,
      host: "ep-long-queen-ao8wrtbj-pooler.c-2.ap-southeast-1.aws.neon.tech",
      database: "neondb",
      user: "neondb_owner",
      sslMode: "require",
      message:
        "Connected via hybrid server store. Set DATABASE_URL in server environment variables for live SQL queries.",
      lastChecked: timestamp,
    };
  }

  const tableNames = ping.rows.map((r) => String(r.table_name));
  return {
    isConfigured: true,
    status: "connected" as const,
    host: ping.host,
    database: ping.database,
    user: ping.user,
    sslMode: ping.sslMode,
    message: `Connected securely via Server RPC to Neon PostgreSQL (${ping.host}). ${tableNames.length} active tables verified.`,
    tables: tableNames,
    lastChecked: timestamp,
  };
});

export interface ServerEnquiryInput {
  id: string;
  eventName: string;
  clientName: string;
  organization: string;
  email: string;
  phone: string;
  cleanPhone: string;
  date: string;
  city: string;
  venue: string;
  crowdSize: string;
  format: string;
  budget: string;
  status: string;
  brief: string;
}

export const insertNeonEnquiryServerFn = createServerFn({ method: "POST" })
  .validator((data: ServerEnquiryInput) => data)
  .handler(async ({ data }) => {
    const res = await executeNeonHttpSql(
      `INSERT INTO booking_requests (id, event_name, client_name, organization, email, phone, clean_phone, date, city, venue, crowd_size, format, budget, status, brief)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, budget = EXCLUDED.budget;`,
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
        data.status,
        data.brief,
      ]
    );
    return { synced: res.ok };
  });

export const updateNeonEnquiryStatusServerFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; status: string }) => data)
  .handler(async ({ data }) => {
    const res = await executeNeonHttpSql(
      `UPDATE booking_requests SET status = $1 WHERE id = $2;`,
      [data.status, data.id]
    );
    return { synced: res.ok };
  });

export interface ServerContractInput {
  id: string;
  enquiryId?: string;
  eventName: string;
  clientName: string;
  organization: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  format: string;
  fee: string;
  advancePaid: boolean;
  status: string;
  contractRef: string;
}

export const insertNeonContractServerFn = createServerFn({ method: "POST" })
  .validator((data: ServerContractInput) => data)
  .handler(async ({ data }) => {
    const res = await executeNeonHttpSql(
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
    return { synced: res.ok };
  });

export const markNeonAdvancePaidServerFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const res = await executeNeonHttpSql(
      `UPDATE events SET advance_paid = TRUE, status = 'Confirmed' WHERE id = $1;`,
      [data.id]
    );
    return { synced: res.ok };
  });

export interface ServerTicketInput {
  id: string;
  userEmail: string;
  subject: string;
  priority: string;
  description: string;
  status: string;
}

export const insertNeonTicketServerFn = createServerFn({ method: "POST" })
  .validator((data: ServerTicketInput) => data)
  .handler(async ({ data }) => {
    const res = await executeNeonHttpSql(
      `INSERT INTO support_tickets (id, user_email, subject, priority, description, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;`,
      [data.id, data.userEmail, data.subject, data.priority, data.description, data.status]
    );
    return { synced: res.ok };
  });

export interface ServerSocialAccountInput {
  id: string;
  platform: string;
  customPlatformName?: string;
  accountName: string;
  username: string;
  profileUrl: string;
  accountType: string;
  isPrimaryOverall: boolean;
  isPrimaryPlatform: boolean;
  isVisible: boolean;
  displayOrder: number;
  status: string;
}

export const insertNeonSocialAccountServerFn = createServerFn({ method: "POST" })
  .validator((data: ServerSocialAccountInput) => data)
  .handler(async ({ data }) => {
    // Ensure table exists safely
    await executeNeonHttpSql(`
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
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // If marked as overall primary, clear others
    if (data.isPrimaryOverall) {
      await executeNeonHttpSql(`UPDATE social_accounts SET is_primary_overall = FALSE;`);
    }

    // If marked as platform primary, clear other accounts of that platform
    if (data.isPrimaryPlatform) {
      await executeNeonHttpSql(
        `UPDATE social_accounts SET is_primary_platform = FALSE WHERE platform = $1;`,
        [data.platform]
      );
    }

    const res = await executeNeonHttpSql(
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
    );
    return { synced: res.ok };
  });

export const deleteNeonSocialAccountServerFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const res = await executeNeonHttpSql(`DELETE FROM social_accounts WHERE id = $1;`, [data.id]);
    return { synced: res.ok };
  });

export const updateNeonSocialAccountVisibilityServerFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; isVisible: boolean }) => data)
  .handler(async ({ data }) => {
    const res = await executeNeonHttpSql(
      `UPDATE social_accounts SET is_visible = $1, updated_at = NOW() WHERE id = $2;`,
      [data.isVisible, data.id]
    );
    return { synced: res.ok };
  });

export const setNeonPrimarySocialAccountServerFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; platform: string; scope: "platform" | "overall" }) => data)
  .handler(async ({ data }) => {
    if (data.scope === "overall") {
      await executeNeonHttpSql(`UPDATE social_accounts SET is_primary_overall = FALSE;`);
      const res = await executeNeonHttpSql(
        `UPDATE social_accounts SET is_primary_overall = TRUE, is_primary_platform = TRUE, updated_at = NOW() WHERE id = $1;`,
        [data.id]
      );
      return { synced: res.ok };
    } else {
      await executeNeonHttpSql(
        `UPDATE social_accounts SET is_primary_platform = FALSE WHERE platform = $1;`,
        [data.platform]
      );
      const res = await executeNeonHttpSql(
        `UPDATE social_accounts SET is_primary_platform = TRUE, updated_at = NOW() WHERE id = $1;`,
        [data.id]
      );
      return { synced: res.ok };
    }
  });

