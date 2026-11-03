import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { Expand } from "lucide-react";
import { galleryMoments, type GalleryCategory } from "@/lib/data";
import { CtaBanner, PageHero } from "@/components/site/Layout";
import { FilterPills, Lightbox } from "@/components/site/Lightbox";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Moments from the Stage | SIDD.WHIZZ" },
      { name: "description", content: "Behind the mic, in the crowd and on the big stage — photo moments from Sid's events." },
      { property: "og:title", content: "Gallery — SIDD.WHIZZ" },
      { property: "og:description", content: "Moments from the stage." },
      { property: "og:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=2" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=2" },
    ],
  }),
  component: Gallery,
});

const filters: GalleryCategory[] = ["All Moments", "On Stage", "Audience", "Awards", "Panel Discussions", "Product Launches", "Corporate", "College Fest"];

function Gallery() {
  const [f, setF] = useState<GalleryCategory>("All Moments");
  const [idx, setIdx] = useState<number | null>(null);
  const list = useMemo(() => (f === "All Moments" ? galleryMoments : galleryMoments.filter((m) => m.category === f)), [f]);
  const prev = useCallback(() => setIdx((i) => (i === null ? i : (i - 1 + list.length) % list.length)), [list.length]);
  const next = useCallback(() => setIdx((i) => (i === null ? i : (i + 1) % list.length)), [list.length]);
  const close = useCallback(() => setIdx(null), []);
  const active = idx !== null ? list[idx] : null;

  return (
    <>
      <PageHero eyebrow="Gallery" title={<>Moments that <em className="text-gold">stay.</em></>} text="Spotlights, standing ovations and the people who make every event special." image="/images/audience-engagement.webp" />
      <section className="container-x py-24">
        <Reveal><FilterPills items={filters} value={f} onChange={(v) => { setF(v); setIdx(null); }} /></Reveal>
        <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {list.map((m, i) => (
            <button key={`${f}-${m.id}`} onClick={() => setIdx(i)}
              className="img-zoom group relative mb-5 block w-full break-inside-avoid overflow-hidden rounded-3xl text-left animate-in fade-in zoom-in-95 duration-700 fill-mode-both"
              style={{ animationDelay: `${i * 70}ms` }}>
              <img src={m.image} alt={m.title} loading="lazy" className={`w-full object-cover ${i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/3]"}`} />
              <div className="absolute inset-0 bg-fade opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <Expand className="absolute right-5 top-5 h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="absolute inset-x-5 bottom-5 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="eyebrow">{m.category}</p>
                <p className="mt-1 font-display text-2xl">{m.title}</p>
              </div>
            </button>
          ))}
        </div>
        {list.length === 0 && <p className="py-20 text-center text-muted-foreground">More moments coming soon.</p>}
      </section>

      <Lightbox open={!!active} onClose={close} onPrev={list.length > 1 ? prev : undefined} onNext={list.length > 1 ? next : undefined}>
        {active && (
          <figure>
            <img src={active.image} alt={active.title} className="mx-auto max-h-[75vh] rounded-3xl object-contain" />
            <figcaption className="mt-5 text-center">
              <p className="font-display text-3xl">{active.title}</p>
              <p className="text-muted-foreground">{active.caption} · {(idx ?? 0) + 1}/{list.length}</p>
            </figcaption>
          </figure>
        )}
      </Lightbox>
      <CtaBanner image="/images/cta-crowd.jpg" />
    </>
  );
}
