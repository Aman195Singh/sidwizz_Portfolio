import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Play, CalendarDays, Mic, Users, TrendingUp, ArrowRight, Trophy, Star, Zap, MessagesSquare,
  Target, Gem, LayoutGrid,
} from "lucide-react";
import { PageHero, StatsBar, SectionHead, Reveal, Signature, Testimonials, BRANDS, BrandMark, CtaBanner } from "@/components/site";
import heroHome from "@/assets/hero-home.jpg";
import techSummit from "@/assets/tech-summit.jpg";
import awards from "@/assets/awards-trophy.jpg";
import conclave from "@/assets/conclave-stage.jpg";
import festival from "@/assets/festival-crowd.jpg";
import hostRed from "@/assets/host-smile-red.jpg";
import confHall from "@/assets/conference-hall.jpg";
import hostArms from "@/assets/host-arms-front.jpg";
import panel from "@/assets/panel-discussion.jpg";
import hostLaugh from "@/assets/host-laugh-red.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SIDD.WHIZZ — Command the Stage | Event Host & Emcee" },
      { name: "description", content: "Siddharth “Sid” Maurya is a professional event host and emcee who turns events into unforgettable experiences." },
      { property: "og:title", content: "SIDD.WHIZZ — Command the Stage" },
      { property: "og:description", content: "Professional event host, emcee and moderator for summits, awards, conclaves and festivals." },
      { property: "og:url", content: "https://sidwizz-portfolio.vercel.app/" },
      { property: "og:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
      { property: "og:image:secure_url", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "SIDD.WHIZZ — Command the Stage" },
      { name: "twitter:description", content: "Professional event host, emcee and moderator for summits, awards, conclaves and festivals." },
      { name: "twitter:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
    ],
  }),
  component: Home,
});

const SERVICES = [
  { t: "Tech & Innovation Summits", img: techSummit, icon: Mic },
  { t: "Corporate Galas & Awards Nights", img: awards, icon: Trophy },
  { t: "Conclaves & Panel Discussions", img: conclave, icon: Users },
  { t: "Live Festivals & Special Events", img: festival, icon: Star },
];

const WHY = [
  { i: Zap, t: "High Energy", d: "Keeps the audience engaged throughout." },
  { i: MessagesSquare, t: "Clear & Relatable", d: "A natural, impactful communication style." },
  { i: Users, t: "Audience Connect", d: "Builds instant rapport with any crowd." },
  { i: Target, t: "Versatile & Adaptive", d: "From corporate to cultural, fits every format." },
  { i: Gem, t: "Professional & Reliable", d: "Punctual, prepared and event-ready always." },
];

const HIGHLIGHTS = [
  { img: hostRed, c: "Corporate", video: false },
  { img: confHall, c: "Corporate", video: true },
  { img: hostArms, c: "Awards", video: false },
  { img: panel, c: "Conclaves", video: true },
  { img: festival, c: "Festivals", video: true },
  { img: hostLaugh, c: "Awards", video: false },
];

