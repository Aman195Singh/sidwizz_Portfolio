import React, { useState, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  Inbox,
  Layers,
  MapPin,
  MessageCircle,
  Plus,
  QrCode,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  X,
  AlertTriangle,
  CreditCard,
  Printer,
  ChevronRight,
  Check,
  RotateCcw,
  Volume2,
  Radio,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getBookingRequests,
  getConfirmedBookings,
  getManagedEvents,
  getAttendeeTickets,
  getCalendarSlots,
  updateBookingRequestStatus,
  sendBookingMessage,
  sendQuoteForBooking,
  confirmBookingAndCreateEvent,
  recordAdvancePayment,
  updateEventSettings,
  updateRunSheetStatus,
  validateAndCheckInTicket,
  type BookingRequest,
  type ConfirmedBookingRecord,
  type ManagedEventRecord,
  type AttendeeTicketRecord,
  type CalendarSlotRecord,
  type BookingRequestStatus,
} from "@/lib/booking-store";
import { ContractModal } from "@/components/LiveBookingAndModals";

export type AdminBookingTab =
  | "dashboard"
  | "requests"
  | "bookings"
  | "calendar"
  | "events"
  | "attendees"
  | "analytics"
  | "settings";

export function AdminBookingWorkspace() {
  const [activeTab, setActiveTab] = useState<AdminBookingTab>("dashboard");

  // State synchronized with booking store
  const [requests, setRequests] = useState<BookingRequest[]>(getBookingRequests);
  const [confirmedBookings, setConfirmedBookings] = useState<ConfirmedBookingRecord[]>(getConfirmedBookings);
  const [managedEvents, setManagedEvents] = useState<ManagedEventRecord[]>(getManagedEvents);
  const [attendeeTickets, setAttendeeTickets] = useState<AttendeeTicketRecord[]>(getAttendeeTickets);
  const [calendarSlots, setCalendarSlots] = useState<CalendarSlotRecord[]>(getCalendarSlots);

  useEffect(() => {
    const handleSync = () => {
      setRequests(getBookingRequests());
      setConfirmedBookings(getConfirmedBookings());
      setManagedEvents(getManagedEvents());
      setAttendeeTickets(getAttendeeTickets());
      setCalendarSlots(getCalendarSlots());
    };
    window.addEventListener("siddwhizz_booking_system_updated", handleSync);
    return () => window.removeEventListener("siddwhizz_booking_system_updated", handleSync);
  }, []);

  // Filter & Search states for Requests
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Detail Modal / Drawer state for a request
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);

  // Quote Builder form state
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [hostingFee, setHostingFee] = useState("₹4,00,000");
  const [travelLodging, setTravelLodging] = useState("Organizer Provided (5-Star Hotel + Flight)");
  const [techRiderFee, setTechRiderFee] = useState("₹50,000");
  const [quoteValidUntil, setQuoteValidUntil] = useState("2026-12-10");

  // Discussion message text inside drawer
  const [replyMessage, setReplyMessage] = useState("");

  // Contract Modal view
  const [viewContractBooking, setViewContractBooking] = useState<ConfirmedBookingRecord | null>(null);

  // QR Ticket Scanner Simulator
  const [scannerInput, setScannerInput] = useState("");
  const [scanResult, setScanResult] = useState<{
    valid: boolean;
    ticket?: AttendeeTicketRecord;
    message: string;
    status: string;
  } | null>(null);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        searchQuery === "" ||
        r.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === "All" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [requests, searchQuery, statusFilter]);

  // Handle Send Quote
  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    const totalAmount = `₹${(
      (parseInt(hostingFee.replace(/\D/g, "")) || 400000) +
      (parseInt(techRiderFee.replace(/\D/g, "")) || 50000)
    ).toLocaleString("en-IN")}`;
    const advanceDeposit = `₹${(
      Math.round(
        ((parseInt(hostingFee.replace(/\D/g, "")) || 400000) +
          (parseInt(techRiderFee.replace(/\D/g, "")) || 50000)) /
          2
      )
    ).toLocaleString("en-IN")}`;

    sendQuoteForBooking(selectedRequest.id, {
      hostingFee,
      travelLodging,
      techRiderFee,
      totalAmount,
      advanceDeposit,
      validUntil: quoteValidUntil,
    });

    toast.success(`Commercial Quote sent to ${selectedRequest.organization} (${totalAmount})!`);
    setQuoteModalOpen(false);
    // Refresh active request in drawer
    const updated = getBookingRequests().find((r) => r.id === selectedRequest.id);
    if (updated) setSelectedRequest(updated);
  };

  // Handle Discussion Reply
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !replyMessage.trim()) return;
    sendBookingMessage(selectedRequest.id, "admin", "Siddharth Maurya (Admin)", replyMessage.trim());
    setReplyMessage("");
    toast.success("Message sent to organizer.");
    const updated = getBookingRequests().find((r) => r.id === selectedRequest.id);
    if (updated) setSelectedRequest(updated);
  };

  // Handle Approve Request
  const handleApprove = (reqId: string) => {
    updateBookingRequestStatus(reqId, "Approved", "Request approved by Siddharth Maurya. Terms accepted.");
    toast.success(`Booking request ${reqId} marked as Approved.`);
    if (selectedRequest?.id === reqId) {
      const updated = getBookingRequests().find((r) => r.id === reqId);
      if (updated) setSelectedRequest(updated);
    }
  };

  // Handle Confirm Booking & Lock Calendar Slot
  const handleConfirmAndLock = (reqId: string) => {
    const res = confirmBookingAndCreateEvent(reqId);
    if (res.success) {
      toast.success(`Stage booking confirmed! Contract ${res.contractRef} executed and calendar date permanently locked.`);
      if (selectedRequest?.id === reqId) {
        const updated = getBookingRequests().find((r) => r.id === reqId);
        if (updated) setSelectedRequest(updated);
      }
    } else {
      toast.error(res.error || "Failed to confirm booking.");
    }
  };

  // Handle QR Check-in scan test
  const handleSimulateScan = (tId: string) => {
    const res = validateAndCheckInTicket(tId);
    setScanResult(res);
    if (res.valid) {
      toast.success(res.message);
    } else if (res.status === "Already Checked In") {
      toast.warning(res.message);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & WORKSPACE TITLE                                */}
      {/* ============================================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-primary">// HOST & STAGE BOOKINGS</span>
            <span className="h-1 w-6 bg-primary rounded-full hidden sm:inline-block" />
          </div>
          <h2 className="display text-2xl sm:text-3xl text-foreground mt-1">
            BOOKING <span className="text-primary">MANAGEMENT.</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            End-to-end stage booking requests, quotes, calendar lock, event run sheets &amp; attendee QR ticketing.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("requests")}
            className="btn-red !py-2 !px-4 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Review Requests ({requests.filter((r) => r.status === "Submitted" || r.status === "Under Review").length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("calendar")}
            className="btn-outline !py-2 !px-4 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="h-4 w-4 text-primary" />
            <span>Calendar Schedule</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. HORIZONTAL TAB NAVIGATION (Matching Blueprint & PDF Spec)   */}
      {/* ============================================================== */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-border/80 pb-2">
        {[
          { id: "dashboard", label: "Dashboard", icon: Layers },
          { id: "requests", label: "Requests", icon: Inbox, badge: requests.filter((r) => r.status === "Submitted" || r.status === "Under Review").length },
          { id: "bookings", label: "Bookings", icon: CheckCircle2, badge: confirmedBookings.length },
          { id: "calendar", label: "Calendar", icon: Calendar },
          { id: "events", label: "Events & Run Sheet", icon: Volume2 },
          { id: "attendees", label: "Attendees & QR Entry", icon: QrCode },
          { id: "analytics", label: "Booking Analytics", icon: TrendingUp },
          { id: "settings", label: "Settings & Rates", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as AdminBookingTab)}
              className={`shrink-0 flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border border-border/80 text-muted-foreground hover:bg-neutral-100 hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {Boolean(tab.badge && tab.badge > 0) && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                    isActive ? "bg-white text-primary" : "bg-primary text-primary-foreground"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: DASHBOARD OVERVIEW                                      */}
      {/* ============================================================== */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Top 5 KPI Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <div className="panel-card shadow-sm hover:border-primary/50 transition">
              <div className="panel-card-header !py-2.5 !px-3.5 flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Total Requests</span>
                <Inbox className="h-4 w-4 text-primary" />
              </div>
              <div className="panel-card-body !p-3.5">
                <p className="text-2xl font-black font-display text-foreground">48</p>
                <p className="text-[11px] font-bold text-emerald-600 mt-0.5">↑ 18.2% this quarter</p>
              </div>
            </div>

            <div className="panel-card shadow-sm hover:border-primary/50 transition">
              <div className="panel-card-header !py-2.5 !px-3.5 flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Confirmed</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="panel-card-body !p-3.5">
                <p className="text-2xl font-black font-display text-foreground">32</p>
                <p className="text-[11px] font-bold text-emerald-600 mt-0.5">↑ 10% stage dates locked</p>
              </div>
            </div>

            <div className="panel-card shadow-sm hover:border-primary/50 transition">
              <div className="panel-card-header !py-2.5 !px-3.5 flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Upcoming Events</span>
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="panel-card-body !p-3.5">
                <p className="text-2xl font-black font-display text-foreground">6</p>
                <p className="text-[11px] font-bold text-primary mt-0.5">Next in 18 days</p>
              </div>
            </div>

            <div className="panel-card shadow-sm hover:border-primary/50 transition">
              <div className="panel-card-header !py-2.5 !px-3.5 flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Total Attendees</span>
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="panel-card-body !p-3.5">
                <p className="text-2xl font-black font-display text-foreground">2,480</p>
                <p className="text-[11px] font-bold text-emerald-600 mt-0.5">↑ 27% reach</p>
              </div>
            </div>

            <div className="panel-card shadow-sm hover:border-primary/50 transition col-span-2 sm:col-span-1">
              <div className="panel-card-header !py-2.5 !px-3.5 flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Booked Value</span>
                <CreditCard className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="panel-card-body !p-3.5">
                <p className="text-2xl font-black font-display text-emerald-600">₹48.5L</p>
                <p className="text-[11px] font-bold text-muted-foreground mt-0.5">92% repeat client rate</p>
              </div>
            </div>
          </div>

          {/* Charts Row: Booking Trend (30 Days) + Events by Type Donut */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left: Booking Trend Chart - 8 cols */}
            <div className="panel-card shadow-sm lg:col-span-8 flex flex-col justify-between">
              <div className="panel-card-header flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-4 w-1.5 rounded-full bg-primary" />
                  <h3 className="font-display text-sm font-extrabold uppercase tracking-tight text-foreground">
                    Booking Trend (Last 30 Days)
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-primary">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    Requests Received
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                    Confirmed Shows
                  </span>
                </div>
              </div>

              <div className="panel-card-body p-5 flex-1 flex flex-col justify-end">
                {/* SVG Curves */}
                <div className="relative h-44 w-full">
                  <svg viewBox="0 0 500 160" className="h-full w-full">
                    {/* Horizontal lines */}
                    {[0, 10, 20, 30, 40].map((v, i) => (
                      <line
                        key={v}
                        x1="30"
                        y1={140 - i * 30}
                        x2="480"
                        y2={140 - i * 30}
                        stroke="#e2e8f0"
                        strokeDasharray={i === 0 ? "none" : "3 3"}
                        strokeWidth="1"
                      />
                    ))}

                    {/* Requests curve (Primary Red) */}
                    <path
                      d="M 30 110 Q 90 70 150 85 T 270 40 T 390 60 T 480 30"
                      fill="none"
                      stroke="#e11d48"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Confirmed curve (Emerald Green) */}
                    <path
                      d="M 30 130 Q 90 100 150 110 T 270 70 T 390 80 T 480 50"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Dots */}
                    <circle cx="270" cy="40" r="4" fill="#e11d48" stroke="#ffffff" strokeWidth="2" />
                    <circle cx="270" cy="70" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                    <circle cx="480" cy="30" r="4" fill="#e11d48" stroke="#ffffff" strokeWidth="2" />
                    <circle cx="480" cy="50" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                  </svg>
                </div>

                <div className="flex justify-between text-[10px] text-muted-foreground font-bold border-t border-neutral-200 pt-2 mt-2">
                  <span>01 Jul</span>
                  <span>08 Jul</span>
                  <span>15 Jul</span>
                  <span>22 Jul</span>
                  <span>30 Jul</span>
                </div>
              </div>
            </div>

            {/* Right: Events by Type Donut - 4 cols */}
            <div className="panel-card shadow-sm lg:col-span-4 flex flex-col justify-between">
              <div className="panel-card-header flex items-center gap-2">
                <span className="h-4 w-1.5 rounded-full bg-primary" />
                <h3 className="font-display text-sm font-extrabold uppercase tracking-tight text-foreground">
                  Events by Type
                </h3>
              </div>

              <div className="panel-card-body p-5 flex flex-col items-center justify-center space-y-4">
                <div className="relative grid h-36 w-36 place-items-center">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    <circle cx="50" cy="50" r="36" fill="none" stroke="#64748b" strokeWidth="12" strokeDasharray="226.19" strokeDashoffset="0" />
                    <circle cx="50" cy="50" r="36" fill="none" stroke="#f59e0b" strokeWidth="12" strokeDasharray="226.19" strokeDashoffset="27" />
                    <circle cx="50" cy="50" r="36" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray="226.19" strokeDashoffset="63" />
                    <circle cx="50" cy="50" r="36" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="226.19" strokeDashoffset="122" />
                    <circle cx="50" cy="50" r="36" fill="none" stroke="#e11d48" strokeWidth="12" strokeDasharray="226.19" strokeDashoffset="180" />
                  </svg>
                  <div className="absolute text-center leading-tight">
                    <p className="text-xl font-black font-display text-foreground">32</p>
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Shows</p>
                  </div>
                </div>

                <div className="w-full space-y-1.5 text-xs">
                  <div className="flex justify-between font-semibold"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Corporate Gala</span> <span className="font-mono">38%</span></div>
                  <div className="flex justify-between font-semibold"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Tech Summit</span> <span className="font-mono">26%</span></div>
                  <div className="flex justify-between font-semibold"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> Product Launch</span> <span className="font-mono">16%</span></div>
                  <div className="flex justify-between font-semibold"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Music Festival</span> <span className="font-mono">12%</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Booking Requests Table + Quick Action Buttons */}
          <div className="panel-card shadow-sm">
            <div className="panel-card-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-4 w-1.5 rounded-full bg-primary" />
                <h3 className="font-display text-sm sm:text-base font-extrabold uppercase tracking-tight text-foreground">
                  Recent Booking Requests
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("requests")}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All Requests</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="panel-card-body p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100/70 border-b border-neutral-200 text-muted-foreground font-extrabold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Request ID</th>
                    <th className="py-2.5 px-4">Event Name &amp; Client</th>
                    <th className="py-2.5 px-4">Event Date</th>
                    <th className="py-2.5 px-4">Venue &amp; City</th>
                    <th className="py-2.5 px-4">Format</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {requests.slice(0, 5).map((req) => (
                    <tr key={req.id} className="hover:bg-neutral-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{req.id}</td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-foreground">{req.eventName}</p>
                        <p className="text-[11px] text-muted-foreground">{req.organization}</p>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold">{req.date}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-foreground truncate max-w-[160px]">{req.venue}</p>
                        <p className="text-[11px] text-muted-foreground">{req.city}</p>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{req.eventType}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 font-bold text-[11px] ${
                            req.status === "Confirmed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : req.status === "Under Review" || req.status === "Submitted"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : req.status === "Quotation Shared"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-neutral-100 text-neutral-700 border border-neutral-300"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRequest(req);
                          }}
                          className="btn-outline !py-1 !px-2.5 text-xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Review</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: REQUESTS QUEUE & REVIEW WORKSPACE                       */}
      {/* ============================================================== */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search requests by event, client, city, or ID..."
                className="w-full rounded-xl border border-neutral-300 bg-white py-2 pl-10 pr-4 text-xs text-foreground focus:border-primary focus:outline-none shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {["All", "Submitted", "Under Review", "Quotation Shared", "Approved", "Confirmed"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    statusFilter === st
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border border-neutral-300 bg-white text-muted-foreground hover:bg-neutral-100"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Requests Grid */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="panel-card shadow-sm hover:border-primary/50 transition cursor-pointer flex flex-col justify-between"
                onClick={() => setSelectedRequest(req)}
              >
                <div className="panel-card-header flex items-center justify-between">
                  <span className="font-mono font-black text-primary text-xs">{req.id}</span>
                  <span
                    className={`inline-block rounded-md px-2 py-0.5 font-bold text-[11px] ${
                      req.status === "Confirmed"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : req.status === "Under Review" || req.status === "Submitted"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="panel-card-body p-4 space-y-3">
                  <div>
                    <h4 className="font-display font-extrabold text-foreground text-base leading-snug">
                      {req.eventName}
                    </h4>
                    <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                      {req.organizerName} • {req.organization}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-neutral-50 rounded-xl p-2.5 border border-neutral-200/80">
                    <div>
                      <span className="block font-bold text-foreground">Date &amp; Time</span>
                      <span>{req.date} • {req.startTime}</span>
                    </div>
                    <div>
                      <span className="block font-bold text-foreground">Venue &amp; City</span>
                      <span className="truncate block">{req.venue}, {req.city}</span>
                    </div>
                    <div>
                      <span className="block font-bold text-foreground">Role Requested</span>
                      <span>{req.hostingRole}</span>
                    </div>
                    <div>
                      <span className="block font-bold text-foreground">Budget</span>
                      <span className="font-mono font-bold text-primary">{req.proposedBudget}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                    <span className="text-[11px] text-muted-foreground">
                      Submitted on {new Date(req.submittedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </span>
                    <button
                      type="button"
                      className="btn-outline !py-1 !px-3 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <span>Review Details</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: BOOKINGS (CONFIRMED & CONTRACTS)                        */}
      {/* ============================================================== */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-extrabold text-foreground">Confirmed Stage Engagements</h3>
              <p className="text-xs text-muted-foreground">Executed stage agreements, locked calendar slots, and 50% advance deposits.</p>
            </div>
          </div>

          <div className="panel-card shadow-sm overflow-hidden">
            <div className="panel-card-body p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100/70 border-b border-neutral-200 text-muted-foreground font-extrabold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Contract Ref</th>
                    <th className="py-3 px-4">Event Name &amp; Client</th>
                    <th className="py-3 px-4">Date &amp; Schedule</th>
                    <th className="py-3 px-4">City &amp; Venue</th>
                    <th className="py-3 px-4">Agreed Fee</th>
                    <th className="py-3 px-4">Advance Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {confirmedBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{b.contractRef}</td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-foreground">{b.eventName}</p>
                        <p className="text-[11px] text-muted-foreground">{b.clientName} ({b.organization})</p>
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        <p>{b.date}</p>
                        <p className="text-[11px] text-muted-foreground">{b.time}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-foreground">{b.city}</p>
                        <p className="text-[11px] text-muted-foreground truncate max-w-[140px]">{b.venue}</p>
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-primary">{b.fee}</td>
                      <td className="py-3 px-4">
                        {b.advancePaid ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" /> 50% Deposit Paid
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              recordAdvancePayment(b.id);
                              toast.success(`Advance deposit recorded as PAID for ${b.eventName}`);
                            }}
                            className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 hover:bg-amber-100 cursor-pointer"
                          >
                            <span>Mark Advance Paid</span>
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setViewContractBooking(b)}
                          className="btn-outline !py-1 !px-2.5 text-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="h-3 w-3 text-primary" />
                          <span>View Contract</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: CALENDAR & CONFLICT SCHEDULE                            */}
      {/* ============================================================== */}
      {activeTab === "calendar" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-base font-extrabold text-foreground">Stage Availability Calendar (2026 - 2027)</h3>
              <p className="text-xs text-muted-foreground">Permanent schedule locks, tentative holds, and travel buffers across Indian cities.</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-primary" /> Confirmed / Locked</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-amber-500" /> Tentative Hold</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-emerald-500" /> Open Date</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {calendarSlots.map((slot, i) => (
              <div
                key={i}
                className="panel-card shadow-sm border-l-4 p-4 space-y-2"
                style={{
                  borderLeftColor: slot.status === "Confirmed" ? "#e11d48" : "#f59e0b",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm text-foreground">{slot.date}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      slot.status === "Confirmed" ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {slot.status}
                  </span>
                </div>
                <h4 className="font-display font-bold text-foreground text-sm">{slot.title}</h4>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p className="flex items-center gap-1"><Clock className="h-3 w-3" /> {slot.time}</p>
                  <p className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {slot.venue}, {slot.city}</p>
                  <p className="font-semibold text-foreground pt-1">Client: {slot.clientName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: EVENTS & RUN SHEET WORKSPACE                            */}
      {/* ============================================================== */}
      {activeTab === "events" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-extrabold text-foreground">Event Operations &amp; Run Sheet</h3>
              <p className="text-xs text-muted-foreground">Manage show execution timelines, AV soundchecks, and backstage crew assignments.</p>
            </div>
          </div>

          {managedEvents.map((ev) => (
            <div key={ev.id} className="panel-card shadow-sm space-y-4">
              <div className="panel-card-header flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-mono text-xs font-bold text-primary">{ev.id}</span>
                  <h4 className="font-display text-base font-black text-foreground mt-0.5">{ev.title}</h4>
                  <p className="text-xs text-muted-foreground">{ev.organization} • {ev.date} • {ev.venue}, {ev.city}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateEventSettings(ev.id, { isPublished: !ev.isPublished });
                      toast.success(`Event ${ev.isPublished ? "Unpublished" : "Published to Attendees"}`);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                      ev.isPublished ? "bg-emerald-600 text-white" : "border border-neutral-300 bg-white text-muted-foreground"
                    }`}
                  >
                    {ev.isPublished ? "● Published" : "Draft (Unpublished)"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateEventSettings(ev.id, { registrationOpen: !ev.registrationOpen });
                      toast.success(`Attendee Registration ${ev.registrationOpen ? "Closed" : "Opened"}`);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                      ev.registrationOpen ? "bg-primary text-primary-foreground" : "border border-neutral-300 bg-white text-muted-foreground"
                    }`}
                  >
                    {ev.registrationOpen ? "Registration Open" : "Registration Closed"}
                  </button>
                </div>
              </div>

              <div className="panel-card-body p-5 space-y-4">
                {/* Run Sheet Checklist */}
                <div>
                  <h5 className="font-display text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                    Stage Run Sheet &amp; Cues
                  </h5>
                  <div className="space-y-2">
                    {ev.runSheet.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50/70 p-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-primary shrink-0">{item.time}</span>
                          <div>
                            <p className="font-bold text-foreground">{item.activity}</p>
                            <p className="text-[11px] text-muted-foreground">Assigned: {item.assignedTo}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const next = item.status === "Pending" ? "In Progress" : item.status === "In Progress" ? "Completed" : "Pending";
                            updateRunSheetStatus(ev.id, idx, next);
                          }}
                          className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                            item.status === "Completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : item.status === "In Progress"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-neutral-200 text-neutral-700"
                          }`}
                        >
                          {item.status}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assigned Crew */}
                <div className="border-t border-neutral-200 pt-3">
                  <h5 className="font-display text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                    Key Production Contacts
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {ev.assignedTeam.map((member, i) => (
                      <div key={i} className="rounded-xl border border-neutral-200 bg-white p-2.5 text-xs">
                        <span className="font-extrabold text-primary block">{member.role}</span>
                        <p className="font-bold text-foreground">{member.name}</p>
                        <p className="font-mono text-muted-foreground text-[11px]">{member.phone}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: ATTENDEES & QR ENTRY CHECK-IN SIMULATOR                 */}
      {/* ============================================================== */}
      {activeTab === "attendees" && (
        <div className="space-y-6">
          {/* QR Scanner / Staff Validator Box */}
          <div className="panel-card shadow-sm border-2 border-primary/40 bg-gradient-to-r from-primary/5 via-white to-primary/5 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white shadow-md shrink-0">
                  <QrCode className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-display text-base font-extrabold text-foreground">Event Day QR Check-In Scanner</h4>
                  <p className="text-xs text-muted-foreground">Type or simulate scanning any Ticket ID (e.g. SW-TKT-9904) to perform instant atomic gate validation.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={scannerInput}
                  onChange={(e) => setScannerInput(e.target.value)}
                  placeholder="Ticket ID (e.g. SW-TKT-9904)"
                  className="rounded-xl border border-neutral-300 bg-white py-2 px-3 text-xs font-mono font-bold text-foreground focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSimulateScan(scannerInput || "SW-TKT-9904")}
                  className="btn-red !py-2 !px-4 text-xs cursor-pointer whitespace-nowrap"
                >
                  Verify Entry
                </button>
              </div>
            </div>

            {scanResult && (
              <div
                className={`mt-4 rounded-xl border p-3.5 text-xs flex items-center justify-between ${
                  scanResult.valid
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                    : scanResult.status === "Already Checked In"
                    ? "bg-amber-50 border-amber-300 text-amber-900"
                    : "bg-red-50 border-red-300 text-red-900"
                }`}
              >
                <div>
                  <p className="font-bold text-sm">{scanResult.message}</p>
                  {scanResult.ticket && (
                    <p className="text-[11px] mt-0.5">
                      Attendee: <strong>{scanResult.ticket.attendeeName}</strong> • {scanResult.ticket.eventName} ({scanResult.ticket.seatZone})
                    </p>
                  )}
                </div>
                <span className="font-mono font-extrabold uppercase px-2 py-1 rounded bg-white/80 border">
                  {scanResult.status}
                </span>
              </div>
            )}
          </div>

          {/* Registered Attendees Table */}
          <div className="panel-card shadow-sm">
            <div className="panel-card-header flex items-center justify-between">
              <h3 className="font-display text-sm font-extrabold uppercase tracking-tight text-foreground">
                Registered Event Delegates &amp; Tickets
              </h3>
              <span className="text-xs font-bold text-muted-foreground">{attendeeTickets.length} Passes Active</span>
            </div>

            <div className="panel-card-body p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100/70 border-b border-neutral-200 text-muted-foreground font-extrabold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Ticket ID</th>
                    <th className="py-2.5 px-4">Attendee Name</th>
                    <th className="py-2.5 px-4">Email</th>
                    <th className="py-2.5 px-4">Event</th>
                    <th className="py-2.5 px-4">Access Zone</th>
                    <th className="py-2.5 px-4">Check-In Status</th>
                    <th className="py-2.5 px-4 text-right">Fast Scan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {attendeeTickets.map((t) => (
                    <tr key={t.ticketId} className="hover:bg-neutral-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{t.ticketId}</td>
                      <td className="py-3 px-4 font-bold text-foreground">{t.attendeeName}</td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">{t.attendeeEmail}</td>
                      <td className="py-3 px-4 truncate max-w-[150px]">{t.eventName}</td>
                      <td className="py-3 px-4 font-semibold text-primary">{t.seatZone}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            t.status === "Checked-in"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleSimulateScan(t.ticketId)}
                          className="btn-outline !py-1 !px-2.5 text-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <QrCode className="h-3 w-3 text-primary" />
                          <span>Simulate Scan</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: BOOKING ANALYTICS                                       */}
      {/* ============================================================== */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="panel-card p-4 text-center">
              <span className="text-xs font-bold text-muted-foreground uppercase">Requests Conversion</span>
              <p className="text-3xl font-black font-display text-primary mt-1">66.7%</p>
              <span className="text-[11px] font-bold text-emerald-600">Requests to Confirmed Shows</span>
            </div>
            <div className="panel-card p-4 text-center">
              <span className="text-xs font-bold text-muted-foreground uppercase">Average Show Fee</span>
              <p className="text-3xl font-black font-display text-foreground mt-1">₹4.25L</p>
              <span className="text-[11px] font-bold text-muted-foreground">Standard 1-Day Anchor</span>
            </div>
            <div className="panel-card p-4 text-center">
              <span className="text-xs font-bold text-muted-foreground uppercase">Gate Attendance Rate</span>
              <p className="text-3xl font-black font-display text-foreground mt-1">94.5%</p>
              <span className="text-[11px] font-bold text-emerald-600">Verified QR Check-Ins</span>
            </div>
            <div className="panel-card p-4 text-center">
              <span className="text-xs font-bold text-muted-foreground uppercase">Schedule Density</span>
              <p className="text-3xl font-black font-display text-emerald-600 mt-1">100%</p>
              <span className="text-[11px] font-bold text-muted-foreground">Q4 Weekend Dates Booked</span>
            </div>
          </div>

          <div className="panel-card p-6 space-y-3">
            <h4 className="font-display font-extrabold text-foreground text-sm uppercase">Booking Funnel Metric Summary</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-muted-foreground">1. Total Inquiries &amp; Organiser Requests:</span>
                <span className="font-bold text-foreground">48 Requests</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-muted-foreground">2. Feasible &amp; Quoted Commercials:</span>
                <span className="font-bold text-foreground">39 Quotes Shared (81%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-muted-foreground">3. Formally Approved &amp; Terms Accepted:</span>
                <span className="font-bold text-foreground">34 Shows (71%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-muted-foreground">4. Confirmed, Advance Paid &amp; Calendar Locked:</span>
                <span className="font-bold text-primary">32 Confirmed Productions (66.7%)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 8: SETTINGS & STANDARD PRICING                             */}
      {/* ============================================================== */}
      {activeTab === "settings" && (
        <div className="panel-card p-6 space-y-4 text-xs">
          <h4 className="font-display text-base font-extrabold text-foreground">Stage Engagement Packages &amp; Policies</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-2">
              <h5 className="font-display font-black text-sm text-foreground">Corporate Keynote &amp; Gala</h5>
              <p className="font-mono font-black text-lg text-primary">₹3,50,000 - ₹5,00,000</p>
              <p className="text-muted-foreground">Full evening award gala, CXO leadership summits, interactive hosting, script review.</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-2">
              <h5 className="font-display font-black text-sm text-foreground">Tech Summit &amp; Fireside Chat</h5>
              <p className="font-mono font-black text-lg text-primary">₹4,00,000 - ₹6,00,000</p>
              <p className="text-muted-foreground">Multi-track tech conferences, VC panel moderation, stage teleprompter coordination.</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-2">
              <h5 className="font-display font-black text-sm text-foreground">Live Arena Music Festival</h5>
              <p className="font-mono font-black text-lg text-primary">₹5,00,000 - ₹8,00,000</p>
              <p className="text-muted-foreground">10,000+ stadium crowd hype, countdown coordination, international DJ transitions.</p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* REQUEST DETAIL MODAL / DRAWER                                  */}
      {/* ============================================================== */}
      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs overflow-y-auto"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 my-8 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <span className="font-mono font-bold text-primary">{selectedRequest.id}</span>
                <h3 className="font-display text-lg font-black text-foreground mt-0.5">{selectedRequest.eventName}</h3>
                <p className="text-muted-foreground font-semibold">
                  Organized by {selectedRequest.organizerName} ({selectedRequest.organization})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-neutral-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Event Specs Grid */}
            <div className="grid grid-cols-2 gap-3 bg-neutral-50 rounded-xl p-3.5 border border-neutral-200">
              <div>
                <span className="font-bold text-muted-foreground block">Target Date &amp; Time</span>
                <span className="font-bold text-foreground text-sm">{selectedRequest.date}</span>
                <span className="block text-muted-foreground">{selectedRequest.startTime} - {selectedRequest.endTime}</span>
              </div>
              <div>
                <span className="font-bold text-muted-foreground block">City &amp; Venue</span>
                <span className="font-bold text-foreground">{selectedRequest.city}</span>
                <span className="block text-muted-foreground truncate">{selectedRequest.venue}</span>
              </div>
              <div>
                <span className="font-bold text-muted-foreground block">Hosting Role</span>
                <span className="font-bold text-foreground">{selectedRequest.hostingRole} ({selectedRequest.eventType})</span>
              </div>
              <div>
                <span className="font-bold text-muted-foreground block">Proposed Budget</span>
                <span className="font-mono font-black text-primary text-sm">{selectedRequest.proposedBudget}</span>
              </div>
            </div>

            {/* Technical Rider & Special Instructions */}
            <div className="space-y-1">
              <span className="font-bold text-foreground">AV &amp; Technical Requirements:</span>
              <p className="rounded-lg bg-neutral-100 p-2.5 text-muted-foreground leading-relaxed">
                {selectedRequest.technicalRequirements || "Standard Shure Axient wireless mic and stage confidence monitors."}
              </p>
            </div>

            {/* Discussion Thread */}
            <div className="space-y-2 border-t border-border pt-3">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5 text-primary" />
                <span>Direct Discussion Thread ({selectedRequest.discussionMessages.length})</span>
              </span>
              <div className="max-h-36 overflow-y-auto space-y-2 rounded-xl bg-neutral-50 p-3 border border-neutral-200">
                {selectedRequest.discussionMessages.length === 0 ? (
                  <p className="text-muted-foreground italic text-center py-2">No messages exchanged yet.</p>
                ) : (
                  selectedRequest.discussionMessages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-2.5 rounded-xl ${
                        m.sender === "admin" ? "bg-primary/10 ml-6 border border-primary/20" : "bg-white mr-6 border border-neutral-200"
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground mb-1">
                        <span className={m.sender === "admin" ? "text-primary" : "text-foreground"}>{m.senderName}</span>
                        <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="text-foreground leading-relaxed">{m.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="flex gap-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type a response to the organizer..."
                  className="flex-1 rounded-xl border border-neutral-300 bg-white py-2 px-3 text-xs focus:border-primary focus:outline-none"
                />
                <button type="submit" className="btn-red !py-2 !px-4 text-xs flex items-center gap-1 cursor-pointer">
                  <Send className="h-3.5 w-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setQuoteModalOpen(true)}
                className="btn-outline !py-2 !px-3.5 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span>Create / Edit Quote</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedRequest.status !== "Approved" && selectedRequest.status !== "Confirmed" && (
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedRequest.id)}
                    className="btn-outline !py-2 !px-3.5 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                  >
                    Approve Request
                  </button>
                )}

                {selectedRequest.status !== "Confirmed" && (
                  <button
                    type="button"
                    onClick={() => handleConfirmAndLock(selectedRequest.id)}
                    className="btn-red !py-2 !px-4 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Confirm &amp; Lock Date</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* QUOTE BUILDER MODAL                                            */}
      {/* ============================================================== */}
      {quoteModalOpen && selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          onClick={() => setQuoteModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-display text-base font-extrabold text-foreground">Commercial Quote Proposal</h4>
              <button
                type="button"
                onClick={() => setQuoteModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-neutral-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSendQuote} className="space-y-3">
              <div>
                <label className="block font-bold text-muted-foreground mb-1">Hosting / Moderation Performance Fee *</label>
                <input
                  type="text"
                  required
                  value={hostingFee}
                  onChange={(e) => setHostingFee(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white py-2 px-3 text-xs font-mono font-bold text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-muted-foreground mb-1">Technical Rider / Sound Kit Fee</label>
                <input
                  type="text"
                  value={techRiderFee}
                  onChange={(e) => setTechRiderFee(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white py-2 px-3 text-xs font-mono font-bold text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-muted-foreground mb-1">Travel &amp; Hospitality Terms</label>
                <input
                  type="text"
                  value={travelLodging}
                  onChange={(e) => setTravelLodging(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-muted-foreground mb-1">Quotation Validity Date</label>
                <input
                  type="date"
                  value={quoteValidUntil}
                  onChange={(e) => setQuoteValidUntil(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setQuoteModalOpen(false)}
                  className="btn-outline !py-2 !px-4 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-red !py-2 !px-5 text-xs cursor-pointer"
                >
                  Send Formal Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contract Viewer Modal */}
      {viewContractBooking && (
        <ContractModal
          isOpen={true}
          onClose={() => setViewContractBooking(null)}
          contractRef={viewContractBooking.contractRef}
          eventName={viewContractBooking.eventName}
          organizerName={viewContractBooking.clientName}
          organization={viewContractBooking.organization}
          eventDate={viewContractBooking.date}
          eventTime={viewContractBooking.time}
          venue={viewContractBooking.venue}
          city={viewContractBooking.city}
          fee={viewContractBooking.fee}
          advancePaid={viewContractBooking.advancePaid}
          onPayAdvance={() => {
            recordAdvancePayment(viewContractBooking.id);
            toast.success("50% Advance booking deposit recorded successfully!");
            setViewContractBooking(null);
          }}
        />
      )}
    </div>
  );
}
