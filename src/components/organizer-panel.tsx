import React, { useState } from "react";
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
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Logo } from "@/components/site";

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<OrganizerTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Enquiries state
  const [enquiries, setEnquiries] = useState<OrgEnquiry[]>(INITIAL_ORG_ENQUIRIES);
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

  // Account details state
  const [companyName, setCompanyName] = useState("Apex Global Tech Summits Pvt Ltd");
  const [contactPerson, setContactPerson] = useState(user?.name || "Priya Sharma");
  const [contactEmail, setContactEmail] = useState(user?.email || "priya@techsummit.io");
  const [contactPhone, setContactPhone] = useState("+91 98200 11223");
  const [gstNumber, setGstNumber] = useState("27AABCA1234F1Z5");

  const handleCreateEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName.trim() || !newDate || !newCity.trim()) {
      toast.error("Please fill in event name, target date, and city.");
      return;
    }

    const newEnq: OrgEnquiry = {
      id: `ENQ-ORG-0${enquiries.length + 1}`,
      eventName: newEventName.trim(),
      date: newDate,
      city: newCity.trim(),
      venue: newVenue.trim() || `${newCity.trim()} Convention Centre`,
      format: newFormat,
      crowdSize: newCrowd,
      budget: newBudget,
      status: "Under Review",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setEnquiries([newEnq, ...enquiries]);
    setCreateModalOpen(false);
    setNewEventName("");
    setNewDate("");
    setNewCity("");
    setNewVenue("");
    setNewBrief("");
    toast.success("Stage booking enquiry submitted directly to Siddharth Maurya's team!");
    setActiveTab("enquiries");
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Organizer company and contact preferences updated successfully!");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* ------------------------------------------------------------- */}
      {/* LEFT NAVIGATION SIDEBAR                                       */}
      {/* ------------------------------------------------------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card/95 backdrop-blur-md transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b px-5">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-muted-foreground hover:bg-accent md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Organizer Badge */}
        <div className="px-5 py-3 border-b border-border/60 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5" /> Organiser Portal
            </span>
            <span className="rounded-full bg-emerald-500/20 text-emerald-500 px-2 py-0.5 text-[9px] font-bold">
              Verified
            </span>
          </div>
          <p className="text-xs font-bold text-foreground mt-1 truncate">{user?.name || "Event Organizer"}</p>
          <p className="text-[11px] text-muted-foreground truncate">{user?.organization || "Apex Global Summits"}</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3 text-xs">
          <button
            onClick={() => {
              setActiveTab("overview");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 font-semibold transition ${
              activeTab === "overview"
                ? "bg-amber-500 text-black shadow-md font-bold"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <LayoutDashboard className="h-4 w-4" /> Overview
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("enquiries");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 font-semibold transition ${
              activeTab === "enquiries"
                ? "bg-amber-500 text-black shadow-md font-bold"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Inbox className="h-4 w-4" /> My Enquiries
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-foreground">
              {enquiries.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("bookings");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 font-semibold transition ${
              activeTab === "bookings"
                ? "bg-amber-500 text-black shadow-md font-bold"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <CalendarCheck className="h-4 w-4" /> My Bookings
            </span>
            <span className="rounded-full bg-emerald-500/20 text-emerald-500 px-1.5 py-0.2 text-[9px] font-bold">
              1 Active
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("events");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 font-semibold transition ${
              activeTab === "events"
                ? "bg-amber-500 text-black shadow-md font-bold"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Radio className="h-4 w-4" /> Event Details & Rider
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("account");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 font-semibold transition ${
              activeTab === "account"
                ? "bg-amber-500 text-black shadow-md font-bold"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <User className="h-4 w-4" /> My Accounts
            </span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t p-3 space-y-1 text-xs">
          <Link
            to="/profile"
            className="flex items-center gap-2 rounded-xl px-3 py-2 font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition"
          >
            <User className="h-4 w-4 text-amber-500" />
            <span>Account Settings</span>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl px-3 py-2 font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Back to Public Website</span>
          </Link>

          <button
            onClick={() => {
              logout();
              navigate({ to: "/" });
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-medium text-destructive hover:bg-destructive/10 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTENT AREA                                             */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-16 items-center justify-between border-b bg-card/60 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg border p-2 text-foreground md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-black font-display tracking-tight text-foreground capitalize">
              {activeTab === "overview" && "Organiser Overview"}
              {activeTab === "enquiries" && "My Stage Booking Enquiries"}
              {activeTab === "bookings" && "Confirmed Bookings & Contracts"}
              {activeTab === "events" && "Event Details & Host Tech Rider"}
              {activeTab === "account" && "Company Account & Billing"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="btn-red !py-1.5 !px-3 text-xs flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create New Enquiry</span>
            </button>

            <Link
              to="/profile"
              className="grid h-8 w-8 place-items-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-500 border border-amber-500/40"
              title="My Account"
            >
              PS
            </Link>
          </div>
        </header>

        {/* Tab Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ========================================================= */}
          {/* 1. OVERVIEW VIEW                                          */}
          {/* ========================================================= */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-card to-card p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/15 px-2 py-0.5 rounded">
                    Corporate Partner Portal
                  </span>
                  <h2 className="text-2xl font-black font-display text-foreground mt-1.5">
                    Welcome back, Priya!
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Managing stage hosting requirements for <strong>Apex Global Tech Summits</strong>.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("bookings")}
                    className="btn-outline !py-2 !px-4 text-xs"
                  >
                    View Active Show
                  </button>
                  <button
                    onClick={() => setCreateModalOpen(true)}
                    className="btn-red !py-2 !px-4 text-xs"
                  >
                    + Enquire Another Event
                  </button>
                </div>
              </div>

              {/* Next Event Countdown Card */}
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      Next Confirmed Show
                    </span>
                    <h3 className="text-xl font-bold text-foreground mt-2">
                      Apex Global Tech Summits 2026
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> Jio World Convention Centre, Mumbai
                    </p>
                  </div>

                  <div className="flex items-center gap-4 bg-muted/40 p-3 rounded-xl border">
                    <div className="text-center">
                      <p className="text-xl font-black font-display text-primary">40</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Days Left</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="text-center">
                      <p className="text-xl font-black font-display text-foreground">Dec 14</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Stage Date</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
                  <div className="p-3 rounded-xl bg-background border">
                    <span className="text-muted-foreground block text-[11px]">Host Role:</span>
                    <span className="font-bold text-foreground">Keynote Intro & Panel Moderator</span>
                  </div>
                  <div className="p-3 rounded-xl bg-background border">
                    <span className="text-muted-foreground block text-[11px]">Stage Rider:</span>
                    <span className="font-bold text-emerald-500">Acknowledged & Approved</span>
                  </div>
                  <div className="p-3 rounded-xl bg-background border">
                    <span className="text-muted-foreground block text-[11px]">Run-of-Show Rundown:</span>
                    <span className="font-bold text-amber-500">Draft v2 in Review</span>
                  </div>
                </div>
              </div>

              {/* Status Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Confirmed Stage Dates</span>
                  <p className="text-3xl font-black font-display text-emerald-500 mt-1">1 Show</p>
                  <p className="text-xs text-muted-foreground mt-1">Contract executed & locked</p>
                </div>

                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Pending Inquiries</span>
                  <p className="text-3xl font-black font-display text-amber-500 mt-1">1 Proposal</p>
                  <p className="text-xs text-muted-foreground mt-1">Under commercial review</p>
                </div>

                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Dedicated Emcee Manager</span>
                  <p className="text-lg font-bold text-foreground mt-1">Neha Sharma</p>
                  <p className="text-xs text-muted-foreground mt-1">Direct support hotline available</p>
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
                  <h3 className="text-base font-bold text-foreground">Your Stage Enquiries</h3>
                  <p className="text-xs text-muted-foreground">Track date lock requests and proposals submitted to Siddharth Maurya's management.</p>
                </div>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="btn-red !py-2 !px-4 text-xs flex items-center gap-2 self-start sm:self-auto"
                >
                  <Plus className="h-4 w-4" /> Create New Enquiry
                </button>
              </div>

              <div className="space-y-4">
                {enquiries.map((enq) => (
                  <div key={enq.id} className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary">{enq.id}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              enq.status === "Confirmed"
                                ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                                : enq.status === "Proposal Sent"
                                ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                                : "bg-sky-500/20 text-sky-500 border border-sky-500/30"
                            }`}
                          >
                            {enq.status}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-foreground mt-1">{enq.eventName}</h4>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs text-muted-foreground">Submitted: {enq.createdAt}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Date & City</span>
                        <p className="font-semibold text-foreground mt-0.5">📅 {enq.date} • {enq.city}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Venue</span>
                        <p className="font-semibold text-foreground mt-0.5">{enq.venue}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Format & Crowd</span>
                        <p className="font-semibold text-foreground mt-0.5">{enq.format} ({enq.crowdSize})</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Budget Range</span>
                        <p className="font-mono font-bold text-foreground mt-0.5">{enq.budget}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Create Enquiry Modal */}
              {createModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-lg rounded-2xl border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <h3 className="text-base font-bold text-foreground">Book Siddharth Maurya for an Event</h3>
                        <p className="text-xs text-muted-foreground">Direct booking request from verified organizer account.</p>
                      </div>
                      <button onClick={() => setCreateModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateEnquiry} className="space-y-4 text-xs">
                      <div>
                        <label className="font-bold text-muted-foreground block mb-1">Event Name / Summit Title</label>
                        <input
                          type="text"
                          required
                          value={newEventName}
                          onChange={(e) => setNewEventName(e.target.value)}
                          placeholder="e.g. National Brand Marketing Conclave 2027"
                          className="w-full rounded-xl border border-input bg-background py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-muted-foreground block mb-1">Event Date</label>
                          <input
                            type="date"
                            required
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="w-full rounded-xl border border-input bg-background py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-muted-foreground block mb-1">City</label>
                          <input
                            type="text"
                            required
                            value={newCity}
                            onChange={(e) => setNewCity(e.target.value)}
                            placeholder="e.g. Mumbai, New Delhi, Bengaluru"
                            className="w-full rounded-xl border border-input bg-background py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-muted-foreground block mb-1">Venue Name</label>
                        <input
                          type="text"
                          value={newVenue}
                          onChange={(e) => setNewVenue(e.target.value)}
                          placeholder="e.g. Taj Lands End, Bandra"
                          className="w-full rounded-xl border border-input bg-background py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-muted-foreground block mb-1">Event Format</label>
                          <select
                            value={newFormat}
                            onChange={(e) => setNewFormat(e.target.value)}
                            className="w-full rounded-xl border border-input bg-background py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                          >
                            <option value="Tech Summit & Keynotes">Tech Summit & Keynotes</option>
                            <option value="Corporate Gala & Awards">Corporate Gala & Awards</option>
                            <option value="Product Launch Expo">Product Launch Expo</option>
                            <option value="Music Festival / Arena">Music Festival / Arena</option>
                            <option value="Celebrity Wedding / Sangeet">Celebrity Wedding / Sangeet</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-muted-foreground block mb-1">Expected Crowd Size</label>
                          <select
                            value={newCrowd}
                            onChange={(e) => setNewCrowd(e.target.value)}
                            className="w-full rounded-xl border border-input bg-background py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                          >
                            <option value="100 - 300 VIPs">100 - 300 VIPs</option>
                            <option value="500 - 1,000 Attendees">500 - 1,000 Attendees</option>
                            <option value="1,000 - 3,000 Attendees">1,000 - 3,000 Attendees</option>
                            <option value="5,000+ Stadium / Arena">5,000+ Stadium / Arena</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-muted-foreground block mb-1">Budget Allocation</label>
                        <select
                          value={newBudget}
                          onChange={(e) => setNewBudget(e.target.value)}
                          className="w-full rounded-xl border border-input bg-background py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                        >
                          <option value="₹2,00,000 - ₹3,50,000">₹2,00,000 - ₹3,50,000</option>
                          <option value="₹3,50,000 - ₹5,00,000">₹3,50,000 - ₹5,00,000</option>
                          <option value="₹5,00,000+ Premium">₹5,00,000+ Premium Stage</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-muted-foreground block mb-1">Special Notes / Run of Show Notes</label>
                        <textarea
                          rows={3}
                          value={newBrief}
                          onChange={(e) => setNewBrief(e.target.value)}
                          placeholder="Tell us about your expectations, VIP dignitaries, and stage energy required..."
                          className="w-full rounded-xl border border-input bg-background py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t">
                        <button
                          type="button"
                          onClick={() => setCreateModalOpen(false)}
                          className="btn-outline !py-2 !px-4 text-xs"
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn-red !py-2 !px-4 text-xs">
                          Submit Enquiry Directly
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. MY BOOKINGS VIEW                                       */}
          {/* ========================================================= */}
          {activeTab === "bookings" && (
            <div className="space-y-6">
              <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Executed Booking Agreements</h3>
                    <p className="text-xs text-muted-foreground">Official confirmed stage locks for Siddharth Maurya.</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 text-emerald-500 px-2.5 py-0.5 text-xs font-bold">
                    1 Confirmed Contract
                  </span>
                </div>

                <div className="rounded-xl border border-border/80 bg-background/50 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-emerald-500">REF: SID-CONF-2026-88</span>
                      <h4 className="text-lg font-bold text-foreground mt-0.5">Apex Global Tech Summits 2026</h4>
                      <p className="text-xs text-muted-foreground">Organizer: Apex Global Tech Summits Pvt Ltd</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => toast.success("Downloading Executed Emcee Contract PDF...")}
                        className="btn-outline !py-1.5 !px-3 text-xs flex items-center gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5" /> Download Contract
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-card border">
                      <span className="text-muted-foreground block text-[11px]">Show Date & Timing</span>
                      <p className="font-bold text-foreground mt-0.5">December 14, 2026 • 09:00 AM - 05:30 PM</p>
                    </div>
                    <div className="p-3 rounded-lg bg-card border">
                      <span className="text-muted-foreground block text-[11px]">Location</span>
                      <p className="font-bold text-foreground mt-0.5">Jio World Convention Centre, Mumbai</p>
                    </div>
                    <div className="p-3 rounded-lg bg-card border">
                      <span className="text-muted-foreground block text-[11px]">Host Status</span>
                      <p className="font-bold text-emerald-500 mt-0.5 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Advance Paid & Locked
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
              <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-foreground">Host Technical Stage Rider & Hospitality</h3>
                  <p className="text-xs text-muted-foreground">
                    Required audio, video, microphone, and backstage parameters for Siddharth Maurya's stage performance.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Microphones */}
                  <div className="rounded-xl border p-4 bg-background/50 space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <Mic className="h-4 w-4" />
                      <span>Microphone Preference</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      1x Shure Axient Digital Wireless Handheld (KSM9 or Beta 58 capsule) or Sennheiser Digital 6000. Fresh AA batteries before keynote introduction.
                    </p>
                  </div>

                  {/* IEM & Monitors */}
                  <div className="rounded-xl border p-4 bg-background/50 space-y-2">
                    <div className="flex items-center gap-2 text-amber-500 font-bold">
                      <Headphones className="h-4 w-4" />
                      <span>In-Ear Monitors (IEM) / Stage Cues</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Dedicated stage cue feed from console / show director. Two wedge floor stage monitors angled towards emcee podium.
                    </p>
                  </div>

                  {/* Visual Confidence */}
                  <div className="rounded-xl border p-4 bg-background/50 space-y-2">
                    <div className="flex items-center gap-2 text-sky-500 font-bold">
                      <Sliders className="h-4 w-4" />
                      <span>Confidence Monitors & Countdown Timer</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Two downstage DSM confidence displays: Left showing current speaker slides / teleprompter, Right showing DStimer speaker countdown clock.
                    </p>
                  </div>

                  {/* Green Room */}
                  <div className="rounded-xl border p-4 bg-background/50 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-500 font-bold">
                      <Building className="h-4 w-4" />
                      <span>Green Room Hospitality</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Quiet backstage dressing room with mirror, steaming iron, ambient lighting, high-speed WiFi, black tea / warm water, and fresh fruit platter.
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Need custom rider adjustments?</span>
                  <button
                    onClick={() => toast.info("Your question has been sent to Sid's technical producer.")}
                    className="btn-outline !py-1.5 !px-3 text-xs"
                  >
                    Request Technical Adjustment
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. MY ACCOUNTS VIEW                                       */}
          {/* ========================================================= */}
          {activeTab === "account" && (
            <div className="space-y-6 max-w-3xl">
              <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-5">
                <div>
                  <h3 className="text-base font-bold text-foreground">Company & Billing Profile</h3>
                  <p className="text-xs text-muted-foreground">Keep your contact information and GST invoicing details up to date.</p>
                </div>

                <form onSubmit={handleSaveAccount} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-muted-foreground block mb-1">Company / Organization Legal Name</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-muted-foreground block mb-1">Primary Event Lead</label>
                      <input
                        type="text"
                        required
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-muted-foreground block mb-1">Mobile Phone (WhatsApp Active)</label>
                      <input
                        type="text"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-muted-foreground block mb-1">Official Email Address</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-muted-foreground block mb-1">GSTIN Number (For Tax Invoice)</label>
                      <input
                        type="text"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button type="submit" className="btn-red !py-2 !px-4 text-xs">
                      Save Account Changes
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
