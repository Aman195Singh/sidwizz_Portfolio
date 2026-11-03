import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X, Instagram, Youtube, Linkedin, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import { navLinks, siteConfig } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 30);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-500", scrolled ? "py-3" : "py-6")}>
      <div className="container-x">
        <nav
          className={cn(
            "flex items-center justify-between rounded-full px-5 py-3 transition-all duration-500",
            scrolled && "glass shadow-card",
          )}
        >
          <Link to="/" className="font-display text-2xl tracking-wide">
            SIDD<span className="text-primary">.</span>WHIZZ
          </Link>
          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.slice(0, -1).map((l) => (
              <li key={l.href}>
                <Link
                  to={l.href}
                  className="relative rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  activeProps={{ className: "!text-foreground bg-secondary" }}
                  activeOptions={{ exact: true }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <Link to="/contact" className="btn btn-gold hidden !py-2.5 !px-5 sm:inline-flex">
              Book Sid <ArrowUpRight className="h-4 w-4" />
            </Link>
            <button
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen(!open)}
              className="grid h-11 w-11 place-items-center rounded-full border border-border lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </div>
      <div
        className={cn(
          "fixed inset-0 top-0 -z-10 bg-background/95 backdrop-blur-xl transition-all duration-500 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ul className="flex h-full flex-col justify-center gap-2 px-8">
          {navLinks.map((l, i) => (
            <li
              key={l.href}
              className={cn("transition-all duration-500", open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0")}
              style={{ transitionDelay: open ? `${i * 60 + 100}ms` : "0ms" }}
            >
              <Link to={l.href} className="font-display text-5xl text-muted-foreground" activeProps={{ className: "!text-primary" }} activeOptions={{ exact: true }}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

export function CtaBanner({ image = "/images/cta-stage.webp" }: { image?: string }) {
  return (
    <section className="container-x py-24">
      <Reveal className="relative overflow-hidden rounded-[2rem] shadow-card">
        <img src={image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/75" />
        <div className="absolute inset-0 bg-stage" />
        <div className="relative px-6 py-20 text-center md:py-28">
          <p className="eyebrow">Your stage awaits</p>
          <h2 className="mx-auto mt-5 max-w-4xl text-5xl md:text-8xl">
            Let's make your event <em className="text-gold">unforgettable</em>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
            Dates fill fast during festive and conference season. Lock in yours today.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="btn btn-gold">Check availability <ArrowUpRight className="h-4 w-4" /></Link>
            <a href={`https://wa.me/${siteConfig.whatsappRaw}`} target="_blank" rel="noreferrer" className="btn btn-ghost">WhatsApp Sid</a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border pt-24">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-96 bg-stage rotate-180" />
      <div className="container-x relative grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-display text-4xl">SIDD<span className="text-primary">.</span>WHIZZ</p>
          <p className="mt-4 max-w-sm text-muted-foreground">{siteConfig.tagline}</p>
          <div className="mt-6 flex gap-3">
            {[
              { href: siteConfig.socials.instagram, I: Instagram, l: "Instagram" },
              { href: siteConfig.socials.youtube, I: Youtube, l: "YouTube" },
              { href: siteConfig.socials.linkedin, I: Linkedin, l: "LinkedIn" },
            ].map(({ href, I, l }) => (
              <a key={l} href={href} target="_blank" rel="noreferrer" aria-label={l}
                className="grid h-11 w-11 place-items-center rounded-full border border-border transition-all hover:border-primary hover:text-primary">
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div className="md:col-span-3">
          <p className="eyebrow">Explore</p>
          <ul className="mt-5 space-y-3">
            {navLinks.map((l) => (
              <li key={l.href}><Link to={l.href} className="text-muted-foreground transition-colors hover:text-foreground">{l.label}</Link></li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-4">
          <p className="eyebrow">Bookings</p>
          <ul className="mt-5 space-y-4 text-muted-foreground">
            <li><a href={`mailto:${siteConfig.email}`} className="flex items-center gap-3 hover:text-foreground"><Mail className="h-4 w-4 text-primary" />{siteConfig.email}</a></li>
            <li><a href={`tel:+${siteConfig.phoneRaw}`} className="flex items-center gap-3 hover:text-foreground"><Phone className="h-4 w-4 text-primary" />{siteConfig.phoneDisplay}</a></li>
            <li className="flex items-start gap-3"><MapPin className="mt-1 h-4 w-4 shrink-0 text-primary" />{siteConfig.location}</li>
          </ul>
        </div>
      </div>
      <p aria-hidden className="relative mt-20 select-none text-center font-display text-[22vw] leading-[0.8] text-foreground/[0.04]">
        SIDD.WHIZZ
      </p>
      <div className="container-x relative flex flex-col justify-between gap-2 border-t border-border py-6 text-xs text-muted-foreground md:flex-row">
        <span>© {new Date().getFullYear()} SIDD.WHIZZ. All rights reserved.</span>
        <span>Crafted for the spotlight.</span>
      </div>
    </footer>
  );
}

export function PageHero({ eyebrow, title, text, image }: { eyebrow: string; title: ReactNode; text: string; image: string }) {
  return (
    <section className="relative flex min-h-[78vh] items-end overflow-hidden pb-20 pt-40">
      <img src={image} alt="" className="absolute inset-0 h-full w-full animate-kenburns object-cover" />
      <div className="absolute inset-0 bg-ink/55" />
      <div className="absolute inset-0 bg-fade" />
      <div className="container-x relative">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="rise mt-5 max-w-5xl overflow-hidden text-6xl md:text-8xl lg:text-9xl">
          <span>{title}</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">{text}</p>
      </div>
    </section>
  );
}
