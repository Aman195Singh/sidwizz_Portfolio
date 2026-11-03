import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, Phone, MapPin, MessageCircle, Send, CheckCircle2 } from "lucide-react";
import { siteConfig } from "@/lib/data";
import { PageHero } from "@/components/site/Layout";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Book Sid — Contact SIDD.WHIZZ" },
      { name: "description", content: "Check Sid's availability for your corporate event, award night, concert, college fest or wedding. Reply within 24 hours." },
      { property: "og:title", content: "Book Sid — SIDD.WHIZZ" },
      { property: "og:description", content: "Tell us about your event and lock in your date." },
      { property: "og:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=2" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=2" },
    ],
  }),
  component: Contact,
});

const eventTypes = [
  "Corporate Events & Summits", "Award Nights & Felicitations", "Conferences & Conclaves", "College / University Annual Fests",
  "Product Launches & Activations", "Live Concerts & Music Festivals", "Panel Moderation & Fireside Chats", "Wedding & Private Celebrations", "Other Custom Event",
];

const field = "w-full rounded-2xl border border-input bg-background/60 px-5 py-4 text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15";

function Contact() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget)) as {name?:string;email?:string;phone?:string;type?:string;date?:string;city?:string;guests?:string;message?:string};
    if (!d.name?.trim() || !/^\S+@\S+\.\S+$/.test(d.email ?? "") || !d.type) {
      setError("Please add your name, a valid email and the event type.");
      return;
    }
    setError("");
    const subject = encodeURIComponent(`Booking enquiry: ${d.type} — ${d.date || "date TBC"}`);
    const body = encodeURIComponent(
      `Name: ${d.name}\nEmail: ${d.email}\nPhone: ${d.phone || "-"}\nEvent: ${d.type}\nDate: ${d.date || "-"}\nCity/Venue: ${d.city || "-"}\nGuests: ${d.guests || "-"}\n\n${d.message || ""}`,
    );
    window.location.href = `mailto:${siteConfig.email}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  const channels = [
    { I: Mail, label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
    { I: Phone, label: "Call", value: siteConfig.phoneDisplay, href: `tel:+${siteConfig.phoneRaw}` },
    { I: MessageCircle, label: "WhatsApp", value: "Chat instantly", href: `https://wa.me/${siteConfig.whatsappRaw}` },
    { I: MapPin, label: "Based in", value: siteConfig.location },
  ];

  return (
    <>
      <PageHero eyebrow="Contact" title={<>Let's talk about <em className="text-gold">your stage.</em></>} text="Share a few details and you'll hear back within 24 hours." image="/images/wedding-stage.webp" />
      <section className="container-x grid gap-10 py-24 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-4">
          {channels.map(({ I, label, value, href }, i) => {
            const inner = (
              <>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><I className="h-5 w-5" /></span>
                <span><span className="eyebrow block">{label}</span><span className="mt-1 block">{value}</span></span>
              </>
            );
            return (
              <Reveal key={label} delay={i * 90}>
                {href ? (
                  <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="group flex items-center gap-4 rounded-3xl border border-border bg-card/40 p-5 transition-all hover:-translate-y-1 hover:border-primary/40">{inner}</a>
                ) : (
                  <div className="group flex items-center gap-4 rounded-3xl border border-border bg-card/40 p-5">{inner}</div>
                )}
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={150} className="lg:col-span-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card/60 p-6 shadow-card md:p-10">
            <div className="pointer-events-none absolute inset-0 bg-stage opacity-60" />
            {sent ? (
              <div className="relative py-16 text-center animate-in fade-in zoom-in-95 duration-700">
                <CheckCircle2 className="mx-auto h-16 w-16 text-primary" />
                <h2 className="mt-6 text-5xl">Thank you!</h2>
                <p className="mx-auto mt-4 max-w-md text-muted-foreground">Your email app should have opened with the enquiry ready to send. If it didn't, write to {siteConfig.email}.</p>
                <button onClick={() => setSent(false)} className="btn btn-ghost mt-8">Send another enquiry</button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="relative grid gap-5 md:grid-cols-2">
                <h2 className="text-4xl md:col-span-2 md:text-5xl">Booking enquiry</h2>
                <label className="space-y-2"><span className="text-sm text-muted-foreground">Full name *</span><input name="name" className={field} placeholder="Your name" /></label>
                <label className="space-y-2"><span className="text-sm text-muted-foreground">Email *</span><input name="email" type="email" className={field} placeholder="you@company.com" /></label>
                <label className="space-y-2"><span className="text-sm text-muted-foreground">Phone</span><input name="phone" type="tel" className={field} placeholder="+91" /></label>
                <label className="space-y-2"><span className="text-sm text-muted-foreground">Event type *</span>
                  <select name="type" defaultValue="" className={field}>
                    <option value="" disabled>Select event type</option>
                    {eventTypes.map((t) => <option key={t} className="bg-card">{t}</option>)}
                  </select>
                </label>
                <label className="space-y-2"><span className="text-sm text-muted-foreground">Event date</span><input name="date" type="date" className={`${field} [color-scheme:dark]`} /></label>
                <label className="space-y-2"><span className="text-sm text-muted-foreground">City / Venue</span><input name="city" className={field} placeholder="Mumbai, Taj Lands End" /></label>
                <label className="space-y-2 md:col-span-2"><span className="text-sm text-muted-foreground">Expected guests</span><input name="guests" inputMode="numeric" className={field} placeholder="e.g. 500" /></label>
                <label className="space-y-2 md:col-span-2"><span className="text-sm text-muted-foreground">Tell me about your event</span><textarea name="message" rows={5} className={`${field} resize-none`} placeholder="Theme, audience, segments, anything special…" /></label>
                {error && <p role="alert" className="text-sm text-destructive md:col-span-2">{error}</p>}
                <button type="submit" className="btn btn-gold md:col-span-2 !py-4">Send enquiry <Send className="h-4 w-4" /></button>
              </form>
            )}
          </div>
        </Reveal>
      </section>
    </>
  );
}
