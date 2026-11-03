import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Play, ArrowUpRight } from "lucide-react";
import { portfolioEvents, videoReels, type EventCategory } from "@/lib/data";
import { Reveal, SectionHead } from "@/components/site/Reveal";
import { CtaBanner, PageHero } from "@/components/site/Layout";
import { FilterPills, Lightbox } from "@/components/site/Lightbox";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio & Showreels — SIDD.WHIZZ" },
      { name: "description", content: "Leadership summits, award galas, CEO panels, product reveals and 15,000-strong concert nights hosted by Sid." },
      { property: "og:title", content: "Portfolio — SIDD.WHIZZ" },
      { property: "og:description", content: "Selected events and showreels." },
      { property: "og:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=2" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=2" },
    ],
  }),
  component: Portfolio,
});

const categories: EventCategory[] = ["All Events", "Corporate", "Award Nights", "Conferences", "Panel Discussions", "Live Shows", "Product Launches"];
type Ev = (typeof portfolioEvents)[number];
type Reel = (typeof videoReels)[number];

function Portfolio() {
  const [cat, setCat] = useState<EventCategory>("All Events");
  const [item, setItem] = useState<Ev | null>(null);
  const [reel, setReel] = useState<Reel | null>(null);
  const list = useMemo(() => (cat === "All Events" ? portfolioEvents : portfolioEvents.filter((e) => e.category === cat)), [cat]);

  return (
    <>
      <PageHero eyebrow="Portfolio" title={<>Stages I've <em className="text-gold">lit up.</em></>} text="A selection of summits, galas, launches and live nights — each one built around its audience." image="/images/concert-stage.webp" />

      <section className="container-x py-24">
        <Reveal><FilterPills items={categories} value={cat} onChange={setCat} /></Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((e, i) => (
            <button key={`${cat}-${e.id}`} onClick={() => setItem(e)} className="img-zoom group text-left animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-card">
                <img src={e.image} alt={e.title} loading="lazy" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-fade opacity-80" />
                <span className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full glass opacity-0 transition-all duration-500 group-hover:opacity-100"><ArrowUpRight className="h-4 w-4" /></span>
                <div className="absolute inset-x-6 bottom-6">
                  <p className="eyebrow">{e.category}</p>
                  <h3 className="mt-2 text-3xl">{e.title}</h3>
                </div>
              </div>
            </button>
          ))}
        </div>
        {list.length === 0 && <p className="py-20 text-center text-muted-foreground">New events in this category coming soon.</p>}
      </section>

      <section className="bg-ink py-28">
        <div className="container-x">
          <SectionHead eyebrow="Showreels" title={<>Watch the <em className="text-gold">energy.</em></>} />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {videoReels.map((r, i) => (
              <Reveal key={r.title} delay={i * 120}>
                <button onClick={() => setReel(r)} className="img-zoom group relative block aspect-video w-full overflow-hidden rounded-3xl text-left">
                  <img src={r.image} alt={r.title} loading="lazy" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-ink/40 transition-colors group-hover:bg-ink/20" />
                  <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gold text-primary-foreground shadow-gold transition-transform duration-500 group-hover:scale-110">
                    <Play className="ml-1 h-6 w-6 fill-current" />
                  </span>
                  <span className="absolute bottom-4 right-4 rounded-full glass px-3 py-1 text-xs">{r.duration}</span>
                </button>
                <h3 className="mt-5 text-2xl">{r.title}</h3>
                <p className="text-sm text-muted-foreground">{r.subtitle}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Lightbox open={!!item} onClose={() => setItem(null)}>
        {item && (
          <div className="grid overflow-hidden rounded-[2rem] border border-border bg-card md:grid-cols-2">
            <img src={item.image} alt={item.title} className="h-full max-h-[70vh] w-full object-cover" />
            <div className="p-8 md:p-10">
              <p className="eyebrow">{item.category} · {item.role}</p>
              <h3 className="mt-4 text-4xl md:text-5xl">{item.title}</h3>
              <p className="mt-5 text-muted-foreground">{item.description}</p>
            </div>
          </div>
        )}
      </Lightbox>
      <Lightbox open={!!reel} onClose={() => setReel(null)}>
        {reel && (
          <div className="relative aspect-video overflow-hidden rounded-[2rem] border border-border">
            <img src={reel.image} alt={reel.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 grid place-items-center bg-ink/70 p-6 text-center">
              <div>
                <h3 className="text-4xl">{reel.title}</h3>
                <p className="mt-3 text-muted-foreground">Full showreel shared on request with your enquiry.</p>
              </div>
            </div>
          </div>
        )}
      </Lightbox>

      <CtaBanner />
    </>
  );
}
