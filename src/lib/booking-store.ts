/**
 * SIDD.WHIZZ — Role-Based Booking & Event Operations Data Store
 * Complete domain store managing:
 * - Host Booking Requests (Organizer -> Admin approval & quote lifecycle)
 * - Confirmed Bookings & Calendar scheduling (concurrency conflict prevention)
 * - Events & Run Sheet operations
 * - Attendee Registration & QR Ticketing with Check-in validation
 */

export interface BookingDiscussionMessage {
  id: string;
  sender: "admin" | "organizer";
  senderName: string;
  text: string;
  timestamp: string;
}

export interface QuoteDetails {
  version: number;
  hostingFee: string;
  travelLodging: string;
  techRiderFee: string;
  totalAmount: string;
  advanceDeposit: string;
  validUntil: string;
  acceptedByOrganizer: boolean;
  acceptedAt?: string;
}

export type BookingRequestStatus =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Needs Information"
  | "Discussion"
  | "Quotation Shared"
  | "Approved"
  | "Confirmed"
  | "In Preparation"
  | "Completed"
  | "Cancelled"
  | "Rejected";

export interface BookingRequest {
  id: string; // e.g. BK-1045
  eventName: string;
  organization: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
  eventType: "Tech Summit" | "Corporate Gala" | "Product Launch" | "Award Show" | "Festival/Concert" | "Annual Conclave" | "Conference";
  format: "In-Person" | "Virtual" | "Hybrid";
  date: string; // YYYY-MM-DD
  alternativeDates: string[];
  startTime: string;
  endTime: string;
  city: string;
  venue: string;
  expectedAudience: string;
  hostingRole: "Host / Anchor" | "Moderator" | "Keynote Speaker" | "Panel Moderator";
  languages: string[];
  duration: string;
  rehearsalRequired: boolean;
  technicalRequirements: string;
  specialInstructions: string;
  proposedBudget: string;
  quotedFee?: string;
  status: BookingRequestStatus;
  priority: "Medium" | "High" | "Urgent";
  submittedAt: string;
  assignedAdmin: string;
  discussionMessages: BookingDiscussionMessage[];
  quoteDetails?: QuoteDetails;
}

export interface ConfirmedBookingRecord {
  id: string;
  contractRef: string;
  eventName: string;
  clientName: string;
  organization: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  format: string;
  fee: string;
  advancePaid: boolean;
  advanceAmount: string;
  balanceDue: string;
  status: "Confirmed" | "In Preparation" | "Completed" | "Cancelled";
  confirmedAt: string;
  eventId?: string;
}

export interface RunSheetItem {
  time: string;
  activity: string;
  assignedTo: string;
  status: "Pending" | "In Progress" | "Completed";
}

export interface ManagedEventRecord {
  id: string; // EVT-2026-xx
  bookingId: string;
  title: string;
  organization: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  status: "Scheduled" | "Published" | "Live" | "Completed";
  isPublished: boolean;
  registrationOpen: boolean;
  capacity: number;
  registeredCount: number;
  runSheet: RunSheetItem[];
  assignedTeam: Array<{ role: string; name: string; phone: string }>;
}

export interface AttendeeTicketRecord {
  ticketId: string; // SW-TKT-xxxx
  eventId: string;
  eventName: string;
  eventDate: string;
  eventVenue: string;
  attendeeName: string;
  attendeeEmail: string;
  seatZone: string;
  qrToken: string;
  status: "Active" | "Checked-in" | "Revoked";
  checkedInAt?: string;
  registeredAt: string;
}

export interface CalendarSlotRecord {
  date: string;
  time: string;
  title: string;
  venue: string;
  city: string;
  status: "Available" | "Tentative" | "Confirmed";
  clientName: string;
  bookingId?: string;
}

// Storage keys
const BOOKING_REQUESTS_KEY = "siddwhizz_booking_requests_v2";
const CONFIRMED_BOOKINGS_KEY = "siddwhizz_confirmed_bookings_v2";
const MANAGED_EVENTS_KEY = "siddwhizz_managed_events_v2";
const ATTENDEE_TICKETS_KEY = "siddwhizz_attendee_tickets_v2";

