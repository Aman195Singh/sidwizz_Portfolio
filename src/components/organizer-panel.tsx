import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Inbox,
  CalendarCheck,
  Radio,
  User,
  Plus,
  ExternalLink,
  LogOut,
  Menu,
  X,
  MapPin,
  Clock,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Mic,
  Headphones,
  Sliders,
  Send,
  Building,
  Mail,
  Phone,
  Sparkles,
  Lock,
  ShieldCheck,
  Camera,
  ImagePlus,
  Trash2,
  KeyRound,
  Upload,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Logo } from "@/components/site";
import { getStoredEnquiries, saveEnquiry } from "@/lib/data-store";

export type OrganizerTab = "overview" | "enquiries" | "bookings" | "events" | "account";

interface OrgEnquiry {
  id: string;
  eventName: string;
  date: string;
  city: string;
  venue: string;
  format: string;
  crowdSize: string;
  budget: string;
  status: "Under Review" | "Proposal Sent" | "Confirmed" | "Declined";
  createdAt: string;
}

const INITIAL_ORG_ENQUIRIES: OrgEnquiry[] = [
  {
    id: "ENQ-ORG-01",
    eventName: "Apex Global Tech Summits 2026",
    date: "2026-12-14",
    city: "Mumbai",
    venue: "Jio World Convention Centre, BKC",
    format: "Technology Summit & Panel Moderation",
    crowdSize: "1,500+ CXOs",
    budget: "₹4,00,000",
    status: "Confirmed",
    createdAt: "2026-10-25",
  },
  {
    id: "ENQ-ORG-02",
    eventName: "Asia AI & Robotics Conclave 2027",
    date: "2027-02-18",
    city: "Bengaluru",
    venue: "Bangalore International Exhibition Centre",
    format: "Robotics Keynote & Expo Stage",
    crowdSize: "3,000 Attendees",
    budget: "₹5,00,000",
    status: "Proposal Sent",
    createdAt: "2026-11-02",
  },
];

