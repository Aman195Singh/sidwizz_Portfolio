/**
 * Unified Live Data Store & NeonDB Synchronizer for SIDD.WHIZZ
 *
 * Provides persistent storage for:
 * 1. Stage Booking Enquiries (cross-shared between /contact, /organizer, and /admin)
 * 2. Confirmed Event Bookings & Executed Contracts
 * 3. Media Asset Library (Photos, Videos, Documents, Audio)
 * 4. Technical Rider & Support Tickets
 * 5. Global Site & Booking Availability Settings
 *
 * Persists to browser localStorage with auto-seeding, and synchronizes
 * mutations with Neon PostgreSQL on the server via TanStack Start Server Functions.
 */

import hostPurple from "@/assets/host-purple.jpg";
import confettiConcert from "@/assets/confetti-concert.jpg";
import hostBowtie from "@/assets/host-bowtie.jpg";
import stageBeams from "@/assets/stage-beams.jpg";
import festivalCrowd from "@/assets/festival-crowd.jpg";
import techSummit from "@/assets/tech-summit.jpg";
import conferenceHall from "@/assets/conference-hall.jpg";
import micDark from "@/assets/mic-dark.jpg";
import conclaveStage from "@/assets/conclave-stage.jpg";
import starTrophy from "@/assets/star-trophy.jpg";
import {
  insertNeonEnquiryServerFn,
  updateNeonEnquiryStatusServerFn,
  insertNeonContractServerFn,
  markNeonAdvancePaidServerFn,
  insertNeonTicketServerFn,
} from "@/lib/neon-server";

export interface Enquiry {
  id: string;
  eventName: string;
  clientName: string;
  organization: string;
  email: string;
  phone: string;
  cleanPhone: string;
  date: string;
  city: string;
  venue: string;
  crowdSize: string;
  format: string;
  budget: string;
  status: "New" | "In Discussion" | "Confirmed" | "Declined";
  createdAt: string;
  brief: string;
  notes?: string[];
  packageTier?: string;
}

export interface Booking {
  id: string;
  enquiryId?: string;
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
  status: "Confirmed" | "Completed" | "Pending";
  contractRef: string;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  title: string;
  type: "image" | "video" | "document" | "audio";
  category: string;
  size: string;
  duration?: string;
  dimensions?: string;
  url: string;
  thumbnail?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userEmail: string;
  userName?: string;
  organization?: string;
  subject: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  description: string;
  status: "Open" | "In Progress" | "Resolved";
  createdAt: string;
}

export interface SiteSettings {
  bookingAvailable: boolean;
  whatsappNotifications: boolean;
  autoReplyEnabled: boolean;
  hotlinePhone: string;
  bookingEmail: string;
  studioAddress: string;
}

// Storage Keys
const ENQUIRIES_KEY = "siddwhizz_dataset_enquiries";
const BOOKINGS_KEY = "siddwhizz_dataset_bookings";
const MEDIA_KEY = "siddwhizz_dataset_media";
const TICKETS_KEY = "siddwhizz_dataset_tickets";
const SETTINGS_KEY = "siddwhizz_site_settings";