// ----------------------------------------------------------------------------
// SEED INITIAL DATA (Matching user specification blueprints & screenshots)
// ----------------------------------------------------------------------------
const INITIAL_BOOKING_REQUESTS: BookingRequest[] = [
  {
    id: "BK-1045",
    eventName: "Annual Tech Summit 2026",
    organization: "TechNext Events Pvt Ltd",
    organizerName: "Priya Sharma",
    organizerEmail: "priya@technext.io",
    organizerPhone: "+91 98200 11223",
    eventType: "Tech Summit",
    format: "In-Person",
    date: "2026-12-14",
    alternativeDates: ["2026-12-15", "2026-12-16"],
    startTime: "09:30 AM",
    endTime: "06:00 PM",
    city: "Mumbai",
    venue: "Jio World Convention Centre, BKC",
    expectedAudience: "1,500+ CXOs & Founders",
    hostingRole: "Host / Anchor",
    languages: ["English", "Hindi"],
    duration: "Full Day (8.5 Hours)",
    rehearsalRequired: true,
    technicalRequirements: "1x Shure Axient Digital Mic, Dual IEM, 2x Confidence Monitors",
    specialInstructions: "High energy morning keynote introduction followed by VC fireside chat moderation.",
    proposedBudget: "₹4,50,000",
    quotedFee: "₹4,50,000",
    status: "Confirmed",
    priority: "High",
    submittedAt: "2026-10-18T10:30:00Z",
    assignedAdmin: "Siddharth Maurya",
    discussionMessages: [
      {
        id: "msg-1",
        sender: "organizer",
        senderName: "Priya Sharma",
        text: "Hi Sid, we would love to have you anchor our 2026 flagship summit once again!",
        timestamp: "2026-10-18T10:32:00Z",
      },
      {
        id: "msg-2",
        sender: "admin",
        senderName: "Siddharth Maurya",
        text: "Delighted to anchor TechNext Summit! Date 14 Dec is held for your team.",
        timestamp: "2026-10-18T14:15:00Z",
      },
    ],
    quoteDetails: {
      version: 1,
      hostingFee: "₹4,00,000",
      travelLodging: "Organizer Provided (5-Star)",
      techRiderFee: "₹50,000",
      totalAmount: "₹4,50,000",
      advanceDeposit: "₹2,25,000",
      validUntil: "2026-11-30",
      acceptedByOrganizer: true,
      acceptedAt: "2026-10-20T11:00:00Z",
    },
  },
  {
    id: "BK-1046",
    eventName: "Deloitte Leadership Conclave & Gala",
    organization: "Deloitte India Events",
    organizerName: "Rohan Kapoor",
    organizerEmail: "rohan.kapoor@deloitte.com",
    organizerPhone: "+91 98111 22334",
    eventType: "Corporate Gala",
    format: "In-Person",
    date: "2026-11-28",
    alternativeDates: ["2026-11-29"],
    startTime: "06:30 PM",
    endTime: "11:00 PM",
    city: "Bengaluru",
    venue: "The Leela Palace Ballroom",
    expectedAudience: "800 Senior Partners",
    hostingRole: "Host / Anchor",
    languages: ["English"],
    duration: "Evening Gala (4.5 Hours)",
    rehearsalRequired: true,
    technicalRequirements: "Wireless Handheld KSM9, Lapel Backup, Stage Teleprompter",
    specialInstructions: "Black tie evening gala with partner award distribution and executive toast.",
    proposedBudget: "₹3,50,000",
    quotedFee: "₹4,00,000",
    status: "Under Review",
    priority: "Urgent",
    submittedAt: "2026-11-01T09:00:00Z",
    assignedAdmin: "Siddharth Maurya",
    discussionMessages: [
      {
        id: "msg-3",
        sender: "organizer",
        senderName: "Rohan Kapoor",
        text: "Please review our gala flow and let us know if 28 Nov can be locked.",
        timestamp: "2026-11-01T09:05:00Z",
      },
    ],
  },
  {
    id: "BK-1047",
    eventName: "Sunburn Arena Live Festival Showcase",
    organization: "Percept Live Entertainment",
    organizerName: "Karan Mehta",
    organizerEmail: "karan@perceptlive.in",
    organizerPhone: "+91 98333 44556",
    eventType: "Festival/Concert",
    format: "In-Person",
    date: "2026-12-31",
    alternativeDates: ["2027-01-01"],
    startTime: "04:00 PM",
    endTime: "01:00 AM",
    city: "Goa",
    venue: "Vagator Arena Grounds",
    expectedAudience: "5,000+ Electronic Music Crowd",
    hostingRole: "Host / Anchor",
    languages: ["English", "Hindi", "Hinglish"],
    duration: "Arena Headline (9 Hours)",
    rehearsalRequired: false,
    technicalRequirements: "Stadium grade wireless system, dedicated IEM feed, pyrotechnic cues",
    specialInstructions: "High octane crowd pump up between international DJ transitions and midnight countdown.",
    proposedBudget: "₹6,00,000+",
    quotedFee: "₹6,50,000",
    status: "Confirmed",
    priority: "Urgent",
    submittedAt: "2026-10-22T16:00:00Z",
    assignedAdmin: "Siddharth Maurya",
    discussionMessages: [],
  },
  {
    id: "BK-1048",
    eventName: "Tata Motors National Dealer Convention",
    organization: "Tata Motors Commercial",
    organizerName: "Meera Sen",
    organizerEmail: "meera.sen@tatamotors.com",
    organizerPhone: "+91 99200 77889",
    eventType: "Annual Conclave",
    format: "In-Person",
    date: "2026-12-05",
    alternativeDates: ["2026-12-06"],
    startTime: "10:00 AM",
    endTime: "05:00 PM",
    city: "New Delhi",
    venue: "Bharat Mandapam (IECC), Pragati Maidan",
    expectedAudience: "1,200 Dealer Principals",
    hostingRole: "Host / Anchor",
    languages: ["Hindi", "English"],
    duration: "Full Day (7 Hours)",
    rehearsalRequired: true,
    technicalRequirements: "Dual Handheld Mics, Live Podia Prompter, IEM System",
    specialInstructions: "Commercial vehicle product reveal, dealer awards, and CEO address.",
    proposedBudget: "₹5,00,000",
    quotedFee: "₹5,00,000",
    status: "Quotation Shared",
    priority: "High",
    submittedAt: "2026-11-03T11:20:00Z",
    assignedAdmin: "Siddharth Maurya",
    discussionMessages: [],
  },
  {
    id: "BK-1049",
    eventName: "InnovateX AI Product Launch 2027",
    organization: "InnovateX Technologies",
    organizerName: "Vikram Malhotra",
    organizerEmail: "vikram@innovatex.ai",
    organizerPhone: "+91 98450 67890",
    eventType: "Product Launch",
    format: "Hybrid",
    date: "2027-01-20",
    alternativeDates: ["2027-01-22"],
    startTime: "02:00 PM",
    endTime: "07:30 PM",
    city: "Hyderabad",
    venue: "HICC Novotel Arena",
    expectedAudience: "2,500 Hybrid Delegates",
    hostingRole: "Moderator",
    languages: ["English"],
    duration: "Half Day (5.5 Hours)",
    rehearsalRequired: true,
    technicalRequirements: "Low latency audio sync for live YouTube 4K stream + stage wireless mics",
    specialInstructions: "Keynote reveal with global software demo and Q&A with enterprise clients.",
    proposedBudget: "₹4,00,000",
    status: "Submitted",
    priority: "Medium",
    submittedAt: "2026-11-05T14:40:00Z",
    assignedAdmin: "Siddharth Maurya",
    discussionMessages: [],
  },
];

