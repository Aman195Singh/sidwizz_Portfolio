import { useEffect, useRef, useState, type ReactNode, type ElementType } from "react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setVisible(true);
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
      ref={ref}
      className={cn("reveal", visible && "is-visible", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

export function CountUp({ value }: { value: string }) {
  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? parseInt(match[1] ?? "0", 10) : 0;
  const suffix = match ? (match[2] ?? "") : value;
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || !match) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / 1800);
        setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return (
    <span ref={ref}>
      {match ? n : ""}
      {suffix}
    </span>
  );
}

export function SectionHead({
  eyebrow,
  title,
  text,
  center,
}: {
  eyebrow: string;
  title: ReactNode;
  text?: string;
  center?: boolean;
}) {
  return (
    <Reveal className={cn("max-w-3xl", center && "mx-auto text-center")}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 text-5xl md:text-7xl">{title}</h2>
      {text && <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{text}</p>}
    </Reveal>
  );
}
