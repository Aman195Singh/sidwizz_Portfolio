import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { AdminPanel } from "@/components/admin-panel";
import { useAuth } from "@/lib/auth";
import { ShieldAlert, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/admin")({
  validateSearch: (
    search: Record<string, unknown>
  ): {
    tab?:
      | "overview"
      | "analytics"
      | "enquiries"
      | "booking"
      | "media"
      | "account"
      | "settings"
      | "support"
      | undefined;
  } => ({
    tab: (typeof search.tab === "string" ? search.tab : undefined) as
      | "overview"
      | "analytics"
      | "enquiries"
      | "booking"
      | "media"
      | "account"
      | "settings"
      | "support"
      | undefined,
  }),
  head: () => ({
    meta: [
      { title: "Admin Panel — SIDD.WHIZZ Control Center" },
      { name: "description", content: "Administrative management portal for inquiries, analytics, media library, and website settings." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminRouteComponent,
});

function AdminRouteComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const search = Route.useSearch();
  const navigate = useNavigate();

  // If user is not logged in as admin, show access guard with demo 1-click option
  if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-xl space-y-4">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-destructive/15 text-destructive border border-destructive/30">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-black font-display text-foreground">Admin Access Required</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This area is restricted to Siddharth Maurya and verified stage managers. Please log in with your admin credentials.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link to="/login" className="btn-red w-full text-xs">
              Sign In as Admin <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
            <Link to="/" className="btn-outline w-full text-xs">
              Return to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <AdminPanel initialTab={search.tab || "overview"} />;
}

