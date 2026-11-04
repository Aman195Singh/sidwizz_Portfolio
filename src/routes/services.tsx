import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Play, CalendarDays, Mic, Users, Trophy, Star, Zap, Target, Gem, ArrowRight, Building2,
  Music, Heart, Rocket, MessageCircle, BarChart3, SlidersHorizontal, ShieldCheck, CheckCircle2,
  Layers, Handshake,
} from "lucide-react";
import { PageHero, StatsBar, SectionHead, Reveal, CtaBanner } from "@/components/site";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import heroServices from "@/assets/hero-services.jpg";
import confetti from "@/assets/confetti-concert.jpg";
import panel from "@/assets/panel-discussion.jpg";
import awards from "@/assets/awards-trophy.jpg";
import wedding from "@/assets/wedding-sangeet.jpg";
import micDark from "@/assets/mic-dark.jpg";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Hosting & Moderation Services — SIDD.WHIZZ" },
      { name: "description", content: "Event hosting, panel moderation, awards & gala hosting and special live events by Siddharth “Sid” Maurya." },
      { property: "og:title", content: "Professional Hosting & Moderation Services — SIDD.WHIZZ" },
      { property: "og:description", content: "From corporate summits to grand celebrations — energy, clarity and audience connection." },
      { property: "og:url", content: "https://sidwizz-portfolio.vercel.app/services" },
      { property: "og:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
      { property: "og:image:secure_url", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
    ],
  }),
  component: Services,
});

const CORE = [
  { t: "Event Hosting & Emceeing", d: "High-energy, audience-focused hosting for corporate, public and large-scale events.", img: confetti, i: Mic },
  { t: "Panel Moderation", d: "Insightful and balanced moderation for industry conclaves, roundtables and leadership sessions.", img: panel, i: Users },
  { t: "Awards & Gala Hosting", d: "Charismatic hosting for awards nights, gala dinners and recognition ceremonies.", img: awards, i: Trophy },
  { t: "Special & Live Events", d: "Engaging stage presence for weddings, sangeet, festivals, product launches and more.", img: wedding, i: Star },
];
const FORMATS = [
  { i: Building2, t: "Corporate Summits" }, { i: Star, t: "Award Nights" }, { i: Users, t: "Conclaves & Forums" },
  { i: Music, t: "Festivals & Live Shows" }, { i: Heart, t: "Weddings & Socials" }, { i: Rocket, t: "Product Launches" },
];
const STEPS = [
  { i: MessageCircle, t: "Get in Touch", d: "Share your event details, format and requirements." },
  { i: CalendarDays, t: "Plan & Align", d: "Discuss the flow, audience and key objectives." },
  { i: Mic, t: "Event Day", d: "A high-energy, well-moderated and engaging experience." },
  { i: BarChart3, t: "Post-Event", d: "Wrap-up, feedback and future collaboration." },
];
const FAQ = [
  { q: "What types of events do you host?", a: "Corporate summits, award nights, conclaves and panel discussions, festivals and live shows, weddings and sangeet, product launches and special events." },
  { q: "Do you also moderate panel discussions?", a: "Yes. I moderate leadership panels, roundtables and fireside chats with thorough research and balanced, insightful questioning." },
  { q: "How can I check your availability?", a: "Send an enquiry through the contact page or call / WhatsApp directly. I typically reply within 24 hours." },
  { q: "Can you travel for outstation or multi-city events?", a: "Absolutely. I host across India and internationally, and can support multi-city event series." },
];