export function OrganizerPanel() {
  const { user, logout, updateProfilePhoto, updatePassword, updateProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<OrganizerTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync enquiries with DataStore
  const [enquiries, setEnquiries] = useState<OrgEnquiry[]>(() => {
    const stored = getStoredEnquiries();
    return stored.map((e) => ({
      id: e.id,
      eventName: e.eventName,
      date: e.date,
      city: e.city,
      venue: e.venue,
      format: e.format,
      crowdSize: e.crowdSize,
      budget: e.budget,
      status: e.status === "New" ? "Under Review" : e.status === "Confirmed" ? "Confirmed" : "Proposal Sent",
      createdAt: e.createdAt,
    }));
  });

  useEffect(() => {
    const handleSync = () => {
      const stored = getStoredEnquiries();
      setEnquiries(
        stored.map((e) => ({
          id: e.id,
          eventName: e.eventName,
          date: e.date,
          city: e.city,
          venue: e.venue,
          format: e.format,
          crowdSize: e.crowdSize,
          budget: e.budget,
          status: e.status === "New" ? "Under Review" : e.status === "Confirmed" ? "Confirmed" : "Proposal Sent",
          createdAt: e.createdAt,
        }))
      );
    };
    window.addEventListener("siddwhizz_enquiries_updated", handleSync);
    return () => window.removeEventListener("siddwhizz_enquiries_updated", handleSync);
  }, []);

  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form fields for new enquiry
  const [newEventName, setNewEventName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [newFormat, setNewFormat] = useState("Tech Summit & Keynotes");
  const [newCrowd, setNewCrowd] = useState("500 - 1,000 Attendees");
  const [newBudget, setNewBudget] = useState("₹2,50,000 - ₹4,00,000");
  const [newBrief, setNewBrief] = useState("");

  // Account details state (Merged Account & Profile for Organizer)
  const [companyName, setCompanyName] = useState(user?.organization || "Apex Global Tech Summits Pvt Ltd");
  const [contactPerson, setContactPerson] = useState(user?.name || "Priya Sharma");
  const [contactEmail, setContactEmail] = useState(user?.email || "priya@techsummit.io");
  const [contactPhone, setContactPhone] = useState("+91 98200 11223");
  const [gstNumber, setGstNumber] = useState("27AABCA1234F1Z5");
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

  const handleCreateEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName.trim() || !newDate || !newCity.trim()) {
      toast.error("Please fill in event name, target date, and city.");
      return;
    }

    saveEnquiry({
      eventName: newEventName.trim(),
      clientName: contactPerson,
      organization: companyName,
      email: contactEmail,
      phone: contactPhone,
      date: newDate,
      city: newCity.trim(),
      venue: newVenue.trim() || `${newCity.trim()} Convention Centre`,
      format: newFormat,
      crowdSize: newCrowd,
      budget: newBudget,
      status: "New",
      brief: newBrief.trim(),
    });

    setCreateModalOpen(false);
    setNewEventName("");
    setNewDate("");
    setNewCity("");
    setNewVenue("");
    setNewBrief("");
    toast.success("Stage booking enquiry submitted directly to Siddharth Maurya's management team!");
    setActiveTab("enquiries");
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name: contactPerson,
      email: contactEmail,
      organization: companyName,
    });
    toast.success("Organizer company and contact preferences updated successfully!");
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
      toast.success("Organizer account password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(res.error || "Failed to update password.");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-primary-foreground">
      {/* ------------------------------------------------------------- */}
      {/* LEFT NAVIGATION SIDEBAR (Fixed & Non-Scrolling with Page)     */}
      {/* ------------------------------------------------------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-border bg-card backdrop-blur-md transition-transform duration-300 md:static md:h-full md:translate-x-0 ${
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
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Organizer Badge (Matches Admin Sidebar Role Banner) */}
        <div className="px-5 py-3.5 border-b border-border bg-primary/10 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Building className="h-4 w-4 text-primary" /> Organiser Portal
            </span>
            <span className="rounded-full bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 text-[11px] font-bold">
              Verified
            </span>
          </div>
          <p className="text-sm font-bold text-foreground mt-1 truncate">{user?.name || "Event Organizer"}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.organization || "Apex Global Summits"}</p>
        </div>

        {/* Navigation Menu (Matches Admin Sidebar Hover & Active Style) */}
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
              <LayoutDashboard className="h-4 w-4 shrink-0" /> Overview
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("enquiries");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 font-semibold transition ${
              activeTab === "enquiries"
                ? "bg-primary text-primary-foreground shadow-sm font-bold"
                : "text-foreground/80 hover:bg-accent hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-3">
              <Inbox className="h-4 w-4 shrink-0" /> My Enquiries
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted text-foreground">
              {enquiries.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("bookings");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 font-semibold transition ${
              activeTab === "bookings"
                ? "bg-primary text-primary-foreground shadow-sm font-bold"
                : "text-foreground/80 hover:bg-accent hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-3">
              <CalendarCheck className="h-4 w-4 shrink-0" /> My Bookings
            </span>
            <span className="rounded-full bg-muted text-foreground border border-border px-2 py-0.5 text-[11px] font-bold">
              1 Active
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("events");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 font-semibold transition ${
              activeTab === "events"
                ? "bg-primary text-primary-foreground shadow-sm font-bold"
                : "text-foreground/80 hover:bg-accent hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-3">
              <Radio className="h-4 w-4 shrink-0" /> Event Details & Rider
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
              <User className="h-4 w-4 shrink-0" /> My Account
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
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 backdrop-blur md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="shrink-0 rounded-lg border border-border p-2 text-foreground md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="truncate font-display text-lg font-extrabold uppercase tracking-tight text-foreground sm:text-xl">
              {activeTab === "overview" && "Organiser Overview"}
              {activeTab === "enquiries" && "My Stage Booking Enquiries"}
              {activeTab === "bookings" && "Confirmed Bookings & Contracts"}
              {activeTab === "events" && "Event Details & Host Tech Rider"}
              {activeTab === "account" && "Company Account & Lead Profile"}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="btn-red !py-2 !px-4 text-xs flex items-center gap-1.5 whitespace-nowrap"
              aria-label="Create new enquiry"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create New Enquiry</span>
              <span className="sm:hidden">New</span>
            </button>

            <button
              onClick={() => setActiveTab("account")}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full overflow-hidden border-2 border-primary/50 bg-secondary hover:border-primary hover:scale-105 transition cursor-pointer"
              title="My Account"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-black text-foreground">PS</span>
              )}
            </button>
          </div>
        </header>

        {/* Tab Content Body (Scrolls Independently) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 bg-background">
          {/* ========================================================= */}
          {/* 1. OVERVIEW VIEW                                          */}
          {/* ========================================================= */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div>
                <p className="eyebrow mb-1">Corporate Partner Portal</p>
                <h2 className="display text-2xl sm:text-3xl text-foreground">
                  Organiser <span className="text-primary">Dashboard</span>
                </h2>
              </div>

              {/* Welcome Banner */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/30 px-2.5 py-0.5 rounded">
                    Verified Event Partner
                  </span>
                  <h3 className="font-display text-2xl font-extrabold text-foreground mt-2">
                    Welcome back, Priya!
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Managing stage hosting requirements for <strong className="text-foreground">Apex Global Tech Summits</strong>.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => setActiveTab("bookings")}
                    className="btn-outline !py-2.5 !px-4 text-sm !border-border !text-foreground hover:!bg-muted"
                  >
                    View Active Show
                  </button>
                  <button
                    onClick={() => setCreateModalOpen(true)}
                    className="btn-red !py-2.5 !px-4 text-sm"
                  >
                    + Enquire Another Event
                  </button>
                </div>
              </div>

              {/* Next Event Countdown Card */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded border border-primary/30">
                      Next Confirmed Show
                    </span>
                    <h3 className="font-display text-xl font-extrabold text-foreground mt-2">
                      Apex Global Tech Summits 2026
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-primary" /> Jio World Convention Centre, Mumbai
                    </p>
                  </div>

                  <div className="flex items-center gap-5 bg-muted/40 p-4 rounded-xl border border-border">
                    <div className="text-center">
                      <p className="text-2xl font-black font-display text-primary">40</p>
                      <p className="text-xs text-muted-foreground uppercase font-bold">Days Left</p>
                    </div>
                    <div className="h-9 w-px bg-border" />
                    <div className="text-center">
                      <p className="text-2xl font-black font-display text-foreground">Dec 14</p>
                      <p className="text-xs text-muted-foreground uppercase font-bold">Stage Date</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 text-sm">
                  <div className="p-4 rounded-xl bg-background border border-border">
                    <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wider mb-1">Host Role:</span>
                    <span className="font-bold text-foreground">Keynote Intro & Panel Moderator</span>
                  </div>
                  <div className="p-4 rounded-xl bg-background border border-border">
                    <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wider mb-1">Stage Rider:</span>
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> Acknowledged & Approved
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-background border border-border">
                    <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wider mb-1">Run-of-Show Rundown:</span>
                    <span className="font-bold text-foreground">Draft v2 in Review</span>
                  </div>
                </div>
              </div>

              {/* Status Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card-lift rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Confirmed Stage Dates</span>
                  <p className="text-3xl font-black font-display text-foreground mt-1.5">1 Show</p>
                  <p className="text-sm text-muted-foreground mt-1">Contract executed & locked</p>
                </div>

                <div className="card-lift rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Inquiries</span>
                  <p className="text-3xl font-black font-display text-primary mt-1.5">1 Proposal</p>
                  <p className="text-sm text-muted-foreground mt-1">Under commercial review</p>
                </div>

                <div className="card-lift rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Dedicated Emcee Manager</span>
                  <p className="font-display text-xl font-extrabold text-foreground mt-1.5">Neha Sharma</p>
                  <p className="text-sm text-muted-foreground mt-1">Direct support hotline available</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. MY ENQUIRIES VIEW (List + Create)                      */}
          {/* ========================================================= */}
          {activeTab === "enquiries" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="eyebrow mb-1">Booking Requests</p>
                  <h2 className="display text-2xl sm:text-3xl text-foreground">
                    Your Stage <span className="text-primary">Enquiries</span>
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Track date lock requests and proposals submitted to Siddharth Maurya's management.</p>
                </div>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="btn-red !py-2.5 !px-5 text-sm flex items-center gap-2 self-start sm:self-auto"
                >
                  <Plus className="h-4 w-4" /> Create New Enquiry
                </button>
              </div>

              <div className="space-y-4">
                {enquiries.map((enq) => (
                  <div key={enq.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3.5">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-sm font-bold text-primary">{enq.id}</span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              enq.status === "Confirmed"
                                ? "bg-muted text-foreground border border-border"
                                : "bg-primary/20 text-primary border border-primary/30"
                            }`}
                          >
                            {enq.status}
                          </span>
                        </div>
                        <h4 className="font-display text-lg font-extrabold text-foreground mt-1">{enq.eventName}</h4>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs font-medium text-muted-foreground">Submitted: {enq.createdAt}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wider">Date & City</span>
                        <p className="font-semibold text-foreground mt-1">📅 {enq.date} • {enq.city}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wider">Venue</span>
                        <p className="font-semibold text-foreground mt-1">{enq.venue}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wider">Format & Crowd</span>
                        <p className="font-semibold text-foreground mt-1">{enq.format} ({enq.crowdSize})</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wider">Budget Range</span>
                        <p className="font-mono font-bold text-primary mt-1">{enq.budget}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. MY BOOKINGS VIEW                                       */}
          {/* ========================================================= */}
          {activeTab === "bookings" && (
            <div className="space-y-6">
              <div>
                <p className="eyebrow mb-1">Executed Contracts</p>
                <h2 className="display text-2xl sm:text-3xl text-foreground">
                  Confirmed <span className="text-primary">Bookings</span>
                </h2>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-foreground">Executed Booking Agreements</h3>
                    <p className="text-sm text-muted-foreground">Official confirmed stage locks for Siddharth Maurya.</p>
                  </div>
                  <span className="rounded-full bg-primary/15 text-primary border border-primary/30 px-3 py-1 text-xs font-bold">
                    1 Confirmed Contract
                  </span>
                </div>

                <div className="rounded-xl border border-border bg-background p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                    <div>
                      <span className="font-mono text-sm font-bold text-primary">REF: SID-CONF-2026-88</span>
                      <h4 className="font-display text-xl font-extrabold text-foreground mt-1">Apex Global Tech Summits 2026</h4>
                      <p className="text-sm text-muted-foreground">Organizer: Apex Global Tech Summits Pvt Ltd</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => toast.success("Downloading Executed Emcee Contract PDF...")}
                        className="btn-outline !py-2 !px-4 text-sm !border-border !text-foreground hover:!bg-muted flex items-center gap-2"
                      >
                        <Download className="h-4 w-4 text-primary" /> Download Contract
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                      <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wider">Show Date & Timing</span>
                      <p className="font-bold text-foreground mt-1">December 14, 2026 • 09:00 AM - 05:30 PM</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                      <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wider">Location</span>
                      <p className="font-bold text-foreground mt-1">Jio World Convention Centre, Mumbai</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                      <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wider">Host Status</span>
                      <p className="font-bold text-foreground mt-1 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-primary" /> Advance Paid & Locked
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. EVENT DETAILS / MY EVENTS (Tech Rider Specs)           */}
          {/* ========================================================= */}
          {activeTab === "events" && (
            <div className="space-y-6">
              <div>
                <p className="eyebrow mb-1">Stage & AV Specifications</p>
                <h2 className="display text-2xl sm:text-3xl text-foreground">
                  Technical <span className="text-primary">Stage Rider</span>
                </h2>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="font-display text-lg font-extrabold text-foreground">Host Technical Stage Rider & Hospitality</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Required audio, video, microphone, and backstage parameters for Siddharth Maurya's stage performance.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {/* Microphones */}
                  <div className="card-lift rounded-xl border border-border p-5 bg-background space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-base">
                      <Mic className="h-5 w-5" />
                      <span>Microphone Preference</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      1x Shure Axient Digital Wireless Handheld (KSM9 or Beta 58 capsule) or Sennheiser Digital 6000. Fresh AA batteries before keynote introduction.
                    </p>
                  </div>

                  {/* IEM & Monitors */}
                  <div className="card-lift rounded-xl border border-border p-5 bg-background space-y-2">
                    <div className="flex items-center gap-2 text-foreground font-bold text-base">
                      <Headphones className="h-5 w-5 text-primary" />
                      <span>In-Ear Monitors (IEM) / Stage Cues</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Dedicated stage cue feed from console / show director. Two wedge floor stage monitors angled towards emcee podium.
                    </p>
                  </div>

                  {/* Visual Confidence */}
                  <div className="card-lift rounded-xl border border-border p-5 bg-background space-y-2">
                    <div className="flex items-center gap-2 text-foreground font-bold text-base">
                      <Sliders className="h-5 w-5 text-primary" />
                      <span>Confidence Monitors & Countdown Timer</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Two downstage DSM confidence displays: Left showing current speaker slides / teleprompter, Right showing DStimer speaker countdown clock.
                    </p>
                  </div>

                  {/* Green Room */}
                  <div className="card-lift rounded-xl border border-border p-5 bg-background space-y-2">
                    <div className="flex items-center gap-2 text-foreground font-bold text-base">
                      <Building className="h-5 w-5 text-primary" />
                      <span>Green Room Hospitality</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Quiet backstage dressing room with mirror, steaming iron, ambient lighting, high-speed WiFi, black tea / warm water, and fresh fruit platter.
                    </p>
                  </div>
                </div>

                <div className="border-t border-border pt-4 flex flex-wrap justify-between items-center gap-3 text-sm">
                  <span className="text-muted-foreground">Need custom rider adjustments?</span>
                  <button
                    onClick={() => toast.info("Your question has been sent to Sid's technical producer.")}
                    className="btn-outline !py-2 !px-4 text-sm !border-border !text-foreground hover:!bg-muted"
                  >
                    Request Technical Adjustment
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. MY ACCOUNTS VIEW (Merged Account & Profile)             */}
          {/* ========================================================= */}
          {activeTab === "account" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <p className="eyebrow mb-1">Partner Profile & Security</p>
                <h2 className="display text-2xl sm:text-3xl text-foreground">
                  Company <span className="text-primary">Account</span>
                </h2>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
                aria-label="Upload organizer photo"
              />

              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                {/* Organizer Profile Header Card with Avatar Studio */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={contactPerson}
                          className="h-20 w-20 rounded-full object-cover border-2 border-primary shadow-lg"
                        />
                      ) : (
                        <div className="grid h-20 w-20 place-items-center rounded-full bg-primary/20 text-2xl font-black text-primary border-2 border-primary/30">
                          {contactPerson.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 rounded-full bg-primary p-2 text-white shadow-md hover:scale-110 transition cursor-pointer"
                        title="Change profile photo"
                      >
                        <Camera className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-xl font-extrabold text-foreground">{contactPerson}</h3>
                        <span className="rounded-full bg-primary/15 text-primary border border-primary/30 px-2.5 py-0.5 text-xs font-bold">
                          Organizer Account
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{companyName}</p>
                      <p className="text-sm font-mono text-primary mt-0.5">{contactEmail}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-red !py-2 !px-4 text-sm flex items-center gap-1.5"
                    >
                      <Upload className="h-4 w-4" /> Upload Photo
                    </button>
                    {user?.avatar && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="btn-outline !py-2 !px-3 text-sm !border-border !text-muted-foreground hover:!bg-muted"
                        title="Remove photo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSaveAccount} className="space-y-4 text-sm">
                  <div>
                    <label className="font-bold text-muted-foreground block mb-1.5">Company / Organization Legal Name</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background/80 py-2.5 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-muted-foreground block mb-1.5">Primary Event Coordinator</label>
                      <input
                        type="text"
                        required
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background/80 py-2.5 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-muted-foreground block mb-1.5">Mobile Phone (WhatsApp Enabled)</label>
                      <input
                        type="text"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background/80 py-2.5 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-muted-foreground block mb-1.5">Official Work Email Address</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background/80 py-2.5 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-muted-foreground block mb-1.5">GSTIN Number (For Tax Invoices)</label>
                      <input
                        type="text"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background/80 py-2.5 px-3.5 text-sm text-foreground font-mono placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button type="submit" className="btn-red !py-2.5 !px-5 text-sm">
                      Save Account Changes
                    </button>
                  </div>
                </form>

                {/* Password / Security Section inside Account */}
                <div className="border-t border-border pt-6 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <KeyRound className="h-5 w-5 text-primary" />
                    <h4 className="font-display text-lg font-extrabold text-foreground">Security & Password</h4>
                  </div>
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
                          className="w-full rounded-xl border border-input bg-background/80 py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none"
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
                          className="w-full rounded-xl border border-input bg-background/80 py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-muted-foreground block mb-1.5">Confirm Password</label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full rounded-xl border border-input bg-background/80 py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="btn-red !py-2.5 !px-5 text-sm"
                    >
                      Update Password & Save
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Create Enquiry Modal (Accessible from any tab) */}
          {createModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
              <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-foreground">Book Siddharth Maurya for an Event</h3>
                    <p className="text-sm text-muted-foreground">Direct booking request from verified organizer account.</p>
                  </div>
                  <button onClick={() => setCreateModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateEnquiry} className="space-y-4 text-sm">
                  <div>
                    <label className="font-bold text-muted-foreground block mb-1.5">Event Name / Summit Title</label>
                    <input
                      type="text"
                      required
                      value={newEventName}
                      onChange={(e) => setNewEventName(e.target.value)}
                      placeholder="e.g. National Brand Marketing Conclave 2027"
                      className="w-full rounded-xl border border-input bg-background/80 py-2.5 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-muted-foreground block mb-1.5">Event Date</label>
                      <input
                        type="date"
                        required
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background/80 py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-muted-foreground block mb-1.5">City</label>
                      <input
                        type="text"
                        required
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        placeholder="e.g. Mumbai, New Delhi, Bengaluru"
                        className="w-full rounded-xl border border-input bg-background/80 py-2.5 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-muted-foreground block mb-1.5">Venue Name</label>
                    <input
                      type="text"
                      value={newVenue}
                      onChange={(e) => setNewVenue(e.target.value)}
                      placeholder="e.g. Taj Lands End, Bandra"
                      className="w-full rounded-xl border border-input bg-background/80 py-2.5 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-muted-foreground block mb-1.5">Event Format</label>
                      <select
                        value={newFormat}
                        onChange={(e) => setNewFormat(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background/80 py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none"
                      >
                        <option value="Tech Summit & Keynotes">Tech Summit & Keynotes</option>
                        <option value="Corporate Gala & Awards">Corporate Gala & Awards</option>
                        <option value="Product Launch Expo">Product Launch Expo</option>
                        <option value="Music Festival / Arena">Music Festival / Arena</option>
                        <option value="Celebrity Wedding / Sangeet">Celebrity Wedding / Sangeet</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-muted-foreground block mb-1.5">Expected Crowd Size</label>
                      <select
                        value={newCrowd}
                        onChange={(e) => setNewCrowd(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background/80 py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none"
                      >
                        <option value="100 - 300 VIPs">100 - 300 VIPs</option>
                        <option value="500 - 1,000 Attendees">500 - 1,000 Attendees</option>
                        <option value="1,000 - 3,000 Attendees">1,000 - 3,000 Attendees</option>
                        <option value="5,000+ Stadium / Arena">5,000+ Stadium / Arena</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-muted-foreground block mb-1.5">Budget Allocation</label>
                    <select
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background/80 py-2.5 px-3.5 text-sm text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="₹2,00,000 - ₹3,50,000">₹2,00,000 - ₹3,50,000</option>
                      <option value="₹3,50,000 - ₹5,00,000">₹3,50,000 - ₹5,00,000</option>
                      <option value="₹5,00,000+ Premium">₹5,00,000+ Premium Stage</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-muted-foreground block mb-1.5">Special Notes / Run of Show Notes</label>
                    <textarea
                      rows={3}
                      value={newBrief}
                      onChange={(e) => setNewBrief(e.target.value)}
                      placeholder="Tell us about your expectations, VIP dignitaries, and stage energy required..."
                      className="w-full rounded-xl border border-input bg-background/80 py-2.5 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setCreateModalOpen(false)}
                      className="btn-outline !py-2 !px-4 text-sm !border-border !text-foreground hover:!bg-muted"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-red !py-2 !px-4 text-sm">
                      Submit Enquiry Directly
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