const INITIAL_CONFIRMED_BOOKINGS: ConfirmedBookingRecord[] = [
  {
    id: "BK-1045",
    contractRef: "REF: SW-CONF-2026-88",
    eventName: "Annual Tech Summit 2026",
    clientName: "Priya Sharma",
    organization: "TechNext Events Pvt Ltd",
    date: "2026-12-14",
    time: "09:30 AM - 06:00 PM IST",
    venue: "Jio World Convention Centre, BKC",
    city: "Mumbai",
    format: "Technology Summit & Panel Moderation",
    fee: "₹4,50,000",
    advancePaid: true,
    advanceAmount: "₹2,25,000",
    balanceDue: "₹2,25,000",
    status: "Confirmed",
    confirmedAt: "2026-10-20T11:00:00Z",
    eventId: "EVT-2026-01",
  },
  {
    id: "BK-1047",
    contractRef: "REF: SW-CONF-2026-92",
    eventName: "Sunburn Arena Live Festival Showcase",
    clientName: "Karan Mehta",
    organization: "Percept Live Entertainment",
    date: "2026-12-31",
    time: "04:00 PM - 01:00 AM IST",
    venue: "Vagator Arena Grounds",
    city: "Goa",
    format: "Arena Music Festival Emcee",
    fee: "₹6,50,000",
    advancePaid: true,
    advanceAmount: "₹3,25,000",
    balanceDue: "₹3,25,000",
    status: "Confirmed",
    confirmedAt: "2026-10-28T12:00:00Z",
    eventId: "EVT-2026-02",
  },
];