function Services() {
  return (
    <>
      <PageHero
        big
        eyebrow="My Services"
        lines={["Professional hosting", "& moderation services", "for every event."]}
        redFrom={2}
        image={heroServices}
        position="70% center"
        text="From corporate summits to grand celebrations, I bring energy, clarity and audience connection to every stage."
        actions={
          <>
            <Link to="/contact" className="btn-red !normal-case !text-base"><Play className="h-4 w-4" /> Book a Service</Link>
            <Link to="/contact" className="btn-outline !normal-case !text-base"><CalendarDays className="h-4 w-4" /> Check Availability</Link>
          </>
        }
      />
      <StatsBar
        className="md:-mt-14"
        items={[
          { icon: <Zap />, label: "High-Energy Presence" },
          { icon: <Users />, label: "Audience Engagement" },
          { icon: <Target />, label: "Format Flexibility" },
          { icon: <Gem />, label: "Professional Execution" },
        ]}
      />

      <section className="container-x py-14">
        <div className="grid gap-4 md:grid-cols-2 md:items-end">
          <SectionHead eyebrow="Core Services" title="Event experiences," red="expertly hosted." />
          <Reveal><p className="text-foreground/80 md:text-right">A range of professional hosting and moderation services tailored to your event format, audience and objectives.</p></Reveal>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CORE.map((s, i) => (
            <Reveal key={s.t} delay={i * 110}>
              <article className="card-lift img-zoom group flex h-full flex-col overflow-hidden">
                <div className="h-40 overflow-hidden"><img src={s.img} alt={s.t} loading="lazy" width={1280} height={896} className="h-full w-full object-cover" /></div>
                <div className="relative flex flex-1 flex-col p-5 pt-7">
                  <span className="icon-badge absolute -top-6 left-5 h-11 w-11 rounded-lg"><s.i className="h-5 w-5" /></span>
                  <h3 className="font-display text-lg font-extrabold">{s.t}</h3>
                  <p className="mt-2 flex-1 text-sm text-foreground/75">{s.d}</p>
                  <Link to="/contact" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary transition-all group-hover:gap-3">Know More <ArrowRight className="h-4 w-4" /></Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x">
        <Reveal className="grid gap-6 rounded-2xl bg-muted p-7 md:grid-cols-[300px_1fr] md:items-center">
          <div className="md:border-r md:pr-6">
            <p className="eyebrow">Event Formats</p>
            <h2 className="display mt-2 text-2xl">Versatile hosting across formats.</h2>
          </div>
          <div className="grid grid-cols-3 gap-5 md:grid-cols-6">
            {FORMATS.map((f) => (
              <div key={f.t} className="group text-center">
                <f.i className="mx-auto h-8 w-8 text-primary transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110" />
                <p className="mt-2 text-sm font-semibold leading-tight">{f.t}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="container-x py-14">
        <SectionHead eyebrow="How it works" title="A simple & transparent process." />
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {STEPS.map((s, i) => (
            <Reveal key={s.t} delay={i * 130} className="relative">
              <div className="card-lift h-full p-6 pt-8 text-center">
                <span className="icon-badge absolute -top-4 left-1/2 h-9 w-9 -translate-x-1/2 font-display text-sm font-black">0{i + 1}</span>
                <s.i className="mx-auto h-8 w-8 text-primary" />
                <h3 className="mt-3 font-display text-base font-extrabold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
              {i < 3 && <ArrowRight className="absolute -right-8 top-1/2 hidden h-5 w-5 text-primary lg:block" />}
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x grid gap-8 pb-12 lg:grid-cols-[320px_1fr] lg:items-center">
        <SectionHead eyebrow="Why choose SIDD.WHIZZ" title="More than a host —" red="a stage partner." />
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { i: Zap, t: "Experience & Energy", d: "Keeps the audience engaged throughout." },
            { i: Target, t: "Audience Connect", d: "Builds instant rapport with any crowd." },
            { i: SlidersHorizontal, t: "Versatile & Adaptive", d: "Fits corporate, cultural and entertainment formats." },
            { i: ShieldCheck, t: "Reliable & Professional", d: "Punctual, prepared and event-ready always." },
          ].map((w, i) => (
            <Reveal key={w.t} delay={i * 90} className="text-center md:border-l md:pl-4">
              <w.i className="mx-auto h-8 w-8 text-primary" />
              <h3 className="mt-2 text-sm font-bold">{w.t}</h3>
              <p className="text-xs text-muted-foreground">{w.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x grid gap-8 pb-12 lg:grid-cols-2">
        <Reveal className="relative overflow-hidden rounded-2xl bg-ink p-8 text-ink-foreground">
          <img src={micDark} alt="" loading="lazy" width={1280} height={768} className="absolute inset-0 h-full w-full object-cover object-right" />
          <div className="relative max-w-sm">
            <p className="eyebrow text-ink-foreground">Add-on Services</p>
            <h2 className="display mt-2 text-2xl md:text-3xl">Enhance your event experience.</h2>
            <ul className="mt-5 space-y-2.5 text-sm">
              {["Event Flow Consulting", "Script & Segment Planning", "Guest & Panel Coordination", "On-stage Audience Engagement", "Multi-format (Online / Hybrid / Offline)"].map((a) => (
                <li key={a} className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 fill-primary text-ink" /> {a}</li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={150}>
          <p className="eyebrow">Engagement Options</p>
          <h2 className="display mt-2 text-2xl md:text-3xl">Choose what works for you.</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { i: CalendarDays, t: "Single Event", d: "Perfect for one-time events, launches or special occasions.", c: "Book Now" },
              { i: Layers, t: "Event Series", d: "Ideal for multi-city, ongoing or annual event series.", c: "Enquire Now", pop: true },
              { i: Handshake, t: "Long-term Collaboration", d: "A trusted stage partner for your brand's multiple events.", c: "Discuss Now" },
            ].map((o) => (
              <div key={o.t} className={`card-lift relative flex flex-col p-5 text-center ${o.pop ? "border-2 border-primary bg-blush" : ""}`}>
                {o.pop && <span className="absolute -top-3 right-3 rounded bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">Popular</span>}
                <o.i className="mx-auto h-8 w-8 text-primary" />
                <h3 className="mt-2 font-display text-sm font-extrabold">{o.t}</h3>
                <p className="mt-1 flex-1 text-xs text-muted-foreground">{o.d}</p>
                <Link to="/contact" className={`mt-4 ${o.pop ? "btn-red" : "btn border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"} !px-3 !py-1.5 !text-xs !normal-case`}>
                  {o.c} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="container-x grid gap-8 pb-8 lg:grid-cols-[320px_1fr]">
        <Reveal>
          <p className="eyebrow eyebrow-line">Frequently asked questions</p>
          <h2 className="display mt-2 text-3xl md:text-4xl">Have questions?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Quick answers to common queries about my services.</p>
        </Reveal>
        <Reveal delay={120}>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ.map((f, i) => (
              <AccordionItem key={f.q} value={`f${i}`} className="rounded-lg border bg-card px-4 shadow-[var(--shadow-card)]">
                <AccordionTrigger className="text-sm font-bold hover:no-underline hover:text-primary">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </section>

      <CtaBanner
        variant="crowd"
        title="Ready to make your"
        red={<span className="text-ink-foreground">next event unforgettable?</span>}
        sub="Let's discuss your event and create an engaging stage experience together."
        primaryLabel="Book Siddharth Now"
      />
    </>
  );
}
