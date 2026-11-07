import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Table,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { getNeonDbStatus, getLiveNeonTables, type NeonDbConfig } from "@/lib/db";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/db-status")({
  head: () => ({
    meta: [
      { title: "System Diagnostics — SIDD.WHIZZ Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DbStatusPage,
});

function DbStatusPage() {
  const { user, isAuthenticated, isLoading, hasPermission } = useAuth();
  const [status, setStatus] = useState<NeonDbConfig | null>(null);
  const [checking, setChecking] = useState(true);
  const [tables, setTables] = useState(getLiveNeonTables());

  const authorized =
    isAuthenticated && user?.role === "admin" && hasPermission("system.diagnostics.view");

  const checkConnection = async () => {
    setChecking(true);
    try {
      const res = await getNeonDbStatus();
      setStatus(res);
      setTables(getLiveNeonTables());
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      checkConnection();
    } else if (!isLoading) {
      setChecking(false);
    }
  }, [authorized, isLoading]);

  // P0 Security Gate: Never expose database topology to anonymous visitors, Members, or Organizers
  if (!isLoading && !authorized) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xl space-y-4">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-destructive/15 text-destructive border border-destructive/30">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="font-display text-xl font-black text-foreground">
            Restricted System Diagnostics
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Database health and schema telemetry are restricted to authorized platform administrators
            with <code className="font-mono text-foreground">system.diagnostics.view</code> access.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link to="/login" className="btn-red w-full text-xs">
              Authorized Staff Sign In <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
            <Link to="/" className="btn-outline w-full text-xs">
              Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container-x max-w-4xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="eyebrow mb-1">Authorized Staff Telemetry</p>
            <h1 className="display text-3xl sm:text-4xl text-foreground mt-1 flex items-center gap-3">
              <Database className="h-8 w-8 text-primary" /> Database <span className="text-primary">Diagnostics</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Redacted server-side PostgreSQL health check and RBAC table inventory.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link to="/admin" className="btn-outline !py-2.5 !px-4 text-xs">
              Back to Admin
            </Link>
            <button
              type="button"
              onClick={checkConnection}
              disabled={checking}
              className="btn-red !py-2.5 !px-5 text-xs flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
              <span>{checking ? "Checking..." : "Re-test RPC"}</span>
            </button>
          </div>
        </div>

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
                    ? "PostgreSQL Server RPC Active"
                    : "Resilient Server Store Mode"}
                </h2>
                <span className="rounded-full bg-primary/15 text-primary border border-primary/30 px-3 py-0.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Credentials Redacted
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

          {status?.host && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border pt-4">
              <div className="rounded-xl border border-border bg-background/50 p-3.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Redacted Endpoint
                </span>
                <p className="font-mono text-sm font-semibold text-foreground truncate mt-1">
                  {status.host}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background/50 p-3.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Database
                </span>
                <p className="font-mono text-sm font-semibold text-foreground mt-1">
                  {status.database || "postgres"}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background/50 p-3.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  SSL Mode
                </span>
                <p className="font-mono text-sm font-semibold text-foreground mt-1">
                  {status.sslMode || "require"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-md space-y-4">
          <div className="flex items-center gap-2">
            <Table className="h-5 w-5 text-primary" />
            <h3 className="font-display text-base font-extrabold text-foreground">
              Verified RBAC &amp; Operational Schema Inventory
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tables.map((t) => (
              <div
                key={t.name}
                className="flex items-start justify-between gap-3 rounded-xl border border-border bg-background/60 p-3.5"
              >
                <div>
                  <p className="font-mono text-xs font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                </div>
                <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-[11px] font-bold shrink-0">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
