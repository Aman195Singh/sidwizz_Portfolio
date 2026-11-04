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
  Lock,
  ShieldCheck,
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

  // Account details state (Merged Account & Profile for Organizer)
  const [companyName, setCompanyName] = useState("Apex Global Tech Summits Pvt Ltd");
  const [contactPerson, setContactPerson] = useState(user?.name || "Priya Sharma");
  const [contactEmail, setContactEmail] = useState(user?.email || "priya@techsummit.io");
  const [contactPhone, setContactPhone] = useState("+91 98200 11223");
  const [gstNumber, setGstNumber] = useState("27AABCA1234F1Z5");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

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
    toast.success("Stage booking enquiry submitted directly to Siddharth Maurya's management team!");
    setActiveTab("enquiries");
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Organizer company and contact preferences updated successfully!");
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in both current and new password.");
      return;
    }
    toast.success("Organizer account password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
  };

  return (
    <div className="flex min-h-screen bg-black text-white font-sans antialiased selection:bg-primary selection:text-white">
      {/* ------------------------------------------------------------- */}
      {/* LEFT NAVIGATION SIDEBAR                                       */}
      {/* ------------------------------------------------------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800 bg-zinc-950/95 backdrop-blur-md transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-5">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Organizer Badge */}
        <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5 text-primary" /> Organiser Portal
            </span>
            <span className="rounded-full bg-white/10 text-white border border-zinc-700 px-2 py-0.5 text-[9px] font-bold">
              Verified
            </span>
          </div>
          <p className="text-xs font-bold text-white mt-1 truncate">{user?.name || "Event Organizer"}</p>
          <p className="text-[11px] text-zinc-400 truncate">{user?.organization || "Apex Global Summits"}</p>
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
                ? "bg-primary text-white shadow-md font-bold"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
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
                ? "bg-primary text-white shadow-md font-bold"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Inbox className="h-4 w-4" /> My Enquiries
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-white">
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
                ? "bg-primary text-white shadow-md font-bold"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <CalendarCheck className="h-4 w-4" /> My Bookings
            </span>
            <span className="rounded-full bg-white/10 text-white border border-zinc-700 px-1.5 py-0.2 text-[9px] font-bold">
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
                ? "bg-primary text-white shadow-md font-bold"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
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
                ? "bg-primary text-white shadow-md font-bold"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <User className="h-4 w-4" /> My Accounts
            </span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-zinc-800 p-3 space-y-1 text-xs">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl px-3 py-2 font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
          >
            <ExternalLink className="h-4 w-4 text-primary" />
            <span>Back to Public Website</span>
          </Link>

          <button
            onClick={() => {
              logout();
              navigate({ to: "/" });
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-medium text-zinc-400 hover:bg-primary/20 hover:text-primary transition"
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
        <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg border border-zinc-800 p-2 text-white md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-black font-display tracking-tight text-white capitalize">
              {activeTab === "overview" && "Organiser Overview"}
              {activeTab === "enquiries" && "My Stage Booking Enquiries"}
              {activeTab === "bookings" && "Confirmed Bookings & Contracts"}
              {activeTab === "events" && "Event Details & Host Tech Rider"}
              {activeTab === "account" && "Company Account & Lead Profile"}
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

            <button
              onClick={() => setActiveTab("account")}
              className="grid h-8 w-8 place-items-center rounded-full bg-primary/20 text-xs font-bold text-primary border border-primary/40 hover:bg-primary hover:text-white transition"
              title="My Account"
            >
              PS
            </button>
          </div>
        </header>

        {/* Tab Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-black">
          {/* ========================================================= */}
          {/* 1. OVERVIEW VIEW                                          */}
          {/* ========================================================= */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 rounded">
                    Corporate Partner Portal
                  </span>
                  <h2 className="text-2xl font-black font-display text-white mt-2">
                    Welcome back, Priya!
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Managing stage hosting requirements for <strong className="text-white">Apex Global Tech Summits</strong>.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("bookings")}
                    className="btn-outline !py-2 !px-4 text-xs !border-zinc-700 !text-white hover:!bg-zinc-800"
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
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-white/10 px-2 py-0.5 rounded border border-zinc-700">
                      Next Confirmed Show
                    </span>
                    <h3 className="text-xl font-bold text-white mt-2">
                      Apex Global Tech Summits 2026
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> Jio World Convention Centre, Mumbai
                    </p>
                  </div>

                  <div className="flex items-center gap-4 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
                    <div className="text-center">
                      <p className="text-xl font-black font-display text-primary">40</p>
                      <p className="text-[10px] text-zinc-400 uppercase font-bold">Days Left</p>
                    </div>
                    <div className="h-8 w-px bg-zinc-800" />
                    <div className="text-center">
                      <p className="text-xl font-black font-display text-white">Dec 14</p>
                      <p className="text-[10px] text-zinc-400 uppercase font-bold">Stage Date</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
                  <div className="p-3 rounded-xl bg-black border border-zinc-800">
                    <span className="text-zinc-500 block text-[11px]">Host Role:</span>
                    <span className="font-bold text-white">Keynote Intro & Panel Moderator</span>
                  </div>
                  <div className="p-3 rounded-xl bg-black border border-zinc-800">
                    <span className="text-zinc-500 block text-[11px]">Stage Rider:</span>
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Acknowledged & Approved
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-black border border-zinc-800">
                    <span className="text-zinc-500 block text-[11px]">Run-of-Show Rundown:</span>
                    <span className="font-bold text-zinc-300">Draft v2 in Review</span>
                  </div>
                </div>
              </div>

              {/* Status Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-sm">
                  <span className="text-xs font-bold text-zinc-400 uppercase">Confirmed Stage Dates</span>
                  <p className="text-3xl font-black font-display text-white mt-1">1 Show</p>
                  <p className="text-xs text-zinc-500 mt-1">Contract executed & locked</p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-sm">
                  <span className="text-xs font-bold text-zinc-400 uppercase">Pending Inquiries</span>
                  <p className="text-3xl font-black font-display text-primary mt-1">1 Proposal</p>
                  <p className="text-xs text-zinc-500 mt-1">Under commercial review</p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-sm">
                  <span className="text-xs font-bold text-zinc-400 uppercase">Dedicated Emcee Manager</span>
                  <p className="text-lg font-bold text-white mt-1">Neha Sharma</p>
                  <p className="text-xs text-zinc-500 mt-1">Direct support hotline available</p>
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
                  <h3 className="text-base font-bold text-white">Your Stage Enquiries</h3>
                  <p className="text-xs text-zinc-400">Track date lock requests and proposals submitted to Siddharth Maurya's management.</p>
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
                  <div key={enq.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary">{enq.id}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              enq.status === "Confirmed"
                                ? "bg-white/10 text-white border border-zinc-700"
                                : "bg-primary/20 text-primary border border-primary/30"
                            }`}
                          >
                            {enq.status}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-1">{enq.eventName}</h4>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs text-zinc-400">Submitted: {enq.createdAt}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-zinc-500 block text-[11px]">Date & City</span>
                        <p className="font-semibold text-white mt-0.5">📅 {enq.date} • {enq.city}</p>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[11px]">Venue</span>
                        <p className="font-semibold text-white mt-0.5">{enq.venue}</p>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[11px]">Format & Crowd</span>
                        <p className="font-semibold text-white mt-0.5">{enq.format} ({enq.crowdSize})</p>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[11px]">Budget Range</span>
                        <p className="font-mono font-bold text-primary mt-0.5">{enq.budget}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Create Enquiry Modal */}
              {createModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <div>
                        <h3 className="text-base font-bold text-white">Book Siddharth Maurya for an Event</h3>
                        <p className="text-xs text-zinc-400">Direct booking request from verified organizer account.</p>
                      </div>
                      <button onClick={() => setCreateModalOpen(false)} className="text-zinc-400 hover:text-white">
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateEnquiry} className="space-y-4 text-xs">
                      <div>
                        <label className="font-bold text-zinc-400 block mb-1">Event Name / Summit Title</label>
                        <input
                          type="text"
                          required
                          value={newEventName}
                          onChange={(e) => setNewEventName(e.target.value)}
                          placeholder="e.g. National Brand Marketing Conclave 2027"
                          className="w-full rounded-xl border border-zinc-800 bg-black py-2 px-3 text-xs text-white placeholder:text-zinc-600 focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-zinc-400 block mb-1">Event Date</label>
                          <input
                            type="date"
                            required
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="w-full rounded-xl border border-zinc-800 bg-black py-2 px-3 text-xs text-white focus:border-primary focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-zinc-400 block mb-1">City</label>
                          <input
                            type="text"
                            required
                            value={newCity}
                            onChange={(e) => setNewCity(e.target.value)}
                            placeholder="e.g. Mumbai, New Delhi, Bengaluru"
                            className="w-full rounded-xl border border-zinc-800 bg-black py-2 px-3 text-xs text-white placeholder:text-zinc-600 focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-zinc-400 block mb-1">Venue Name</label>
                        <input
                          type="text"
                          value={newVenue}
                          onChange={(e) => setNewVenue(e.target.value)}
                          placeholder="e.g. Taj Lands End, Bandra"
                          className="w-full rounded-xl border border-zinc-800 bg-black py-2 px-3 text-xs text-white placeholder:text-zinc-600 focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-zinc-400 block mb-1">Event Format</label>
                          <select
                            value={newFormat}
                            onChange={(e) => setNewFormat(e.target.value)}
                            className="w-full rounded-xl border border-zinc-800 bg-black py-2 px-3 text-xs text-white focus:border-primary focus:outline-none"
                          >
                            <option value="Tech Summit & Keynotes">Tech Summit & Keynotes</option>
                            <option value="Corporate Gala & Awards">Corporate Gala & Awards</option>
                            <option value="Product Launch Expo">Product Launch Expo</option>
                            <option value="Music Festival / Arena">Music Festival / Arena</option>
                            <option value="Celebrity Wedding / Sangeet">Celebrity Wedding / Sangeet</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-zinc-400 block mb-1">Expected Crowd Size</label>
                          <select
                            value={newCrowd}
                            onChange={(e) => setNewCrowd(e.target.value)}
                            className="w-full rounded-xl border border-zinc-800 bg-black py-2 px-3 text-xs text-white focus:border-primary focus:outline-none"
                          >
                            <option value="100 - 300 VIPs">100 - 300 VIPs</option>
                            <option value="500 - 1,000 Attendees">500 - 1,000 Attendees</option>
                            <option value="1,000 - 3,000 Attendees">1,000 - 3,000 Attendees</option>
                            <option value="5,000+ Stadium / Arena">5,000+ Stadium / Arena</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-zinc-400 block mb-1">Budget Allocation</label>
                        <select
                          value={newBudget}
                          onChange={(e) => setNewBudget(e.target.value)}
                          className="w-full rounded-xl border border-zinc-800 bg-black py-2 px-3 text-xs text-white focus:border-primary focus:outline-none"
                        >
                          <option value="₹2,00,000 - ₹3,50,000">₹2,00,000 - ₹3,50,000</option>
                          <option value="₹3,50,000 - ₹5,00,000">₹3,50,000 - ₹5,00,000</option>
                          <option value="₹5,00,000+ Premium">₹5,00,000+ Premium Stage</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-zinc-400 block mb-1">Special Notes / Run of Show Notes</label>
                        <textarea
                          rows={3}
                          value={newBrief}
                          onChange={(e) => setNewBrief(e.target.value)}
                          placeholder="Tell us about your expectations, VIP dignitaries, and stage energy required..."
                          className="w-full rounded-xl border border-zinc-800 bg-black py-2 px-3 text-xs text-white placeholder:text-zinc-600 focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                        <button
                          type="button"
                          onClick={() => setCreateModalOpen(false)}
                          className="btn-outline !py-2 !px-4 text-xs !border-zinc-700 !text-white hover:!bg-zinc-800"
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
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Executed Booking Agreements</h3>
                    <p className="text-xs text-zinc-400">Official confirmed stage locks for Siddharth Maurya.</p>
                  </div>
                  <span className="rounded-full bg-white/10 text-white border border-zinc-700 px-2.5 py-0.5 text-xs font-bold">
                    1 Confirmed Contract
                  </span>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-black p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-primary">REF: SID-CONF-2026-88</span>
                      <h4 className="text-lg font-bold text-white mt-0.5">Apex Global Tech Summits 2026</h4>
                      <p className="text-xs text-zinc-400">Organizer: Apex Global Tech Summits Pvt Ltd</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => toast.success("Downloading Executed Emcee Contract PDF...")}
                        className="btn-outline !py-1.5 !px-3 text-xs !border-zinc-700 !text-white hover:!bg-zinc-800 flex items-center gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5 text-primary" /> Download Contract
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                      <span className="text-zinc-500 block text-[11px]">Show Date & Timing</span>
                      <p className="font-bold text-white mt-0.5">December 14, 2026 • 09:00 AM - 05:30 PM</p>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                      <span className="text-zinc-500 block text-[11px]">Location</span>
                      <p className="font-bold text-white mt-0.5">Jio World Convention Centre, Mumbai</p>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                      <span className="text-zinc-500 block text-[11px]">Host Status</span>
                      <p className="font-bold text-white mt-0.5 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Advance Paid & Locked
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
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Host Technical Stage Rider & Hospitality</h3>
                  <p className="text-xs text-zinc-400">
                    Required audio, video, microphone, and backstage parameters for Siddharth Maurya's stage performance.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Microphones */}
                  <div className="rounded-xl border border-zinc-800 p-4 bg-black space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <Mic className="h-4 w-4" />
                      <span>Microphone Preference</span>
                    </div>
                    <p className="text-zinc-400 leading-relaxed">
                      1x Shure Axient Digital Wireless Handheld (KSM9 or Beta 58 capsule) or Sennheiser Digital 6000. Fresh AA batteries before keynote introduction.
                    </p>
                  </div>

                  {/* IEM & Monitors */}
                  <div className="rounded-xl border border-zinc-800 p-4 bg-black space-y-2">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <Headphones className="h-4 w-4 text-primary" />
                      <span>In-Ear Monitors (IEM) / Stage Cues</span>
                    </div>
                    <p className="text-zinc-400 leading-relaxed">
                      Dedicated stage cue feed from console / show director. Two wedge floor stage monitors angled towards emcee podium.
                    </p>
                  </div>

                  {/* Visual Confidence */}
                  <div className="rounded-xl border border-zinc-800 p-4 bg-black space-y-2">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <Sliders className="h-4 w-4 text-primary" />
                      <span>Confidence Monitors & Countdown Timer</span>
                    </div>
                    <p className="text-zinc-400 leading-relaxed">
                      Two downstage DSM confidence displays: Left showing current speaker slides / teleprompter, Right showing DStimer speaker countdown clock.
                    </p>
                  </div>

                  {/* Green Room */}
                  <div className="rounded-xl border border-zinc-800 p-4 bg-black space-y-2">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <Building className="h-4 w-4 text-primary" />
                      <span>Green Room Hospitality</span>
                    </div>
                    <p className="text-zinc-400 leading-relaxed">
                      Quiet backstage dressing room with mirror, steaming iron, ambient lighting, high-speed WiFi, black tea / warm water, and fresh fruit platter.
                    </p>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-4 flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Need custom rider adjustments?</span>
                  <button
                    onClick={() => toast.info("Your question has been sent to Sid's technical producer.")}
                    className="btn-outline !py-1.5 !px-3 text-xs !border-zinc-700 !text-white hover:!bg-zinc-800"
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
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Company & Organizer Account Profile</h3>
                  <p className="text-xs text-zinc-400">Keep your billing legal information, primary coordinator details, and account credentials synchronized.</p>
                </div>

                <form onSubmit={handleSaveAccount} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-zinc-400 block mb-1">Company / Organization Legal Name</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-black py-2.5 px-3 text-xs text-white placeholder:text-zinc-600 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-zinc-400 block mb-1">Primary Event Coordinator</label>
                      <input
                        type="text"
                        required
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-black py-2.5 px-3 text-xs text-white placeholder:text-zinc-600 focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-zinc-400 block mb-1">Mobile Phone (WhatsApp Enabled)</label>
                      <input
                        type="text"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-black py-2.5 px-3 text-xs text-white placeholder:text-zinc-600 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-zinc-400 block mb-1">Official Work Email Address</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-black py-2.5 px-3 text-xs text-white placeholder:text-zinc-600 focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-zinc-400 block mb-1">GSTIN Number (For Tax Invoices)</label>
                      <input
                        type="text"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-black py-2.5 px-3 text-xs text-white font-mono placeholder:text-zinc-600 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button type="submit" className="btn-red !py-2.5 !px-5 text-xs">
                      Save Account Changes
                    </button>
                  </div>
                </form>

                {/* Password / Security Section inside Account */}
                <div className="border-t border-zinc-800 pt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-bold text-white">Security & Password</h4>
                  </div>
                  <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-zinc-400 block mb-1">Current Password</label>
                        <input
                          type="password"
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
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-zinc-800 bg-black py-2 px-3 text-xs text-white focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="btn-outline !py-2 !px-4 text-xs !border-zinc-700 !text-white hover:!bg-zinc-800"
                    >
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
