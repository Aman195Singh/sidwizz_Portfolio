import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Play, Quote } from "lucide-react";
import { benefits, processSteps, services, siteConfig, stats, testimonials, portfolioEvents } from "@/lib/data";
import { CountUp, Reveal, SectionHead } from "@/components/site/Reveal";
import { CtaBanner } from "@/components/site/Layout";
import { Icon } from "@/components/site/icons";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SIDD.WHIZZ — Event Host, Emcee & Moderator in India" },
      { name: "description", content: "500+ events, 100k+ audience. Book Siddharth “Sid” Maurya for corporate summits, award nights, concerts, college fests and weddings." },
      { property: "og:title", content: "SIDD.WHIZZ — Event Host, Emcee & Moderator" },
      { property: "og:description", content: "High-energy, polished hosting for every kind of stage." },
    ],
  }),
  component: Home,
});

const marquee = ["Corporate Summits", "Award Nights", "Concerts", "College Fests", "Product Launches", "Weddings & Sangeet", "Panel Moderation", "Keynotes"];

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[100svh] items-end overflow-hidden pb-16 pt-36">
        <img src="/images/hero-host.webp" alt="Sid hosting on a concert stage" className="absolute inset-0 h-full w-full animate-kenburns object-cover object-[30%_center]" />
        <div className="absolute inset-0 bg-ink/40" />
        <div className="absolute inset-0 bg-fade" />
        <div className="container-x relative grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="eyebrow">{siteConfig.title}</p>
            <h1 className="mt-6 text-[17vw] leading-[0.85] md:text-[9.5rem]">
              <span className="rise block overflow-hidden"><span>The voice</span></span>
              <span className="rise block overflow-hidden"><span style={{ animationDelay: "120ms" }}>that owns <em className="text-gold">the room.</em></span></span>
            </h1>
          </div>
          <div className="lg:col-span-4">
            <Reveal delay={300} className="glass rounded-3xl p-6">
              <p className="text-muted-foreground">
                I'm <span className="text-foreground">{siteConfig.hostName}</span> — turning summits, galas and stadium nights into moments people talk about for years.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/contact" className="btn btn-gold">Book a date <ArrowUpRight className="h-4 w-4" /></Link>
                <Link to="/portfolio" className="btn btn-ghost"><Play className="h-4 w-4" /> Showreel</Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-y border-border bg-ink py-6">
        <div className="flex w-max animate-marquee gap-12 whitespace-nowrap">
          {[...marquee, ...marquee].map((m, i) => (
            <span key={i} className="flex items-center gap-12 font-display text-4xl italic text-muted-foreground">
              {m} <span className="text-primary not-italic">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <section className="container-x grid grid-cols-2 gap-px overflow-hidden py-24 md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 100} className="border-l border-border px-6 py-4">
            <p className="font-display text-6xl md:text-8xl text-gold"><CountUp value={s.value} /></p>
            <p className="mt-2 text-sm uppercase tracking-[0.2em] text-muted-foreground">{s.label}</p>
          </Reveal>
        ))}
      </section>

      {/* INTRO SPLIT */}
      <section className="container-x grid items-center gap-16 py-16 lg:grid-cols-2">
        <Reveal className="img-zoom relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-card">
          <img src="/images/host-on-stage.webp" alt="Sid on stage" loading="lazy" className="h-full w-full object-cover" />
          <div className="absolute bottom-5 left-5 glass rounded-2xl px-5 py-4">
            <p className="eyebrow">Since 2018</p>
            <p className="font-display text-2xl">8 years. 500+ stages.</p>
          </div>
        </Reveal>
        <div>
          <SectionHead eyebrow="Why Sid" title={<>Energy you can <em className="text-gold">feel</em>, polish you can trust.</>} />
          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {benefits.map((b, i) => (
              <Reveal as="li" key={b.label} delay={i * 70} className="flex items-center gap-4 rounded-2xl border border-border bg-card/50 p-4 transition-colors hover:border-primary/50">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Icon name={b.icon} className="h-5 w-5" /></span>
                <span className="text-sm">{b.label}</span>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={200}><Link to="/about" className="btn btn-ghost mt-10">Meet Sid <ArrowUpRight className="h-4 w-4" /></Link></Reveal>
        </div>
      </section>

      {/* SERVICES */}
      <section className="container-x py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead eyebrow="What I host" title={<>Every stage, <em className="text-gold">mastered.</em></>} />
          <Link to="/services" className="btn btn-ghost">All services <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={(i % 4) * 90} className={i === 0 || i === 5 ? "lg:col-span-2" : ""}>
              <Link to="/services" className="img-zoom group relative block h-96 overflow-hidden rounded-3xl shadow-card">
                <img src={s.image} alt={s.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-fade" />
                <span className="absolute left-5 top-5 rounded-full glass px-3 py-1 text-[10px] tracking-[0.2em]">{s.tag}</span>
                <div className="absolute inset-x-5 bottom-5">
                  <h3 className="text-3xl">{s.title}</h3>
                  <p className="mt-2 max-h-0 overflow-hidden text-sm text-muted-foreground opacity-0 transition-all duration-500 group-hover:max-h-24 group-hover:opacity-100">{s.description}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURED WORK */}
      <section className="bg-ink py-28">
        <div className="container-x">
          <SectionHead eyebrow="Recent stages" title={<>Moments, <em className="text-gold">live.</em></>} />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {portfolioEvents.slice(0, 3).map((e, i) => (
              <Reveal key={e.id} delay={i * 120} className={i === 1 ? "md:translate-y-12" : ""}>
                <Link to="/portfolio" className="img-zoom group block">
                  <div className="aspect-[3/4] overflow-hidden rounded-3xl"><img src={e.image} alt={e.title} loading="lazy" className="h-full w-full object-cover" /></div>
                  <p className="eyebrow mt-5">{e.category} · {e.role}</p>
                  <h3 className="mt-2 text-3xl transition-colors group-hover:text-primary">{e.title}</h3>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="container-x py-28">
        <SectionHead center eyebrow="How it works" title={<>From first call to <em className="text-gold">final applause.</em></>} />
        <ol className="relative mt-16 grid gap-6 md:grid-cols-5">
          <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent md:block" />
          {processSteps.map((p, i) => (
            <Reveal as="li" key={p.step} delay={i * 110} className="relative text-center">
              <span className="relative mx-auto grid h-16 w-16 place-items-center rounded-full border border-primary/40 bg-background text-primary shadow-gold">
                <Icon name={p.icon} className="h-6 w-6" />
              </span>
              <p className="mt-6 font-display text-3xl">{p.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-x py-20">
        <SectionHead eyebrow="Kind words" title={<>Trusted by those who <em className="text-gold">run the show.</em></>} />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal as="blockquote" key={t.author} delay={i * 120} className="flex flex-col rounded-3xl border border-border bg-card/60 p-8 transition-all duration-500 hover:-translate-y-2 hover:border-primary/40">
              <Quote className="h-8 w-8 text-primary" />
              <p className="mt-6 flex-1 font-display text-2xl leading-snug">“{t.quote}”</p>
              <footer className="mt-8 border-t border-border pt-5">
                <p className="font-semibold">{t.author}</p>
                <p className="text-sm text-muted-foreground">{t.designation}</p>
              </footer>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
