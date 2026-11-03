import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { CalendarDays, ArrowRight, Menu, X, Send, Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import ctaHost from "@/assets/cta-host.jpg";
import ctaCrowd from "@/assets/cta-crowd.jpg";
import avPriya from "@/assets/avatar-priya.jpg";
import avRohit from "@/assets/avatar-rohit.jpg";
import avAmit from "@/assets/avatar-amit.jpg";

export const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
] as const;

/* ---------- Reveal on scroll ---------- */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref as never}
      className={`reveal ${shown ? "in" : ""} ${className}`}
      style={{ "--d": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

/* ---------- Logo ---------- */
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <svg viewBox="0 0 40 28" className="h-7 w-9 text-primary" aria-hidden>
        {[2, 7, 12, 17, 22, 27, 32, 37].map((x, i) => {
          const h = [6, 12, 20, 26, 26, 18, 10, 5][i] ?? 10;
          return <rect key={x} x={x - 1.2} y={14 - h / 2} width="2.4" height={h} rx="1.2" fill="currentColor" />;
        })}
      </svg>
      <span className={`font-display text-xl font-black tracking-tight md:text-2xl ${light ? "text-ink-foreground" : "text-foreground"}`}>
        SIDD.<span className="text-primary">WHIZZ</span>
      </span>
    </span>
  );
}

function Tagline({ light = false }: { light?: boolean }) {
  return (
    <div className={`border-l pl-4 leading-tight ${light ? "border-ink-muted/40" : "border-border"}`}>
      <p className={`font-display text-[13px] font-extrabold ${light ? "text-ink-foreground" : "text-foreground"}`}>
        SIDDHARTH “SID” MAURYA
      </p>
      <p className={`text-[10px] font-semibold tracking-wide ${light ? "text-ink-muted" : "text-muted-foreground"}`}>
        EVENT HOST • EMCEE • MODERATOR
      </p>
    </div>
  );
}

/* ---------- Header ---------- */
export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 10);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header
      className={`sticky top-0 z-50 border-b bg-background/95 backdrop-blur transition-shadow duration-300 ${scrolled ? "shadow-[var(--shadow-card)]" : ""}`}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4 md:h-[72px]">
        <Link to="/" className="flex items-center gap-4">
          <Logo />
          <span className="hidden lg:block">
            <Tagline />
          </span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="nav-link" activeOptions={{ exact: true }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <Link to="/contact" className="btn-red hidden !px-4 !py-2 !normal-case md:inline-flex">
          <CalendarDays className="h-4 w-4" /> Book Sid <ArrowRight className="h-4 w-4" />
        </Link>
        <button
          className="grid h-10 w-10 place-items-center rounded-md border md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <div
        className={`grid overflow-hidden border-t bg-background transition-all duration-500 md:hidden ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr] border-transparent"}`}
      >
        <div className="min-h-0">
          <nav className="container-x flex flex-col gap-1 py-4">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: true }}
                className="rounded-md px-3 py-2.5 font-semibold data-[status=active]:bg-accent data-[status=active]:text-primary"
              >
                {n.label}
              </Link>
            ))}
            <Link to="/contact" className="btn-red mt-2">
              <CalendarDays className="h-4 w-4" /> Book Sid
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

/* ---------- Social icons ---------- */
const SOCIAL = [
  { label: "YouTube", href: "https://youtube.com", d: "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" },
  { label: "Instagram", href: "https://instagram.com", d: "M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2Zm0 4.8a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4Zm5.2-9.6a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z" },
  { label: "LinkedIn", href: "https://linkedin.com", d: "M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2ZM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2ZM7.1 20.5H3.5V9h3.6v11.5Z" },
  { label: "X", href: "https://x.com", d: "M18.2 2.3h3.4l-7.4 8.4 8.7 11.5h-6.8l-5.3-7-6.1 7H1.3l7.9-9L.9 2.3h7l4.8 6.4 5.5-6.4Zm-1.2 17.9h1.9L7 4.2H5l12 16Z" },
];

