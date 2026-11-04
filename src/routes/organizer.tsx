import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { OrganizerPanel } from "@/components/organizer-panel";
import { useAuth } from "@/lib/auth";
import { Briefcase, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/organizer")({
  head: () => ({
    meta: [
      { title: "Organiser Portal — SIDD.WHIZZ" },
      { name: "description", content: "Dedicated client & organizer portal for bookings, stage enquiries, and technical riders." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: OrganizerRouteComponent,
});

function OrganizerRouteComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // If user is not logged in as client or admin
  if (!isLoading && (!isAuthenticated || (user?.role !== "client" && user?.role !== "admin"))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-xl space-y-4">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary border border-primary/30">
            <Briefcase className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-black font-display text-foreground">Event Organizer Access Required</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Please log in with your verified event organizer account to access your booking enquiries, contracts, and stage specifications.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link to="/login" className="btn-red w-full text-xs">
              Sign In as Organizer <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
            <Link to="/" className="btn-outline w-full text-xs">
              Return to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <OrganizerPanel />;
}

