import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { User, Mail, Lock, Building, ArrowRight, ShieldCheck, Briefcase, UserCheck, AlertCircle } from "lucide-react";
import { useAuth, type UserRole } from "@/lib/auth";
import { Logo } from "@/components/site";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — SIDD.WHIZZ" },
      { name: "description", content: "Sign up for an event organizer account, audience pass, or client portal." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { signup, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("client");
  const [organization, setOrganization] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to profile
  if (isAuthenticated && user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="card-ink max-w-md p-8 text-center rounded-2xl border">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary/20 text-primary">
            <UserCheck className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Already Registered</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You are signed in as <span className="font-semibold text-foreground">{user.name}</span> ({user.role}).
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link to="/profile" className="btn-red w-full">
              Go to Role Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please provide your full name.");
      return;
    }
    if (!email.trim()) {
      setError("Please provide a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signup({
        name,
        email,
        password,
        role,
        organization,
      });

      if (res.success) {
        navigate({ to: "/profile" });
      } else {
        setError(res.error || "Failed to create account.");
      }
    } catch {
      setError("An unexpected error occurred during signup.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gradient-to-b from-background via-ink/5 to-background py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="mx-auto w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="text-3xl font-black font-display tracking-tight text-foreground">
            Create Your Account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose your role to get personalized access to event bookings, client proposals, or community updates.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border bg-card/90 backdrop-blur-md p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Select Your Role (Role-Based Access)
              </label>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setRole("client")}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                    role === "client"
                      ? "border-amber-500 bg-amber-500/15 text-foreground ring-1 ring-amber-500"
                      : "border-border bg-background/60 text-muted-foreground hover:border-amber-500/50"
                  }`}
                >
                  <Briefcase className={`h-5 w-5 mb-1.5 ${role === "client" ? "text-amber-500" : "text-muted-foreground"}`} />
                  <span className="text-xs font-bold text-foreground">Organizer</span>
                  <span className="text-[10px] text-muted-foreground">Corporate / Event</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("member")}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                    role === "member"
                      ? "border-emerald-500 bg-emerald-500/15 text-foreground ring-1 ring-emerald-500"
                      : "border-border bg-background/60 text-muted-foreground hover:border-emerald-500/50"
                  }`}
                >
                  <UserCheck className={`h-5 w-5 mb-1.5 ${role === "member" ? "text-emerald-500" : "text-muted-foreground"}`} />
                  <span className="text-xs font-bold text-foreground">Member</span>
                  <span className="text-[10px] text-muted-foreground">Audience / Attendee</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                    role === "admin"
                      ? "border-primary bg-primary/15 text-foreground ring-1 ring-primary"
                      : "border-border bg-background/60 text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <ShieldCheck className={`h-5 w-5 mb-1.5 ${role === "admin" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-xs font-bold text-foreground">Admin</span>
                  <span className="text-[10px] text-muted-foreground">Host / Management</span>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full rounded-xl border border-input bg-background/80 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-input bg-background/80 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>
            </div>

            {/* Organization / Company */}
            <div>
              <label htmlFor="org" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Company / Organization (Optional)
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="org"
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Google Cloud, TechSparks, Event Planners"
                  className="w-full rounded-xl border border-input bg-background/80 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-input bg-background/80 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-red w-full !py-2.5 !mt-6 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? "Creating Account..." : "Create Account"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Footer link to Login */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

