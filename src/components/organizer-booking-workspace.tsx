import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Eye,
  FileText,
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
  ChevronRight,
  ChevronLeft,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  getBookingRequests,
  getConfirmedBookings,
  getManagedEvents,
  getAttendeeTickets,
  createBookingRequest,
  acceptQuoteByOrganizer,
  recordAdvancePayment,
  checkDateConflict,
  type BookingRequest,
  type ConfirmedBookingRecord,
  type ManagedEventRecord,
  type AttendeeTicketRecord,
} from "@/lib/booking-store";
import {
  ContractModal,
  TechnicalRiderRequestModal,
} from "@/components/LiveBookingAndModals";

export type OrganizerBookingTab =
  | "dashboard"
  | "new-request"
  | "requests"
  | "bookings"
  | "events"
  | "calendar"
  | "attendees";

export function OrganizerBookingWorkspace() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<OrganizerBookingTab>("dashboard");

  // Synchronized stores
  const [requests, setRequests] = useState<BookingRequest[]>(getBookingRequests);
  const [confirmedBookings, setConfirmedBookings] = useState<ConfirmedBookingRecord[]>(getConfirmedBookings);
  const [managedEvents, setManagedEvents] = useState<ManagedEventRecord[]>(getManagedEvents);
  const [attendeeTickets, setAttendeeTickets] = useState<AttendeeTicketRecord[]>(getAttendeeTickets);

  useEffect(() => {
    const handleSync = () => {
      setRequests(getBookingRequests());
      setConfirmedBookings(getConfirmedBookings());
      setManagedEvents(getManagedEvents());
      setAttendeeTickets(getAttendeeTickets());
    };
    window.addEventListener("siddwhizz_booking_system_updated", handleSync);
    return () => window.removeEventListener("siddwhizz_booking_system_updated", handleSync);
  }, []);

  // Filter only current organizer's bookings / requests if organizer company is set
  const myRequests = requests;
  const myBookings = confirmedBookings;

  // Selected request modal
  const [selectedReq, setSelectedReq] = useState<BookingRequest | null>(null);

  // Contract Modal view
  const [contractModalBooking, setContractModalBooking] = useState<ConfirmedBookingRecord | null>(null);

  // Technical Rider Modal
  const [riderModalOpen, setRiderModalOpen] = useState(false);

  // --------------------------------------------------------------------------
  // 5-STEP WIZARD FORM STATE
  // --------------------------------------------------------------------------
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Event Details
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState<BookingRequest["eventType"]>("Tech Summit");
  const [format, setFormat] = useState<BookingRequest["format"]>("In-Person");
  const [expectedAudience, setExpectedAudience] = useState("1,500 Attendees");
  const [eventDescription, setEventDescription] = useState("");

  // Step 2: Date & Venue
  const [preferredDate, setPreferredDate] = useState("");
  const [altDates, setAltDates] = useState("");
  const [startTime, setStartTime] = useState("09:30 AM");
  const [endTime, setEndTime] = useState("06:00 PM");
  const [city, setCity] = useState("Mumbai");
  const [venue, setVenue] = useState("");

  // Step 3: Hosting Scope
  const [hostingRole, setHostingRole] = useState<BookingRequest["hostingRole"]>("Host / Anchor");
  const [languages, setLanguages] = useState<string[]>(["English", "Hindi"]);
  const [duration, setDuration] = useState("Full Day");
  const [rehearsalRequired, setRehearsalRequired] = useState(true);
  const [technicalRequirements, setTechnicalRequirements] = useState("1x Wireless Mic (Shure Axient), Dual IEM feed, 2x Confidence Monitors");
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Step 4: Package & Commercials
  const [preferredPackage, setPreferredPackage] = useState("Flagship Corporate Summit Anchor");
  const [proposedBudget, setProposedBudget] = useState("₹4,00,000");
  const [travelAccommodation, setTravelAccommodation] = useState("Organizer Provided (5-Star Hotel + Flight)");

  // Step 5: Terms Agreement
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Check date conflict live
  const conflict = useMemo(() => {
    return checkDateConflict(preferredDate);
  }, [preferredDate]);

  // Submit wizard
  const handleSubmitBookingRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim() || !preferredDate || !venue.trim()) {
      toast.error("Please fill in event name, date and venue.");
      return;
    }
    if (!agreedTerms) {
      toast.error("Please agree to the booking terms and commercial policy.");
      return;
    }

    const created = createBookingRequest({
      eventName: eventName.trim(),
      organization: user?.organization || "Apex Global Tech Summits Pvt Ltd",
      organizerName: user?.name || "Priya Sharma",
      organizerEmail: user?.email || "priya@techsummit.io",
      organizerPhone: "+91 98200 11223",
      eventType,
      format,
      date: preferredDate,
      alternativeDates: altDates ? altDates.split(",").map((s) => s.trim()) : [],
      startTime,
      endTime,
      city: city.trim(),
      venue: venue.trim(),
      expectedAudience,
      hostingRole,
      languages,
      duration,
      rehearsalRequired,
      technicalRequirements,
      specialInstructions,
      proposedBudget,
      priority: "High",
    });

    toast.success(`Booking request ${created.id} submitted! Siddharth Maurya's management team has been notified.`);
    // Reset form
    setStep(1);
    setEventName("");
    setPreferredDate("");
    setVenue("");
    setEventDescription("");
    setSpecialInstructions("");
    setAgreedTerms(false);
    setActiveTab("requests");
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. TOP HEADER & WORKSPACE TITLE                                */}
      {/* ============================================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-primary">// CLIENT &amp; ORGANIZER DESK</span>
            <span className="h-1 w-6 bg-primary rounded-full hidden sm:inline-block" />
          </div>
          <h2 className="display text-2xl sm:text-3xl text-foreground mt-1">
            MY <span className="text-primary">BOOKINGS.</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Submit hosting requests, review quotes, execute agreements, lock stage dates &amp; coordinate event day details.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setActiveTab("new-request");
            setStep(1);
          }}
          className="btn-red !py-2 !px-4 text-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Booking Request</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 2. HORIZONTAL TAB NAVIGATION                                   */}
      {/* ============================================================== */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-border/80 pb-2">
        {[
          { id: "dashboard", label: "Dashboard", icon: Layers },
          { id: "new-request", label: "New Request", icon: Plus },
          { id: "requests", label: "My Requests", icon: Inbox, badge: myRequests.length },
          { id: "bookings", label: "Confirmed Bookings", icon: CheckCircle2, badge: myBookings.length },
          { id: "events", label: "My Events & Run Sheet", icon: Volume2 },
          { id: "calendar", label: "Calendar", icon: Calendar },
          { id: "attendees", label: "Attendees & Entry", icon: QrCode },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as OrganizerBookingTab)}
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
      {/* TAB 1: ORGANIZER DASHBOARD OVERVIEW                            */}
      {/* ============================================================== */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Overview KPIs matching PDF page 1 */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="panel-card p-4">
              <span className="text-[11px] font-extrabold text-muted-foreground uppercase">Active Requests</span>
              <p className="text-2xl font-black font-display text-foreground mt-1">3</p>
              <p className="text-[11px] text-primary font-bold mt-0.5">Under Review / Negotiation</p>
            </div>
            <div className="panel-card p-4">
              <span className="text-[11px] font-extrabold text-muted-foreground uppercase">Confirmed Bookings</span>
              <p className="text-2xl font-black font-display text-emerald-600 mt-1">2</p>
              <p className="text-[11px] text-emerald-600 font-bold mt-0.5">Stage Dates Locked</p>
            </div>
            <div className="panel-card p-4">
              <span className="text-[11px] font-extrabold text-muted-foreground uppercase">Upcoming Event</span>
              <p className="text-2xl font-black font-display text-foreground mt-1">1</p>
              <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">In 38 Days (Mumbai)</p>
            </div>
            <div className="panel-card p-4">
              <span className="text-[11px] font-extrabold text-muted-foreground uppercase">Registered Attendees</span>
              <p className="text-2xl font-black font-display text-primary mt-1">860</p>
              <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">VIP &amp; Delegate Passes</p>
            </div>
          </div>

          {/* My Booking Requests List matching PDF Page 1 */}
          <div className="panel-card shadow-sm">
            <div className="panel-card-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-4 w-1.5 rounded-full bg-primary" />
                <h3 className="font-display text-sm sm:text-base font-extrabold uppercase tracking-tight text-foreground">
                  My Booking Requests
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("new-request");
                  setStep(1);
                }}
                className="btn-red !py-1.5 !px-3 text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ New Booking Request</span>
              </button>
            </div>

            <div className="panel-card-body p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100/70 border-b border-neutral-200 text-muted-foreground font-extrabold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Request ID</th>
                    <th className="py-2.5 px-4">Event Name</th>
                    <th className="py-2.5 px-4">Target Date</th>
                    <th className="py-2.5 px-4">Venue &amp; City</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {myRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-neutral-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-primary">{req.id}</td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-foreground">{req.eventName}</p>
                        <p className="text-[11px] text-muted-foreground">{req.eventType}</p>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold">{req.date}</td>
                      <td className="py-3 px-4 truncate max-w-[160px]">{req.venue}, {req.city}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 font-bold text-[11px] ${
                            req.status === "Confirmed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : req.status === "Under Review" || req.status === "Submitted"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : req.status === "Quotation Shared"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-neutral-100 text-neutral-700"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReq(req);
                          }}
                          className="btn-outline !py-1 !px-2.5 text-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>View Details</span>
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
      {/* TAB 2: NEW BOOKING REQUEST MULTI-STEP STEPPER (1 to 5)         */}
      {/* ============================================================== */}
      {activeTab === "new-request" && (
        <div className="panel-card shadow-sm p-6 space-y-6">
          {/* Stepper Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground mb-2">
              <span className={step >= 1 ? "text-primary font-black" : ""}>1. Event Details</span>
              <span className={step >= 2 ? "text-primary font-black" : ""}>2. Date &amp; Venue</span>
              <span className={step >= 3 ? "text-primary font-black" : ""}>3. Hosting Scope</span>
              <span className={step >= 4 ? "text-primary font-black" : ""}>4. Package &amp; Budget</span>
              <span className={step >= 5 ? "text-primary font-black" : ""}>5. Review &amp; Submit</span>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmitBookingRequest} className="space-y-4 text-xs">
            {/* STEP 1: EVENT DETAILS */}
            {step === 1 && (
              <div className="space-y-4">
                <h4 className="font-display text-base font-extrabold text-foreground">Step 1 — Event Details</h4>
                <div>
                  <label className="block font-bold text-muted-foreground mb-1">Event Title / Name *</label>
                  <input
                    type="text"
                    required
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="e.g. Apex Global Tech Summits 2026"
                    className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-xs font-bold text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-muted-foreground mb-1">Event Format</label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value as any)}
                      className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="In-Person">In-Person (Live On-Stage)</option>
                      <option value="Virtual">Virtual (Studio / Broadcast)</option>
                      <option value="Hybrid">Hybrid (Stage + 4K Stream)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-muted-foreground mb-1">Event Type</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value as any)}
                      className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="Tech Summit">Tech Summit</option>
                      <option value="Corporate Gala">Corporate Gala &amp; Awards</option>
                      <option value="Product Launch">Product Launch &amp; Keynote</option>
                      <option value="Annual Conclave">Annual Dealer / Partner Conclave</option>
                      <option value="Festival/Concert">Live Music Festival Showcase</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-muted-foreground mb-1">Expected Audience</label>
                    <input
                      type="text"
                      value={expectedAudience}
                      onChange={(e) => setExpectedAudience(e.target.value)}
                      placeholder="e.g. 1,500 Attendees"
                      className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-muted-foreground mb-1">Event Description &amp; Theme</label>
                  <textarea
                    rows={3}
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    placeholder="Briefly describe the theme, audience profile (e.g. CXOs, developers, founders) and expectations..."
                    className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    disabled={!eventName.trim()}
                    onClick={() => setStep(2)}
                    className="btn-red !py-2 !px-5 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>Continue to Date &amp; Venue</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DATE & VENUE */}
            {step === 2 && (
              <div className="space-y-4">
                <h4 className="font-display text-base font-extrabold text-foreground">Step 2 — Date &amp; Venue</h4>

                <div>
                  <label className="block font-bold text-muted-foreground mb-1">Target Event Date *</label>
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-xs font-bold text-foreground focus:border-primary focus:outline-none"
                  />
                  {conflict.conflict && (
                    <div className="mt-2 rounded-xl bg-amber-50 border border-amber-300 p-3 text-xs text-amber-900 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Date Conflict Notice:</p>
                        <p>{conflict.reason} You can still submit this request; our team will review availability or suggest alternative time slots.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-muted-foreground mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai, Bengaluru, New Delhi"
                      className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-muted-foreground mb-1">Venue Name / Address *</label>
                    <input
                      type="text"
                      required
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      placeholder="e.g. Jio World Convention Centre, BKC"
                      className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-muted-foreground mb-1">Show Start Time</label>
                    <input
                      type="text"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      placeholder="09:30 AM"
                      className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-muted-foreground mb-1">Show End Time</label>
                    <input
                      type="text"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      placeholder="06:00 PM"
                      className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-outline !py-2 !px-4 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    disabled={!preferredDate || !venue.trim()}
                    onClick={() => setStep(3)}
                    className="btn-red !py-2 !px-5 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>Continue to Hosting Scope</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: HOSTING SCOPE */}
            {step === 3 && (
              <div className="space-y-4">
                <h4 className="font-display text-base font-extrabold text-foreground">Step 3 — Hosting Scope &amp; AV Rider</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-muted-foreground mb-1">Requested Role</label>
                    <select
                      value={hostingRole}
                      onChange={(e) => setHostingRole(e.target.value as any)}
                      className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="Host / Anchor">Master of Ceremonies (Host &amp; Emcee)</option>
                      <option value="Moderator">CXO Fireside Chat &amp; Panel Moderator</option>
                      <option value="Keynote Speaker">Keynote Speaker</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-muted-foreground mb-1">Duration</label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. Full Day (8 Hours) or Evening Gala (4 Hours)"
                      className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-muted-foreground mb-1">Technical AV Equipment Provided by Venue</label>
                  <textarea
                    rows={2}
                    value={technicalRequirements}
                    onChange={(e) => setTechnicalRequirements(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rehearsalCheck"
                    checked={rehearsalRequired}
                    onChange={(e) => setRehearsalRequired(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary cursor-pointer"
                  />
                  <label htmlFor="rehearsalCheck" className="font-semibold text-foreground cursor-pointer">
                    Pre-event technical rehearsal required on show-day morning or evening prior
                  </label>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-outline !py-2 !px-4 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="btn-red !py-2 !px-5 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Continue to Commercials</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: PACKAGE & BUDGET */}
            {step === 4 && (
              <div className="space-y-4">
                <h4 className="font-display text-base font-extrabold text-foreground">Step 4 — Package &amp; Commercial Terms</h4>

                <div>
                  <label className="block font-bold text-muted-foreground mb-1">Preferred Hosting Package</label>
                  <input
                    type="text"
                    value={preferredPackage}
                    onChange={(e) => setPreferredPackage(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-muted-foreground mb-1">Proposed Performance Budget (INR)</label>
                    <input
                      type="text"
                      value={proposedBudget}
                      onChange={(e) => setProposedBudget(e.target.value)}
                      placeholder="₹4,00,000"
                      className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-xs font-mono font-bold text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-muted-foreground mb-1">Travel &amp; Accommodation Provision</label>
                    <input
                      type="text"
                      value={travelAccommodation}
                      onChange={(e) => setTravelAccommodation(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 px-3.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="btn-outline !py-2 !px-4 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className="btn-red !py-2 !px-5 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Review &amp; Finalize</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: REVIEW & SUBMIT */}
            {step === 5 && (
              <div className="space-y-4">
                <h4 className="font-display text-base font-extrabold text-foreground">Step 5 — Review &amp; Submit Request</h4>

                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-3">
                  <div className="flex justify-between border-b border-neutral-200 pb-2">
                    <span className="font-bold text-muted-foreground">Event Name:</span>
                    <span className="font-bold text-foreground">{eventName}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-200 pb-2">
                    <span className="font-bold text-muted-foreground">Target Date:</span>
                    <span className="font-bold font-mono text-primary">{preferredDate} ({startTime} - {endTime})</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-200 pb-2">
                    <span className="font-bold text-muted-foreground">City &amp; Venue:</span>
                    <span className="font-bold text-foreground">{venue}, {city}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-200 pb-2">
                    <span className="font-bold text-muted-foreground">Role &amp; Format:</span>
                    <span className="font-bold text-foreground">{hostingRole} ({eventType})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-muted-foreground">Proposed Budget:</span>
                    <span className="font-bold font-mono text-emerald-700">{proposedBudget}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="termsConfirm"
                    required
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="termsConfirm" className="text-muted-foreground cursor-pointer leading-relaxed">
                    I confirm this request is on behalf of {user?.organization || "Apex Global Tech Summits"}. I understand that date locking requires formal Admin quotation approval and 50% advance deposit.
                  </label>
                </div>

                <div className="flex justify-between pt-3 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="btn-outline !py-2 !px-4 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    disabled={!agreedTerms}
                    className="btn-red !py-2.5 !px-6 text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    <span>Submit Booking Request</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: MY REQUESTS (ORGANIZER STATUS TRACKING)                 */}
      {/* ============================================================== */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {myRequests.map((req) => (
              <div key={req.id} className="panel-card shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <span className="font-mono font-black text-primary text-xs">{req.id}</span>
                  <span
                    className={`rounded-md px-2 py-0.5 font-bold text-[11px] ${
                      req.status === "Confirmed"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : req.status === "Quotation Shared"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-display font-extrabold text-foreground text-sm">{req.eventName}</h4>
                  <p className="text-xs text-muted-foreground">{req.date} • {req.venue}, {req.city}</p>
                </div>

                {req.quoteDetails && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-blue-900">Commercial Quote v{req.quoteDetails.version}</span>
                      <span className="font-mono font-black text-blue-950 text-sm">{req.quoteDetails.totalAmount}</span>
                    </div>
                    <p className="text-[11px] text-blue-800">
                      50% Advance Deposit Required: <strong>{req.quoteDetails.advanceDeposit}</strong> (Valid until {req.quoteDetails.validUntil})
                    </p>
                    {!req.quoteDetails.acceptedByOrganizer ? (
                      <button
                        type="button"
                        onClick={() => {
                          acceptQuoteByOrganizer(req.id);
                          toast.success("Quotation terms accepted! Waiting for final contract execution.");
                        }}
                        className="btn-red !py-1.5 !px-3 text-xs w-full cursor-pointer"
                      >
                        Accept Quotation Terms
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Terms Accepted on {new Date(req.quoteDetails.acceptedAt || "").toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedReq(req)}
                    className="btn-outline !py-1 !px-3 text-xs cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>View Timeline &amp; Messages</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: MY BOOKINGS (CONFIRMED & CONTRACTS)                     */}
      {/* ============================================================== */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {myBookings.map((b) => (
              <div key={b.id} className="panel-card shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <span className="font-mono font-black text-primary text-xs">{b.contractRef}</span>
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                    Confirmed
                  </span>
                </div>

                <div>
                  <h4 className="font-display font-extrabold text-foreground text-base">{b.eventName}</h4>
                  <p className="text-xs text-muted-foreground">{b.date} • {b.time}</p>
                  <p className="text-xs text-muted-foreground truncate">{b.venue}, {b.city}</p>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Fee:</span>
                    <span className="font-mono font-bold text-foreground">{b.fee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Advance Deposit (50%):</span>
                    <span className="font-mono font-bold text-emerald-600">
                      {b.advancePaid ? "Paid & Locked" : "Pending Deposit"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setRiderModalOpen(true)}
                    className="btn-outline !py-1.5 !px-3 text-xs cursor-pointer"
                  >
                    Request Rider Adjustment
                  </button>

                  <button
                    type="button"
                    onClick={() => setContractModalBooking(b)}
                    className="btn-red !py-1.5 !px-3.5 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>View Contract</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: MY EVENTS & RUN SHEET                                   */}
      {/* ============================================================== */}
      {activeTab === "events" && (
        <div className="space-y-4">
          {managedEvents.map((ev) => (
            <div key={ev.id} className="panel-card shadow-sm p-5 space-y-4">
              <div>
                <span className="font-mono text-xs font-bold text-primary">{ev.id}</span>
                <h4 className="font-display text-base font-black text-foreground">{ev.title}</h4>
                <p className="text-xs text-muted-foreground">{ev.date} • {ev.venue}, {ev.city}</p>
              </div>

              <div>
                <h5 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Event Run Sheet
                </h5>
                <div className="space-y-2">
                  {ev.runSheet.map((item, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl bg-neutral-50 border p-2.5 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-primary shrink-0">{item.time}</span>
                        <div>
                          <p className="font-bold text-foreground">{item.activity}</p>
                          <p className="text-[11px] text-muted-foreground">Assigned: {item.assignedTo}</p>
                        </div>
                      </div>
                      <span className="rounded px-2 py-0.5 text-[10px] font-bold bg-neutral-200">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: CALENDAR                                                */}
      {/* ============================================================== */}
      {activeTab === "calendar" && (
        <div className="panel-card shadow-sm p-5 space-y-4 text-xs">
          <h4 className="font-display text-sm font-extrabold uppercase text-foreground">
            Stage Schedule &amp; Production Calendar
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {myBookings.map((b) => (
              <div key={b.id} className="rounded-xl border border-primary/40 bg-primary/5 p-3.5 space-y-1">
                <span className="font-mono font-bold text-primary">{b.date}</span>
                <h5 className="font-bold text-foreground text-sm">{b.eventName}</h5>
                <p className="text-muted-foreground">{b.venue}, {b.city}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: ATTENDEES (ORGANIZER VIEW)                              */}
      {/* ============================================================== */}
      {activeTab === "attendees" && (
        <div className="panel-card shadow-sm p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-sm font-extrabold uppercase text-foreground">
              Registered Event Attendees ({attendeeTickets.length})
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b font-bold text-muted-foreground">
                <tr>
                  <th className="py-2">Ticket ID</th>
                  <th className="py-2">Attendee Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Zone</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attendeeTickets.map((t) => (
                  <tr key={t.ticketId} className="hover:bg-neutral-50">
                    <td className="py-2.5 font-mono font-bold text-primary">{t.ticketId}</td>
                    <td className="py-2.5 font-bold text-foreground">{t.attendeeName}</td>
                    <td className="py-2.5 font-mono text-muted-foreground">{t.attendeeEmail}</td>
                    <td className="py-2.5 font-semibold text-primary">{t.seatZone}</td>
                    <td className="py-2.5">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-neutral-100">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contract Viewer Modal */}
      {contractModalBooking && (
        <ContractModal
          isOpen={true}
          onClose={() => setContractModalBooking(null)}
          contractRef={contractModalBooking.contractRef}
          eventName={contractModalBooking.eventName}
          organizerName={contractModalBooking.clientName}
          organization={contractModalBooking.organization}
          eventDate={contractModalBooking.date}
          eventTime={contractModalBooking.time}
          venue={contractModalBooking.venue}
          city={contractModalBooking.city}
          fee={contractModalBooking.fee}
          advancePaid={contractModalBooking.advancePaid}
          onPayAdvance={() => {
            recordAdvancePayment(contractModalBooking.id);
            toast.success("50% Advance booking deposit recorded successfully!");
            setContractModalBooking(null);
          }}
        />
      )}

      {/* Technical Rider Modal */}
      {riderModalOpen && (
        <TechnicalRiderRequestModal
          isOpen={true}
          onClose={() => setRiderModalOpen(false)}
          organizerEmail={user?.email || "priya@techsummit.io"}
          onSubmitTicket={async (ticket) => {
            toast.success("Rider adjustment request sent to Siddharth Maurya's stage engineer.");
            setRiderModalOpen(false);
            return { ticketId: `TKT-${Math.floor(1000 + Math.random() * 9000)}` };
          }}
        />
      )}

      {/* Request Details Modal */}
      {selectedReq && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          onClick={() => setSelectedReq(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <span className="font-mono font-bold text-primary">{selectedReq.id}</span>
                <h4 className="font-display text-base font-black text-foreground mt-0.5">{selectedReq.eventName}</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="rounded p-1 text-muted-foreground hover:bg-neutral-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 bg-neutral-50 p-3 rounded-xl border">
              <div className="flex justify-between"><span className="text-muted-foreground">Target Date:</span> <span className="font-bold">{selectedReq.date}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">City &amp; Venue:</span> <span className="font-bold">{selectedReq.venue}, {selectedReq.city}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Role:</span> <span className="font-bold">{selectedReq.hostingRole}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status:</span> <span className="font-bold text-primary">{selectedReq.status}</span></div>
            </div>

            <div>
              <h5 className="font-bold text-foreground mb-1.5">Direct Message History:</h5>
              <div className="max-h-36 overflow-y-auto space-y-2 rounded-xl bg-neutral-50 p-2.5 border">
                {selectedReq.discussionMessages.map((m) => (
                  <div key={m.id} className="p-2 rounded-lg bg-white border text-[11px]">
                    <span className="font-bold text-primary block">{m.senderName}:</span>
                    <p>{m.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="btn-outline !py-1.5 !px-4 text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