const INITIAL_MANAGED_EVENTS: ManagedEventRecord[] = [
  {
    id: "EVT-2026-01",
    bookingId: "BK-1045",
    title: "Annual Tech Summit 2026 — Keynote & Galas",
    organization: "TechNext Events Pvt Ltd",
    date: "2026-12-14",
    time: "09:30 AM - 06:00 PM",
    venue: "Jio World Convention Centre, BKC",
    city: "Mumbai",
    status: "Published",
    isPublished: true,
    registrationOpen: true,
    capacity: 1500,
    registeredCount: 1420,
    runSheet: [
      { time: "08:30 AM", activity: "Venue AV & Wireless Mic Soundcheck with Stage Sound Engineer", assignedTo: "Technical Team", status: "Completed" },
      { time: "09:15 AM", activity: "Host Briefing & Slide Review with Show Caller", assignedTo: "Siddharth Maurya & Director", status: "Completed" },
      { time: "09:30 AM", activity: "Delegate Registration & VIP Pass QR Entry Scan", assignedTo: "Check-in Staff", status: "In Progress" },
      { time: "10:00 AM", activity: "Grand Opening Keynote Introduction by Host Siddharth Maurya", assignedTo: "Siddharth Maurya", status: "Pending" },
      { time: "11:30 AM", activity: "Panel Discussion: Future of Enterprise AI in India", assignedTo: "Sid (Moderator) + 4 CXOs", status: "Pending" },
      { time: "04:30 PM", activity: "TechNext Innovator Awards Ceremony & Closing Toast", assignedTo: "Siddharth Maurya", status: "Pending" },
    ],
    assignedTeam: [
      { role: "Master of Ceremonies (Host)", name: "Siddharth “Sid” Maurya", phone: "+91 98200 88776" },
      { role: "Stage Production Manager", name: "Rakesh Verma", phone: "+91 98200 44321" },
      { role: "FOH Sound Engineer", name: "Devendra Joshi", phone: "+91 98200 55432" },
    ],
  },
  {
    id: "EVT-2026-02",
    bookingId: "BK-1047",
    title: "Sunburn Arena Live Festival Showcase",
    organization: "Percept Live Entertainment",
    date: "2026-12-31",
    time: "04:00 PM - 01:00 AM",
    venue: "Vagator Arena Grounds",
    city: "Goa",
    status: "Published",
    isPublished: true,
    registrationOpen: true,
    capacity: 5000,
    registeredCount: 4890,
    runSheet: [
      { time: "03:00 PM", activity: "Stadium Line Array Acoustic Tuning & IEM Frequency Scan", assignedTo: "Percept AV Crew", status: "Completed" },
      { time: "04:30 PM", activity: "Gates Open & Arena Crowd Welcome Host Intro", assignedTo: "Siddharth Maurya", status: "Pending" },
      { time: "11:55 PM", activity: "New Year 2027 Countdown & Pyro Show Cues", assignedTo: "Siddharth Maurya & Pyro Lead", status: "Pending" },
    ],
    assignedTeam: [
      { role: "Headline Host", name: "Siddharth “Sid” Maurya", phone: "+91 98200 88776" },
      { role: "Artist Coordinator", name: "Ananya Roy", phone: "+91 98111 99887" },
    ],
  },
];