// Initial Seed Datasets
const DEFAULT_ENQUIRIES: Enquiry[] = [
  {
    id: "ENQ-101",
    eventName: "Global FinTech Summit 2026",
    clientName: "Arjun Nair",
    organization: "FinTech India Association",
    email: "arjun.nair@fintechsummit.in",
    phone: "+91 98201 54321",
    cleanPhone: "919820154321",
    date: "2026-12-14",
    city: "Mumbai",
    venue: "Jio World Convention Centre, BKC",
    crowdSize: "1,500+ CXOs & Founders",
    format: "Tech Summit & Keynotes",
    budget: "₹3,50,000 - ₹5,00,000",
    status: "New",
    createdAt: "2026-11-04 10:30 AM",
    brief: "Looking for high energy hosting for 2 full days, opening keynote moderation, and evening gala awards.",
    notes: ["Client requested host showreel video link", "Preferred date is firm"],
    packageTier: "Full-Day Summit / Gala",
  },
  {
    id: "ENQ-102",
    eventName: "Deloitte Leadership Conclave & Gala",
    clientName: "Rohan Kapoor",
    organization: "Deloitte India Events",
    email: "rohan.kapoor@deloitte.com",
    phone: "+91 98112 99887",
    cleanPhone: "919811299887",
    date: "2026-11-28",
    city: "Bengaluru",
    venue: "The Leela Palace Ballroom",
    crowdSize: "800 Senior Partners",
    format: "Corporate Gala & Awards",
    budget: "₹2,50,000 - ₹4,00,000",
    status: "In Discussion",
    createdAt: "2026-11-03 04:15 PM",
    brief: "Annual leadership meet requiring polished stage delivery, partner award distribution, and interactive audience segments.",
    notes: ["Commercial quotation sent on Nov 3", "Awaiting confirmation from executive sponsor"],
    packageTier: "Full-Day Summit / Gala",
  },
  {
    id: "ENQ-103",
    eventName: "Sunburn Arena Live Festival Showcase",
    clientName: "Karan Mehta",
    organization: "Percept Live Entertainment",
    email: "karan.mehta@perceptlive.in",
    phone: "+91 99300 44556",
    cleanPhone: "919930044556",
    date: "2026-12-31",
    city: "Goa",
    venue: "Vagator Main Arena",
    crowdSize: "15,000+ Music Lovers",
    format: "Music Festival & Live Arena",
    budget: "₹5,00,000+",
    status: "Confirmed",
    createdAt: "2026-11-01 11:00 AM",
    brief: "Prime NYE stage crowd hyping, international DJ artist introductions, and midnight countdown.",
    notes: ["Advance deposit received", "Tech rider signed"],
    packageTier: "Multi-Day Series / Festival",
  },
  {
    id: "ENQ-104",
    eventName: "Tata Motors National Dealer Convention",
    clientName: "Meera Sen",
    organization: "Tata Motors Commercial",
    email: "meera.sen@tatamotors.com",
    phone: "+91 98450 12345",
    cleanPhone: "919845012345",
    date: "2026-12-05",
    city: "New Delhi",
    venue: "Bharat Mandapam (IECC)",
    crowdSize: "2,000 Attendees",
    format: "Product Launch & Dealer Expo",
    budget: "₹4,00,000 - ₹6,00,000",
    status: "New",
    createdAt: "2026-11-04 01:20 PM",
    brief: "EV vehicle launch showcase followed by national dealer recognition evening.",
    notes: [],
    packageTier: "Full-Day Summit / Gala",
  },
];

const DEFAULT_BOOKINGS: Booking[] = [
  {
    id: "BK-901",
    enquiryId: "ENQ-101",
    eventName: "Apex Global Tech Summits 2026",
    clientName: "Priya Sharma",
    organization: "Apex Global Tech Summits Pvt Ltd",
    date: "2026-12-14",
    time: "09:00 AM - 05:30 PM",
    venue: "Jio World Convention Centre",
    city: "Mumbai",
    format: "Technology Summit & Panel Moderation",
    fee: "₹4,00,000",
    advancePaid: true,
    status: "Confirmed",
    contractRef: "REF: SID-CONF-2026-88",
    createdAt: "2026-10-25",
  },
  {
    id: "BK-902",
    enquiryId: "ENQ-103",
    eventName: "Sunburn Arena Live Festival Showcase",
    clientName: "Karan Mehta",
    organization: "Percept Live Entertainment",
    date: "2026-12-31",
    time: "07:00 PM - 01:00 AM",
    venue: "Vagator Main Arena",
    city: "Goa",
    format: "Music Festival & Live Arena",
    fee: "₹5,50,000",
    advancePaid: true,
    status: "Confirmed",
    contractRef: "REF: SID-CONF-2026-92",
    createdAt: "2026-11-01",
  },
];

