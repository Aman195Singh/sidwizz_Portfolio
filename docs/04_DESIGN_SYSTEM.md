# 04 — Design System (Tailwind CSS v4 & OKLCH Theme)

## 1. Visual Direction & Aesthetic
The SIDD.WHIZZ aesthetic is a high-energy, cinematic concert stage theme:
- Deep stage blacks, crisp whites, and vibrant concert crimson/magenta (`#E5233B`).
- Subtle gold spotlights (`#F4C430`) for key phrases, stats, and testimonials.
- Modern Montserrat display typography paired with legible, human DM Sans body prose.

---

## 2. Color Palette (Declared in `src/styles.css`)

```css
@theme inline {
  --font-display: "Montserrat", system-ui, sans-serif;
  --font-sans: "DM Sans", system-ui, sans-serif;

  /* Theme Tokens */
  --color-primary: var(--primary);
  --color-primary-deep: var(--primary-deep);
  --color-ink: var(--ink);
  --color-ink-foreground: var(--ink-foreground);
  --color-ink-muted: var(--ink-muted);
  --color-star: var(--star);
  --color-border: var(--border);
}

:root {
  --radius: 0.75rem;
  --background: oklch(0.995 0 0);
  --foreground: oklch(0.2 0.005 20);

  /* Primary Crimson */
  --primary: oklch(0.58 0.235 27);         /* #E5233B Vibrant Stage Red/Crimson */
  --primary-deep: oklch(0.45 0.19 27);    /* Deep Burgundy Accent */
  --primary-foreground: oklch(0.99 0 0);  /* Clean White */

  /* Deep Stage Ink */
  --ink: oklch(0.12 0.015 285);            /* #0C0712 Deep Concert Black */
  --ink-foreground: oklch(0.99 0 0);      /* #FFFFFF Crisp White */
  --ink-muted: oklch(0.7 0.01 285);       /* Off-White Subtext */

  /* Spotlight Gold */
  --star: oklch(0.85 0.16 85);            /* #F4C430 Gold Accent */

  --border: oklch(0.88 0.005 20);
}
```

---

## 3. Typography
- **Headings & Badges (`font-display`):** Montserrat (weights 700 to 900, tracking tight).
- **Body & Captions (`font-sans`):** DM Sans (weights 400 to 600, leading relaxed).
- **Google Fonts Loading:** Linked directly in `src/routes/__root.tsx` with `preconnect` for high Core Web Vitals performance.

---

## 4. Reusable Component Inventory

### Site Components (`src/components/site.tsx`)
1. `<PageHero>`: Full-bleed hero banner with title lines, background photo, and CTA buttons.
2. `<StatsBar>`: Four-metric showcase bar with icons and values.
3. `<SectionHead>`: Eyebrow badge + display title + optional italic gold highlight.
4. `<Reveal>`: Scroll-driven entrance animation container.
5. `<Testimonials>`: Client review cards with circular avatars and 5-star ratings.
6. `<CtaBanner>`: Pre-footer conversion section with booking CTA.
7. `<Lightbox>`: Modal photo viewer for gallery.
8. `<Signature>`: Stylized handwritten signature.
9. `<Logo>`: Scalable SVG soundwave equalizer logo.
10. `<BrandMark>`: Individual SVG vector marks for client brands (Google, Microsoft, AWS, Infosys, IBM, HCLTech, TATA).

### UI Primitives (`src/components/ui/`)
Accordion, Alert, Alert Dialog, Aspect Ratio, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Carousel, Checkbox, Dialog, Drawer, Dropdown Menu, Form, Input, Popover, Progress, Radio Group, Scroll Area, Select, Separator, Sheet, Slider, Sonner, Switch, Table, Tabs, Textarea, Tooltip.