function Home() {
  const [filter, setFilter] = useState("All Events");
  const shown = HIGHLIGHTS.filter((h) => filter === "All Events" || h.c === filter).slice(0, 5);
  return (
    <>
      <PageHero
        big
        eyebrow="The Voice. The Energy. The Experience."
        lines={["Command the stage.", "Energize every", "audience."]}
        redFrom={1}
        image={heroHome}
        position="70% center"
        text={<>Siddharth “Sid” Maurya (SIDD.WHIZZ) — a professional event host and emcee who turns ideas, audiences and events into unforgettable experiences with energy, clarity and connection.</>}
        actions={
          <>
            <Link to="/portfolio" className="btn-red"><Play className="h-4 w-4" /> Explore Portfolio</Link>
            <Link to="/contact" className="btn-outline"><CalendarDays className="h-4 w-4" /> Check Availability</Link>
          </>
        }
      />
      <StatsBar
        className="md:-mt-14"
        items={[
          { icon: <Mic />, value: "600+", label: "Events" },
          { icon: <CalendarDays />, value: "15+", label: "Years" },
          { icon: <Users />, value: "1.2M+", label: "Audience Reach" },
          { icon: <TrendingUp />, value: "92%", label: "Re-engagement" },
        ]}
      />

      <section className="container-x grid gap-10 py-16 lg:grid-cols-[300px_1fr]">
        <Reveal className="lg:border-r lg:pr-8">
          <p className="eyebrow">About SIDD.WHIZZ</p>
          <h2 className="display mt-3 text-3xl lg:text-[34px]">
            The art of <span className="block text-primary">owning the stage.</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-foreground/80">
            A dynamic event host, moderator and emcee, Siddharth “Sid” Maurya brings the perfect blend of energy, professionalism and audience connection to every stage.
          </p>
          <Signature />
          <Link to="/about" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all">
            Know more <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
        <div>
          <SectionHead eyebrow="Hosting & Moderation Services" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s, i) => (
              <Reveal key={s.t} delay={i * 100}>
                <Link to="/services" className="card-lift img-zoom group block h-full overflow-hidden">
                  <div className="relative h-36 overflow-hidden">
                    <img src={s.img} alt={s.t} loading="lazy" width={1280} height={896} className="h-full w-full object-cover" />
                  </div>
                  <div className="relative p-4 pt-7">
                    <span className="icon-badge absolute -top-6 left-4 h-11 w-11"><s.icon className="h-5 w-5" /></span>
                    <h3 className="font-display text-base font-extrabold leading-tight">{s.t}</h3>
                    <span className="icon-badge mt-4 ml-auto h-7 w-7 transition-transform duration-300 group-hover:translate-x-1">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-blush py-14">
        <div className="container-x">
          <SectionHead center eyebrow="Why choose SIDD.WHIZZ" title="More than a host — a stage experience." />
          <div className="mt-10 grid grid-cols-2 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {WHY.map((w, i) => (
              <Reveal key={w.t} delay={i * 90} className={`px-4 text-center ${i > 0 ? "lg:border-l" : ""}`}>
                <w.i className="mx-auto h-9 w-9 text-primary transition-transform duration-500 hover:scale-125" />
                <h3 className="mt-3 font-display text-sm font-extrabold">{w.t}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{w.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-16">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <SectionHead eyebrow="Portfolio" title="Event highlights" />
          <Reveal className="flex flex-wrap gap-2">
            {["All Events", "Corporate", "Awards", "Conclaves", "Festivals"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`chip ${filter === f ? "chip-active" : ""}`}>{f}</button>
            ))}
          </Reveal>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {shown.map((h, i) => (
            <div key={h.img + filter} className="animate-rise img-zoom group relative aspect-[4/3] overflow-hidden rounded-lg" style={{ "--d": `${i * 80}ms` } as React.CSSProperties}>
              <img src={h.img} alt={`${h.c} event`} loading="lazy" width={1280} height={896} className="h-full w-full object-cover" />
              {h.video && (
                <span className="absolute inset-0 grid place-items-center">
                  <span className="animate-pulse-ring grid h-11 w-11 place-items-center rounded-full bg-background/90 text-foreground">
                    <Play className="h-5 w-5 fill-current" />
                  </span>
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link to="/portfolio" className="btn-outline"><LayoutGrid className="h-4 w-4 text-primary" /> View Full Portfolio</Link>
        </div>
      </section>

      <section className="container-x pb-12">
        <SectionHead eyebrow="Testimonials" title="What organizers say" className="mb-7" />
        <Testimonials />
      </section>

      <section className="container-x pb-4">
        <SectionHead eyebrow="Trusted by" title="Brands & organizers" />
        <Reveal className="mt-6 flex flex-wrap items-center justify-between gap-6 border-y py-6">
          {BRANDS.slice(0, 7).map((b) => <BrandMark key={b} name={b} />)}
        </Reveal>
      </section>

      <CtaBanner
        title="Let's make your"
        red={<span className="text-ink-foreground">next event unforgettable.</span>}
        sub="Host • Emcee • Moderator • Event Presenter"
      />
    </>
  );
}