const DEFAULT_MEDIA: MediaItem[] = [
  {
    id: "med-1",
    title: "Global FinTech Summit 2025 Keynote Intro",
    type: "video",
    category: "Showreels",
    size: "42.5 MB",
    duration: "2:15 min",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: techSummit,
    createdAt: "2026-10-20",
  },
  {
    id: "med-2",
    title: "Siddharth Maurya High-Res Stage Anchor Shot",
    type: "image",
    category: "Portraits",
    size: "2.4 MB",
    dimensions: "3840 x 2160",
    url: hostPurple,
    thumbnail: hostPurple,
    createdAt: "2026-10-15",
  },
  {
    id: "med-3",
    title: "Concert Finale Confetti Blast Arena",
    type: "image",
    category: "Festivals",
    size: "3.1 MB",
    dimensions: "4000 x 2667",
    url: confettiConcert,
    thumbnail: confettiConcert,
    createdAt: "2026-10-18",
  },
  {
    id: "med-4",
    title: "Siddharth Maurya Technical Stage Rider & Hospitality Guide (PDF)",
    type: "document",
    category: "Riders & Specs",
    size: "1.2 MB",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    thumbnail: conferenceHall,
    createdAt: "2026-11-01",
  },
  {
    id: "med-5",
    title: "High-Impact Emcee Intro Voiceover & BGM",
    type: "audio",
    category: "Audio Clips",
    size: "4.8 MB",
    duration: "0:42 sec",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    thumbnail: micDark,
    createdAt: "2026-09-12",
  },
  {
    id: "med-6",
    title: "Black Bowtie Gala Host Portrait",
    type: "image",
    category: "Headshots",
    size: "1.8 MB",
    dimensions: "2400 x 3000",
    url: hostBowtie,
    thumbnail: hostBowtie,
    createdAt: "2026-10-05",
  },
  {
    id: "med-7",
    title: "Live Concert Arena Stage Beams",
    type: "image",
    category: "Stage Moments",
    size: "2.8 MB",
    dimensions: "3840 x 2160",
    url: stageBeams,
    thumbnail: stageBeams,
    createdAt: "2026-10-25",
  },
  {
    id: "med-8",
    title: "Sunburn Arena Massive Crowd Atmosphere",
    type: "image",
    category: "Festivals",
    size: "3.5 MB",
    dimensions: "3840 x 2400",
    url: festivalCrowd,
    thumbnail: festivalCrowd,
    createdAt: "2026-10-30",
  },
];

const DEFAULT_TICKETS: SupportTicket[] = [
  {
    id: "TKT-401",
    userEmail: "priya.sharma@eventcorp.in",
    userName: "Priya Sharma",
    organization: "Apex Global Tech Summits Pvt Ltd",
    subject: "Additional Wireless Handheld Mic for Panel Q&A (Dec 14)",
    priority: "Medium",
    description:
      "Requesting confirmation for 2 extra Shure Axient wireless mics for the afternoon fireside chat with 4 speakers.",
    status: "Open",
    createdAt: "2026-11-04 11:15 AM",
  },
];

const DEFAULT_SETTINGS: SiteSettings = {
  bookingAvailable: true,
  whatsappNotifications: true,
  autoReplyEnabled: true,
  hotlinePhone: "+91 98765 43210",
  bookingEmail: "bookings@siddwhizz.com",
  studioAddress: "Aerocity Business District, New Delhi — 110037",
};

// -------------------------------------------------------------
// ENQUIRIES API
// -------------------------------------------------------------

export function getStoredEnquiries(): Enquiry[] {
  if (typeof window === "undefined") return DEFAULT_ENQUIRIES;
  try {
    const raw = localStorage.getItem(ENQUIRIES_KEY);
    if (!raw) {
      localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(DEFAULT_ENQUIRIES));
      return DEFAULT_ENQUIRIES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Failed to read enquiries from storage:", err);
    return DEFAULT_ENQUIRIES;
  }
}

