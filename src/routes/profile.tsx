import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  User,
  ShieldCheck,
  Briefcase,
  UserCheck,
  LogOut,
  CalendarDays,
  Database,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Download,
  AlertTriangle,
  FolderOpen,
} from "lucide-react";
import { useAuth, type UserRole } from "@/lib/auth";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Dashboard & Profile — SIDD.WHIZZ" },
      { name: "description", content: "Role-based user profile and portal." },
    ],
  }),
  component: ProfilePage,
});

// Demo booking requests for Admin view
const INITIAL_BOOKINGS = [
  {
    id: "BK-902",
    client: "Global FinTech Summit 2026",
    contact: "Arjun Nair",
    date: "2026-12-14",
    city: "Mumbai, Jio World Convention Centre",
    format: "Tech Summit & Keynotes",
    status: "Confirmed",
  },
  {
    id: "BK-903",
    client: "Deloitte Leadership Conclave",
    contact: "Rohan Kapoor",
    date: "2026-11-28",
    city: "Bengaluru, The Leela Palace",
    format: "Corporate Gala & Awards",
    status: "Pending Review",
  },
  {
    id: "BK-904",
    client: "Sunburn Arena Live Festival",
    contact: "Karan Mehta",
    date: "2026-12-31",
    city: "Goa, Vagator Stage",
    format: "Music Festival & Live Arena",
    status: "In Discussion",
  },
];

