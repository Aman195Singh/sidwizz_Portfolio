import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LayoutGrid, Building2, Trophy, Users, Sparkles, Heart, Camera, RefreshCw, PlaySquare, Image as ImageIcon } from "lucide-react";
import { PageHero, StatsBar, Reveal, CtaBanner, Lightbox } from "@/components/site";
import heroGallery from "@/assets/hero-gallery.jpg";
import hostRed from "@/assets/host-smile-red.jpg";
import confHall from "@/assets/conference-hall.jpg";
import hostBlue from "@/assets/host-seated-blue.jpg";
import confetti from "@/assets/confetti-concert.jpg";
import hostArms from "@/assets/host-arms-front.jpg";
import star from "@/assets/star-trophy.jpg";
import panel from "@/assets/panel-discussion.jpg";
import hostLaugh from "@/assets/host-laugh-red.jpg";
import festival from "@/assets/festival-crowd.jpg";
import hostPurple from "@/assets/host-purple.jpg";
import techSummit from "@/assets/tech-summit.jpg";
import hostBow from "@/assets/host-bowtie.jpg";
import awards from "@/assets/awards-trophy.jpg";
import wedding from "@/assets/wedding-sangeet.jpg";
import conclave from "@/assets/conclave-stage.jpg";
import beams from "@/assets/stage-beams.jpg";
import heroAbout from "@/assets/hero-about.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Event Moments in Pictures | SIDD.WHIZZ" },
      { name: "description", content: "A glimpse of the energy, audiences and memorable stages hosted by Siddharth “Sid” Maurya." },
      { property: "og:title", content: "Gallery — SIDD.WHIZZ" },
      { property: "og:description", content: "Event moments in pictures." },
    ],
  }),
  component: Gallery,
});

const FILTERS = [
  { t: "All Events", i: LayoutGrid }, { t: "Corporate", i: Building2 }, { t: "Awards", i: Trophy },
  { t: "Conclaves", i: Users }, { t: "Festivals", i: Sparkles }, { t: "Weddings", i: Heart }, { t: "Behind the Scenes", i: Camera },
];

// span classes mirror the mosaic layout of the design (12-col grid)
const PHOTOS = [
  { src: hostRed, c: "Corporate", span: "md:col-span-4", alt: "Hosting with a smile" },
  { src: confHall, c: "Conclaves", span: "md:col-span-5", alt: "Conference hall" },
  { src: hostBlue, c: "Conclaves", span: "md:col-span-3", alt: "Panel moderation" },
  { src: confetti, c: "Festivals", span: "md:col-span-4", alt: "Confetti concert" },
  { src: hostArms, c: "Corporate", span: "md:col-span-5", alt: "Welcoming the audience" },
  { src: star, c: "Awards", span: "md:col-span-3", alt: "Star trophy" },
  { src: panel, c: "Conclaves", span: "md:col-span-4", alt: "Panel discussion" },
  { src: hostLaugh, c: "Behind the Scenes", span: "md:col-span-2", alt: "Laughing on stage" },
  { src: festival, c: "Festivals", span: "md:col-span-3", alt: "Festival crowd" },
  { src: hostPurple, c: "Corporate", span: "md:col-span-3", alt: "Engaging the room" },
  { src: techSummit, c: "Corporate", span: "md:col-span-4", alt: "Tech summit" },
  { src: heroGallery, c: "Festivals", span: "md:col-span-5", alt: "Arena moment" },
  { src: hostBow, c: "Awards", span: "md:col-span-3", alt: "Awards host" },
];
const MORE = [
  { src: awards, c: "Awards", span: "md:col-span-4", alt: "Awards gala" },
  { src: wedding, c: "Weddings", span: "md:col-span-4", alt: "Sangeet stage" },
  { src: conclave, c: "Behind the Scenes", span: "md:col-span-4", alt: "Stage setup" },
  { src: beams, c: "Festivals", span: "md:col-span-6", alt: "Stage light beams" },
  { src: heroAbout, c: "Corporate", span: "md:col-span-6", alt: "Addressing the crowd" },
];

function Gallery() {
  const [f, setF] = useState("All Events");
  const [more, setMore] = useState(false);
  const [lb, setLb] = useState<number | null>(null);
  const all = more ? [...PHOTOS, ...MORE] : PHOTOS;
  const list = all.filter((p) => f === "All Events" || p.c === f);
  const isAll = f === "All Events";
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        lines={["Event moments", "in pictures."]}
        redFrom={1}
        image={heroGallery}
        position="60% center"
        text="A glimpse of the energy, audiences and memorable stages I've had the privilege to host."
      />

      <section className="container-x py-8">
        <Reveal className="flex flex-wrap gap-3">
          {FILTERS.map((x) => (
            <button key={x.t} onClick={() => setF(x.t)} className={`chip inline-flex items-center gap-2 !rounded-lg !px-4 !py-2 ${f === x.t ? "chip-active" : ""}`}>
              <x.i className="h-4 w-4" /> {x.t}
            </button>
          ))}
        </Reveal>
      </section>

      <section className="px-3 md:px-4">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-2.5 md:grid-cols-12">
          {list.map((p, i) => (
            <button
              key={p.src + f}
              onClick={() => setLb(i)}
              className={`animate-rise img-zoom group relative h-44 overflow-hidden rounded-lg md:h-56 ${isAll ? p.span : "md:col-span-4"}`}
              style={{ "--d": `${(i % 6) * 70}ms` } as React.CSSProperties}
            >
              <img src={p.src} alt={p.alt} loading="lazy" className="h-full w-full object-cover" />
              <span className="ink-fade-bottom absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="absolute bottom-3 left-3 translate-y-3 text-left text-sm font-bold text-ink-foreground opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                {p.alt}
              </span>
            </button>
          ))}
        </div>
        {list.length === 0 && <p className="py-10 text-center text-muted-foreground">More photos from this category are coming soon.</p>}
        <div className="mt-8 text-center">
          {!more ? (
            <button onClick={() => setMore(true)} className="btn-outline !rounded-full !px-8 !normal-case">
              <RefreshCw className="h-4 w-4 text-primary" /> Load More Photos
            </button>
          ) : (
            <p className="text-sm text-muted-foreground">You've seen all the photos.</p>
          )}
        </div>
      </section>

      <StatsBar
        className="mt-10"
        items={[
          { icon: <Camera />, value: "600+", label: "Event Photos" },
          { icon: <PlaySquare />, value: "120+", label: "Event Videos" },
          { icon: <ImageIcon />, value: "50+", label: "Event Albums" },
          { icon: <Users />, value: "1.2M+", label: "Audience Moments" },
        ]}
      />

      <CtaBanner
        variant="crowd"
        title="Want to be part of"
        red={<>the next gallery?</>}
        sub="Let's create memorable moments at your next event."
        primaryLabel="Book Siddharth Now"
        secondary={{ label: "Watch Showreel", to: "/portfolio" }}
      />
      <Lightbox images={list} index={lb} onClose={() => setLb(null)} onIndex={setLb} />
    </>
  );
}