export function saveEnquiry(
  data: Omit<Enquiry, "id" | "createdAt" | "cleanPhone"> & { cleanPhone?: string }
): Enquiry {
  const current = getStoredEnquiries();
  const cleanPhone = (data.phone || "").replace(/\D/g, "");
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const newEnquiry: Enquiry = {
    id: `ENQ-${Math.floor(100 + Math.random() * 900)}`,
    eventName: data.eventName.trim(),
    clientName: data.clientName.trim(),
    organization: data.organization?.trim() || "Corporate Client",
    email: data.email.trim(),
    phone: data.phone.trim(),
    cleanPhone: cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`,
    date: data.date || "To be scheduled",
    city: data.city.trim(),
    venue: data.venue.trim() || `${data.city.trim()} Venue`,
    crowdSize: data.crowdSize || "500 - 1,000 Attendees",
    format: data.format || "Stage Host & Moderator",
    budget: data.budget || "₹2,50,000 - ₹4,00,000",
    status: data.status || "New",
    createdAt: formattedDate,
    brief: data.brief.trim(),
    notes: data.notes || [],
    packageTier: data.packageTier || "Full-Day Summit / Gala",
  };

  const updated = [newEnquiry, ...current];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("siddwhizz_enquiries_updated"));
    } catch (err) {
      console.warn("Failed to persist new enquiry:", err);
    }

    // Background Server RPC sync to Neon PostgreSQL
    insertNeonEnquiryServerFn({
      data: {
        id: newEnquiry.id,
        eventName: newEnquiry.eventName,
        clientName: newEnquiry.clientName,
        organization: newEnquiry.organization,
        email: newEnquiry.email,
        phone: newEnquiry.phone,
        cleanPhone: newEnquiry.cleanPhone,
        date: newEnquiry.date,
        city: newEnquiry.city,
        venue: newEnquiry.venue,
        crowdSize: newEnquiry.crowdSize,
        format: newEnquiry.format,
        budget: newEnquiry.budget,
        status: newEnquiry.status,
        brief: newEnquiry.brief,
      },
    }).catch(() => {});
  }

  return newEnquiry;
}

export function updateEnquiryStatus(id: string, status: Enquiry["status"]): boolean {
  const current = getStoredEnquiries();
  const index = current.findIndex((e) => e.id === id);
  if (index === -1) return false;

  current[index].status = status;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(current));
      window.dispatchEvent(new Event("siddwhizz_enquiries_updated"));
    } catch (err) {
      console.warn("Failed to update enquiry status:", err);
    }

    updateNeonEnquiryStatusServerFn({ data: { id, status } }).catch(() => {});
  }
  return true;
}

export function addEnquiryNote(id: string, note: string): boolean {
  const current = getStoredEnquiries();
  const index = current.findIndex((e) => e.id === id);
  if (index === -1) return false;

  const enq = current[index];
  enq.notes = [...(enq.notes || []), note.trim()];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(current));
      window.dispatchEvent(new Event("siddwhizz_enquiries_updated"));
    } catch (err) {
      console.warn("Failed to add enquiry note:", err);
    }
  }
  return true;
}

// -------------------------------------------------------------
// BOOKINGS & CONTRACTS API
// -------------------------------------------------------------

export function getStoredBookings(): Booking[] {
  if (typeof window === "undefined") return DEFAULT_BOOKINGS;
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (!raw) {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(DEFAULT_BOOKINGS));
      return DEFAULT_BOOKINGS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_BOOKINGS;
  }
}

export function saveBookingContract(
  data: Omit<Booking, "id" | "createdAt" | "contractRef"> & { contractRef?: string }
): Booking {
  const current = getStoredBookings();
  const randomRef = Math.floor(10 + Math.random() * 89);
  const newBooking: Booking = {
    ...data,
    id: `BK-${Math.floor(100 + Math.random() * 900)}`,
    contractRef: data.contractRef || `REF: SID-CONF-2026-${randomRef}`,
    createdAt: new Date().toISOString().split("T")[0],
  };

  const updated = [newBooking, ...current];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("siddwhizz_bookings_updated"));
    } catch (err) {
      console.warn("Failed to save booking contract:", err);
    }

    insertNeonContractServerFn({
      data: {
        id: newBooking.id,
        enquiryId: newBooking.enquiryId,
        eventName: newBooking.eventName,
        clientName: newBooking.clientName,
        organization: newBooking.organization,
        date: newBooking.date,
        time: newBooking.time,
        venue: newBooking.venue,
        city: newBooking.city,
        format: newBooking.format,
        fee: newBooking.fee,
        advancePaid: newBooking.advancePaid,
        status: newBooking.status,
        contractRef: newBooking.contractRef,
      },
    }).catch(() => {});
  }

  return newBooking;
}

export function approveEnquiryToContract(params: {
  enquiryId: string;
  agreedFee: string;
  timeSlot?: string;
  advancePaid?: boolean;
}): Booking | null {
  const enquiries = getStoredEnquiries();
  const target = enquiries.find((e) => e.id === params.enquiryId);
  if (!target) return null;

  updateEnquiryStatus(target.id, "Confirmed");
  addEnquiryNote(
    target.id,
    `Contract issued at ${params.agreedFee} (${params.advancePaid ? "50% Advance Paid" : "Awaiting 50% Advance"})`
  );

  // Check if contract already exists for this enquiry
  const existing = getStoredBookings().find((b) => b.enquiryId === target.id);
  if (existing) {
    return existing;
  }

  return saveBookingContract({
    enquiryId: target.id,
    eventName: target.eventName,
    clientName: target.clientName,
    organization: target.organization,
    date: target.date,
    time: params.timeSlot || "09:30 AM - 06:00 PM",
    venue: target.venue,
    city: target.city,
    format: target.format,
    fee: params.agreedFee,
    advancePaid: Boolean(params.advancePaid),
    status: "Confirmed",
  });
}

export function markBookingAdvancePaid(bookingId: string): boolean {
  const current = getStoredBookings();
  const idx = current.findIndex((b) => b.id === bookingId);
  if (idx === -1) return false;

  current[idx].advancePaid = true;
  current[idx].status = "Confirmed";

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(current));
      window.dispatchEvent(new Event("siddwhizz_bookings_updated"));
    } catch (err) {
      console.warn("Failed to update booking advance status:", err);
    }

    markNeonAdvancePaidServerFn({ data: { id: bookingId } }).catch(() => {});
  }
  return true;
}

export interface LockedDateInfo {
  date: string;
  eventName: string;
  city: string;
  status: "Confirmed" | "Pending";
}

export function getLockedEventDates(): LockedDateInfo[] {
  const bookings = getStoredBookings();
  const enquiries = getStoredEnquiries();
  const map = new Map<string, LockedDateInfo>();

  for (const b of bookings) {
    if (b.date && /^\d{4}-\d{2}-\d{2}$/.test(b.date)) {
      map.set(b.date, {
        date: b.date,
        eventName: b.eventName,
        city: b.city,
        status: "Confirmed",
      });
    }
  }

  for (const e of enquiries) {
    if (e.date && /^\d{4}-\d{2}-\d{2}$/.test(e.date) && e.status !== "Declined") {
      if (!map.has(e.date)) {
        map.set(e.date, {
          date: e.date,
          eventName: e.eventName,
          city: e.city,
          status: e.status === "Confirmed" ? "Confirmed" : "Pending",
        });
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

// -------------------------------------------------------------
// SUPPORT & TECHNICAL RIDER TICKETS API
// -------------------------------------------------------------

export function getStoredTickets(): SupportTicket[] {
  if (typeof window === "undefined") return DEFAULT_TICKETS;
  try {
    const raw = localStorage.getItem(TICKETS_KEY);
    if (!raw) {
      localStorage.setItem(TICKETS_KEY, JSON.stringify(DEFAULT_TICKETS));
      return DEFAULT_TICKETS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_TICKETS;
  }
}

export function saveSupportTicket(
  data: Omit<SupportTicket, "id" | "createdAt" | "status"> & { status?: SupportTicket["status"] }
): SupportTicket {
  const current = getStoredTickets();
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const newTicket: SupportTicket = {
    id: `TKT-${Math.floor(100 + Math.random() * 900)}`,
    userEmail: data.userEmail,
    userName: data.userName || "Event Organizer",
    organization: data.organization || "Partner Organization",
    subject: data.subject.trim(),
    priority: data.priority || "Medium",
    description: data.description.trim(),
    status: data.status || "Open",
    createdAt: formattedDate,
  };

  const updated = [newTicket, ...current];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(TICKETS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("siddwhizz_tickets_updated"));
    } catch (err) {
      console.warn("Failed to save support ticket:", err);
    }

    insertNeonTicketServerFn({
      data: {
        id: newTicket.id,
        userEmail: newTicket.userEmail,
        subject: newTicket.subject,
        priority: newTicket.priority,
        description: newTicket.description,
        status: newTicket.status,
      },
    }).catch(() => {});
  }

  return newTicket;
}

export function updateTicketStatus(id: string, status: SupportTicket["status"]): boolean {
  const current = getStoredTickets();
  const idx = current.findIndex((t) => t.id === id);
  if (idx === -1) return false;

  current[idx].status = status;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(TICKETS_KEY, JSON.stringify(current));
      window.dispatchEvent(new Event("siddwhizz_tickets_updated"));
    } catch (err) {
      console.warn("Failed to update ticket status:", err);
    }
  }
  return true;
}

// -------------------------------------------------------------
// GLOBAL SITE & BOOKING SETTINGS API
// -------------------------------------------------------------

export function getSiteSettings(): SiteSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function updateSiteSettings(partial: Partial<SiteSettings>): SiteSettings {
  const next = { ...getSiteSettings(), ...partial };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("siddwhizz_settings_updated"));
    } catch (err) {
      console.warn("Failed to update site settings:", err);
    }
  }
  return next;
}

// -------------------------------------------------------------
// MEDIA API
// -------------------------------------------------------------

export function getStoredMedia(): MediaItem[] {
  if (typeof window === "undefined") return DEFAULT_MEDIA;
  try {
    const raw = localStorage.getItem(MEDIA_KEY);
    if (!raw) {
      localStorage.setItem(MEDIA_KEY, JSON.stringify(DEFAULT_MEDIA));
      return DEFAULT_MEDIA;
    }
    const parsed: MediaItem[] = JSON.parse(raw);
    let migrated = false;
    const cleanList = parsed.map((item) => {
      if (item.url && item.url.includes("sidwizz-portfolio.vercel.app")) {
        migrated = true;
        if (item.id === "med-2" || item.url.includes("host-purple")) return { ...item, url: hostPurple };
        if (item.id === "med-3" || item.url.includes("confetti-concert")) return { ...item, url: confettiConcert };
        if (item.id === "med-6" || item.url.includes("host-bowtie")) return { ...item, url: hostBowtie };
        if (item.id === "med-7" || item.url.includes("stage-beams")) return { ...item, url: stageBeams };
        if (item.url.includes(".pdf")) return { ...item, url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" };
        if (item.url.includes(".mp3")) return { ...item, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" };
        return { ...item, url: stageBeams };
      }
      return item;
    });
    if (migrated) {
      localStorage.setItem(MEDIA_KEY, JSON.stringify(cleanList));
    }
    return cleanList;
  } catch {
    return DEFAULT_MEDIA;
  }
}

export function addMediaItem(item: Omit<MediaItem, "id" | "createdAt">): MediaItem {
  const current = getStoredMedia();
  const newItem: MediaItem = {
    ...item,
    id: `med-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString().split("T")[0],
  };

  const updated = [newItem, ...current];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(MEDIA_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("siddwhizz_media_updated"));
    } catch (err) {
      console.warn("Failed to add media item:", err);
    }
  }
  return newItem;
}

export function deleteMediaItem(id: string): boolean {
  const current = getStoredMedia();
  const filtered = current.filter((m) => m.id !== id);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(MEDIA_KEY, JSON.stringify(filtered));
      window.dispatchEvent(new Event("siddwhizz_media_updated"));
    } catch (err) {
      console.warn("Failed to delete media item:", err);
    }
  }
  return true;
}

export function updateMediaThumbnail(id: string, thumbnail: string): boolean {
  const current = getStoredMedia();
  const idx = current.findIndex((m) => m.id === id);
  if (idx === -1) return false;

  current[idx].thumbnail = thumbnail;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(MEDIA_KEY, JSON.stringify(current));
      window.dispatchEvent(new Event("siddwhizz_media_updated"));
    } catch (err) {
      console.warn("Failed to update media thumbnail:", err);
    }
  }
  return true;
}

export function getDefaultThumbnail(item: { type: string; url?: string; thumbnail?: string }): string {
  if (item.thumbnail && item.thumbnail.trim()) return item.thumbnail;
  if (item.type === "image" && item.url) return item.url;
  if (item.type === "video") return techSummit;
  if (item.type === "audio") return micDark;
  if (item.type === "document") return conferenceHall;
  return stageBeams;
}
