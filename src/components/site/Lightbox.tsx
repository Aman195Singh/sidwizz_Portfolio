import { useEffect, type ReactNode } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export function Lightbox({ open, onClose, onPrev, onNext, children }: {
  open: boolean; onClose: () => void; onPrev?: (() => void) | undefined; onNext?: (() => void) | undefined; children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev?.();
      if (e.key === "ArrowRight") onNext?.();
    };
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open, onClose, onPrev, onNext]);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}>
      <button aria-label="Close" onClick={onClose} className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-full glass"><X className="h-5 w-5" /></button>
      {onPrev && <button aria-label="Previous" onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full glass"><ChevronLeft className="h-5 w-5" /></button>}
      {onNext && <button aria-label="Next" onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full glass"><ChevronRight className="h-5 w-5" /></button>}
      <div className="max-h-full w-full max-w-5xl animate-in zoom-in-95 duration-500" onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

export function FilterPills<T extends string>({ items, value, onChange }: { items: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((c) => (
        <button key={c} onClick={() => onChange(c)}
          className={`rounded-full border px-5 py-2.5 text-sm transition-all duration-300 ${value === c ? "border-primary bg-primary text-primary-foreground shadow-gold" : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"}`}>
          {c}
        </button>
      ))}
    </div>
  );
}
