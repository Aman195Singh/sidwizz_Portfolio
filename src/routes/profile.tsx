import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  User,
  ShieldCheck,
  Briefcase,
  UserCheck,
  LogOut,
  CalendarDays,
  Lock,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Ticket,
  Camera,
  Trash2,
  KeyRound,
  Upload,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Account — SIDD.WHIZZ" },
      { name: "description", content: "Member account, profile photo, and personal stage access passes." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, isAuthenticated, logout, updateProfilePhoto, updatePassword, updateProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      <div className="flex min-h-[70vh] items-center justify-center px-4 bg-black">
        <div className="card-ink max-w-md p-8 text-center rounded-2xl border border-zinc-800 bg-zinc-950">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary/20 text-primary">
            <User className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Sign In Required</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Please log in to manage your attendee passes and account profile.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link to="/login" className="btn-red w-full">
              Sign In to Continue
            </Link>
            <Link to="/" className="btn-outline w-full !border-zinc-700 !text-white hover:!bg-zinc-800">
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
      <div className="flex min-h-[70vh] items-center justify-center px-4 bg-black">
        <div className="card-ink max-w-md p-8 text-center rounded-2xl border border-zinc-800 bg-zinc-950">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary/20 text-primary">
            <Sparkles className="h-6 w-6 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-white">Opening Your Portal...</h2>
          <p className="mt-2 text-sm text-zinc-400">
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
    <div className="min-h-screen bg-black py-10 text-white font-sans">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
        aria-label="Upload profile picture"
      />

      <div className="container-x max-w-5xl space-y-8">
        {/* Top Header Card with Profile Photo Studio */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {/* Photo Avatar */}
              <div className="relative group">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-20 w-20 rounded-2xl object-cover border-2 border-primary shadow-xl"
                  />
                ) : (
                  <div className="grid h-20 w-20 place-items-center rounded-2xl bg-primary/20 text-3xl font-black text-primary border-2 border-primary/30">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 rounded-full bg-primary p-2 text-white shadow-lg hover:scale-110 transition cursor-pointer"
                  title="Upload profile photo"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-black font-display text-white">{user.name}</h1>
                  <span className="rounded-full bg-white/10 text-white border border-zinc-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    Member Pass
                  </span>
                </div>
                <p className="text-sm text-zinc-400">{user.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                  >
                    <Upload className="h-3 w-3" /> Change Photo
                  </button>
                  {user.avatar && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-xs text-zinc-500 hover:text-destructive flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  logout();
                  navigate({ to: "/" });
                }}
                className="btn-outline !py-2 !px-4 text-xs !border-zinc-700 !text-white hover:!bg-zinc-900"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* VIP Stage Passes / Registered Events */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Ticket className="h-4 w-4 text-primary" /> Active Stage Passes & RSVPs
              </h3>
              <p className="text-xs text-zinc-400">Events hosted by Siddharth Maurya where you hold audience registration.</p>
            </div>
            <span className="rounded-full bg-white/10 text-white border border-zinc-700 px-2.5 py-0.5 text-xs font-bold">
              1 Active Pass
            </span>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-black p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-bold text-primary">TICKET: PASS-2026-VIP</span>
              <h4 className="text-base font-bold text-white mt-0.5">Global FinTech Summit 2026</h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                📅 Dec 14, 2026 • Jio World Convention Centre, Mumbai • Emcee: Siddharth Maurya
              </p>
            </div>
            <button
              onClick={() => toast.success("Pass QR code sent to your registered email.")}
              className="btn-red !py-1.5 !px-3 text-xs self-start sm:self-auto"
            >
              View VIP Pass
            </button>
          </div>
        </div>

        {/* Member Account & Profile Form */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Personal Account Information</h3>
            <p className="text-xs text-zinc-400">Update your contact profile and preferences.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-zinc-400 block mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-black py-2.5 px-3 text-xs text-white placeholder:text-zinc-600 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-black py-2.5 px-3 text-xs text-white placeholder:text-zinc-600 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-400 block mb-1">Mobile Contact</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-black py-2.5 px-3 text-xs text-white placeholder:text-zinc-600 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-400 block mb-1">Location / City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-black py-2.5 px-3 text-xs text-white placeholder:text-zinc-600 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className="btn-red !py-2.5 !px-5 text-xs">
                Save Profile Details
              </button>
            </div>
          </form>

          {/* Password update */}
          <div className="border-t border-zinc-800 pt-6 space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-bold text-white">Account Password</h4>
            </div>
            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-zinc-400 block mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-zinc-800 bg-black py-2 px-3 text-xs text-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-400 block mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full rounded-xl border border-zinc-800 bg-black py-2 px-3 text-xs text-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-400 block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full rounded-xl border border-zinc-800 bg-black py-2 px-3 text-xs text-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn-red !py-2 !px-4 text-xs"
              >
                Change Password & Save
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
