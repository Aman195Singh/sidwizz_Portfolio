import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Play, CalendarDays, Mic, Users, Trophy, LayoutGrid, ArrowUpRight, Images, MoreVertical } from "lucide-react";
import { PageHero, StatsBar, SectionHead, Reveal, Testimonials, BRANDS, BrandMark, CtaBanner, Lightbox } from "@/components/site";
import heroPortfolio from "@/assets/hero-portfolio.jpg";
import hostPurple from "@/assets/host-purple.jpg";
import panel from "@/assets/panel-discussion.jpg";
import awards from "@/assets/awards-trophy.jpg";
import conclave from "@/assets/conclave-stage.jpg";
import hostRed from "@/assets/host-smile-red.jpg";
import festival from "@/assets/festival-crowd.jpg";
import wedding from "@/assets/wedding-sangeet.jpg";
import heroGallery from "@/assets/hero-gallery.jpg";
import hostLaugh from "@/assets/host-laugh-red.jpg";
import cta from "@/assets/cta-crowd.jpg";
import confHall from "@/assets/conference-hall.jpg";
import hostArms from "@/assets/host-arms-front.jpg";
import techSummit from "@/assets/tech-summit.jpg";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Stage Moments by SIDD.WHIZZ" },
      { name: "description", content: "Showreel, event highlights and snapshots from summits, award nights, conclaves, festivals and weddings hosted by Sid." },
      { property: "og:title", content: "Portfolio — SIDD.WHIZZ" },
      { property: "og:description", content: "Stage moments, real experiences, lasting impact." },
      { property: "og:url", content: "https://sidwizz-portfolio.vercel.app/portfolio" },
      { property: "og:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
      { property: "og:image:secure_url", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
    ],
  }),
  component: Portfolio,
});

const REELS = [
  { t: "Corporate Summit – Leadership Conclave", d: "02:16", img: panel },
  { t: "Awards Night – Annual Excellence Awards", d: "02:03", img: awards },
  { t: "Panel Discussion – Industry Insight Forum", d: "01:54", img: conclave },
];
const CATS = ["All Events", "Corporate", "Awards", "Conclaves", "Festivals", "Weddings", "Product Launches", "Others"];
const ITEMS = [
  { t: "Corporate Event", s: "Leadership Summit 2026", c: "Corporate", img: hostRed },
  { t: "Awards Night", s: "Excellence Awards 2025", c: "Awards", img: awards },
  { t: "Panel Discussion", s: "Industry Leaders Forum", c: "Conclaves", img: panel },
  { t: "Live Festival", s: "City Music Fest 2025", c: "Festivals", img: festival },
  { t: "Wedding Event", s: "Sangeet Celebration", c: "Weddings", img: wedding },
  { t: "Tech Launch", s: "Innovation Day 2025", c: "Product Launches", img: techSummit },
  { t: "Business Conclave", s: "Future of Work Forum", c: "Conclaves", img: confHall },
  { t: "Gala Evening", s: "Annual Celebration", c: "Others", img: hostArms },
];
const SNAPS = [
  { src: heroGallery, alt: "Hosting a packed arena" },
  { src: hostLaugh, alt: "On stage with the mic" },
  { src: cta, alt: "Crowd energy" },
  { src: confHall, alt: "Conference hall" },
  { src: hostArms, alt: "Welcoming the audience" },
];

