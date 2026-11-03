import { createFileRoute } from "@tanstack/react-router";
import { hostingPhilosophy, interests, milestones, siteConfig } from "@/lib/data";
import { Reveal, SectionHead } from "@/components/site/Reveal";
import { CtaBanner, PageHero } from "@/components/site/Layout";
import { Icon } from "@/components/site/icons";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Sid — The Story Behind SIDD.WHIZZ" },
      { name: "description", content: "From campus fests in 2018 to 500+ national stages — the journey and hosting philosophy of Siddharth Maurya." },
      { property: "og:title", content: "About Sid — SIDD.WHIZZ" },
      { property: "og:description", content: "The journey, philosophy and person behind the mic." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <PageHero eyebrow="About" title={<>Born for the <em className="text-gold">spotlight.</em></>} text={`${siteConfig.hostName} — a host who reads the room, leads the moment and leaves every audience wanting more.`} image="/images/about-hero.jpg" />

      <section className="container-x grid items-center gap-16 py-28 lg:grid-cols-2">
        <div>
          <SectionHead eyebrow="My story" title={<>A mic, a crowd, and a <em className="text-gold">spark.</em></>} />
          <Reveal delay={150} className="mt-8 space-y-5 text-lg leading-relaxed text-muted-foreground">
            <p>It started at a university fest, with a borrowed mic and 3,000 restless students. Ten minutes later, they were all on their feet. That was the moment I knew.</p>
            <p>Today I host corporate summits, award galas, arena concerts and weddings across India and abroad — bringing the same energy, preparation and heart to every single stage.</p>
          </Reveal>
        </div>
        <Reveal className="relative">
          <div className="img-zoom aspect-[4/5] overflow-hidden rounded-[2rem] shadow-card"><img src="/images/about-story.jpg" alt="Sid backstage" loading="lazy" className="h-full w-full object-cover" /></div>
          <div className="img-zoom absolute -bottom-10 -left-6 hidden w-1/2 overflow-hidden rounded-3xl border-4 border-background shadow-card md:block">
            <img src="/images/black-and-white-host.webp" alt="" loading="lazy" className="aspect-square w-full object-cover" />
          </div>
        </Reveal>
      </section>

      <section className="bg-ink py-28">
        <div className="container-x">
          <SectionHead eyebrow="Philosophy" title={<>Four things I bring to <em className="text-gold">every stage.</em></>} />
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {hostingPhilosophy.map((p, i) => (
              <Reveal key={p.title} delay={i * 100} className="group rounded-3xl border border-border bg-card/50 p-8 transition-all duration-500 hover:-translate-y-2 hover:border-primary/40 hover:shadow-gold">
                <span className="font-display text-6xl text-primary/30 transition-colors group-hover:text-primary">0{i + 1}</span>
                <Icon name={p.icon} className="mt-6 h-7 w-7 text-primary" />
                <h3 className="mt-4 text-3xl">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-28">
        <SectionHead center eyebrow="Milestones" title={<>The <em className="text-gold">journey.</em></>} />
        <ol className="relative mx-auto mt-16 max-w-4xl">
          <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-primary via-accent to-transparent md:left-1/2" />
          {milestones.map((m, i) => (
            <Reveal as="li" key={m.year} delay={80} className={`relative mb-12 pl-14 md:w-1/2 md:pl-0 ${i % 2 ? "md:ml-auto md:pl-14" : "md:pr-14 md:text-right"}`}>
              <span className={`absolute left-2.5 top-3 h-3 w-3 rounded-full bg-primary shadow-gold ${i % 2 ? "md:-left-1.5" : "md:left-auto md:-right-1.5"}`} />
              <p className="font-display text-6xl text-gold">{m.year}</p>
              <h3 className="mt-2 text-2xl">{m.title}</h3>
              <p className="mt-2 text-muted-foreground">{m.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="container-x pb-10">
        <Reveal className="rounded-[2rem] border border-border bg-card/40 p-10 text-center">
          <p className="eyebrow">Off stage</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {interests.map((x) => (
              <span key={x.label} className="flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm transition-colors hover:border-primary hover:text-primary">
                <Icon name={x.icon} className="h-4 w-4" /> {x.label}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      <CtaBanner image="/images/about-cta.jpg" />
    </>
  );
}
