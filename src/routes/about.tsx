import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Play, CalendarDays, Mic, Users, TrendingUp, Trophy, Rocket, Zap, Target, ArrowLeftRight, Gem,
  Star, Layers, Award, CheckCircle2, MessageCircle, ChevronRight,
} from "lucide-react";
import { PageHero, StatsBar, SectionHead, Reveal, Signature, CtaBanner } from "@/components/site";
import heroAbout from "@/assets/hero-about.jpg";
import mic from "@/assets/hero-contact.jpg";
import beams from "@/assets/stage-beams.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Siddharth “Sid” Maurya — SIDD.WHIZZ" },
      { name: "description", content: "Meet Sid — an event host, emcee and moderator who turns ideas, people and moments into high-energy stage experiences." },
      { property: "og:title", content: "About SIDD.WHIZZ — A Voice That Moves Audiences" },
      { property: "og:description", content: "The journey, principles and strengths behind Siddharth “Sid” Maurya." },
      { property: "og:url", content: "https://sidwizz-portfolio.vercel.app/about" },
      { property: "og:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
      { property: "og:image:secure_url", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
    ],
  }),
  component: About,
});

const JOURNEY = [
  { i: Mic, t: "The Beginning", d: "A passion for speaking, people and live events." },
  { i: Users, t: "Growing on Stage", d: "Hosting diverse events and building a distinct style." },
  { i: Trophy, t: "Expanding Horizons", d: "From corporate platforms to large-scale celebrations." },
  { i: Rocket, t: "The Road Ahead", d: "Continuing to create impactful stage experiences." },
];
const PRINCIPLES = [
  { i: Zap, t: "Energy", d: "Bring the right vibe and keep the momentum alive." },
  { i: Users, t: "Connection", d: "Turn an audience into an engaged community." },
  { i: Target, t: "Clarity", d: "Communicate with purpose, simplicity and impact." },
  { i: ArrowLeftRight, t: "Adaptability", d: "Read the room, adapt the flow and deliver seamlessly." },
  { i: Gem, t: "Professionalism", d: "Be prepared, punctual and event-ready always." },
];
const STRENGTHS = [
  "Event Hosting & Emceeing", "Content Flow & Stage Management", "Panel Moderation",
  "Versatile Across Event Formats", "Audience Engagement", "Professional & Reliable Execution",
];

function About() {
  return (
    <>
      <PageHero
        big
        eyebrow="Behind the Stage"
        lines={["More than a host.", "A voice that moves", "audiences."]}
        redFrom={1}
        image={heroAbout}
        position="70% center"
        text="Meet Siddharth “Sid” Maurya — an event host, emcee and moderator who turns ideas, people and moments into engaging, high-energy stage experiences."
        actions={
          <>
            <a href="#journey" className="btn-red"><Play className="h-4 w-4" /> Explore My Journey</a>
            <Link to="/contact" className="btn-outline"><CalendarDays className="h-4 w-4" /> Book Siddharth</Link>
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

      <section className="container-x grid items-center gap-10 py-14 md:grid-cols-2">
        <Reveal className="img-zoom overflow-hidden rounded-2xl shadow-[var(--shadow-card)]">
          <img src={mic} alt="Microphone on stage" loading="lazy" width={1920} height={1080} className="aspect-[16/9] w-full object-cover" />
        </Reveal>
        <Reveal delay={150}>
          <p className="eyebrow eyebrow-line">The person behind the mic</p>
          <h2 className="display mt-3 text-3xl lg:text-[40px]">The art of <span className="block text-primary">owning the stage.</span></h2>
          <p className="mt-4 leading-relaxed text-foreground/80">
            A dynamic event host, moderator and emcee, Siddharth “Sid” Maurya brings the perfect blend of energy, professionalism and audience connection to every stage — from high-impact corporate summits to grand award nights and live entertainment festivals.
          </p>
          <Signature />
        </Reveal>
      </section>

      <section id="journey" className="container-x scroll-mt-24 py-8">
        <SectionHead eyebrow="The Journey" title="Every stage has a story." />
        <div className="relative mt-10 grid gap-8 md:grid-cols-4">
          <div className="absolute left-[12%] right-[12%] top-7 hidden h-0.5 bg-primary md:block" />
          {JOURNEY.map((j, i) => (
            <Reveal key={j.t} delay={i * 150} className="relative text-center">
              <span className="icon-badge relative mx-auto h-14 w-14 transition-transform duration-500 hover:scale-110"><j.i className="h-6 w-6" /></span>
              {i < 3 && (
                <span className="icon-badge absolute -right-4 top-5 hidden h-5 w-5 md:grid"><ChevronRight className="h-3 w-3" /></span>
              )}
              <h3 className="mt-4 font-display text-base font-extrabold uppercase">{j.t}</h3>
              <p className="mx-auto mt-1 max-w-[220px] text-sm text-muted-foreground">{j.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x py-12">
        <SectionHead eyebrow="Hosting Philosophy" title="Stage principles that guide me." />
        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.t} delay={i * 90}>
              <div className="card-lift h-full p-5 text-center">
                <p.i className="mx-auto h-9 w-9 text-primary" />
                <h3 className="mt-3 font-display text-sm font-extrabold uppercase">{p.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x grid items-center gap-10 py-6 md:grid-cols-2">
        <Reveal className="img-zoom overflow-hidden rounded-2xl">
          <img src={beams} alt="Arena stage with light beams" loading="lazy" width={1280} height={768} className="aspect-[16/9] w-full object-cover" />
        </Reveal>
        <Reveal delay={150}>
          <p className="eyebrow eyebrow-line">What makes the experience different</p>
          <h2 className="display mt-3 text-3xl lg:text-[38px]">More than words. <span className="block text-primary">It's the experience.</span></h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {[
              { i: Star, t: "Engaging Presence", d: "Keeps audiences involved from start to finish." },
              { i: Layers, t: "Versatile Hosting", d: "Adapts effortlessly across event formats and audiences." },
              { i: Award, t: "Impactful Delivery", d: "A polished, confident and memorable stage experience." },
            ].map((x) => (
              <div key={x.t}>
                <x.i className="h-7 w-7 text-primary" />
                <h3 className="mt-2 text-sm font-bold">{x.t}</h3>
                <p className="text-xs text-muted-foreground">{x.d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="container-x grid gap-6 py-10 md:grid-cols-2">
        <Reveal className="rounded-2xl bg-ink p-8 text-ink-foreground">
          <p className="eyebrow text-ink-foreground">Languages</p>
          <h2 className="display mt-2 text-2xl md:text-3xl">Communicate <br />without barriers.</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {["Hindi", "English", "Hinglish"].map((l) => (
              <span key={l} className="inline-flex items-center gap-2 rounded-lg border border-ink-foreground/80 px-5 py-2 text-sm font-bold transition-colors hover:border-primary hover:bg-primary">
                <MessageCircle className="h-4 w-4 text-primary" /> {l}
              </span>
            ))}
          </div>
        </Reveal>
        <Reveal delay={150} className="rounded-2xl border p-6 sm:p-8">
          <p className="eyebrow">Professional Strengths</p>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
            {STRENGTHS.map((s) => (
              <li key={s} className="flex items-center gap-3 text-sm font-semibold">
                <CheckCircle2 className="h-5 w-5 shrink-0 fill-primary text-primary-foreground" /> {s}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <CtaBanner
        variant="crowd"
        title="Let's create an"
        red={<span className="text-ink-foreground">unforgettable stage experience.</span>}
        sub="Discuss your upcoming event, format and vision with me."
        primaryLabel="Book Siddharth"
      />
    </>
  );
}