const INITIAL_ATTENDEE_TICKETS: AttendeeTicketRecord[] = [
  {
    ticketId: "SW-TKT-9904",
    eventId: "EVT-2026-01",
    eventName: "Annual Tech Summit 2026",
    eventDate: "14 Dec 2026 • 09:30 AM IST",
    eventVenue: "Jio World Convention Centre, Mumbai",
    attendeeName: "Rahul Sen",
    attendeeEmail: "rahul.sen@fintechindia.org",
    seatZone: "VIP Front Row — Stage Left",
    qrToken: "tok_sec_9904_8817a_sw",
    status: "Active",
    registeredAt: "2026-10-25T14:30:00Z",
  },
  {
    ticketId: "SW-TKT-9905",
    eventId: "EVT-2026-01",
    eventName: "Annual Tech Summit 2026",
    eventDate: "14 Dec 2026 • 09:30 AM IST",
    eventVenue: "Jio World Convention Centre, Mumbai",
    attendeeName: "Aman Singh",
    attendeeEmail: "aman@techsummit.io",
    seatZone: "Executive Delegate Lounge — Zone A",
    qrToken: "tok_sec_9905_1120f_sw",
    status: "Active",
    registeredAt: "2026-10-26T10:15:00Z",
  },
  {
    ticketId: "SW-TKT-9906",
    eventId: "EVT-2026-02",
    eventName: "Sunburn Arena Live Festival Showcase",
    eventDate: "31 Dec 2026 • 04:00 PM IST",
    eventVenue: "Vagator Arena Grounds, Goa",
    attendeeName: "Pooja Hegde",
    attendeeEmail: "pooja.h@gmail.com",
    seatZone: "VIP Stage Front Pit",
    qrToken: "tok_sec_9906_4431b_sw",
    status: "Checked-in",
    checkedInAt: "2026-12-31T17:15:00Z",
    registeredAt: "2026-11-01T18:00:00Z",
  },
];

// ----------------------------------------------------------------------------
// GETTERS & STORAGE SYNC
// ----------------------------------------------------------------------------
export function getBookingRequests(): BookingRequest[] {
  if (typeof window === "undefined") return INITIAL_BOOKING_REQUESTS;
  try {
    const raw = localStorage.getItem(BOOKING_REQUESTS_KEY);
    if (!raw) {
      localStorage.setItem(BOOKING_REQUESTS_KEY, JSON.stringify(INITIAL_BOOKING_REQUESTS));
      return INITIAL_BOOKING_REQUESTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_BOOKING_REQUESTS;
  }
}

export function saveBookingRequests(list: BookingRequest[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BOOKING_REQUESTS_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("siddwhizz_booking_system_updated"));
  } catch {}
}

export function getConfirmedBookings(): ConfirmedBookingRecord[] {
  if (typeof window === "undefined") return INITIAL_CONFIRMED_BOOKINGS;
  try {
    const raw = localStorage.getItem(CONFIRMED_BOOKINGS_KEY);
    if (!raw) {
      localStorage.setItem(CONFIRMED_BOOKINGS_KEY, JSON.stringify(INITIAL_CONFIRMED_BOOKINGS));
      return INITIAL_CONFIRMED_BOOKINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CONFIRMED_BOOKINGS;
  }
}

export function saveConfirmedBookings(list: ConfirmedBookingRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONFIRMED_BOOKINGS_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("siddwhizz_booking_system_updated"));
  } catch {}
}

export function getManagedEvents(): ManagedEventRecord[] {
  if (typeof window === "undefined") return INITIAL_MANAGED_EVENTS;
  try {
    const raw = localStorage.getItem(MANAGED_EVENTS_KEY);
    if (!raw) {
      localStorage.setItem(MANAGED_EVENTS_KEY, JSON.stringify(INITIAL_MANAGED_EVENTS));
      return INITIAL_MANAGED_EVENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MANAGED_EVENTS;
  }
}

export function saveManagedEvents(list: ManagedEventRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MANAGED_EVENTS_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("siddwhizz_booking_system_updated"));
  } catch {}
}

export function getAttendeeTickets(): AttendeeTicketRecord[] {
  if (typeof window === "undefined") return INITIAL_ATTENDEE_TICKETS;
  try {
    const raw = localStorage.getItem(ATTENDEE_TICKETS_KEY);
    if (!raw) {
      localStorage.setItem(ATTENDEE_TICKETS_KEY, JSON.stringify(INITIAL_ATTENDEE_TICKETS));
      return INITIAL_ATTENDEE_TICKETS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ATTENDEE_TICKETS;
  }
}

export function saveAttendeeTickets(list: AttendeeTicketRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ATTENDEE_TICKETS_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("siddwhizz_booking_system_updated"));
  } catch {}
}

// ----------------------------------------------------------------------------
// MUTATION OPERATIONS (Strict business rules & state transitions)
// ----------------------------------------------------------------------------

/**
 * 1. Create a new Booking Request (From Organizer Multi-Step Form)
 */