export function SocialIcons({ variant = "dark" }: { variant?: "dark" | "card" }) {
  return (
    <div className="flex items-center gap-3">
      {SOCIAL.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noreferrer"
          aria-label={s.label}
          className={
            variant === "dark"
              ? "grid h-9 w-9 place-items-center rounded-md text-ink-foreground transition-all duration-300 hover:-translate-y-1 hover:text-primary"
              : "grid h-12 w-16 place-items-center rounded-lg border bg-card text-foreground transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:text-primary"
          }
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
            <path d={s.d} />
          </svg>
        </a>
      ))}
    </div>
  );
}

/* ---------- Footer ---------- */
export function Footer() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="container-x grid gap-8 py-8 md:grid-cols-[auto_1fr_auto] md:items-center">
        <div className="flex items-center gap-4">
          <Logo light />
          <div className="border-l border-ink-muted/30 pl-4 text-xs">
            <p className="font-bold">Siddharth “Sid” Maurya</p>
            <p className="text-ink-muted">Event Host • Emcee • Moderator</p>
          </div>
        </div>
        <div className="md:justify-self-center">
          <p className="mb-2 text-sm font-bold">Quick Links</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: true }}
                className="transition-colors hover:text-ink-foreground data-[status=active]:text-primary data-[status=active]:underline data-[status=active]:underline-offset-8"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="md:border-l md:border-ink-muted/30 md:pl-8">
          <p className="mb-2 text-sm font-bold">Connect</p>
          <SocialIcons />
        </div>
      </div>
      <div className="container-x flex flex-col justify-between gap-2 border-t border-ink-muted/20 py-4 text-xs text-ink-muted sm:flex-row">
        <p>© 2026 SIDD.WHIZZ. All Rights Reserved.</p>
        <p className="flex gap-3">
          <a href="#" className="hover:text-ink-foreground">Privacy Policy</a>
          <span>|</span>
          <a href="#" className="hover:text-ink-foreground">Terms of Service</a>
        </p>
      </div>
    </footer>
  );
}