function Portfolio() {
  const [cat, setCat] = useState("All Events");
  const [lb, setLb] = useState<number | null>(null);
  const list = ITEMS.filter((i) => cat === "All Events" || i.c === cat).slice(0, 5);
  return (
    <>
      <PageHero
        big
        eyebrow="Portfolio"
        lines={["Stage moments,", "real experiences,", "lasting impact."]}
        redFrom={2}
        image={heroPortfolio}
        position="65% center"
        text="A glimpse of events, conversations and experiences where I've hosted, moderated and created meaningful audience connections."
        actions={
          <>
            <a href="#showreel" className="btn-red !normal-case !text-base"><Play className="h-4 w-4" /> Watch Showreel</a>
            <Link to="/contact" className="btn-outline !normal-case !text-base"><CalendarDays className="h-4 w-4" /> Book for Your Event</Link>
          </>
        }
      />
      <StatsBar
        className="md:-mt-14"
        items={[
          { icon: <Mic />, value: "600+", label: "Events Hosted" },
          { icon: <CalendarDays />, value: "15+", label: "Years on Stage" },
          { icon: <Users />, value: "1.2M+", label: "Audience Engaged" },
          { icon: <Trophy />, value: "150+", label: "Brands & Organizers" },
        ]}
      />

      <section id="showreel" className="container-x scroll-mt-24 py-14">
        <div className="grid gap-4 md:grid-cols-2 md:items-end">
          <SectionHead eyebrow="Featured Work" title="Event showreel" />
          <Reveal><p className="text-foreground/80">Curated highlights from diverse events — corporate summits, award nights, conclaves, product launches and live celebrations.</p></Reveal>
        </div>
        <div className="mt-7 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <Reveal className="img-zoom group relative overflow-hidden rounded-2xl">
            <img src={hostPurple} alt="Showreel 2026" loading="lazy" width={1024} height={1024} className="aspect-[16/9] w-full object-cover" />
            <div className="ink-fade-bottom absolute inset-0" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="animate-pulse-ring grid h-16 w-16 place-items-center rounded-full bg-background text-primary transition-transform duration-300 group-hover:scale-110">
                <Play className="h-7 w-7 fill-current" />
              </span>
            </span>
            <div className="absolute bottom-5 left-5 text-ink-foreground">
              <p className="font-display text-lg font-black">SIDD.WHIZZ</p>
              <p className="text-sm">Event Hosting Showreel 2026</p>
            </div>
            <span className="absolute bottom-5 right-5 rounded bg-ink/80 px-2 py-0.5 text-xs font-bold text-ink-foreground">04:28</span>
          </Reveal>
          <div className="flex flex-col gap-4">
            {REELS.map((r, i) => (
              <Reveal key={r.t} delay={i * 120}>
                <div className="card-lift group flex items-center gap-4 p-2.5">
                  <div className="img-zoom relative h-20 w-32 shrink-0 overflow-hidden rounded-lg">
                    <img src={r.img} alt={r.t} loading="lazy" width={1280} height={896} className="h-full w-full object-cover" />
                    <span className="absolute inset-0 grid place-items-center">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-background text-primary"><Play className="h-4 w-4 fill-current" /></span>
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold leading-snug">{r.t}</p>
                    <span className="mt-1 inline-block rounded bg-ink px-2 py-0.5 text-[11px] font-bold text-ink-foreground">{r.d}</span>
                  </div>
                  <MoreVertical className="h-5 w-5 text-muted-foreground" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x">
        <SectionHead eyebrow="Browse by event type" />
        <Reveal className="mt-4 flex flex-wrap gap-2.5">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`chip inline-flex items-center gap-2 ${cat === c ? "chip-active" : ""}`}>
              {c === "All Events" && <LayoutGrid className="h-4 w-4" />} {c}
            </button>
          ))}
        </Reveal>
        <div className="mt-8">
          <SectionHead eyebrow="Event Highlights" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {list.length === 0 && <p className="text-muted-foreground">More events coming soon in this category.</p>}
            {list.map((it, i) => (
              <div key={it.t + cat} className="animate-rise card-lift img-zoom group overflow-hidden" style={{ "--d": `${i * 80}ms` } as React.CSSProperties}>
                <div className="h-40 overflow-hidden"><img src={it.img} alt={it.t} loading="lazy" width={1280} height={896} className="h-full w-full object-cover" /></div>
                <div className="flex items-end justify-between p-3">
                  <div>
                    <p className="text-sm font-extrabold">{it.t}</p>
                    <p className="text-xs text-muted-foreground">{it.s}</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-primary transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x grid gap-10 py-14 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <SectionHead eyebrow="Event Snapshots" />
          <Reveal className="mt-5 grid grid-cols-4 grid-rows-2 gap-3">
            {SNAPS.map((s, i) => (
              <div
                role="button"
                tabIndex={0}
                key={s.src}
                onClick={() => setLb(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setLb(i);
                  }
                }}
                className={`img-zoom relative cursor-pointer overflow-hidden rounded-lg focus-visible:ring-2 focus-visible:ring-primary outline-none ${i === 0 ? "col-span-2 row-span-2" : ""}`}
              >
                <img src={s.src} alt={s.alt} loading="lazy" className="h-full min-h-28 w-full object-cover" />
                {i === 0 && (
                  <Link to="/gallery" onClick={(e) => e.stopPropagation()} className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-lg border-2 border-ink-foreground bg-ink/40 px-4 py-2 text-sm font-bold text-ink-foreground backdrop-blur transition-colors hover:bg-primary">
                    <Images className="h-4 w-4" /> View Full Gallery
                  </Link>
                )}
              </div>
            ))}
          </Reveal>
        </div>
        <div className="lg:border-l lg:pl-8">
          <SectionHead eyebrow="Clients & Organizers" />
          <Reveal className="mt-5 grid grid-cols-3 gap-y-8 text-center">
            {BRANDS.map((b) => <div key={b}><BrandMark name={b} /></div>)}
          </Reveal>
        </div>
      </section>

      <section className="container-x pb-6">
        <SectionHead eyebrow="What organizers say" className="mb-6" />
        <Testimonials />
      </section>

      <CtaBanner
        variant="crowd"
        title="Let's create your"
        red={<span className="text-ink-foreground">next big stage moment.</span>}
        sub="Corporate • Awards • Conclaves • Festivals • Weddings & More"
        primaryLabel="Book Siddharth Now"
      />
      <Lightbox images={SNAPS} index={lb} onClose={() => setLb(null)} onIndex={setLb} />
    </>
  );
}
