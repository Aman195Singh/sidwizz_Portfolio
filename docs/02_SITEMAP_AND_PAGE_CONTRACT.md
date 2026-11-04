# 02 — Sitemap and Route Contract (TanStack Start + Vite)

## Route Architecture
All routes are file-based and live under `src/routes/`. TanStack Router auto-generates `src/routeTree.gen.ts`. Never edit `routeTree.gen.ts` manually.

### Public Routes

| Route File | URL Path | Purpose | Key Components |
|---|---|---|---|
| `src/routes/__root.tsx` | App Shell | Global HTML shell, fonts, favicon/OG links, router `<Outlet />` | `RootShell`, `Nav`, `Footer`, `HeadContent`, `Scripts` |
| `src/routes/index.tsx` | `/` | Cinematic Homepage | `PageHero`, `StatsBar`, Services Cards, `Testimonials`, `CtaBanner` |
| `src/routes/about.tsx` | `/about` | Bio, philosophy, milestones, signature | `PageHero`, Milestones list, `Signature`, `CtaBanner` |
| `src/routes/services.tsx` | `/services` | 8 event formats, 3 packages, deliverables, FAQ | `PageHero`, Format Cards, Package Cards, Accordion FAQ |
| `src/routes/portfolio.tsx` | `/portfolio` | Event highlights, showreels, video modals | `PageHero`, Event Grid, Video Player Modal, Case Studies |
| `src/routes/gallery.tsx` | `/gallery` | Stage moments & audience engagement | `PageHero`, Multi-column Image Grid, Fullscreen `Lightbox` |
| `src/routes/contact.tsx` | `/contact` | Booking enquiry form & direct contact | `PageHero`, Booking Form, Contact Info Cards, Toast feedback |

---

## Route Creation Conventions

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/my-route")({
  head: () => ({
    meta: [
      { title: "Page Title — SIDD.WHIZZ" },
      { name: "description", content: "Page description for search engines." },
      { property: "og:title", content: "Page Title — SIDD.WHIZZ" },
      { property: "og:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=2" },
    ],
  }),
  component: MyPageComponent,
});

function MyPageComponent() {
  return <div>...</div>;
}
```

### Conventions to Enforce:
1. **Dynamic Routes:** Dynamic segments must use the bare dollar sign (e.g., `src/routes/portfolio/$slug.tsx` maps to `/portfolio/:slug`).
2. **Internal Navigation:** Always use `<Link to="/route" />` from `@tanstack/react-router`.
3. **App Shell:** Always keep `<Outlet />` inside `src/routes/__root.tsx` so child routes render properly.
4. **Metadata:** Always specify page-specific `meta` tags inside the `head()` function of `createFileRoute`.