/* ---------- Page hero ---------- */
export function PageHero({
  eyebrow,
  lines,
  redFrom,
  text,
  image,
  big = false,
  actions,
  position = "center",
}: {
  eyebrow: string;
  lines: string[];
  redFrom: number;
  text: ReactNode;
  image: string;
  big?: boolean;
  actions?: ReactNode;
  position?: string;
}) {
  return (
    <section className={`relative overflow-hidden ${big ? "md:h-[700px]" : "md:h-[500px]"}`}>
      <div className="relative h-[300px] md:absolute md:inset-0 md:h-auto">
        <div className="absolute inset-0 md:left-[30%]">
          <img
            src={image}
            alt=""
            width={1920}
            height={1080}
            className="animate-kenburns h-full w-full object-cover"
            style={{ objectPosition: position }}
          />
        </div>
        <div className="hero-slash animate-slash pointer-events-none absolute inset-0 hidden md:block" />
        <div className="hero-fade absolute inset-0 hidden md:block" />
        <div className="hero-fade-mobile absolute inset-0 md:hidden" />
      </div>
      <div className="container-x relative -mt-16 pb-10 md:mt-0 md:flex md:h-full md:items-center md:pb-0">
        <div className="max-w-2xl">
          <p className="eyebrow eyebrow-line animate-rise">{eyebrow}</p>
          <h1 className={`display mt-4 ${big ? "text-4xl sm:text-5xl lg:text-[54px]" : "text-3xl sm:text-4xl lg:text-[52px]"}`}>
            {lines.map((l, i) => (
              <span
                key={l}
                className={`animate-rise block ${i >= redFrom ? "text-primary" : ""}`}
                style={{ "--d": `${120 + i * 110}ms` } as CSSProperties}
              >
                {l}
              </span>
            ))}
          </h1>
          <p
            className="animate-rise mt-5 max-w-md text-[15px] leading-relaxed text-foreground/85"
            style={{ "--d": "520ms" } as CSSProperties}
          >
            {text}
          </p>
          {actions && (
            <div className="animate-rise mt-7 flex flex-wrap gap-3" style={{ "--d": "650ms" } as CSSProperties}>
              {actions}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- Stats bar ---------- */
export function StatsBar({
  items,
  className = "",
}: {
  items: { icon: ReactNode; value?: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={`container-x relative z-10 ${className}`}>
      <Reveal>
        <div className="grid grid-cols-2 gap-y-6 rounded-2xl border-2 border-primary/70 bg-ink px-4 py-5 text-ink-foreground shadow-[var(--shadow-red)] md:grid-cols-4 md:px-8">
          {items.map((it, i) => (
            <div
              key={it.label}
              className={`flex items-center justify-center gap-4 ${i > 0 ? "md:border-l md:border-ink-muted/25" : ""}`}
            >
              <span className="text-primary [&_svg]:h-8 [&_svg]:w-8">{it.icon}</span>
              <div>
                {it.value && <CountUp value={it.value} />}
                <p className={`${it.value ? "text-xs uppercase tracking-wide text-ink-muted" : "font-display text-sm font-bold leading-tight md:text-base"}`}>
                  {it.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}

function CountUp({ value }: { value: string }) {
  const m = value.match(/^([\d.]+)(.*)$/);
  const target = m?.[1] ? parseFloat(m[1]) : 0;
  const suffix = m ? (m[2] ?? "") : value;
  const decimals = m?.[1]?.includes(".") ? 1 : 0;
  const ref = useRef<HTMLParagraphElement>(null);
  const [n, setN] = useState(target);
  useEffect(() => {
    const el = ref.current;
    if (!el || !m) return;
    setN(0);
    const io = new IntersectionObserver((e) => {
      if (!e[0]?.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / 1600);
        setN(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <p ref={ref} className="font-display text-2xl font-black md:text-3xl">
      {n.toFixed(decimals)}
      {suffix}
    </p>
  );
}

/* ---------- Section heading ---------- */
export function SectionHead({
  eyebrow,
  title,
  red,
  className = "",
  center = false,
}: {
  eyebrow: string;
  title?: string;
  red?: string;
  className?: string;
  center?: boolean;
}) {
  return (
    <Reveal className={`${center ? "text-center" : ""} ${className}`}>
      <p className="eyebrow">{eyebrow}</p>
      {(title || red) && (
        <h2 className="display mt-2 text-2xl sm:text-3xl lg:text-[38px]">
          <span className={red ? "" : "heading-line"}>{title}</span>
          {red && (
            <>
              {title && <br />}
              <span className="heading-line text-primary">{red}</span>
            </>
          )}
        </h2>
      )}
    </Reveal>
  );
}

/* ---------- CTA banner ---------- */
export function CtaBanner({
  title,
  red,
  sub,
  variant = "host",
  secondary = { label: "Get in Touch", to: "/contact" as const },
  primaryLabel = "Book Sid Now",
}: {
  title: ReactNode;
  red?: ReactNode;
  sub: ReactNode;
  variant?: "host" | "crowd";
  secondary?: { label: string; to: "/contact" | "/portfolio" };
  primaryLabel?: string;
}) {
  return (
    <section className="container-x py-10">
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl bg-ink text-ink-foreground">
          <img
            src={variant === "host" ? ctaHost : ctaCrowd}
            alt=""
            loading="lazy"
            width={1920}
            height={640}
            className="absolute inset-0 h-full w-full object-cover object-left"
          />
          <div className="cta-fade absolute inset-0" />
          <div className="relative grid gap-6 px-6 py-10 md:grid-cols-[1fr_auto] md:items-center md:py-12 md:pl-[34%] md:pr-10">
            <div>
              <h2 className="display text-2xl md:text-[34px]">
                {title}
                {red && <span className="block text-primary">{red}</span>}
              </h2>
              <p className="mt-3 text-ink-muted md:text-lg">{sub}</p>
            </div>
            <div className="flex flex-col gap-3 md:w-64 [&_a]:whitespace-nowrap">
              <Link to="/contact" className="btn-red !normal-case !text-base">
                <CalendarDays className="h-4 w-4" /> {primaryLabel} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to={secondary.to} className="btn-ghost-light !normal-case !text-base">
                <Send className="h-4 w-4" /> {secondary.label}
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- Testimonials ---------- */
const TESTIMONIALS = [
  { q: "Sid brought unmatched energy and professionalism to our annual summit. The audience was fully engaged throughout.", n: "Priya Sharma", r: "Event Director, TechNova", img: avPriya },
  { q: "A brilliant host! Confident, sharp and incredibly versatile. He made our awards night truly memorable.", n: "Rohit Verma", r: "Marketing Head, Innovex", img: avRohit },
  { q: "Sid has a rare ability to connect with diverse audiences — be it corporate leaders, industry experts or a live festival crowd.", n: "Amit Khanna", r: "Founder, EventSphere", img: avAmit },
];

export function Testimonials() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {TESTIMONIALS.map((t, i) => (
        <Reveal key={t.n} delay={i * 120}>
          <figure className="card-lift flex h-full flex-col p-6">
            <div className="flex gap-3">
              <Quote className="h-8 w-8 shrink-0 fill-primary text-primary" />
              <blockquote className="text-sm leading-relaxed text-foreground/85">“{t.q}”</blockquote>
            </div>
            <figcaption className="mt-5 flex items-center gap-3">
              <img src={t.img} alt={t.n} loading="lazy" width={816} height={816} className="h-11 w-11 rounded-full object-cover" />
              <div className="flex-1">
                <p className="text-sm font-bold">{t.n}</p>
                <p className="text-xs text-muted-foreground">{t.r}</p>
              </div>
              <div className="flex text-star">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-current" />
                ))}
              </div>
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}

/* ---------- Brand wordmarks ---------- */
export const BRANDS = ["Google", "Microsoft", "aws", "Infosys", "IBM", "HCLTech", "TATA", "accenture", "vivo"];

export function BrandMark({ name }: { name: string }) {
  const style: Record<string, string> = {
    Google: "font-sans font-medium tracking-tight",
    Microsoft: "font-sans font-semibold",
    aws: "font-display font-black lowercase",
    Infosys: "font-sans font-medium italic",
    IBM: "font-display font-black tracking-[0.2em]",
    HCLTech: "font-display font-extrabold italic",
    TATA: "font-display font-black tracking-widest",
    accenture: "font-sans font-semibold lowercase",
    vivo: "font-display font-bold lowercase tracking-wider",
  };
  return (
    <span
      className={`text-2xl text-foreground/70 transition-all duration-300 hover:scale-110 hover:text-primary ${style[name] ?? "font-bold"}`}
    >
      {name}
    </span>
  );
}

/* ---------- Lightbox ---------- */
export function Lightbox({
  images,
  index,
  onClose,
  onIndex,
}: {
  images: { src: string; alt: string }[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  useEffect(() => {
    if (index === null) return;
    const on = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % images.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", on);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", on);
      document.body.style.overflow = "";
    };
  }, [index, images.length, onClose, onIndex]);
  const img = index === null ? undefined : images[index];
  if (index === null || !img) return null;
  return (
    <div
      className="animate-in fade-in fixed inset-0 z-[100] grid place-items-center bg-ink/95 p-4 duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal
    >
      <button aria-label="Close" className="absolute right-5 top-5 text-ink-foreground hover:text-primary" onClick={onClose}>
        <X className="h-8 w-8" />
      </button>
      <button
        aria-label="Previous"
        className="absolute left-3 grid h-12 w-12 place-items-center rounded-full bg-ink-foreground/10 text-ink-foreground hover:bg-primary md:left-8"
        onClick={(e) => {
          e.stopPropagation();
          onIndex((index - 1 + images.length) % images.length);
        }}
      >
        <ChevronLeft />
      </button>
      <img
        key={img.src}
        src={img.src}
        alt={img.alt}
        className="animate-in zoom-in-95 fade-in max-h-[85vh] max-w-[90vw] rounded-xl object-contain duration-500"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        aria-label="Next"
        className="absolute right-3 grid h-12 w-12 place-items-center rounded-full bg-ink-foreground/10 text-ink-foreground hover:bg-primary md:right-8"
        onClick={(e) => {
          e.stopPropagation();
          onIndex((index + 1) % images.length);
        }}
      >
        <ChevronRight />
      </button>
      <p className="absolute bottom-5 text-sm text-ink-muted">
        {img.alt} · {index + 1} / {images.length}
      </p>
    </div>
  );
}

export function Signature() {
  return (
    <div className="mt-5">
      <p className="text-4xl text-primary" style={{ fontFamily: "'Great Vibes', cursive" }}>
        Siddharth Maurya
      </p>
      <p className="mt-1 text-xs font-bold tracking-[0.3em]">SIDD.WHIZZ</p>
    </div>
  );
}
