import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  User,
  Mail,
  Lock,
  Building,
  Phone,
  Globe,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  UserCheck,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { useAuth, type OrganizerOnboardingInput } from "@/lib/auth";
import { Logo } from "@/components/site";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Register or Apply — SIDD.WHIZZ" },
      {
        name: "description",
        content: "Create a community attendee pass or submit an Event Organizer onboarding application.",
      },
    ],
  }),
  component: SignupPage,
});

const ORG_TYPES: OrganizerOnboardingInput["organizationType"][] = [
  "Corporate Brand",
  "Event Management Agency",
  "Tech Summit / Conference",
  "Festival / Live Promoter",
  "Luxury Wedding / Family Office",
  "University / Institution",
];

function SignupPage() {
  const { signup, submitOrganizerApplication, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [onboardingMode, setOnboardingMode] = useState<"member" | "organizer">("member");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Organizer application fields
  const [organizationName, setOrganizationName] = useState("");
  const [organizationType, setOrganizationType] =
    useState<OrganizerOnboardingInput["organizationType"]>("Corporate Brand");
  const [websiteOrSocial, setWebsiteOrSocial] = useState("");
  const [notes, setNotes] = useState("");

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
          <h2 className="text-xl font-bold text-foreground font-display">Account Active</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Signed in as <span className="font-semibold text-foreground">{user.name}</span>.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link to={portalPath} className="btn-red w-full">
              Continue to {portalName}
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

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (onboardingMode === "member") {
        const res = await signup({
          name: name.trim(),
          email: email.trim(),
          password,
          role: "member",
          phone: phone.trim() || undefined,
        });
        if (res.success) {
          navigate({ to: "/profile" });
        } else {
          setError(res.error || "Unable to register member account.");
        }
      } else {
        if (!organizationName.trim() || !phone.trim()) {
          setError("Organization name and contact phone are required for Organizer verification.");
          setIsSubmitting(false);
          return;
        }
        const res = await submitOrganizerApplication({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          organizationName: organizationName.trim(),
          organizationType,
          websiteOrSocial: websiteOrSocial.trim() || undefined,
          notes: notes.trim() || undefined,
        });
        if (res.success) {
          navigate({ to: "/organizer" });
        } else {
          setError(res.error || "Unable to submit Organizer application.");
        }
      }
    } catch {
      setError("An unexpected error occurred during registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gradient-to-b from-background via-ink/5 to-background py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="mx-auto w-full max-w-lg space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <p className="eyebrow justify-center mb-1">Controlled Portal Onboarding</p>
          <h1 className="display text-3xl sm:text-4xl text-foreground">
            Join <span className="text-primary">SIDD.WHIZZ</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Register instantly as an Event Attendee, or submit your Organization for verified Host Booking access.
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
            <fieldset>
              <legend className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Choose Onboarding Path
              </legend>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setOnboardingMode("member")}
                  aria-pressed={onboardingMode === "member"}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition cursor-pointer ${
                    onboardingMode === "member"
                      ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                      : "border-border bg-muted/40 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  <UserCheck
                    className={`h-5 w-5 mb-1.5 ${
                      onboardingMode === "member" ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <span className="text-sm font-bold text-foreground">Member / Attendee</span>
                  <span className="text-xs text-muted-foreground">Instant Ticket &amp; Event Pass</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOnboardingMode("organizer")}
                  aria-pressed={onboardingMode === "organizer"}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition cursor-pointer ${
                    onboardingMode === "organizer"
                      ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                      : "border-border bg-muted/40 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  <Briefcase
                    className={`h-5 w-5 mb-1.5 ${
                      onboardingMode === "organizer" ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <span className="text-sm font-bold text-foreground">Organizer Application</span>
                  <span className="text-xs text-muted-foreground">Admin-Verified Agency Access</span>
                </button>
              </div>

              <p className="mt-2.5 flex items-start gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span>
                  {onboardingMode === "organizer"
                    ? "Organizer accounts undergo quick Admin verification before Host Booking & Event Publishing tools unlock."
                    : "Staff & Admin accounts are strictly invitation-only and cannot be self-registered publicly."}
                </span>
              </p>
            </fieldset>

            <div>
              <label
                htmlFor="signup-name"
                className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5"
              >
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full rounded-xl border border-input bg-background/80 py-3 pl-10 pr-4 text-base sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="signup-email"
                  className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5"
                >
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-xl border border-input bg-background/80 py-3 pl-10 pr-3 text-base sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-phone"
                  className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5"
                >
                  Phone {onboardingMode === "organizer" ? "*" : "(Optional)"}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="signup-phone"
                    name="phone"
                    type="tel"
                    required={onboardingMode === "organizer"}
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98200 00000"
                    className="w-full rounded-xl border border-input bg-background/80 py-3 pl-10 pr-3 text-base sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                  />
                </div>
              </div>
            </div>

            {onboardingMode === "organizer" && (
              <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Organization Verification Details
                </p>

                <div>
                  <label
                    htmlFor="signup-org"
                    className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1"
                  >
                    Company / Agency Name *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="signup-org"
                      name="organizationName"
                      type="text"
                      required
                      autoComplete="organization"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="e.g. Apex Global Tech Summits Pvt Ltd"
                      className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-base sm:text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="signup-org-type"
                      className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1"
                    >
                      Organization Category
                    </label>
                    <select
                      id="signup-org-type"
                      name="organizationType"
                      value={organizationType}
                      onChange={(e) =>
                        setOrganizationType(
                          e.target.value as OrganizerOnboardingInput["organizationType"]
                        )
                      }
                      className="w-full rounded-xl border border-input bg-background py-2.5 px-3 text-base sm:text-sm text-foreground focus:border-primary focus:outline-none"
                    >
                      {ORG_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="signup-web"
                      className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1"
                    >
                      Website / LinkedIn
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        id="signup-web"
                        name="websiteOrSocial"
                        type="text"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        value={websiteOrSocial}
                        onChange={(e) => setWebsiteOrSocial(e.target.value)}
                        placeholder="https://company.com"
                        className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-3 text-base sm:text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="signup-notes"
                    className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1"
                  >
                    Upcoming Event Brief (Optional)
                  </label>
                  <textarea
                    id="signup-notes"
                    name="notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Briefly describe the summit, gala, or festival you organize..."
                    className="w-full rounded-xl border border-input bg-background p-3 text-base sm:text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="signup-password"
                className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5"
              >
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  aria-describedby="signup-password-hint"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
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
              <p id="signup-password-hint" className="mt-1 text-[11px] text-muted-foreground">
                Must be at least 8 characters; hashed server-side via PBKDF2-SHA256.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-red w-full !py-3 !mt-6 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>
                {isSubmitting
                  ? "Submitting..."
                  : onboardingMode === "organizer"
                  ? "Submit Organizer Application"
                  : "Create Member Account"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

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
