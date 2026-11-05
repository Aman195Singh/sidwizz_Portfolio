import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  Send,
  User,
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  ArrowUpRight,
  Briefcase,
  Trophy,
  Users,
  Music,
  Heart,
  Rocket,
  CalendarHeart,
  Zap,
  Clock,
  Handshake,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Building,
  Sparkles,
} from "lucide-react";
import { PageHero, Reveal, SocialIcons, CtaBanner } from "@/components/site";
import heroContact from "@/assets/hero-contact.jpg";
import {
  saveEnquiry,
  getLockedEventDates,
  getSiteSettings,
  type LockedDateInfo,
} from "@/lib/data-store";

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): { format?: string } => ({
    format: typeof search.format === "string" ? search.format : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Contact & Book Siddharth “Sid” Maurya — SIDD.WHIZZ" },
      { name: "description", content: "Send an enquiry to book Sid as your event host, emcee or moderator. Typically replies within 24 hours." },
      { property: "og:title", content: "Let's Create Your Next Big Event — SIDD.WHIZZ" },
      { property: "og:description", content: "Get in touch to discuss your requirements and availability." },
      { property: "og:url", content: "https://sidwizz-portfolio.vercel.app/contact" },
      { property: "og:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
      { property: "og:image:secure_url", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
    ],
  }),
  component: Contact,
});

const EVENT_TYPES = [
  "Corporate Summit",
  "Awards & Gala Night",
  "Conclave & Forum",
  "Festival & Live Show",
  "Wedding & Social",
  "Product Launch",
  "Special Event",
];

const PACKAGE_TIERS = [
  { label: "Single Event / Half-Day Session", budget: "₹2,00,000 - ₹3,00,000" },
  { label: "Full-Day Summit / Gala", budget: "₹3,50,000 - ₹5,00,000" },
  { label: "Multi-Day Series / Festival", budget: "₹5,00,000+" },
];

function matchEventType(formatParam?: string): string {
  if (!formatParam) return "";
  const lower = formatParam.toLowerCase();
  if (lower.includes("summit") || lower.includes("corporate") || lower.includes("conference")) return "Corporate Summit";
  if (lower.includes("award") || lower.includes("gala")) return "Awards & Gala Night";
  if (lower.includes("panel") || lower.includes("conclave") || lower.includes("forum") || lower.includes("fireside")) return "Conclave & Forum";
  if (lower.includes("festival") || lower.includes("concert") || lower.includes("college") || lower.includes("sports")) return "Festival & Live Show";
  if (lower.includes("wedding") || lower.includes("sangeet") || lower.includes("social")) return "Wedding & Social";
  if (lower.includes("launch") || lower.includes("brand")) return "Product Launch";
  const exact = EVENT_TYPES.find((t) => t.toLowerCase() === lower);
  return exact || "Corporate Summit";
}

function Field({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <label className="group relative block">
      <span className="pointer-events-none absolute left-4 top-3.5 text-foreground/70 transition-colors group-focus-within:text-primary [&_svg]:h-5 [&_svg]:w-5">{icon}</span>
      {children}
    </label>
  );
}
const inputCls =
  "w-full rounded-lg border border-input bg-card py-3 pl-12 pr-4 text-sm outline-none transition-all duration-300 placeholder:text-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/15";

