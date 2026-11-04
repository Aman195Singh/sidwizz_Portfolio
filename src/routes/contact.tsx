import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import {
  CalendarDays, Send, User, Phone, Mail, MessageSquare, MapPin, ArrowUpRight, Briefcase, Trophy,
  Users, Music, Heart, Rocket, CalendarHeart, Zap, Clock, Handshake, ChevronDown,
} from "lucide-react";
import { PageHero, Reveal, SocialIcons, CtaBanner } from "@/components/site";
import heroContact from "@/assets/hero-contact.jpg";
import { saveEnquiry } from "@/lib/data-store";

export const Route = createFileRoute("/contact")({
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

const EVENT_TYPES = ["Corporate Summit", "Awards & Gala Night", "Conclave & Forum", "Festival & Live Show", "Wedding & Social", "Product Launch", "Special Event"];

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
  const [sending, setSending] = useState(false);
  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const form = e.currentTarget;
    const d = new FormData(form);
    const name = String(d.get("name") || "").trim();
    const phone = String(d.get("phone") || "").trim();
    const email = String(d.get("email") || "").trim();
    const type = String(d.get("type") || "");
    const msg = String(d.get("message") || "").trim();
    const date = String(d.get("date") || "");
    if (name.length < 2) { toast.error("Please enter your name."); return; }
    if (!/^[+\d][\d\s-]{7,}$/.test(phone)) { toast.error("Please enter a valid phone number."); return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { toast.error("Please enter a valid email address."); return; }
    if (!type) { toast.error("Please select an event type."); return; }
    if (msg.length < 10) { toast.error("Tell us a little more about your event."); return; }
    setSending(true);
    setTimeout(() => {
      saveEnquiry({
        eventName: `${name}'s ${type}`,
        clientName: name,
        organization: "Direct Enquiry via Website",
        email,
        phone,
        date: date || "Upcoming Date",
        city: "Mumbai / Pan-India",
        venue: "Client Specified Venue",
        format: type,
        crowdSize: "500 - 1,000 Attendees",
        budget: "₹2,50,000 - ₹4,00,000",
        status: "New",
        brief: msg,
      });
      setSending(false);
      form.reset();
      toast.success(`Thanks ${name}! Your enquiry has been saved and sent to Siddharth Maurya's team. We'll reply within 24 hours.`);
    }, 600);
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
            <h2 className="eyebrow !text-2xl !normal-case">Send an Enquiry</h2>
            <p className="mt-1 pl-8 text-sm text-foreground/75">Tell us about your event and we'll get back to you soon.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field icon={<User />}><input name="name" placeholder="Your Name *" className={inputCls} /></Field>
              <Field icon={<Phone />}><input name="phone" type="tel" placeholder="Phone Number *" className={inputCls} /></Field>
              <Field icon={<Mail />}><input name="email" type="email" placeholder="Email Address *" className={inputCls} /></Field>
              <Field icon={<CalendarDays />}><input name="date" type="text" onFocus={(e) => (e.target.type = "date")} placeholder="Event Date (Optional)" className={inputCls} /></Field>
              <div className="sm:col-span-2">
                <Field icon={<CalendarDays />}>
                  <select name="type" defaultValue="" className={`${inputCls} appearance-none`}>
                    <option value="" disabled>Event Type *</option>
                    {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-3.5 h-5 w-5" />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field icon={<MessageSquare />}>
                  <textarea name="message" rows={4} placeholder="Tell us about your event (e.g. format, audience, location, etc.) *" className={`${inputCls} resize-y`} />
                </Field>
              </div>
            </div>
            <button type="submit" disabled={sending} className="btn-red mt-5 w-full !py-3.5 !text-base !normal-case disabled:opacity-70">
              <Send className={`h-5 w-5 ${sending ? "animate-pulse" : ""}`} /> {sending ? "Sending…" : "Send Enquiry"}
            </button>
          </form>
        </Reveal>

        <Reveal delay={150}>
          <div id="touch" className="h-full scroll-mt-24 rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] md:p-8">
            <h2 className="eyebrow !text-2xl !normal-case">Get in Touch</h2>
            <p className="mt-1 pl-8 text-sm text-foreground/75">Prefer a direct conversation? Use the details below.</p>
            <div className="mt-5 divide-y">
              {[
                { i: Phone, l: "Call / WhatsApp", v: "+91 98765 43210", h: "https://wa.me/919876543210" },
                { i: Mail, l: "Email", v: "hello@siddwhizz.com", h: "mailto:hello@siddwhizz.com" },
                { i: MapPin, l: "Based In", v: "New Delhi, India", h: "https://maps.google.com/?q=New+Delhi" },
              ].map((c) => (
                <a key={c.l} href={c.h} target="_blank" rel="noreferrer" className="group flex items-center gap-4 py-3.5">
                  <span className="grid h-14 w-14 place-items-center rounded-lg bg-accent text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground"><c.i className="h-6 w-6" /></span>
                  <span className="flex-1">
                    <span className="block text-sm font-bold">{c.l}</span>
                    <span className="block text-foreground/85">{c.v}</span>
                  </span>
                  <ArrowUpRight className="h-5 w-5 text-primary transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
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
