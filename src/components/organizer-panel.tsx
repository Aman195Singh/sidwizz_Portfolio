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
import {
  getStoredEnquiries,
  saveEnquiry,
  getStoredBookings,
  markBookingAdvancePaid,
  getStoredTickets,
  saveSupportTicket,
  getLockedEventDates,
  type Booking,
  type SupportTicket,
} from "@/lib/data-store";
import {
  ContractModal,
  TechnicalRiderRequestModal,
} from "@/components/LiveBookingAndModals";

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

  const [bookings, setBookings] = useState<Booking[]>(() => getStoredBookings());
  const [selectedContract, setSelectedContract] = useState<Booking | null>(null);
  const [riderModalOpen, setRiderModalOpen] = useState(false);
  const [riderTickets, setRiderTickets] = useState<SupportTicket[]>(() => getStoredTickets());

  useEffect(() => {
    const syncBookings = () => setBookings(getStoredBookings());
    const syncTickets = () => setRiderTickets(getStoredTickets());
    window.addEventListener("siddwhizz_bookings_updated", syncBookings);
    window.addEventListener("siddwhizz_tickets_updated", syncTickets);
    return () => {
      window.removeEventListener("siddwhizz_bookings_updated", syncBookings);
      window.removeEventListener("siddwhizz_tickets_updated", syncTickets);
    };
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

  const lockedDates = getLockedEventDates();
  const dateConflict = newDate ? lockedDates.find((d) => d.date === newDate) : undefined;

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
    const cleanGst = gstNumber.trim().toUpperCase();
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (cleanGst && !gstRegex.test(cleanGst)) {
      toast.error(
        "Invalid Indian GSTIN format. Must be 15 characters (e.g. 27AABCA1234F1Z5)."
      );
      return;
    }
    setGstNumber(cleanGst);
    await updateProfile({
      name: contactPerson,
      email: contactEmail,
      organization: companyName,
    });
    toast.success("Organizer company, GSTIN, and contact preferences updated successfully!");
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
              {bookings.length} Active
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 panel-canvas">
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
              <div className="panel-card shadow-md">
                <div className="panel-card-header flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-5 w-1.5 rounded-full bg-primary shrink-0" />
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/30 px-2.5 py-0.5 rounded">
                        Verified Event Partner
                      </span>
                      <h3 className="font-display text-lg sm:text-xl font-black tracking-tight text-foreground uppercase mt-1">
                        Welcome back, {contactPerson || "Priya"}!
                      </h3>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={() => setActiveTab("bookings")}
                      className="btn-outline !py-2 !px-3.5 text-xs sm:text-sm !border-neutral-300 !text-foreground hover:!bg-white cursor-pointer"
                    >
                      View Active Show
                    </button>
                    <button
                      onClick={() => setCreateModalOpen(true)}
                      className="btn-red !py-2 !px-3.5 text-xs sm:text-sm cursor-pointer"
                    >
                      + Enquire Another Event
                    </button>
                  </div>
                </div>
                <div className="panel-card-body p-6">
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Managing stage hosting requirements for <strong className="text-foreground">{companyName || "Apex Global Tech Summits"}</strong>.
                  </p>
                </div>
              </div>

              {/* Next Event Countdown Card */}
              <div className="panel-card shadow-sm">
                <div className="panel-card-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className="h-5 w-1.5 rounded-full bg-primary shrink-0" />
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded border border-primary/30">
                        Next Confirmed Show
                      </span>
                      <h3 className="font-display text-lg sm:text-xl font-extrabold text-foreground mt-1">
                        Apex Global Tech Summits 2026
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-primary shrink-0" /> Jio World Convention Centre, Mumbai
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 bg-white p-3.5 rounded-xl border border-neutral-300 shadow-2xs">
                    <div className="text-center">
                      <p className="text-2xl font-black font-display text-primary">40</p>
                      <p className="text-[11px] text-muted-foreground uppercase font-bold">Days Left</p>
                    </div>
                    <div className="h-8 w-px bg-neutral-300" />
                    <div className="text-center">
                      <p className="text-2xl font-black font-display text-foreground">Dec 14</p>
                      <p className="text-[11px] text-muted-foreground uppercase font-bold">Stage Date</p>
                    </div>
                  </div>
                </div>

                <div className="panel-card-body p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="panel-inner-tile p-4">
                      <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wider mb-1">Host Role:</span>
                      <span className="font-bold text-foreground">Keynote Intro &amp; Panel Moderator</span>
                    </div>
                    <div className="panel-inner-tile p-4">
                      <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wider mb-1">Stage Rider:</span>
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Acknowledged &amp; Approved
                      </span>
                    </div>
                    <div className="panel-inner-tile p-4">
                      <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wider mb-1">Run-of-Show Rundown:</span>
                      <span className="font-bold text-foreground">Draft v2 in Review</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="panel-card card-lift shadow-sm">
                  <div className="panel-card-header py-3 px-5 flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground/80 uppercase tracking-wider">Confirmed Stage Dates</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="panel-card-body p-5">
                    <p className="text-3xl font-black font-display text-foreground">{bookings.length} {bookings.length === 1 ? "Show" : "Shows"}</p>
                    <p className="text-xs text-muted-foreground mt-1">Contract executed &amp; locked</p>
                  </div>
                </div>

                <div className="panel-card card-lift shadow-sm">
                  <div className="panel-card-header py-3 px-5 flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground/80 uppercase tracking-wider">Pending Inquiries</span>
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div className="panel-card-body p-5">
                    <p className="text-3xl font-black font-display text-primary">
                      {enquiries.filter((e) => e.status !== "Confirmed").length} Proposals
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Under commercial review</p>
                  </div>
                </div>

                <div className="panel-card card-lift shadow-sm">
                  <div className="panel-card-header py-3 px-5 flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground/80 uppercase tracking-wider">Dedicated Emcee Manager</span>
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div className="panel-card-body p-5">
                    <p className="font-display text-xl font-extrabold text-foreground">Neha Sharma</p>
                    <p className="text-xs text-muted-foreground mt-1">Direct support hotline available</p>
                  </div>
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
                  <div key={enq.id} className="panel-card shadow-sm">
                    <div className="panel-card-header flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="h-5 w-1.5 rounded-full bg-primary shrink-0" />
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-sm font-bold text-primary">{enq.id}</span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                enq.status === "Confirmed"
                                  ? "bg-muted text-foreground border border-neutral-300"
                                  : "bg-primary/20 text-primary border border-primary/30"
                              }`}
                            >
                              {enq.status}
                            </span>
                          </div>
                          <h4 className="font-display text-base sm:text-lg font-extrabold text-foreground mt-0.5">{enq.eventName}</h4>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs font-medium text-muted-foreground">Submitted: {enq.createdAt}</span>
                      </div>
                    </div>

                    <div className="panel-card-body p-5">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
                        <div className="panel-inner-tile p-3.5">
                          <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wider">Date &amp; City</span>
                          <p className="font-semibold text-foreground mt-1">📅 {enq.date} • {enq.city}</p>
                        </div>
                        <div className="panel-inner-tile p-3.5">
                          <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wider">Venue</span>
                          <p className="font-semibold text-foreground mt-1">{enq.venue}</p>
                        </div>
                        <div className="panel-inner-tile p-3.5">
                          <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wider">Format &amp; Crowd</span>
                          <p className="font-semibold text-foreground mt-1">{enq.format} ({enq.crowdSize})</p>
                        </div>
                        <div className="panel-inner-tile p-3.5">
                          <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wider">Budget Range</span>
                          <p className="font-mono font-bold text-primary mt-1">{enq.budget}</p>
                        </div>
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

              <div className="panel-card shadow-sm">
                <div className="panel-card-header flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-5 w-1.5 rounded-full bg-primary shrink-0" />
                    <div>
                      <h3 className="font-display text-base sm:text-lg font-extrabold text-foreground uppercase tracking-tight">Executed Booking Agreements</h3>
                      <p className="text-xs text-muted-foreground">Official confirmed stage locks for Siddharth Maurya.</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-primary/15 text-primary border border-primary/30 px-3 py-1 text-xs font-bold">
                    {bookings.length} Confirmed {bookings.length === 1 ? "Contract" : "Contracts"}
                  </span>
                </div>

                <div className="panel-card-body p-6 space-y-4">
                  {bookings.map((bk) => (
                    <div key={bk.id} className="panel-inner-tile p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-300 pb-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm font-bold text-primary">{bk.contractRef}</span>
                            <span className="rounded-full bg-primary/15 text-primary border border-primary/30 px-2.5 py-0.5 text-[11px] font-bold">
                              Fee: {bk.fee}
                            </span>
                          </div>
                          <h4 className="font-display text-xl font-extrabold text-foreground mt-1">{bk.eventName}</h4>
                          <p className="text-sm text-muted-foreground">Organizer: {bk.organization}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {!bk.advancePaid && (
                            <button
                              onClick={() => {
                                markBookingAdvancePaid(bk.id);
                                setBookings(getStoredBookings());
                                toast.success(`50% Advance Deposit recorded for ${bk.eventName}!`);
                              }}
                              className="btn-red !py-2 !px-4 text-sm cursor-pointer"
                            >
                              Pay 50% Advance Deposit
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedContract(bk)}
                            className="btn-outline !py-2 !px-4 text-sm !border-neutral-300 !text-foreground hover:!bg-white flex items-center gap-2 cursor-pointer"
                          >
                            <Download className="h-4 w-4 text-primary" /> View &amp; Download Contract
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div className="p-3.5 rounded-lg bg-white border border-neutral-300">
                          <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wider">Show Date &amp; Timing</span>
                          <p className="font-bold text-foreground mt-1">{bk.date} • {bk.time}</p>
                        </div>
                        <div className="p-3.5 rounded-lg bg-white border border-neutral-300">
                          <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wider">Location</span>
                          <p className="font-bold text-foreground mt-1">{bk.venue}, {bk.city}</p>
                        </div>
                        <div className="p-3.5 rounded-lg bg-white border border-neutral-300">
                          <span className="text-muted-foreground block text-xs uppercase font-bold tracking-wider">Host Status</span>
                          <p className="font-bold text-foreground mt-1 flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-primary" />{" "}
                            {bk.advancePaid ? "Advance Paid & Locked" : "Awaiting 50% Advance Deposit"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
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

              <div className="panel-card shadow-sm">
                <div className="panel-card-header flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-5 w-1.5 rounded-full bg-primary shrink-0" />
                    <div>
                      <h3 className="font-display text-base sm:text-lg font-extrabold text-foreground uppercase tracking-tight">Host Technical Stage Rider &amp; Hospitality</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Required audio, video, microphone, and backstage parameters for Siddharth Maurya's stage performance.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setRiderModalOpen(true)}
                    className="btn-red !py-2 !px-4 text-xs sm:text-sm cursor-pointer self-start sm:self-auto"
                  >
                    Request Technical Adjustment
                  </button>
                </div>

                <div className="panel-card-body p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {/* Microphones */}
                    <div className="panel-inner-tile p-5 space-y-2">
                      <div className="flex items-center gap-2 text-primary font-bold text-base">
                        <Mic className="h-5 w-5" />
                        <span>Microphone Preference</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                        1x Shure Axient Digital Wireless Handheld (KSM9 or Beta 58 capsule) or Sennheiser Digital 6000. Fresh AA batteries before keynote introduction.
                      </p>
                    </div>

                    {/* IEM & Monitors */}
                    <div className="panel-inner-tile p-5 space-y-2">
                      <div className="flex items-center gap-2 text-foreground font-bold text-base">
                        <Headphones className="h-5 w-5 text-primary" />
                        <span>In-Ear Monitors (IEM) / Stage Cues</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                        Dedicated stage cue feed from console / show director. Two wedge floor stage monitors angled towards emcee podium.
                      </p>
                    </div>

                    {/* Visual Confidence */}
                    <div className="panel-inner-tile p-5 space-y-2">
                      <div className="flex items-center gap-2 text-foreground font-bold text-base">
                        <Sliders className="h-5 w-5 text-primary" />
                        <span>Confidence Monitors &amp; Countdown Timer</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                        Two downstage DSM confidence displays: Left showing current speaker slides / teleprompter, Right showing DStimer speaker countdown clock.
                      </p>
                    </div>

                    {/* Green Room */}
                    <div className="panel-inner-tile p-5 space-y-2">
                      <div className="flex items-center gap-2 text-foreground font-bold text-base">
                        <Building className="h-5 w-5 text-primary" />
                        <span>Green Room Hospitality</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                        Quiet backstage dressing room with mirror, steaming iron, ambient lighting, high-speed WiFi, black tea / warm water, and fresh fruit platter.
                      </p>
                    </div>
                  </div>

                  {riderTickets.length > 0 && (
                    <div className="border-t border-neutral-300 pt-5 space-y-3">
                      <h4 className="font-display text-sm font-extrabold uppercase tracking-wider text-foreground">
                        Submitted Technical Rider Adjustments ({riderTickets.length})
                      </h4>
                      <div className="space-y-2.5">
                        {riderTickets.map((tkt) => (
                          <div
                            key={tkt.id}
                            className="panel-inner-tile p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-primary">{tkt.id}</span>
                                <span className="font-bold text-foreground">{tkt.subject}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{tkt.description}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="rounded-full bg-primary/15 text-primary border border-primary/30 px-2.5 py-0.5 text-xs font-bold">
                                {tkt.priority} Priority
                              </span>
                              <span className="rounded-full bg-muted text-foreground border border-neutral-300 px-2.5 py-0.5 text-xs font-bold">
                                {tkt.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

              <div className="panel-card shadow-sm">
                {/* Organizer Profile Header Card with Avatar Studio */}
                <div className="panel-card-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="h-5 w-1.5 rounded-full bg-primary shrink-0" />
                    <div className="flex items-center gap-3">
                      <div className="relative group">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={contactPerson}
                            className="h-16 w-16 rounded-full object-cover border-2 border-primary shadow"
                          />
                        ) : (
                          <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/20 text-xl font-black text-primary border-2 border-primary/30">
                            {contactPerson.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 text-white shadow hover:scale-110 transition cursor-pointer"
                          title="Change profile photo"
                        >
                          <Camera className="h-3 w-3" />
                        </button>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-lg sm:text-xl font-extrabold text-foreground">{contactPerson}</h3>
                          <span className="rounded-full bg-primary/15 text-primary border border-primary/30 px-2.5 py-0.5 text-xs font-bold">
                            Organizer Account
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{companyName}</p>
                        <p className="text-xs font-mono text-primary mt-0.5">{contactEmail}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-red !py-2 !px-3.5 text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5" /> Upload Photo
                    </button>
                    {user?.avatar && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="btn-outline !py-2 !px-3 text-xs sm:text-sm !border-neutral-300 !text-muted-foreground hover:!bg-white cursor-pointer"
                        title="Remove photo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="panel-card-body p-6 space-y-6">
                  <form onSubmit={handleSaveAccount} className="space-y-4 text-sm">
                    <div>
                      <label className="font-bold text-muted-foreground block mb-1.5">Company / Organization Legal Name</label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
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
                          className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-muted-foreground block mb-1.5">Mobile Phone (WhatsApp Enabled)</label>
                        <input
                          type="text"
                          required
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
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
                          className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-muted-foreground block mb-1.5">GSTIN Number (For Tax Invoices)</label>
                        <input
                          type="text"
                          value={gstNumber}
                          onChange={(e) => setGstNumber(e.target.value)}
                          className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-sm text-foreground font-mono placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button type="submit" className="btn-red !py-2.5 !px-5 text-sm cursor-pointer">
                        Save Account Changes
                      </button>
                    </div>
                  </form>

                  {/* Password / Security Section inside Account */}
                  <div className="border-t border-neutral-300 pt-6 space-y-4">
                    <div className="flex items-center gap-2.5">
                      <KeyRound className="h-5 w-5 text-primary" />
                      <h4 className="font-display text-lg font-extrabold text-foreground">Security &amp; Password</h4>
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
                          <label className="font-bold text-muted-foreground block mb-1.5">Confirm Password</label>
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
                        Update Password &amp; Save
                      </button>
                    </form>
                  </div>
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
                      {newDate && (
                        <p
                          className={`mt-1.5 text-xs font-bold flex items-center gap-1 ${
                            dateConflict ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {dateConflict ? (
                            <>
                              <AlertCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span>
                                Note: {newDate} has a {dateConflict.status.toLowerCase()} lock ({dateConflict.city}). Waitlist / alternate slot applies.
                              </span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span>Date Available for Direct Lock</span>
                            </>
                          )}
                        </p>
                      )}
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

      <ContractModal
        open={Boolean(selectedContract)}
        onClose={() => setSelectedContract(null)}
        booking={
          selectedContract
            ? {
                id: selectedContract.id,
                contractRef: selectedContract.contractRef,
                eventName: selectedContract.eventName,
                clientName: selectedContract.clientName,
                organization: selectedContract.organization,
                date: selectedContract.date,
                time: selectedContract.time,
                venue: selectedContract.venue,
                city: selectedContract.city,
                format: selectedContract.format,
                fee: selectedContract.fee,
                advancePaid: selectedContract.advancePaid,
                gstin: gstNumber,
              }
            : null
        }
        onPayAdvance={(bookingId) => {
          markBookingAdvancePaid(bookingId);
          const refreshed = getStoredBookings();
          setBookings(refreshed);
          const updatedSelected = refreshed.find((b) => b.id === bookingId) || null;
          setSelectedContract(updatedSelected);
        }}
      />

      <TechnicalRiderRequestModal
        open={riderModalOpen}
        onClose={() => setRiderModalOpen(false)}
        userEmail={contactEmail}
        organization={companyName}
        onSubmitRequest={({ subject, priority, description }) => {
          saveSupportTicket({
            userEmail: contactEmail,
            userName: contactPerson,
            organization: companyName,
            subject,
            priority: priority === "Critical" ? "Urgent" : priority,
            description,
          });
          setRiderTickets(getStoredTickets());
        }}
      />
    </div>
  );
}