function Contact() {
  const { format: formatParam } = Route.useSearch();
  const [sending, setSending] = useState(false);
  const [selectedType, setSelectedType] = useState(() => matchEventType(formatParam));
  const [selectedPackage, setSelectedPackage] = useState(PACKAGE_TIERS[1].label);
  const [selectedDate, setSelectedDate] = useState("");
  const [lockedDates, setLockedDates] = useState<LockedDateInfo[]>(() => getLockedEventDates());
  const [siteSettings, setSiteSettings] = useState(() => getSiteSettings());

  useEffect(() => {
    if (formatParam) {
      setSelectedType(matchEventType(formatParam));
    }
  }, [formatParam]);

  useEffect(() => {
    const sync = () => {
      setLockedDates(getLockedEventDates());
      setSiteSettings(getSiteSettings());
    };
    window.addEventListener("siddwhizz_enquiries_updated", sync);
    window.addEventListener("siddwhizz_bookings_updated", sync);
    window.addEventListener("siddwhizz_settings_updated", sync);
    return () => {
      window.removeEventListener("siddwhizz_enquiries_updated", sync);
      window.removeEventListener("siddwhizz_bookings_updated", sync);
      window.removeEventListener("siddwhizz_settings_updated", sync);
    };
  }, []);

  const dateConflict = selectedDate ? lockedDates.find((d) => d.date === selectedDate) : undefined;

  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    const name = String(d.get("name") || "").trim();
    const phone = String(d.get("phone") || "").trim();
    const email = String(d.get("email") || "").trim();
    const organization = String(d.get("organization") || "").trim();
    const city = String(d.get("city") || "").trim();
    const type = selectedType || String(d.get("type") || "");
    const msg = String(d.get("message") || "").trim();
    const date = selectedDate || String(d.get("date") || "");

    if (name.length < 2) { toast.error("Please enter your name."); return; }
    if (!/^[+\d][\d\s-]{7,}$/.test(phone)) { toast.error("Please enter a valid phone number."); return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { toast.error("Please enter a valid email address."); return; }
    if (!type) { toast.error("Please select an event type."); return; }
    if (msg.length < 10) { toast.error("Tell us a little more about your event."); return; }

    const tierObj = PACKAGE_TIERS.find((t) => t.label === selectedPackage) || PACKAGE_TIERS[1];

    setSending(true);
    setTimeout(() => {
      saveEnquiry({
        eventName: organization ? `${organization} — ${type}` : `${name}'s ${type}`,
        clientName: name,
        organization: organization || "Direct Enquiry via Website",
        email,
        phone,
        date: date || "Upcoming Date",
        city: city || "Mumbai / Pan-India",
        venue: city ? `${city} Venue` : "Client Specified Venue",
        format: type,
        crowdSize: "500 - 1,000 Attendees",
        budget: tierObj.budget,
        packageTier: tierObj.label,
        status: "New",
        brief: msg,
      });
      setSending(false);
      form.reset();
      setSelectedDate("");
      setLockedDates(getLockedEventDates());
      toast.success(
        `Thanks ${name}! Your ${tierObj.label} enquiry has been saved to our live booking pipeline. We'll reply within 24 hours.`
      );
    }, 500);
  };

  return (
    <>
      <PageHero
        eyebrow="Contact"
        lines={["Let's create", "your next", "big event."]}
        redFrom={2}
        image={heroContact}
        position="60% center"
        text="Have an event in mind? Get in touch to discuss your requirements, availability and how we can make it unforgettable."
        actions={
          <>
            <a href="#enquiry" className="btn-red !normal-case !text-base"><CalendarDays className="h-4 w-4" /> Book Siddharth</a>
            <a href="#touch" className="btn-outline !normal-case !text-base"><Send className="h-4 w-4" /> Get in Touch</a>
          </>
        }
      />

      <section className="container-x grid gap-6 py-10 lg:grid-cols-[1.5fr_1fr]">
        <Reveal>
          <form id="enquiry" onSubmit={onSubmit} noValidate className="scroll-mt-24 rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="eyebrow !text-2xl !normal-case">Send an Enquiry</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <span className={`h-2 w-2 rounded-full ${siteSettings.bookingAvailable ? "bg-primary animate-pulse" : "bg-muted-foreground"}`} />
                {siteSettings.bookingAvailable ? "Accepting 2026–27 Stage Dates" : "Priority Waitlist Active"}
              </span>
            </div>
            <p className="mt-1 pl-8 text-sm text-foreground/75">
              Check live date availability, select your event format &amp; package tier, and lock your stage date.
            </p>

            {/* Live Stage Calendar Lock Status Pills */}
            <div className="mt-5 rounded-xl border border-border bg-accent/40 p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-primary" /> Upcoming Locked Stage Dates:
                </span>
                <span className="text-muted-foreground">Select a date below to verify instant availability</span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {lockedDates.slice(0, 5).map((d) => (
                  <span
                    key={d.date}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-mono font-semibold text-foreground"
                    title={`${d.eventName} (${d.city})`}
                  >
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {d.date} • {d.city} ({d.status})
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field icon={<User />}><input name="name" placeholder="Your Name *" className={inputCls} /></Field>
              <Field icon={<Phone />}><input name="phone" type="tel" placeholder="Phone Number *" className={inputCls} /></Field>
              <Field icon={<Mail />}><input name="email" type="email" placeholder="Email Address *" className={inputCls} /></Field>
              <div>
                <Field icon={<CalendarDays />}>
                  <input
                    name="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    aria-label="Event Date"
                    className={inputCls}
                  />
                </Field>
                {selectedDate && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-foreground">
                    {dateConflict ? (
                      <>
                        <AlertCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-primary">
                          {selectedDate} has a {dateConflict.status.toLowerCase()} lock in {dateConflict.city} — Alternate slot / Waitlist available
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{selectedDate} is Available for Direct Stage Lock!</span>
                      </>
                    )}
                  </p>
                )}
              </div>

              <Field icon={<Building />}><input name="organization" placeholder="Company / Organization (Optional)" className={inputCls} /></Field>
              <Field icon={<MapPin />}><input name="city" placeholder="Event City (e.g. Mumbai, Delhi, Bengaluru)" className={inputCls} /></Field>

              <div>
                <Field icon={<CalendarDays />}>
                  <select
                    name="type"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className={`${inputCls} appearance-none`}
                  >
                    <option value="" disabled>Event Type *</option>
                    {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-3.5 h-5 w-5" />
                </Field>
              </div>

              <div>
                <Field icon={<Sparkles />}>
                  <select
                    name="packageTier"
                    value={selectedPackage}
                    onChange={(e) => setSelectedPackage(e.target.value)}
                    className={`${inputCls} appearance-none`}
                  >
                    {PACKAGE_TIERS.map((p) => (
                      <option key={p.label} value={p.label}>
                        {p.label} ({p.budget})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-3.5 h-5 w-5" />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field icon={<MessageSquare />}>
                  <textarea name="message" rows={4} placeholder="Tell us about your event (e.g. format, audience size, venue, run-of-show, etc.) *" className={`${inputCls} resize-y`} />
                </Field>
              </div>
            </div>
            <button type="submit" disabled={sending} className="btn-red mt-5 w-full !py-3.5 !text-base !normal-case disabled:opacity-70 cursor-pointer">
              <Send className={`h-5 w-5 ${sending ? "animate-pulse" : ""}`} /> {sending ? "Sending…" : "Send Enquiry & Lock Date"}
            </button>
          </form>
        </Reveal>

        <Reveal delay={150}>
          <div id="touch" className="h-full scroll-mt-24 rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] md:p-8">
            <h2 className="eyebrow !text-2xl !normal-case">Get in Touch</h2>
            <p className="mt-1 pl-8 text-sm text-foreground/75">Prefer a direct conversation? Use the verified management channels below.</p>
            <div className="mt-5 divide-y">
              {[
                { i: Phone, l: "Call / WhatsApp Hotline", v: siteSettings.hotlinePhone || "+91 98765 43210", h: "https://wa.me/919876543210" },
                { i: Mail, l: "Bookings & Press Desk", v: "bookings@siddwhizz.com", h: "mailto:bookings@siddwhizz.com" },
                { i: MapPin, l: "Management Studio", v: "Aerocity Business District, New Delhi — 110037", h: "https://maps.google.com/?q=Aerocity+New+Delhi" },
              ].map((c) => (
                <a key={c.l} href={c.h} target="_blank" rel="noreferrer" className="group flex items-center gap-4 py-3.5">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-accent text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground"><c.i className="h-6 w-6" /></span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-bold">{c.l}</span>
                    <span className="block text-sm text-foreground/85 break-words">{c.v}</span>
                  </span>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-primary transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                </a>
              ))}
            </div>
            <h3 className="eyebrow mt-6 !text-xl !normal-case">Connect on Social</h3>
            <div className="mt-4"><SocialIcons variant="card" /></div>
          </div>
        </Reveal>
      </section>

      <section className="container-x">
        <Reveal className="grid items-center gap-6 lg:grid-cols-[200px_1fr]">
          <h2 className="eyebrow !text-xl !normal-case">Events I Host</h2>
          <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-4 lg:grid-cols-7">
            {[
              { i: Briefcase, t: "Corporate Summits" }, { i: Trophy, t: "Awards & Gala Nights" }, { i: Users, t: "Conclaves & Forums" },
              { i: Music, t: "Festivals & Live Shows" }, { i: Heart, t: "Weddings & Socials" }, { i: Rocket, t: "Product Launches" },
              { i: CalendarHeart, t: "Special Events" },
            ].map((e) => (
              <div key={e.t} className="group border-l px-2 text-center">
                <e.i className="mx-auto h-8 w-8 text-primary transition-transform duration-300 group-hover:-translate-y-1" />
                <p className="mt-2 text-sm font-bold leading-tight">{e.t}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="container-x pt-8">
        <Reveal className="grid items-center gap-6 rounded-2xl bg-accent p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3">
            <Zap className="h-10 w-10 fill-primary text-primary" />
            <p className="display text-2xl normal-case">Quick Response</p>
          </div>
          {[
            { i: Clock, t: "Typically Reply Within 24 Hours" },
            { i: CalendarDays, t: "Discuss Availability & Requirements" },
            { i: Handshake, t: "Custom Hosting for Your Event Format" },
          ].map((q) => (
            <div key={q.t} className="flex items-center gap-4 lg:border-l lg:pl-6">
              <q.i className="h-9 w-9 shrink-0 text-primary" />
              <p className="font-semibold">{q.t}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <CtaBanner
        variant="crowd"
        title="Ready to bring"
        red="your event to life?"
        sub="Let's discuss your event and create a memorable experience together."
        primaryLabel="Book Siddharth Now"
      />
    </>
  );
}
