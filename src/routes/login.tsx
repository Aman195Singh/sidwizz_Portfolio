import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Lock, Mail, ArrowRight, ShieldCheck, Briefcase, UserCheck, AlertCircle, Sparkles } from "lucide-react";
import { useAuth, DEMO_USERS, type UserRole } from "@/lib/auth";
import { Logo } from "@/components/site";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — SIDD.WHIZZ Client & Admin Portal" },
      { name: "description", content: "Sign in to access event bookings, client portal, or administrative controls." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
          <h2 className="text-xl font-bold text-foreground">Already Logged In</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You are signed in as <span className="font-semibold text-foreground">{user.name}</span> ({user.role}).
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link to="/profile" className="btn-red w-full">
              Go to Role Dashboard
            </Link>
            <Link to="/" className="btn-outline w-full">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate({ to: "/profile" });
      } else {
        setError(res.error || "Authentication failed.");
      }
    } catch {
      setError("An unexpected error occurred during sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (role: UserRole) => {
    const demo = DEMO_USERS[role];
    setEmail(demo.email);
    setPassword(role === "admin" ? "sid123" : "password123");
    setIsSubmitting(true);
    try {
      await login(demo.email, role === "admin" ? "sid123" : "password123", role);
      navigate({ to: "/profile" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gradient-to-b from-background via-ink/5 to-background py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="mx-auto w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="text-3xl font-black font-display tracking-tight text-foreground">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access your role-based dashboard, booking status, or administrative controls.
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
                  placeholder="organizer@company.com"
                  className="w-full rounded-xl border border-input bg-background/80 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <span className="text-xs text-muted-foreground/80 hover:text-primary cursor-pointer">
                  Forgot?
                </span>
              </div>
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
              <span>{isSubmitting ? "Signing in..." : "Sign In"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Logins for RBAC testing */}
          <div className="mt-8 border-t border-border/80 pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                One-Click Role Demo Logins
              </p>
            </div>
            <p className="text-[12px] text-muted-foreground mb-3">
              Instantly test Role-Based Access Control without filling forms:
            </p>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("admin")}
                className="flex flex-col items-center justify-center rounded-xl border border-primary/30 bg-primary/5 p-2.5 text-center transition hover:bg-primary/15 hover:border-primary"
              >
                <ShieldCheck className="h-5 w-5 text-primary mb-1" />
                <span className="text-xs font-bold text-foreground">Admin</span>
                <span className="text-[10px] text-muted-foreground">Site Owner</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin("client")}
                className="flex flex-col items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/5 p-2.5 text-center transition hover:bg-amber-500/15 hover:border-amber-500"
              >
                <Briefcase className="h-5 w-5 text-amber-500 mb-1" />
                <span className="text-xs font-bold text-foreground">Organizer</span>
                <span className="text-[10px] text-muted-foreground">Client Portal</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin("member")}
                className="flex flex-col items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-2.5 text-center transition hover:bg-emerald-500/15 hover:border-emerald-500"
              >
                <UserCheck className="h-5 w-5 text-emerald-500 mb-1" />
                <span className="text-xs font-bold text-foreground">Member</span>
                <span className="text-[10px] text-muted-foreground">Audience</span>
              </button>
            </div>

            {/* Default Admin Credentials Info */}
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs">
              <p className="font-bold text-foreground mb-1">🔑 Default Admin Credentials:</p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-muted-foreground font-mono text-[11px]">
                <p>Email: <span className="text-primary font-bold">admin@siddwhizz.com</span></p>
                <p>Password: <span className="text-foreground font-bold">sid123</span></p>
              </div>
            </div>
          </div>

          {/* Footer link to Signup */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              Sign up here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

