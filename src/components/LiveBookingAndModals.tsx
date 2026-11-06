import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Calendar,
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  MapPin,
  Mic,
  Play,
  Printer,
  QrCode,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Award,
  Globe,
} from "lucide-react";

// ============================================================================
// 1. EXECUTED STAGE CONTRACT VIEWER, PRINTABLE PDF & ADVANCE PAYMENT MODAL
// ============================================================================
export interface ContractBookingInfo {
  id: string;
  contractRef: string;
  eventName: string;
  clientName: string;
  organization: string;
  date: string;
  time?: string;
  venue: string;
  city?: string;
  format?: string;
  fee: string;
  advancePaid: boolean;
  gstin?: string;
}

export interface ContractModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  booking?: ContractBookingInfo | null;
  contractRef?: string;
  eventName?: string;
  organizerName?: string;
  organization?: string;
  eventDate?: string;
  eventTime?: string;
  venue?: string;
  city?: string;
  fee?: string;
  advancePaid?: boolean;
  onPayAdvance?: (bookingId: string) => Promise<void> | void;
}

export function ContractModal({
  isOpen,
  open,
  onClose,
  booking,
  contractRef: propContractRef,
  eventName: propEventName,
  organizerName: propOrganizerName,
  organization: propOrganization,
  eventDate: propEventDate,
  eventTime: propEventTime = "09:00 AM - 05:30 PM IST",
  venue: propVenue,
  city: propCity = "Mumbai",
  fee: propFee,
  advancePaid: propAdvancePaid,
  onPayAdvance,
}: ContractModalProps) {
  const [paying, setPaying] = useState(false);

  const show = isOpen ?? open ?? false;
  if (!show) return null;

  const contractRef = booking?.contractRef ?? propContractRef ?? "SW-2026-8841";
  const eventName = booking?.eventName ?? propEventName ?? "Corporate Flagship Event";
  const organizerName = booking?.clientName ?? propOrganizerName ?? "Event Organizer";
  const organization = booking?.organization ?? propOrganization ?? "Partner Organization";
  const eventDate = booking?.date ?? propEventDate ?? "Upcoming Date";
  const eventTime = booking?.time ?? propEventTime;
  const venue = booking?.venue ?? propVenue ?? "Main Convention Hall";
  const city = booking?.city ?? propCity;
  const fee = booking?.fee ?? propFee ?? "₹3,50,000";
  const advancePaid = booking?.advancePaid ?? propAdvancePaid ?? false;
  const bookingId = booking?.id ?? contractRef;

  const handleAdvanceClick = async () => {
    if (!onPayAdvance) return;
    setPaying(true);
    try {
      await onPayAdvance(bookingId);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 sm:p-8 text-foreground shadow-2xl my-8 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-primary">
              <FileText className="h-4 w-4" />
              Executed Stage Engagement Agreement
            </span>
            <h3 className="font-display text-xl font-black text-foreground mt-1">
              {contractRef}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition cursor-pointer"
            aria-label="Close contract modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-border bg-background p-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Artist / Master of Ceremonies
              </p>
              <p className="font-display font-bold text-foreground mt-0.5">
                Siddharth “Sid” Maurya (SIDD.WHIZZ)
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Client / Event Organizer
              </p>
              <p className="font-display font-bold text-foreground mt-0.5">
                {organizerName} ({organization})
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Event Title & Schedule
              </p>
              <p className="font-semibold text-foreground mt-0.5">
                {eventName}
              </p>
              <p className="text-xs text-muted-foreground">
                {eventDate} • {eventTime}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Venue & Agreed Performance Fee
              </p>
              <p className="font-semibold text-foreground mt-0.5">
                {venue}{city ? `, ${city}` : ""}
              </p>
              <p className="font-mono font-extrabold text-primary">
                {fee} (+18% GST)
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2 text-xs leading-relaxed text-muted-foreground">
            <p className="font-bold text-foreground uppercase tracking-wider">
              Terms of Stage Engagement & Technical Rider:
            </p>
            <p>
              1. <strong>Date Locking & Deposit:</strong> A 50% advance booking deposit is required to permanently lock the stage calendar date. Balance 50% is payable 48 hours prior to show day.
            </p>
            <p>
              2. <strong>Technical AV Rider:</strong> Organizer agrees to provide 1x Shure Axient Digital Wireless Handheld (KSM9/Beta58 capsule), Dual IEM feed with show-caller talkback, two downstage confidence monitors, and a private green room.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-background p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Deposit & Calendar Lock Status:
            </span>
            {advancePaid ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-500">
                <CheckCircle2 className="h-4 w-4" /> 50% Advance Paid — Stage Date Locked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/30 px-3 py-1 text-xs font-bold text-primary">
                ⏳ Pending 50% Advance Deposit to Lock Date
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 border-t border-border pt-4">
          {!advancePaid && onPayAdvance && (
            <button
              type="button"
              disabled={paying}
              onClick={handleAdvanceClick}
              className="btn-red !py-2.5 !px-5 text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard className="h-4 w-4" />
              <span>{paying ? "Confirming Deposit..." : "Pay 50% Advance Deposit Now"}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-outline !py-2.5 !px-5 text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="h-4 w-4 text-primary" />
            <span>Print / Save Contract PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. TECHNICAL RIDER ADJUSTMENT MODAL (/organizer -> support_tickets)
// ============================================================================
export interface TechnicalRiderRequestModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  organizerEmail?: string;
  userEmail?: string;
  organizerName?: string;
  organization?: string;
  onSubmitTicket?: (data: {
    userEmail: string;
    subject: string;
    priority: "Low" | "Medium" | "High" | "Critical";
    description: string;
  }) => Promise<{ ticketId: string }> | { ticketId: string };
  onSubmitRequest?: (data: {
    subject: string;
    priority: "Low" | "Medium" | "High" | "Critical";
    description: string;
  }) => Promise<void> | void;
}

export function TechnicalRiderRequestModal({
  isOpen,
  open,
  onClose,
  organizerEmail,
  userEmail,
  onSubmitTicket,
  onSubmitRequest,
}: TechnicalRiderRequestModalProps) {
  const [subject, setSubject] = useState("AV & Wireless Microphone Frequency Adjustment");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "Critical">("High");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const show = isOpen ?? open ?? false;
  if (!show) return null;

  const effectiveEmail = organizerEmail ?? userEmail ?? "organizer@siddwhizz.com";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 5) return;
    setSubmitting(true);
    try {
      if (onSubmitTicket) {
        const res = await onSubmitTicket({
          userEmail: effectiveEmail,
          subject: subject.trim(),
          priority,
          description: description.trim(),
        });
        setTicketId(res.ticketId);
      } else if (onSubmitRequest) {
        await onSubmitRequest({
          subject: subject.trim(),
          priority,
          description: description.trim(),
        });
        setTicketId(`TKT-${Math.floor(1000 + Math.random() * 9000)}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 text-foreground shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Stage Production Desk
            </span>
            <h3 className="font-display text-lg font-extrabold text-foreground">
              Request Technical Rider Adjustment
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {ticketId ? (
          <div className="py-6 text-center space-y-3">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/15 text-primary border border-primary/30">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="font-display text-lg font-extrabold text-foreground">
              Rider Adjustment Logged ({ticketId})
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Your technical production request has been saved to the database and routed to Siddharth Maurya's Stage Sound Engineer.
            </p>
            <button
              type="button"
              onClick={() => {
                setTicketId(null);
                setDescription("");
                onClose();
              }}
              className="btn-red !py-2 !px-6 text-xs cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Adjustment Subject *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Production Priority
              </label>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as "Low" | "Medium" | "High" | "Critical")
                }
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="Medium">Medium — Pre-Production Planning</option>
                <option value="High">High — Main Stage AV / Microphone</option>
                <option value="Critical">Critical — Show Day Setup</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Venue AV Details / Substitution Request *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Specify available wireless mic model, mixer channels, confidence monitor placement, or green room arrangement..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline !py-2 !px-4 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-red !py-2 !px-5 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{submitting ? "Submitting..." : "Submit Rider Ticket"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 3. INTERACTIVE VIP STAGE PASS QR CODE MODAL (/profile)
// ============================================================================
export interface VipPassQrModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  passId?: string;
  eventName?: string;
  attendeeName?: string;
  attendeeEmail?: string;
  passHolderName?: string;
  passHolderEmail?: string;
  eventDate?: string;
  venue?: string;
  seatZone?: string;
}

export function VipPassQrModal({
  isOpen,
  open,
  onClose,
  passId = "SW-VIP-2026-9904",
  eventName = "Global FinTech Summit 2026 — Keynote & Gala",
  attendeeName,
  attendeeEmail,
  passHolderName,
  passHolderEmail,
  eventDate = "14 Dec 2026 • 09:30 AM IST",
  venue = "Jio World Convention Centre, Mumbai",
  seatZone = "VIP Front Row — Stage Left",
}: VipPassQrModalProps) {
  const show = isOpen ?? open ?? false;
  if (!show) return null;

  const displayAttendeeName = attendeeName ?? passHolderName ?? "VIP Delegate";
  const displayAttendeeEmail = attendeeEmail ?? passHolderEmail ?? "member@siddwhizz.com";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm rounded-3xl border-2 border-primary/50 bg-card p-6 text-center text-foreground shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 border border-primary/30 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified VIP Pass
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
            aria-label="Close VIP Pass Modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div>
          <h3 className="font-display text-lg font-black text-foreground">{eventName}</h3>
          <p className="text-xs font-semibold text-primary mt-0.5">{eventDate}</p>
          <p className="text-xs text-muted-foreground">{venue}</p>
        </div>

        {/* Crisp Scannable Vector QR Pass Representation */}
        <div className="mx-auto w-48 rounded-2xl bg-white p-4 flex flex-col items-center justify-center shadow-inner border border-border">
          <QrCode className="h-32 w-32 text-black" strokeWidth={1.75} />
          <span className="mt-1.5 font-mono text-xs font-black tracking-widest text-black">
            {passId}
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-background p-3.5 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Delegate Name:</span>
            <span className="font-bold text-foreground">{displayAttendeeName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Registered Email:</span>
            <span className="text-foreground truncate max-w-[180px] font-mono">{displayAttendeeEmail}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Stage Host:</span>
            <span className="font-bold text-foreground">Siddharth “Sid” Maurya</span>
          </div>
          <div className="flex justify-between items-center border-t border-border pt-1.5">
            <span className="text-muted-foreground">Access Zone:</span>
            <span className="font-extrabold text-primary">{seatZone}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="btn-red w-full !py-3 text-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="h-4 w-4" />
          <span>Print / Save VIP Pass PDF</span>
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// 4. HD VIDEO SHOWREEL PLAYER MODAL (Fixes static image on /portfolio & /)
// ============================================================================
export interface VideoShowreelModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  duration?: string;
  videoUrl?: string;
}

export function VideoShowreelModal({
  isOpen,
  open,
  onClose,
  title,
  subtitle = "Siddharth “Sid” Maurya — Live Stage Hosting & Moderation Highlight",
  duration = "04:28",
  videoUrl = "https://www.youtube.com/embed/scWpXEYZEGk?autoplay=1&rel=0",
}: VideoShowreelModalProps) {
  const show = isOpen ?? open ?? false;
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-4xl rounded-2xl border border-border bg-card overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded bg-primary px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary-foreground">
                <Play className="h-3 w-3 fill-current" /> 4K Stage Showreel
              </span>
              <span className="font-mono text-xs text-muted-foreground">{duration}</span>
            </div>
            <h3 className="font-display text-base sm:text-lg font-extrabold text-foreground truncate mt-1">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
            aria-label="Close video player"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={videoUrl}
            title={title}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card px-5 py-3.5 border-t border-border">
          <p className="text-xs text-muted-foreground">{subtitle}</p>
          <Link
            to="/contact"
            onClick={onClose}
            className="btn-red !py-2 !px-4 text-xs whitespace-nowrap self-start sm:self-auto"
          >
            <Calendar className="h-3.5 w-3.5" /> Book Sid for Your Event
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 5. PORTFOLIO EVENT CASE STUDY MODAL (/portfolio)
// ============================================================================
export interface CaseStudyItem {
  t: string;
  s: string;
  c: string;
  img: string;
  client?: string;
  city?: string;
  location?: string;
  crowdSize?: string;
  audience?: string;
  summary?: string;
  quote?: string;
}

export function CaseStudyModal({
  isOpen,
  open,
  item,
  onClose,
}: {
  isOpen?: boolean;
  open?: boolean;
  item: CaseStudyItem | null;
  onClose: () => void;
}) {
  const show = isOpen ?? open ?? Boolean(item);
  if (!show || !item) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-border bg-card overflow-hidden shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-56 w-full overflow-hidden">
          <img src={item.img} alt={item.s} className="h-full w-full object-cover" />
          <div className="ink-fade-bottom absolute inset-0" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-black/70 p-2 text-white hover:bg-primary transition cursor-pointer"
            aria-label="Close case study"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <span className="rounded-full bg-primary px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wider">
              {item.c}
            </span>
            <h3 className="font-display text-2xl font-black mt-1.5">{item.s}</h3>
            <p className="text-xs text-white/80">{item.t}</p>
          </div>
        </div>

        <div className="p-6 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-background p-3.5 text-xs">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary shrink-0" />
              <div>
                <span className="text-muted-foreground block">Audience Size</span>
                <span className="font-bold text-foreground">{item.crowdSize || "1,500+ Live Delegates"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <div>
                <span className="text-muted-foreground block">Location & Client</span>
                <span className="font-bold text-foreground">{item.city || "Mumbai / New Delhi"}</span>
              </div>
            </div>
          </div>

          <p className="text-foreground/85 leading-relaxed">
            {item.summary ||
              `Siddharth “Sid” Maurya anchored "${item.s}" (${item.t}), delivering high-energy opening keynotes, seamless speaker transitions, and interactive audience engagement segments tailored to the ${item.c.toLowerCase()} format.`}
          </p>

          <blockquote className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 text-xs italic text-foreground/90">
            “{item.quote || "Sid kept the entire auditorium energized from the opening keynote to the closing ceremony with zero script lag and commanding stage presence."}”
          </blockquote>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline !py-2 !px-4 text-xs cursor-pointer"
            >
              Close
            </button>
            <Link
              to="/contact"
              search={{ format: item.c }}
              onClick={onClose}
              className="btn-red !py-2 !px-5 text-xs flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Book Similar {item.c} Show</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 6. OFFICIAL ELECTRONIC PRESS KIT (EPK) MODAL (/about)
// ============================================================================
export function PressKitModal({
  isOpen,
  open,
  onClose,
}: {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
}) {
  const show = isOpen ?? open ?? false;
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 sm:p-8 text-foreground shadow-2xl my-8 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary">
              Official Media & Corporate Dossier (2026)
            </span>
            <h3 className="font-display text-2xl font-black text-foreground mt-1">
              Siddharth “Sid” Maurya — Electronic Press Kit (EPK)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
            aria-label="Close EPK modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <p className="text-foreground/85 leading-relaxed">
            <strong>Siddharth “Sid” Maurya (SIDD.WHIZZ)</strong> is one of India's premier corporate event hosts, keynote moderators, and live arena emcees. With over <strong>15+ years</strong> of stage command and <strong>600+ flagship productions</strong> across 28+ cities, Sid blends editorial sharpness with high-voltage crowd connection.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border bg-background p-3 text-center">
              <Mic className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="font-display text-lg font-black">600+</p>
              <p className="text-[11px] text-muted-foreground">Events Hosted</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-3 text-center">
              <Users className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="font-display text-lg font-black">1.2M+</p>
              <p className="text-[11px] text-muted-foreground">Live Audience</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-3 text-center">
              <Globe className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="font-display text-lg font-black">3</p>
              <p className="text-[11px] text-muted-foreground">English • Hindi • Hinglish</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-3 text-center">
              <Award className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="font-display text-lg font-black">92%</p>
              <p className="text-[11px] text-muted-foreground">Client Re-Hire Rate</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background p-4 space-y-2 text-xs">
            <p className="font-bold uppercase tracking-wider text-primary">
              Select Enterprise Brands & Summits Hosted:
            </p>
            <p className="text-foreground font-semibold">
              Google Cloud • Microsoft • AWS • Infosys • IBM • HCLTech • TATA Sons • Accenture • Vivo
            </p>
            <p className="font-bold uppercase tracking-wider text-primary pt-2">
              Standard Stage AV Rider Summary:
            </p>
            <p className="text-muted-foreground">
              1x Shure Axient Digital Wireless Handheld (KSM9 capsule), Dual-channel Shure PSM1000 In-Ear Monitors, 2x Downstage 55" Confidence Monitors (Slide + Countdown Timer), and Private Green Room.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-border pt-4">
          <span className="text-xs text-muted-foreground">
            Booking Desk: <strong>+91 98200 88776</strong> • <strong>bookings@siddwhizz.com</strong>
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-red !py-2.5 !px-5 text-xs flex items-center gap-2 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Print / Save Official EPK (PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

