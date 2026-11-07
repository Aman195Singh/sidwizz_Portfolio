import { createFileRoute, Link } from "@tanstack/react-router";
import { OrganizerPanel } from "@/components/organizer-panel";
import { useAuth } from "@/lib/auth";
import { Briefcase, ArrowRight, Clock, ShieldAlert, LogOut, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/organizer")({
  head: () => ({
    meta: [
      { title: "Organiser Portal — SIDD.WHIZZ" },
      {
        name: "description",
        content: "Dedicated client & organizer portal for bookings, stage enquiries, and technical riders.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: OrganizerRouteComponent,
});

function OrganizerRouteComponent() {
  const { user, isAuthenticated, isLoading, logout, refreshSession } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs font-semibold text-muted-foreground">Verifying Organizer session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== "client" && user?.role !== "admin")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-xl space-y-4">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary border border-primary/30">
            <Briefcase className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-black font-display text-foreground">
            Event Organizer Access Required
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Please sign in with your verified Event Organizer account or submit an onboarding
            application to access booking proposals, contracts, and stage riders.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link to="/login" className="btn-red w-full text-xs">
              Sign In as Organizer <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
            <Link to="/signup" className="btn-outline w-full text-xs">
              Apply for Organizer Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Controlled Onboarding Gate: Unapproved Organizers wait in holding view until Admin approval
  if (user.accountStatus === "pending_approval") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-2xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-500/15 text-amber-600 border border-amber-500/30">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-700">
                Verification Pending
              </span>
              <h1 className="font-display text-xl font-black text-foreground mt-1">
                Organizer Application Under Review
              </h1>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Thank you, <span className="font-bold text-foreground">{user.name}</span>. Your
            organization profile for{" "}
            <span className="font-bold text-foreground">
              {user.organization || "your agency"}
            </span>{" "}
            has been received and queued for SIDD.WHIZZ Management verification. Once approved,
            Host Booking, Event Operations, and Contract workspaces will unlock automatically.
          </p>

          {user.pendingApplicationNote && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 text-xs">
              <p className="font-bold text-foreground mb-0.5">Reviewer Note:</p>
              <p className="text-muted-foreground">{user.pendingApplicationNote}</p>
            </div>
          )}

          <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Registered Email:</span>
              <span className="font-mono font-semibold text-foreground">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data Access Scope:</span>
              <span className="font-mono font-semibold text-primary">ORGANIZATION (Isolated)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Application Status:</span>
              <span className="font-bold uppercase text-amber-700">
                {user.pendingApplicationStatus?.replace("_", " ") || "Pending Review"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => refreshSession()}
              className="btn-outline !py-2 !px-4 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Check Approval Status
            </button>
            <div className="flex items-center gap-2">
              <Link to="/contact" className="btn-red !py-2 !px-4 text-xs">
                Urgent Date Enquiry
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user.accountStatus !== "active") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xl space-y-4">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-destructive/15 text-destructive border border-destructive/30">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="font-display text-xl font-black text-foreground">Account Restricted</h2>
          <p className="text-xs text-muted-foreground">
            Your account status is currently <strong>{user.accountStatus}</strong>. Please contact
            SIDD.WHIZZ Management for assistance.
          </p>
          <Link to="/" className="btn-outline w-full text-xs">
            Return to Website
          </Link>
        </div>
      </div>
    );
  }

  return <OrganizerPanel />;
}
