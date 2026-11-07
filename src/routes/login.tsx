import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  UserCheck,
  AlertCircle,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth, type UserRole } from "@/lib/auth";
import { Logo } from "@/components/site";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — SIDD.WHIZZ Client & Admin Portal" },
      {
        name: "description",
        content: "Secure sign-in for event organizers, community attendees, and authorized SIDD.WHIZZ staff.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, devQuickLogin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated && user) {
    const portalPath =
      user.role === "admin" ? "/admin" : user.role === "client" ? "/organizer" : "/profile";
    const portalName =
      user.role === "admin"
        ? "Admin Control Center"
        : user.role === "client"
        ? "Organiser Portal"
        : "Member Account";

    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="max-w-md w-full p-8 text-center rounded-2xl border border-border bg-card shadow-xl">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary/20 text-primary">
            <UserCheck className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground font-display">Already Signed In</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Signed in as <span className="font-semibold text-foreground">{user.name}</span> (
            {user.roleNames[0] || user.role}).
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link to={portalPath} className="btn-red w-full">
              Open {portalName}
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

    if (!email.trim() || !password) {
      setError("Please enter both your email address and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email.trim(), password);
      if (res.success && res.user) {
        if (res.user.role === "admin") {
          navigate({ to: "/admin" });
        } else if (res.user.role === "client") {
          navigate({ to: "/organizer" });
        } else {
          navigate({ to: "/profile" });
        }
      } else {
        setError(res.error || "Invalid email address or password.");
      }
    } catch {
      setError("An unexpected error occurred during sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDevQuickLogin = async (role: UserRole) => {
    if (!import.meta.env.DEV) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await devQuickLogin(role);
      if (res.success && res.user) {
        if (res.user.role === "admin") {
          navigate({ to: "/admin" });
        } else if (res.user.role === "client") {
          navigate({ to: "/organizer" });
        } else {
          navigate({ to: "/profile" });
        }
      } else {
        setError(res.error || "Development quick login failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gradient-to-b from-background via-ink/5 to-background py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="mx-auto w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <p className="eyebrow justify-center mb-1">Portal Authentication</p>
          <h1 className="display text-3xl sm:text-4xl text-foreground">
            Welcome <span className="text-primary">Back</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with your verified credentials to access bookings, tickets, or authorized management tools.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-md p-6 sm:p-8 shadow-2xl">
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-6 flex items-start gap-2.5 rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm text-foreground"
            >
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} method="post" className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="username"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-input bg-background/80 py-3 pl-10 pr-4 text-base sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-input bg-background/80 py-3 pl-10 pr-11 text-base sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-red w-full !py-3 !mt-6 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? "Verifying Session..." : "Sign In Securely"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Local Development Sandbox Switcher ONLY — Completely stripped from production builds */}
          {import.meta.env.DEV && (
            <div className="mt-8 border-t border-border pt-6">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Local Dev Role Switcher
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 border border-primary/25 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                  Dev Only
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Hidden automatically on live production deployments:
              </p>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => handleDevQuickLogin("admin")}
                  disabled={isSubmitting}
                  className="flex flex-col items-center justify-center rounded-xl border border-primary/40 bg-primary/10 p-3 text-center transition hover:bg-primary/20 hover:border-primary cursor-pointer"
                >
                  <ShieldCheck className="h-5 w-5 text-primary mb-1" />
                  <span className="text-sm font-bold text-foreground">Super Admin</span>
                  <span className="text-[11px] text-muted-foreground">Dev Session</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDevQuickLogin("client")}
                  disabled={isSubmitting}
                  className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/40 p-3 text-center transition hover:bg-accent hover:border-primary/50 cursor-pointer"
                >
                  <Briefcase className="h-5 w-5 text-primary mb-1" />
                  <span className="text-sm font-bold text-foreground">Organizer</span>
                  <span className="text-[11px] text-muted-foreground">Dev Session</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDevQuickLogin("member")}
                  disabled={isSubmitting}
                  className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/40 p-3 text-center transition hover:bg-accent hover:border-primary/50 cursor-pointer"
                >
                  <UserCheck className="h-5 w-5 text-primary mb-1" />
                  <span className="text-sm font-bold text-foreground">Member</span>
                  <span className="text-[11px] text-muted-foreground">Dev Session</span>
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            New to SIDD.WHIZZ?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              Register as Member or Apply as Organizer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
