import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Key,
  Table,
  ArrowRight,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";
import { getNeonDbStatus, getLiveNeonTables, type NeonDbConfig } from "@/lib/db";
import { toast } from "sonner";

export const Route = createFileRoute("/db-status")({
  head: () => ({
    meta: [
      { title: "Neon Database Health & Status — SIDD.WHIZZ" },
      { name: "description", content: "Check Neon PostgreSQL database connection and status." },
    ],
  }),
  component: DbStatusPage,
});

function DbStatusPage() {
  const [status, setStatus] = useState<NeonDbConfig | null>(null);
  const [checking, setChecking] = useState(true);
  const [copied, setCopied] = useState(false);
  const [tables, setTables] = useState(getLiveNeonTables());

  const checkConnection = async () => {
    setChecking(true);
    try {
      const res = await getNeonDbStatus();
      setStatus(res);
      setTables(getLiveNeonTables());
    } catch {
      setStatus({
        isConfigured: false,
        status: "connection_error",
        message: "An unexpected error occurred while checking Neon connection.",
      });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const sampleEnv = `DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-sample-pool-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-sample-direct-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"`;

  const copyEnvSnippet = () => {
    navigator.clipboard.writeText(sampleEnv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container-x max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="eyebrow mb-1">Database Diagnostics</p>
            <h1 className="display text-3xl sm:text-4xl text-foreground mt-1 flex items-center gap-3">
              <Database className="h-8 w-8 text-primary" /> NeonDB <span className="text-primary">Status</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Verify your Neon PostgreSQL serverless database connection, schema, and environment variables.
            </p>
          </div>

          <button
            onClick={checkConnection}
            disabled={checking}
            className="btn-outline !py-2.5 !px-5 text-sm flex items-center gap-2 self-start sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
            <span>{checking ? "Checking..." : "Re-test Connection"}</span>
          </button>
        </div>

        {/* Live Status Card */}
        <div className="rounded-2xl border bg-card/90 backdrop-blur-md p-6 sm:p-8 shadow-xl">
          <div className="flex items-start gap-4">
            <div
              className={`rounded-2xl p-3 border ${
                status?.status === "connected"
                  ? "bg-primary/15 border-primary/40 text-primary"
                  : "bg-muted border-border text-foreground"
              }`}
            >
              {status?.status === "connected" ? (
                <CheckCircle2 className="h-8 w-8" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-primary" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-xl font-extrabold text-foreground">
                  {status?.status === "connected"
                    ? "NeonDB Connected Successfully"
                    : "NeonDB Connection Needs Setup in .env"}
                </h2>
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${
                    status?.status === "connected"
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {status?.status === "connected" ? "Status: Active" : "Status: Action Required"}
                </span>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">{status?.message}</p>

              {status?.lastChecked && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Last checked: {status.lastChecked} (IST)
                </p>
              )}
            </div>
          </div>

          {/* Connection Parameters */}
          {status?.host && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border pt-4">
              <div className="rounded-xl border border-border bg-background/50 p-3.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Host</span>
                <p className="font-mono text-sm font-semibold text-foreground truncate mt-1">{status.host}</p>
              </div>
              <div className="rounded-xl border border-border bg-background/50 p-3.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Database</span>
                <p className="font-mono text-sm font-semibold text-foreground mt-1">{status.database || "neondb"}</p>
              </div>
              <div className="rounded-xl border border-border bg-background/50 p-3.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">SSL Mode</span>
                <p className="font-mono text-sm font-semibold text-foreground mt-1">{status.sslMode || "require"}</p>
              </div>
            </div>
          )}
        </div>

        {/* Step-by-Step Setup Guide in Hindi & English */}
        <div className="rounded-2xl border bg-card/90 backdrop-blur-md p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-2.5">
            <Key className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-extrabold text-foreground">
              How to Connect Your NeonDB (NeonDB Kaise Set Karein)
            </h3>
          </div>

          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="grid h-6 w-6 place-items-center rounded-full bg-primary/20 text-xs font-bold text-primary shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Go to Neon Console (Neon Console me login karein)
                </p>
                <p className="text-sm mt-0.5">
                  Visit{" "}
                  <a
                    href="https://console.neon.tech"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline font-medium"
                  >
                    https://console.neon.tech
                  </a>{" "}
                  and create or select your project (e.g., <code>siddwhizz-portfolio</code>).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="grid h-6 w-6 place-items-center rounded-full bg-primary/20 text-xs font-bold text-primary shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Copy Connection String (Connection Details copy karein)
                </p>
                <p className="text-sm mt-0.5">
                  Dashboard pe <strong>Connection Details</strong> me se pooled PostgreSQL connection string copy karein.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="grid h-6 w-6 place-items-center rounded-full bg-primary/20 text-xs font-bold text-primary shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Create or edit your local <code>.env</code> file
                </p>
                <p className="text-sm mt-0.5">
                  Project root folder me <code>.env</code> file banayein aur apna connection string paste karein:
                </p>
              </div>
            </div>
          </div>

          {/* Code block */}
          <div className="rounded-xl border bg-ink/90 p-4 font-mono text-xs text-ink-foreground">
            <div className="mb-2.5 flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-semibold text-ink-muted">.env</span>
              <button
                onClick={copyEnvSnippet}
                className="flex items-center gap-1 rounded bg-white/10 px-2.5 py-1 text-xs text-white hover:bg-white/20 transition"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5 text-ink-muted" />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
            <pre className="overflow-x-auto whitespace-pre">{sampleEnv}</pre>
          </div>
        </div>

        {/* Expected Database Schema */}
        <div className="rounded-2xl border bg-card/90 backdrop-blur-md p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <Table className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg font-extrabold text-foreground">
                  Application Database Schema (NeonDB)
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                All 8 dataset tables configured for SiddWhizz portfolio with active persistent storage:
              </p>
            </div>

            <button
              onClick={() => {
                const sqlSnippet = `-- Run this in Neon Console SQL Editor to create all 8 tables:
CREATE TABLE IF NOT EXISTS users (id VARCHAR(64) PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL DEFAULT 'password123', role VARCHAR(32) NOT NULL DEFAULT 'client', organization VARCHAR(255), avatar TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS sessions (id VARCHAR(64) PRIMARY KEY, user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE, token TEXT UNIQUE NOT NULL, expires_at TIMESTAMP WITH TIME ZONE NOT NULL);
CREATE TABLE IF NOT EXISTS booking_requests (id VARCHAR(64) PRIMARY KEY, event_name VARCHAR(255) NOT NULL, client_name VARCHAR(255) NOT NULL, organization VARCHAR(255), email VARCHAR(255) NOT NULL, phone VARCHAR(64) NOT NULL, clean_phone VARCHAR(64), date VARCHAR(64), city VARCHAR(128) NOT NULL, venue VARCHAR(255), crowd_size VARCHAR(128), format VARCHAR(128) NOT NULL, budget VARCHAR(128), status VARCHAR(32) NOT NULL DEFAULT 'New', brief TEXT, notes TEXT[] DEFAULT '{}', created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS events (id VARCHAR(64) PRIMARY KEY, enquiry_id VARCHAR(64), event_name VARCHAR(255) NOT NULL, client_name VARCHAR(255) NOT NULL, organization VARCHAR(255), date VARCHAR(64) NOT NULL, time VARCHAR(64), venue VARCHAR(255) NOT NULL, city VARCHAR(128) NOT NULL, format VARCHAR(128) NOT NULL, fee VARCHAR(64), advance_paid BOOLEAN DEFAULT FALSE, status VARCHAR(32) NOT NULL DEFAULT 'Confirmed', contract_ref VARCHAR(128), created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS media_assets (id VARCHAR(64) PRIMARY KEY, title VARCHAR(255) NOT NULL, type VARCHAR(32) NOT NULL, category VARCHAR(64) NOT NULL, size VARCHAR(32) NOT NULL, duration VARCHAR(32), dimensions VARCHAR(32), url TEXT NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS testimonials (id VARCHAR(64) PRIMARY KEY, client_name VARCHAR(255) NOT NULL, client_role VARCHAR(255) NOT NULL, organization VARCHAR(255) NOT NULL, quote TEXT NOT NULL, rating INTEGER DEFAULT 5, event_type VARCHAR(128), avatar_url TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS support_tickets (id VARCHAR(64) PRIMARY KEY, user_email VARCHAR(255) NOT NULL, subject VARCHAR(255) NOT NULL, priority VARCHAR(32) DEFAULT 'Medium', description TEXT NOT NULL, status VARCHAR(32) DEFAULT 'Open', created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);`;
                navigator.clipboard.writeText(sqlSnippet);
                toast.success("Full SQL Schema copied! Paste into your Neon Console SQL Editor.");
              }}
              className="btn-red !py-2 !px-4 text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5" /> Copy Complete SQL Migration
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3.5">Table Name</th>
                  <th className="p-3.5">Purpose / Data Stored</th>
                  <th className="p-3.5">Schema Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {tables.map((t) => (
                  <tr key={t.name} className="hover:bg-accent/40 transition">
                    <td className="p-3.5 font-mono font-bold text-primary">{t.name}</td>
                    <td className="p-3.5 text-muted-foreground">{t.description}</td>
                    <td className="p-3.5">
                      <span className="rounded-full bg-primary/20 text-primary border border-primary/40 px-2.5 py-0.5 text-xs font-bold">
                        {t.rows} Active Records
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Back navigation */}
        <div className="flex justify-between items-center">
          <Link to="/admin" className="btn-outline text-sm">
            ← Back to Admin Panel
          </Link>
          <Link to="/" className="btn-red text-sm">
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