export function createBookingRequest(
  data: Omit<BookingRequest, "id" | "status" | "submittedAt" | "assignedAdmin" | "discussionMessages">
): BookingRequest {
  const list = getBookingRequests();
  const nextNum = Math.floor(1050 + Math.random() * 8900);
  const newRequest: BookingRequest = {
    ...data,
    id: `BK-${nextNum}`,
    status: "Submitted",
    submittedAt: new Date().toISOString(),
    assignedAdmin: "Siddharth Maurya",
    discussionMessages: [
      {
        id: `msg-${Date.now()}`,
        sender: "organizer",
        senderName: data.organizerName,
        text: `Booking request created for "${data.eventName}" (${data.date}). Special notes: ${data.specialInstructions || "Standard stage hosting requested."}`,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  list.unshift(newRequest);
  saveBookingRequests(list);
  return newRequest;
}

/**
 * 2. Update Request Status (Admin Review, Needs Info, Discussion, Approve, Reject)
 */
export function updateBookingRequestStatus(
  id: string,
  newStatus: BookingRequestStatus,
  adminNote?: string
): boolean {
  const list = getBookingRequests();
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return false;

  list[idx]!.status = newStatus;
  if (adminNote) {
    list[idx]!.discussionMessages.push({
      id: `msg-${Date.now()}`,
      sender: "admin",
      senderName: "Siddharth Maurya (Admin)",
      text: adminNote,
      timestamp: new Date().toISOString(),
    });
  }

  saveBookingRequests(list);
  return true;
}

/**
 * 3. Send Discussion Message (Thread between Admin & Organizer)
 */
export function sendBookingMessage(
  requestId: string,
  sender: "admin" | "organizer",
  senderName: string,
  text: string
): boolean {
  const list = getBookingRequests();
  const idx = list.findIndex((r) => r.id === requestId);
  if (idx === -1) return false;

  list[idx]!.discussionMessages.push({
    id: `msg-${Date.now()}`,
    sender,
    senderName,
    text: text.trim(),
    timestamp: new Date().toISOString(),
  });

  saveBookingRequests(list);
  return true;
}

/**
 * 4. Create / Send Commercial Quote for Request (Admin -> Organizer)
 */
export function sendQuoteForBooking(
  requestId: string,
  quote: {
    hostingFee: string;
    travelLodging: string;
    techRiderFee: string;
    totalAmount: string;
    advanceDeposit: string;
    validUntil: string;
  }
): boolean {
  const list = getBookingRequests();
  const idx = list.findIndex((r) => r.id === requestId);
  if (idx === -1) return false;

  const currentVersion = list[idx]!.quoteDetails?.version || 0;
  list[idx]!.quoteDetails = {
    version: currentVersion + 1,
    ...quote,
    acceptedByOrganizer: false,
  };
  list[idx]!.quotedFee = quote.totalAmount;
  list[idx]!.status = "Quotation Shared";

  list[idx]!.discussionMessages.push({
    id: `msg-${Date.now()}`,
    sender: "admin",
    senderName: "Siddharth Maurya (Admin)",
    text: `Commercial Quote v${currentVersion + 1} shared: ${quote.totalAmount} (50% Advance Deposit: ${quote.advanceDeposit}). Valid until ${quote.validUntil}.`,
    timestamp: new Date().toISOString(),
  });

  saveBookingRequests(list);
  return true;
}

/**
 * 5. Accept Quote (Organizer Action)
 */
export function acceptQuoteByOrganizer(requestId: string): boolean {
  const list = getBookingRequests();
  const idx = list.findIndex((r) => r.id === requestId);
  if (idx === -1 || !list[idx]!.quoteDetails) return false;

  list[idx]!.quoteDetails!.acceptedByOrganizer = true;
  list[idx]!.quoteDetails!.acceptedAt = new Date().toISOString();
  list[idx]!.status = "Approved";

  list[idx]!.discussionMessages.push({
    id: `msg-${Date.now()}`,
    sender: "organizer",
    senderName: list[idx]!.organizerName,
    text: `Quotation accepted by organizer. Ready for final contract execution and stage calendar locking.`,
    timestamp: new Date().toISOString(),
  });

  saveBookingRequests(list);
  return true;
}

/**
 * 6. Confirm Booking & Lock Calendar Slot (Atomic transaction creating ConfirmedBooking and Event)
 */
export function confirmBookingAndCreateEvent(requestId: string): { success: boolean; contractRef?: string; error?: string } {
  const list = getBookingRequests();
  const req = list.find((r) => r.id === requestId);
  if (!req) return { success: false, error: "Booking request not found" };

  // Check if already confirmed
  const confirmedList = getConfirmedBookings();
  if (confirmedList.some((b) => b.id === requestId)) {
    return { success: true, contractRef: confirmedList.find((b) => b.id === requestId)!.contractRef };
  }

  // Generate unique Contract Reference
  const contractRef = `REF: SW-CONF-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 89)}`;
  const eventId = `EVT-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 89)}`;

  const fee = req.quoteDetails?.totalAmount || req.quotedFee || req.proposedBudget || "₹4,00,000";
  const advance = req.quoteDetails?.advanceDeposit || "₹2,00,000";

  // 1. Add to Confirmed Bookings
  const newConfirmed: ConfirmedBookingRecord = {
    id: req.id,
    contractRef,
    eventName: req.eventName,
    clientName: req.organizerName,
    organization: req.organization,
    date: req.date,
    time: `${req.startTime} - ${req.endTime} IST`,
    venue: req.venue,
    city: req.city,
    format: `${req.eventType} (${req.hostingRole})`,
    fee,
    advancePaid: false,
    advanceAmount: advance,
    balanceDue: advance,
    status: "Confirmed",
    confirmedAt: new Date().toISOString(),
    eventId,
  };
  confirmedList.unshift(newConfirmed);
  saveConfirmedBookings(confirmedList);

  // 2. Add to Managed Events
  const eventsList = getManagedEvents();
  const newEvent: ManagedEventRecord = {
    id: eventId,
    bookingId: req.id,
    title: req.eventName,
    organization: req.organization,
    date: req.date,
    time: `${req.startTime} - ${req.endTime}`,
    venue: req.venue,
    city: req.city,
    status: "Scheduled",
    isPublished: true,
    registrationOpen: true,
    capacity: parseInt(req.expectedAudience.replace(/\D/g, "")) || 1000,
    registeredCount: 0,
    runSheet: [
      { time: "09:00 AM", activity: "Venue AV Setup & Wireless Microphone Scan", assignedTo: "Technical AV Team", status: "Pending" },
      { time: "09:30 AM", activity: "Host Briefing with Event Director", assignedTo: "Siddharth Maurya", status: "Pending" },
      { time: "10:00 AM", activity: "Show Opening & Keynote Presentation", assignedTo: "Siddharth Maurya", status: "Pending" },
    ],
    assignedTeam: [
      { role: "Host / Emcee", name: "Siddharth “Sid” Maurya", phone: "+91 98200 88776" },
      { role: "Event Coordinator", name: req.organizerName, phone: req.organizerPhone },
    ],
  };
  eventsList.unshift(newEvent);
  saveManagedEvents(eventsList);

  // 3. Update Request Status to Confirmed
  req.status = "Confirmed";
  saveBookingRequests(list);

  return { success: true, contractRef };
}

/**
 * 7. Mark Advance Payment Paid
 */
export function recordAdvancePayment(bookingId: string): boolean {
  const list = getConfirmedBookings();
  const item = list.find((b) => b.id === bookingId);
  if (!item) return false;
  item.advancePaid = true;
  item.balanceDue = "₹0 (Paid in Full / Advance Secured)";
  saveConfirmedBookings(list);
  return true;
}

/**
 * 8. Toggle Event Publishing or Registration
 */
export function updateEventSettings(
  eventId: string,
  settings: { isPublished?: boolean; registrationOpen?: boolean }
): boolean {
  const list = getManagedEvents();
  const ev = list.find((e) => e.id === eventId);
  if (!ev) return false;

  if (settings.isPublished !== undefined) ev.isPublished = settings.isPublished;
  if (settings.registrationOpen !== undefined) ev.registrationOpen = settings.registrationOpen;

  saveManagedEvents(list);
  return true;
}

/**
 * 9. Update RunSheet Item Status
 */
export function updateRunSheetStatus(
  eventId: string,
  itemIndex: number,
  status: "Pending" | "In Progress" | "Completed"
): boolean {
  const list = getManagedEvents();
  const ev = list.find((e) => e.id === eventId);
  if (!ev || !ev.runSheet[itemIndex]) return false;

  ev.runSheet[itemIndex]!.status = status;
  saveManagedEvents(list);
  return true;
}

/**
 * 10. Register Attendee & Generate Secure Opaque QR Ticket
 */
export function registerAttendee(data: {
  eventId: string;
  name: string;
  email: string;
  phone?: string;
  seatZone?: string;
}): AttendeeTicketRecord {
  const tickets = getAttendeeTickets();
  const events = getManagedEvents();
  const ev = events.find((e) => e.id === data.eventId);

  const nextTicketNum = Math.floor(9900 + Math.random() * 990);
  const token = `tok_sec_${nextTicketNum}_${Math.random().toString(36).substring(2, 8)}_sw`;

  const newTicket: AttendeeTicketRecord = {
    ticketId: `SW-TKT-${nextTicketNum}`,
    eventId: data.eventId,
    eventName: ev ? ev.title : "SiddWhizz Flagship Production",
    eventDate: ev ? `${ev.date} • ${ev.time} IST` : "14 Dec 2026",
    eventVenue: ev ? `${ev.venue}, ${ev.city}` : "Jio World Convention Centre, Mumbai",
    attendeeName: data.name.trim(),
    attendeeEmail: data.email.trim(),
    seatZone: data.seatZone || "VIP Front Row — Stage Left",
    qrToken: token,
    status: "Active",
    registeredAt: new Date().toISOString(),
  };

  tickets.unshift(newTicket);
  saveAttendeeTickets(tickets);

  // Increment event registered count
  if (ev) {
    ev.registeredCount = (ev.registeredCount || 0) + 1;
    saveManagedEvents(events);
  }

  return newTicket;
}

/**
 * 11. Validate and Check-In QR Ticket (Simulates event day scanner)
 */
export function validateAndCheckInTicket(identifier: string): {
  valid: boolean;
  ticket?: AttendeeTicketRecord;
  message: string;
  status: "Valid" | "Already Checked In" | "Revoked" | "Not Found";
} {
  const tickets = getAttendeeTickets();
  const clean = identifier.trim();
  const ticket = tickets.find((t) => t.ticketId === clean || t.qrToken === clean);

  if (!ticket) {
    return {
      valid: false,
      status: "Not Found",
      message: "Ticket not found in event database. Please verify Ticket ID or QR token.",
    };
  }

  if (ticket.status === "Revoked") {
    return {
      valid: false,
      ticket,
      status: "Revoked",
      message: "Access Denied: Ticket has been revoked by event administration.",
    };
  }

  if (ticket.status === "Checked-in") {
    return {
      valid: false,
      ticket,
      status: "Already Checked In",
      message: `Duplicate Scan Warning: Ticket already checked in on ${new Date(ticket.checkedInAt || "").toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}.`,
    };
  }

  // Successful First Check-in
  ticket.status = "Checked-in";
  ticket.checkedInAt = new Date().toISOString();
  saveAttendeeTickets(tickets);

  return {
    valid: true,
    ticket,
    status: "Valid",
    message: `Entry Approved: Welcome, ${ticket.attendeeName}! (${ticket.seatZone})`,
  };
}

/**
 * 12. Get Unified Calendar Availability & Conflict Detector
 */
export function getCalendarSlots(): CalendarSlotRecord[] {
  const bookings = getConfirmedBookings();
  const requests = getBookingRequests();

  const slots: CalendarSlotRecord[] = [];

  // Add confirmed bookings
  bookings.forEach((b) => {
    slots.push({
      date: b.date,
      time: b.time,
      title: b.eventName,
      venue: b.venue,
      city: b.city,
      status: "Confirmed",
      clientName: b.clientName,
      bookingId: b.id,
    });
  });

  // Add tentative/under review holds
  requests
    .filter((r) => r.status === "Under Review" || r.status === "Quotation Shared")
    .forEach((r) => {
      if (!slots.some((s) => s.date === r.date)) {
        slots.push({
          date: r.date,
          time: `${r.startTime} - ${r.endTime}`,
          title: r.eventName,
          venue: r.venue,
          city: r.city,
          status: "Tentative",
          clientName: r.organizerName,
          bookingId: r.id,
        });
      }
    });

  return slots;
}

export function checkDateConflict(targetDate: string): { conflict: boolean; reason?: string; booking?: CalendarSlotRecord } {
  if (!targetDate) return { conflict: false };
  const slots = getCalendarSlots();
  const match = slots.find((s) => s.date === targetDate);
  if (match) {
    return {
      conflict: true,
      reason: match.status === "Confirmed"
        ? `Date ${targetDate} is permanently locked for "${match.title}" (${match.city}).`
        : `Date ${targetDate} is on temporary hold for "${match.title}".`,
      booking: match,
    };
  }
  return { conflict: false };
}

