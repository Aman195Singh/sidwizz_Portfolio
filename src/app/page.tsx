import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Mic, Sparkles, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Demo Status Banner */}
      <aside
        aria-label="Demo environment notification"
        className="border-b border-border bg-surface px-4 py-2 text-center text-xs font-medium text-muted"
      >
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-accent animate-pulse" />
          <strong className="text-foreground">[DEMO ENVIRONMENT]</strong> — Phase 0 Foundation Verified · Synthetic Data Only
        </span>
      </aside>

      {/* Main Shell */}
      <main className="flex-1 flex flex-col justify-center py-16 sm:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-surface-raised px-4 py-1.5 text-xs font-semibold text-primary-text mb-8">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span>Event Host · Emcee · Speaker</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground">
              Commanding the Stage. <br />
              <span className="text-primary-text">Energizing Every Audience.</span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-lg sm:text-xl text-muted leading-relaxed">
              Official portfolio and booking enquiry platform for Siddharth Maurya. Specializing in high-stakes corporate summits, tech conclaves, and prestigious galas across Asia and beyond.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" variant="accent" className="gap-2">
                <Calendar className="h-4 w-4" />
                Check Availability [DEMO]
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Mic className="h-4 w-4" />
                Explore Services
                <ArrowRight className="h-4 w-4 text-primary-text" />
              </Button>
            </div>

            {/* Architecture Foundation Highlights */}
            <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3 text-left">
              <div className="rounded-lg border border-border bg-surface p-5">
                <div className="flex items-center gap-2 text-accent font-semibold text-sm mb-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Next.js 15 App Router</span>
                </div>
                <p className="text-xs text-muted">
                  Strict TypeScript, Server Components by default, and verified async Next.js 15 API handling.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-surface p-5">
                <div className="flex items-center gap-2 text-primary-text font-semibold text-sm mb-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Neon & Drizzle ORM</span>
                </div>
                <p className="text-xs text-muted">
                  Transaction-safe Postgres connection pooled for app runtime, with direct migration isolation.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-surface p-5">
                <div className="flex items-center gap-2 text-foreground font-semibold text-sm mb-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>WCAG 2.2 AA Theme</span>
                </div>
                <p className="text-xs text-muted">
                  Deep purple concert aesthetic calibrated for high-contrast accessibility on all screen sizes.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface/50 py-6 text-center text-xs text-muted">
        <Container>
          <p>© {new Date().getFullYear()} Siddharth Maurya · Sidd.Whizz V1 [DEMO] · All rights reserved.</p>
        </Container>
      </footer>
    </div>
  );
}

