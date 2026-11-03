import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ArrowUpRight } from "lucide-react";
import { packages, services, processSteps } from "@/lib/data";
import { Reveal, SectionHead } from "@/components/site/Reveal";
import { CtaBanner, PageHero } from "@/components/site/Layout";
import { Icon } from "@/components/site/icons";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Hosting Services & Packages — SIDD.WHIZZ" },
      { name: "description", content: "Concerts, college fests, corporate summits, weddings, award nights, product launches, panels and keynotes. Choose a hosting package." },
      { property: "og:title", content: "Hosting Services — SIDD.WHIZZ" },
      { property: "og:description", content: "Eight event formats, three packages, one unforgettable host." },
    ],
  }),
  component: Services,
});

function Services() {
  return (
    <>
      <PageHero eyebrow="Services" title={<>One host. <em className="text-gold">Every stage.</em></>} text="From boardrooms to arenas — tailored hosting that fits your audience, your brand and your moment." image="/images/corporate-stage.webp" />

      <section className="container-x space-y-28 py-28">
        {services.map((s, i) => (
          <div key={s.id} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
            <Reveal className={cn("img-zoom aspect-[5/4] overflow-hidden rounded-[2rem] shadow-card", i % 2 && "lg:order-2")}>
              <img src={s.image} alt={s.title} loading="lazy" className="h-full w-full object-cover" />
            </Reveal>
            <Reveal delay={150}>
              <div className="flex items-center gap-4">
                <span className="font-display text-7xl text-primary/30">{String(i + 1).padStart(2, "0")}</span>
                <span className="rounded-full border border-primary/40 px-3 py-1 text-[10px] tracking-[0.25em] text-primary">{s.tag}</span>
              </div>
              <h2 className="mt-4 flex items-center gap-4 text-5xl md:text-6xl">{s.title}</h2>
              <p className="mt-5 max-w-lg text-lg text-muted-foreground">{s.description}</p>
              <Link to="/contact" className="btn btn-ghost mt-8"><Icon name={s.icon} className="h-4 w-4 text-primary" /> Enquire <ArrowUpRight className="h-4 w-4" /></Link>
            </Reveal>
          </div>
        ))}
      </section>

      <section className="bg-ink py-28">
        <div className="container-x">
          <SectionHead center eyebrow="Packages" title={<>Pick your <em className="text-gold">experience.</em></>} text="Every package is customised after a quick discovery call." />
          <div className="mt-16 grid items-stretch gap-6 lg:grid-cols-3">
            {packages.map((p, i) => (
              <Reveal key={p.name} delay={i * 120} className={cn(
                "relative flex flex-col rounded-[2rem] border p-8 transition-all duration-500 hover:-translate-y-2",
                p.popular ? "border-primary bg-card shadow-gold lg:-my-4 lg:py-12" : "border-border bg-card/40",
              )}>
                {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 text-xs font-semibold text-primary-foreground">Most booked</span>}
                <Icon name={p.icon} className="h-8 w-8 text-primary" />
                <h3 className="mt-5 text-4xl">{p.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.tagline}</p>
                <ul className="mt-8 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{f}</li>
                  ))}
                </ul>
                <Link to="/contact" className={cn("btn mt-10 w-full", p.popular ? "btn-gold" : "btn-ghost")}>{p.buttonText}</Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-28">
        <SectionHead eyebrow="Process" title={<>Simple, <em className="text-gold">seamless.</em></>} />
        <div className="mt-12 grid gap-4 md:grid-cols-5">
          {processSteps.map((p, i) => (
            <Reveal key={p.step} delay={i * 90} className="rounded-3xl border border-border p-6">
              <p className="font-display text-5xl text-gold">{p.step}</p>
              <p className="mt-4 text-xl font-semibold">{p.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaBanner image="/images/event-cta.webp" />
    </>
  );
}