function ProfilePage() {
  const { user, isAuthenticated, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="card-ink max-w-md p-8 text-center rounded-2xl border">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary/20 text-primary">
            <User className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Sign In Required</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please log in or select a demo account to view your role-based dashboard.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link to="/login" className="btn-red w-full">
              Sign In to Continue
            </Link>
            <Link to="/" className="btn-outline w-full">
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
  };

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container-x max-w-6xl space-y-8">
        {/* Top Banner: Profile Card & Role Switcher */}
        <div className="rounded-2xl border bg-card/90 backdrop-blur-md p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            {/* User Meta */}
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-tr from-primary/30 to-primary/10 text-2xl font-black text-primary border border-primary/30">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-black font-display text-foreground">{user.name}</h1>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      user.role === "admin"
                        ? "bg-primary/20 text-primary border border-primary/40"
                        : user.role === "client"
                        ? "bg-amber-500/20 text-amber-500 border border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-500 border border-emerald-500/40"
                    }`}
                  >
                    Role: {user.role}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {user.organization && (
                  <p className="text-xs text-foreground/80 font-medium mt-0.5">
                    🏢 {user.organization}
                  </p>
                )}
              </div>
            </div>

            {/* Logout button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  logout();
                  navigate({ to: "/" });
                }}
                className="btn-outline !py-2 !px-3 text-xs text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </div>

          {/* Quick Interactive Role Switcher Banner */}
          <div className="mt-6 rounded-xl border border-border/80 bg-background/50 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Live RBAC Tester: Switch Active Role
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => switchRole("admin")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    user.role === "admin"
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "border border-primary/30 text-foreground hover:bg-primary/10"
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> Admin (Sid)
                </button>
                <button
                  onClick={() => switchRole("client")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    user.role === "client"
                      ? "bg-amber-500 text-black shadow-md"
                      : "border border-amber-500/30 text-foreground hover:bg-amber-500/10"
                  }`}
                >
                  <Briefcase className="h-3.5 w-3.5" /> Client (Organizer)
                </button>
                <button
                  onClick={() => switchRole("member")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    user.role === "member"
                      ? "bg-emerald-500 text-white shadow-md"
                      : "border border-emerald-500/30 text-foreground hover:bg-emerald-500/10"
                  }`}
                >
                  <UserCheck className="h-3.5 w-3.5" /> Audience (Member)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated Portal Quick Launcher */}
        {user.role === "admin" && (
          <div className="rounded-2xl border-2 border-primary/40 bg-gradient-to-r from-primary/15 via-card to-card p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-primary/20 p-3 text-primary shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black font-display text-foreground">Dedicated Admin Management Panel</h3>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
                  Full backoffice console with left navigation bar: Multi-client Enquiries with instant WhatsApp/Call/Email outreach, Web Traffic Analytics, Media Library sorted by type, Team Accounts, and Developer Support.
                </p>
              </div>
            </div>
            <Link to="/admin" className="btn-red !py-2.5 !px-5 text-xs whitespace-nowrap self-start sm:self-auto flex items-center gap-2">
              <span>Open Admin Panel</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {user.role === "client" && (
          <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-card to-card p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-amber-500/20 p-3 text-amber-500 shrink-0">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black font-display text-foreground">Dedicated Organiser Portal</h3>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
                  Manage your stage reservations, create new event enquiries, download contracts, and review host technical stage riders.
                </p>
              </div>
            </div>
            <Link to="/organizer" className="btn-red !py-2.5 !px-5 text-xs whitespace-nowrap self-start sm:self-auto flex items-center gap-2">
              <span>Open Organiser Portal</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* ============================================================== */}
        {/* ROLE VIEW 1: ADMIN (SITE OWNER / SIDDHARTH MAURYA)              */}
        {/* ============================================================== */}
        {user.role === "admin" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" /> Admin Control Center
                </h2>
                <p className="text-xs text-muted-foreground">
                  Exclusive access for Siddharth Maurya & management team.
                </p>
              </div>
              <Link to="/db-status" className="btn-outline !py-1.5 !px-3 text-xs flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-amber-400" /> Neon DB Status
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="card-glass rounded-xl p-4 border text-center">
                <p className="text-2xl font-black text-primary font-display">600+</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Events Hosted</p>
              </div>
              <div className="card-glass rounded-xl p-4 border text-center">
                <p className="text-2xl font-black text-amber-400 font-display">15+ Yrs</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Stage Veteran</p>
              </div>
              <div className="card-glass rounded-xl p-4 border text-center">
                <p className="text-2xl font-black text-emerald-400 font-display">1.2M+</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Audience Reach</p>
              </div>
              <div className="card-glass rounded-xl p-4 border text-center">
                <p className="text-2xl font-black text-sky-400 font-display">99.4%</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Rebooking Rate</p>
              </div>
            </div>

            {/* Neon DB Quick Card */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500 border border-amber-500/20">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">NeonDB PostgreSQL Integration</h3>
                  <p className="text-xs text-muted-foreground">
                    Database connection status, environment verification, and database health inspector.
                  </p>
                </div>
              </div>
              <Link to="/db-status" className="btn-red !py-1.5 !px-3 text-xs whitespace-nowrap">
                Check NeonDB Health <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Booking Requests Queue */}
            <div className="rounded-2xl border bg-card/90 backdrop-blur-md p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">Booking & Enquiries Pipeline</h3>
                  <p className="text-xs text-muted-foreground">Manage incoming event hosting inquiries from organizers</p>
                </div>
                <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full border border-primary/20">
                  {bookings.length} Requests
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b bg-muted/40 uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-3">Ref</th>
                      <th className="p-3">Event / Client</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Venue</th>
                      <th className="p-3">Format</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-accent/40 transition">
                        <td className="p-3 font-mono font-bold text-primary">{b.id}</td>
                        <td className="p-3">
                          <p className="font-bold text-foreground">{b.client}</p>
                          <p className="text-[11px] text-muted-foreground">Contact: {b.contact}</p>
                        </td>
                        <td className="p-3 font-medium whitespace-nowrap">{b.date}</td>
                        <td className="p-3 text-muted-foreground">{b.city}</td>
                        <td className="p-3">{b.format}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.status === "Confirmed"
                                ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                                : b.status === "Pending Review"
                                ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                                : "bg-sky-500/20 text-sky-500 border border-sky-500/30"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          {b.status !== "Confirmed" && (
                            <button
                              onClick={() => handleStatusChange(b.id, "Confirmed")}
                              className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold text-[11px]"
                            >
                              Confirm
                            </button>
                          )}
                          <button
                            onClick={() => alert(`Details for ${b.client} (Contact: ${b.contact})`)}
                            className="px-2 py-1 rounded border border-border hover:bg-accent text-foreground text-[11px]"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ROLE VIEW 2: CLIENT / EVENT ORGANIZER                           */}
        {/* ============================================================== */}
        {user.role === "client" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-amber-500" /> Event Organizer Portal
                </h2>
                <p className="text-xs text-muted-foreground">
                  Manage your event requests, download riders, and coordinate with Sid's team.
                </p>
              </div>
              <Link to="/contact" className="btn-red !py-1.5 !px-3 text-xs">
                <CalendarDays className="h-3.5 w-3.5" /> Book New Event
              </Link>
            </div>

            {/* Client Status Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Your Stage Bookings</span>
                  <CalendarDays className="h-4 w-4 text-amber-500" />
                </div>
                <p className="text-2xl font-black text-foreground">1 Active</p>
                <p className="text-xs text-emerald-500 font-semibold mt-1">Confirmed for Q4 2026</p>
              </div>

              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Tech Rider & Kit</span>
                  <Download className="h-4 w-4 text-primary" />
                </div>
                <p className="text-2xl font-black text-foreground">Ready</p>
                <p className="text-xs text-muted-foreground mt-1">AV, mic specs & stage rider available</p>
              </div>

              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Host Response Time</span>
                  <Clock className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-black text-foreground">&lt; 4 Hours</p>
                <p className="text-xs text-muted-foreground mt-1">Priority manager support</p>
              </div>
            </div>

            {/* Organizer Current Booking Details */}
            <div className="rounded-2xl border bg-card/90 backdrop-blur-md p-6 shadow-xl">
              <h3 className="text-base font-bold text-foreground mb-4">Your Active Event Reservation</h3>
              <div className="rounded-xl border border-border/80 bg-background/50 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      Confirmed Host Booking
                    </span>
                    <h4 className="text-base font-bold text-foreground mt-2">
                      Apex Global Tech Summits 2026
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      📅 Date: December 14, 2026 • 📍 Jio World Convention Centre, Mumbai
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      🎤 Format: Keynote Introduction & Technology Panel Moderation
                    </p>
                  </div>
                  <div className="flex sm:flex-col gap-2">
                    <Link to="/contact" className="btn-outline !py-1.5 !px-3 text-xs text-center">
                      Enquire Another Date
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ROLE VIEW 3: AUDIENCE / MEMBER                                  */}
        {/* ============================================================== */}
        {user.role === "member" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-emerald-500" /> Audience & Community VIP Pass
                </h2>
                <p className="text-xs text-muted-foreground">
                  Exclusive access to Siddharth's upcoming live festival appearances and stage highlights.
                </p>
              </div>
            </div>

            {/* Member Highlights */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <h4 className="font-bold text-sm text-foreground">Backstage Stage Moments</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Access high-resolution gallery and unreleased host clips.
                </p>
                <Link to="/gallery" className="mt-3 inline-flex text-xs font-semibold text-primary hover:underline">
                  Open Stage Gallery →
                </Link>
              </div>

              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <h4 className="font-bold text-sm text-foreground">Host Insights & Journey</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Learn about 15+ years of live stagecraft and crowd dynamics.
                </p>
                <Link to="/about" className="mt-3 inline-flex text-xs font-semibold text-primary hover:underline">
                  Read Sid's Journey →
                </Link>
              </div>

              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <h4 className="font-bold text-sm text-foreground">Need Sid for an Event?</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Recommend Siddharth to your corporate team or college fest committee.
                </p>
                <Link to="/contact" className="mt-3 inline-flex text-xs font-semibold text-primary hover:underline">
                  Share Booking Page →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

