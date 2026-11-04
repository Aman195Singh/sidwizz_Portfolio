# 13 — SEO, Accessibility & Performance (TanStack Start + Vite)

## 1. Search Engine Optimization (SEO)

### A. Meta Tags in `createFileRoute`
Every route in `src/routes/` implements descriptive, search-optimized meta tags via `head()`:
```tsx
export const Route = createFileRoute("/...")({
  head: () => ({
    meta: [
      { title: "Page Title — SIDD.WHIZZ" },
      { name: "description", content: "..." },
      { property: "og:title", content: "..." },
      { property: "og:description", content: "..." },
      { property: "og:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=2" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=2" },
    ],
  }),
  component: ...,
});
```

### B. Robots.txt
Located in `public/robots.txt`:
```txt
User-agent: *
Allow: /
Sitemap: https://sidwizz-portfolio.vercel.app/sitemap.xml
```

---

## 2. Accessibility (a11y) Standards
- **WCAG 2.2 AA Contrast:** Body text and headings maintain high-contrast ratios against the deep stage dark background (`oklch(0.12 0.015 285)`).
- **Keyboard Navigation:** All interactive elements (`<button>`, `<Link>`, inputs, dialog close buttons) have visible `:focus-visible` ring indicators.
- **Screen Reader Support:** Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`), descriptive `aria-label`s on icon-only buttons, and explicit `alt` text on all stage imagery.
- **Dialogs & Modals:** Lightbox and video modals trap focus, handle Escape key dismissal, and return focus upon exit.

---

## 3. Core Web Vitals & Loading Performance
- **Largest Contentful Paint (LCP):** Above-the-fold hero images are imported as ES modules and rendered with priority sizing and minimal CSS overhead.
- **Cumulative Layout Shift (CLS = 0):** All images declare explicit aspect ratios (`aspect-[16/9]`, `aspect-[4/3]`, `aspect-square`) preventing layout jumps while loading.
- **First Input Delay (FID) / INP:** Lightweight client hydration using TanStack Router ensures immediate interactivity on user tap/click.
- **Asset Caching:** Vite automatically adds content hashes to all CSS and JS bundles, enabling immutable CDN caching.
