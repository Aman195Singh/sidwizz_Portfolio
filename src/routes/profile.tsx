import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  User,
  LogOut,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Ticket,
  Camera,
  Trash2,
  KeyRound,
  Upload,
  LayoutDashboard,
  Menu,
  X,
  Calendar,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/site";
import { VipPassQrModal } from "@/components/LiveBookingAndModals";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Attendee Portal — SIDD.WHIZZ" },
      { name: "description", content: "Member account, profile photo, and personal stage access passes." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, isAuthenticated, logout, updateProfilePhoto, updatePassword, updateProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"overview" | "account" | "security">("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vipPassOpen, setVipPassOpen] = useState(false);

  // If user is Admin or Client, route directly to their merged portal
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        navigate({ to: "/admin" });
      } else if (user.role === "client") {
        navigate({ to: "/organizer" });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Form states for member account
  const [name, setName] = useState(user?.name || "Community Member");
  const [email, setEmail] = useState(user?.email || "member@audience.in");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [city, setCity] = useState("Mumbai, Maharashtra");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "Community Member");
      setEmail(user.email || "member@audience.in");
    }
  }, [user]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile photo must be smaller than 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      await updateProfilePhoto(dataUrl);
      toast.success("Profile photo uploaded and saved successfully!");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    await updateProfilePhoto("");
    toast.success("Profile photo removed.");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name,
      email,
    });
    toast.success("Member profile details updated successfully!");
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    const res = await updatePassword(currentPassword, newPassword);
    if (res.success) {
      toast.success("Security password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(res.error || "Failed to update password.");
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex h-screen items-center justify-center px-4 bg-background">
        <div className="max-w-md w-full p-8 text-center rounded-2xl border border-border bg-card shadow-xl">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary/20 text-primary">
            <User className="h-6 w-6" />
          </div>
          <h2 className="display text-2xl text-foreground">Sign In Required</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please log in to manage your attendee passes and account profile.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link to="/login" className="btn-red w-full">
              Sign In to Continue
            </Link>
            <Link to="/" className="btn-outline w-full !border-border !text-foreground hover:!bg-muted">
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If redirecting admin or client
  if (user.role === "admin" || user.role === "client") {
    const target = user.role === "admin" ? "/admin" : "/organizer";
    return (
      <div className="flex h-screen items-center justify-center px-4 bg-background">
        <div className="max-w-md w-full p-8 text-center rounded-2xl border border-border bg-card shadow-xl">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary/20 text-primary">
            <Sparkles className="h-6 w-6 animate-spin" />
          </div>
          <h2 className="display text-2xl text-foreground">Opening Your Portal...</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Redirecting to your dedicated {user.role === "admin" ? "Admin Panel" : "Organiser Portal"}.
          </p>
          <div className="mt-6">
            <Link to={target} className="btn-red w-full">
              Click Here if Not Redirected
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-primary-foreground">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
        aria-label="Upload profile picture"
      />

      {/* Mobile & Tablet Dark Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* LEFT NAVIGATION SIDEBAR (Fixed & Non-Scrolling with Page)     */}
      {/* ------------------------------------------------------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-border bg-card backdrop-blur-md transition-transform duration-300 lg:static lg:h-full lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Attendee Role Banner (Matches Admin & Organizer Sidebar Banner) */}
        <div className="px-5 py-3.5 border-b border-border bg-primary/10 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Ticket className="h-4 w-4 text-primary" /> Attendee Portal
            </span>
            <span className="rounded-full bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 text-[11px] font-bold">
              VIP Pass
            </span>
          </div>
          <p className="text-sm font-bold text-foreground mt-1 truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>

        {/* Navigation Menu (Exact same hover & active style as Admin Panel) */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto p-3 text-sm">
          <button
            onClick={() => {
              setActiveTab("overview");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 font-semibold transition ${
              activeTab === "overview"
                ? "bg-primary text-primary-foreground shadow-sm font-bold"
                : "text-foreground/80 hover:bg-accent hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-3">
              <LayoutDashboard className="h-4 w-4 shrink-0" /> Overview & Passes
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted text-foreground">
              1
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("account");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 font-semibold transition ${
              activeTab === "account"
                ? "bg-primary text-primary-foreground shadow-sm font-bold"
                : "text-foreground/80 hover:bg-accent hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-3">
              <User className="h-4 w-4 shrink-0" /> Account & Profile
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("security");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 font-semibold transition ${
              activeTab === "security"
                ? "bg-primary text-primary-foreground shadow-sm font-bold"
                : "text-foreground/80 hover:bg-accent hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-3">
              <KeyRound className="h-4 w-4 shrink-0" /> Security & Password
            </span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-border p-3 space-y-1 text-sm shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-semibold text-foreground/80 hover:bg-accent hover:text-foreground transition"
          >
            <ExternalLink className="h-4 w-4 text-primary shrink-0" />
            <span>Back to Public Website</span>
          </Link>

          <button
            onClick={() => {
              logout();
              navigate({ to: "/" });
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-semibold text-foreground/80 hover:bg-accent hover:text-foreground transition"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTENT AREA (Fixed Header + Scrollable Main Body)       */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header Bar (Fixed / Non-Scrolling) */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 backdrop-blur lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="shrink-0 rounded-lg border border-border p-2 text-foreground lg:hidden cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="truncate font-display text-lg font-extrabold uppercase tracking-tight text-foreground sm:text-xl">
              {activeTab === "overview" && "Attendee Overview & Stage Passes"}
              {activeTab === "account" && "Personal Profile & Photo Studio"}
              {activeTab === "security" && "Account Security & Password"}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
            <Link
              to="/contact"
              className="btn-red !py-2 !px-4 text-xs whitespace-nowrap"
            >
              Book Sid
            </Link>

            <button
              onClick={() => setActiveTab("account")}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full overflow-hidden border-2 border-primary/50 bg-secondary hover:border-primary hover:scale-105 transition cursor-pointer"
              title="My Account"
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-black text-foreground">{user.name.charAt(0).toUpperCase()}</span>
              )}
            </button>
          </div>
        </header>

        {/* Tab Content Body (Scrolls Independently) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 panel-canvas">
          {/* Top Header Card with Profile Photo Studio */}
          <div className="panel-card shadow-sm">
            <div className="panel-card-header flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="h-5 w-1.5 rounded-full bg-primary shrink-0" />
                <div>
                  <h3 className="font-display text-base sm:text-lg font-black tracking-tight text-foreground uppercase">
                    Member Account &amp; Identity Studio
                  </h3>
                  <p className="text-xs text-muted-foreground">Manage your attendee stage avatar and session authentication.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate({ to: "/" });
                }}
                className="btn-outline !py-1.5 !px-3.5 text-xs !border-neutral-300 !text-foreground hover:!bg-neutral-200 self-start sm:self-auto cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            </div>

            <div className="panel-card-body p-6 sm:p-7">
              <div className="flex items-center gap-4">
                {/* Photo Avatar */}
                <div className="relative group">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-20 w-20 rounded-full object-cover border-2 border-primary shadow-xl"
                    />
                  ) : (
                    <div className="grid h-20 w-20 place-items-center rounded-full bg-primary/20 text-3xl font-black text-primary border-2 border-primary/30">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 rounded-full bg-primary p-2 text-white shadow-lg hover:scale-110 transition cursor-pointer"
                    title="Upload profile photo"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="font-display text-2xl font-extrabold text-foreground">{user.name}</h2>
                    <span className="rounded-full bg-primary/15 text-primary border border-primary/30 px-3 py-0.5 text-xs font-bold uppercase tracking-wider">
                      Member Pass
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-primary font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5" /> Change Photo
                    </button>
                    {user.avatar && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {activeTab === "overview" && (
            <div className="space-y-8">
              <div>
                <p className="eyebrow mb-1">Audience Access &amp; RSVPs</p>
                <h2 className="display text-2xl sm:text-3xl text-foreground">
                  Active Stage <span className="text-primary">Passes</span>
                </h2>
              </div>

              {/* VIP Stage Passes / Registered Events */}
              <div className="panel-card shadow-sm">
                <div className="panel-card-header flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-5 w-1.5 rounded-full bg-primary shrink-0" />
                    <div>
                      <h3 className="font-display text-base sm:text-lg font-black tracking-tight text-foreground uppercase flex items-center gap-2">
                        <Ticket className="h-5 w-5 text-primary" /> Active Stage Passes &amp; RSVPs
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Events hosted by Siddharth Maurya where you hold audience registration.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-primary/15 text-primary border border-primary/30 px-3 py-1 text-xs font-bold">
                    1 Active Pass
                  </span>
                </div>

                <div className="panel-card-body p-6">
                  <div className="panel-inner-tile card-lift flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <span className="font-mono text-sm font-bold text-primary">TICKET: PASS-2026-VIP</span>
                      <h4 className="font-display text-xl font-extrabold text-foreground">Global FinTech Summit 2026</h4>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-1">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-primary" /> Dec 14, 2026
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-primary" /> Jio World Convention Centre, Mumbai
                        </span>
                        <span className="flex items-center gap-1.5 text-foreground font-semibold">
                          <CheckCircle2 className="h-4 w-4 text-primary" /> Emcee: Siddharth Maurya
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setVipPassOpen(true)}
                      className="btn-red !py-2.5 !px-5 text-sm self-start sm:self-auto shrink-0 cursor-pointer"
                    >
                      View VIP Pass (QR)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activeTab === "account" || activeTab === "overview") && (
            <div className="space-y-6">
              <div>
                <p className="eyebrow mb-1">Member Identity</p>
                <h2 className="display text-2xl sm:text-3xl text-foreground">
                  Personal <span className="text-primary">Profile</span>
                </h2>
              </div>

              {/* Member Account & Profile Form */}
              <div className="panel-card shadow-sm">
                <div className="panel-card-header flex items-center gap-2.5">
                  <span className="h-5 w-1.5 rounded-full bg-primary shrink-0" />
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-black tracking-tight text-foreground uppercase">
                      Personal Account Information
                    </h3>
                    <p className="text-xs text-muted-foreground">Update your contact profile and preferences.</p>
                  </div>
                </div>

                <div className="panel-card-body p-6">
                  <form onSubmit={handleSaveProfile} className="space-y-4 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-muted-foreground block mb-1.5">Your Full Name</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-muted-foreground block mb-1.5">Email Address</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-muted-foreground block mb-1.5">Mobile Contact</label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-muted-foreground block mb-1.5">Location / City</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button type="submit" className="btn-red !py-2.5 !px-5 text-sm cursor-pointer">
                        Save Profile Details
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {(activeTab === "security" || activeTab === "overview") && (
            <div className="space-y-6">
              <div>
                <p className="eyebrow mb-1">Credentials &amp; Protection</p>
                <h2 className="display text-2xl sm:text-3xl text-foreground">
                  Account <span className="text-primary">Security</span>
                </h2>
              </div>

              <div className="panel-card shadow-sm">
                <div className="panel-card-header flex items-center gap-2.5">
                  <span className="h-5 w-1.5 rounded-full bg-primary shrink-0" />
                  <KeyRound className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-black tracking-tight text-foreground uppercase">
                      Account Password &amp; Authentication
                    </h3>
                    <p className="text-xs text-muted-foreground">Update your password to keep your member account secure.</p>
                  </div>
                </div>

                <div className="panel-card-body p-6">
                  <form onSubmit={handleUpdatePassword} className="space-y-4 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="font-bold text-muted-foreground block mb-1.5">Current Password</label>
                        <input
                          type="password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-muted-foreground block mb-1.5">New Password</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-muted-foreground block mb-1.5">Confirm New Password</label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="btn-red !py-2.5 !px-5 text-sm cursor-pointer"
                    >
                      Change Password &amp; Save
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <VipPassQrModal
        open={vipPassOpen}
        onClose={() => setVipPassOpen(false)}
        passHolderName={user.name}
        passHolderEmail={user.email}
      />
    </div>
  );
}
