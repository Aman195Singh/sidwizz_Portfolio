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
import { getNeonDbStatus, EXPECTED_NEON_TABLES, type NeonDbConfig } from "@/lib/db";

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

  const checkConnection = async () => {
    setChecking(true);
    try {
      const res = await getNeonDbStatus();
      setStatus(res);
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
DIRECT_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-sample-direct-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
VITE_DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-sample-pool-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"`;

  const copyEnvSnippet = () => {
    navigator.clipboard.writeText(sampleEnv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container-x max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-500/20 text-amber-500 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                Database Diagnostics
              </span>
            </div>
            <h1 className="text-3xl font-black font-display text-foreground mt-2 flex items-center gap-3">
              <Database className="h-8 w-8 text-primary" /> NeonDB Status & Health Check
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Verify your Neon PostgreSQL serverless database connection, schema, and environment variables.
            </p>
          </div>

          <button
            onClick={checkConnection}
            disabled={checking}
            className="btn-outline !py-2 !px-4 text-xs flex items-center gap-2 self-start sm:self-auto"
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
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-500"
                  : "bg-amber-500/15 border-amber-500/30 text-amber-500"
              }`}
            >
              {status?.status === "connected" ? (
                <CheckCircle2 className="h-8 w-8" />
              ) : (
                <AlertTriangle className="h-8 w-8" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold text-foreground">
                  {status?.status === "connected"
                    ? "NeonDB Connected Successfully"
                    : "NeonDB Connection Needs Setup in .env"}
                </h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                    status?.status === "connected"
                      ? "bg-emerald-500/20 text-emerald-500"
                      : "bg-amber-500/20 text-amber-500"
                  }`}
                >
                  {status?.status === "connected" ? "Status: Active" : "Status: Action Required"}
                </span>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">{status?.message}</p>

              {status?.lastChecked && (
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Last checked: {status.lastChecked} (IST)
                </p>
              )}
            </div>
          </div>

          {/* Connection Parameters */}
          {status?.host && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-4">
              <div className="rounded-xl border bg-background/50 p-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Host</span>
                <p className="font-mono text-xs font-semibold text-foreground truncate mt-1">{status.host}</p>
              </div>
              <div className="rounded-xl border bg-background/50 p-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Database</span>
                <p className="font-mono text-xs font-semibold text-foreground mt-1">{status.database || "neondb"}</p>
              </div>
              <div className="rounded-xl border bg-background/50 p-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">SSL Mode</span>
                <p className="font-mono text-xs font-semibold text-emerald-500 mt-1">{status.sslMode || "require"}</p>
              </div>
            </div>
          )}
        </div>

        {/* Step-by-Step Setup Guide in Hindi & English */}
        <div className="rounded-2xl border bg-card/90 backdrop-blur-md p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">
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
                <p className="text-xs mt-0.5">
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
                <p className="text-xs mt-0.5">
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
                <p className="text-xs mt-0.5">
                  Project root folder me <code>.env</code> file banayein aur apna connection string paste karein:
                </p>
              </div>
            </div>
          </div>

          {/* Code block */}
          <div className="relative rounded-xl border bg-ink/90 p-4 font-mono text-xs text-ink-foreground">
            <button
              onClick={copyEnvSnippet}
              className="absolute right-3 top-3 flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-[11px] hover:bg-white/20 transition"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
            <pre className="overflow-x-auto whitespace-pre">{sampleEnv}</pre>
          </div>
        </div>

        {/* Expected Database Schema */}
        <div className="rounded-2xl border bg-card/90 backdrop-blur-md p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Table className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">
              Application Database Schema (NeonDB)
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Core schema tables planned for SiddWhizz portfolio with Better Auth and Neon PostgreSQL:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/40 uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3">Table Name</th>
                  <th className="p-3">Purpose / Data Stored</th>
                  <th className="p-3">Schema Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {EXPECTED_NEON_TABLES.map((t) => (
                  <tr key={t.name} className="hover:bg-accent/40 transition">
                    <td className="p-3 font-mono font-bold text-primary">{t.name}</td>
                    <td className="p-3 text-muted-foreground">{t.description}</td>
                    <td className="p-3">
                      <span className="rounded-full bg-emerald-500/20 text-emerald-500 px-2 py-0.5 text-[10px] font-bold">
                        Ready
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Back to Profile */}
        <div className="flex justify-between items-center">
          <Link to="/profile" className="btn-outline text-xs">
            ← Back to Role Dashboard
          </Link>
          <Link to="/" className="btn-red text-xs">
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

