# SIDD.WHIZZ — Developer & Agent Instructions

This repository contains the official portfolio website for **Siddharth “Sid” Maurya** (Event Host, Emcee & Moderator).

---

## 1. Verified Tech Stack
- **Framework & SSR:** TanStack Start (`@tanstack/react-start` 1.168.x) powered by Nitro & Vite 8
- **Routing:** TanStack Router (`@tanstack/react-router` 1.170.x) — strict file-based routing in `src/routes/`
- **Language & Runtime:** TypeScript 5.8 (strict mode enabled), Node.js v22.16+
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite` + `tw-animate-css`) with inline OKLCH theme in `src/styles.css`
- **UI & Primitives:** Radix UI primitives (`@radix-ui/react-*`), Lucide React icons (`lucide-react`)
- **Testing:** Vitest 4.x with React Testing Library (`npm test`)
- **Dev Server Port:** `http://localhost:8080/` (`npm run dev`)

---

## 2. Architecture & File Conventions

### A. Routing (`src/routes/`)
- Every `.tsx` file inside `src/routes/` corresponds to a route URL.
- **Root Shell:** `src/routes/__root.tsx` defines the HTML shell (`<html>`, `<head>`, `<HeadContent />`, `<body>`, `<Outlet />`, `<Scripts />`).
- **Pages:**
  - `src/routes/index.tsx` → `/` (Cinematic Homepage)
  - `src/routes/about.tsx` → `/about` (Bio, Journey, Philosophy, Signature)
  - `src/routes/services.tsx` → `/services` (8 Event Formats, Packages, FAQ)
  - `src/routes/portfolio.tsx` → `/portfolio` (Featured Summits, Galas, Festivals, Video Modals)
  - `src/routes/gallery.tsx` → `/gallery` (Stage Moments, Audience Energy, Full-screen Lightbox)
  - `src/routes/contact.tsx` → `/contact` (Date Availability, Booking Enquiry Form, Direct Channels)
- **Dynamic Routes:** Use bare dollar sign `src/routes/portfolio/$slug.tsx` (NOT Next.js `[slug]`).
- **Route Declaration:** Always use `export const Route = createFileRoute("/...")({ ... })`.
- **Navigation:** Always use `<Link to="..." />` from `@tanstack/react-router`. Never use `next/link` or raw `<a>` for internal links.

### B. Components (`src/components/`)
- **Core Site Components:** `src/components/site.tsx` exports:
  - `Nav`: Sticky header with responsive mobile drawer, route indicator, and "Book Sid" action.
  - `PageHero`: Cinematic hero banner with dual-tone titles, stage backdrop, and call-to-actions.
  - `StatsBar`: Responsive grid displaying verified event milestones (600+ Events, 15+ Years, 1.2M+ Audience).
  - `SectionHead`: Standardized section header with eyebrow badges and italic accents.
  - `Reveal`: Scroll-driven viewport intersection animation wrapper with configurable delay.
  - `Testimonials`: Carousel/grid of client reviews with client avatars, organizer roles, and 5-star ratings.
  - `CtaBanner`: High-impact closing banner inviting event organizers to lock in dates.
  - `Footer`: Global footer with quick navigation links, social handles, and copyright notice.
  - `Lightbox`: Modal image zoom viewer with keyboard esc navigation.
  - `Signature`: Stylized handwritten signature of Siddharth Maurya.
  - `Logo` / `BrandMark`: Built-in soundwave SVG equalizer branding.
- **UI Primitives:** `src/components/ui/` contains Radix-powered accessible primitives (accordion, button, dialog, drawer, dropdown, select, sheet, sonner, etc.).

### C. Assets (`src/assets/` & `public/`)
- **Cinematic Imagery:** Photos are stored in `src/assets/` and imported directly into components/routes as ES modules (e.g. `import heroHome from "@/assets/hero-home.jpg";`). This guarantees Vite hashes, optimizes, and bundles images for instant zero-layout-shift loading.
- **Web Meta Assets:** Favicons, Apple touch icons, Open Graph banners (`og-image.png`, `og-square.png`), and `robots.txt` live in `public/`.

---

## 3. Critical "Vibe Coding" Agent Guidelines

> [!IMPORTANT]
> **DO NOT confuse this project with Next.js!**
> - NEVER create `src/app/`, `page.tsx`, or `layout.tsx`.
> - NEVER import from `next/*` (`next/navigation`, `next/link`, `next/image`, `next/font`).
> - NEVER create a `tailwind.config.ts`. Tailwind CSS v4 is loaded via `@tailwindcss/vite` and configured directly inside `src/styles.css`.
> - NEVER force push or rewrite Git history if connected to Lovable.

### Coding Rules:
1. **Preserve Design Integrity:** All pages use the deep stage black (`oklch(0.12 0.015 285)`), concert crimson/red (`oklch(0.58 0.235 27)`), and gold spotlight (`oklch(0.85 0.16 85)`) color palette with `Montserrat` display typography and `DM Sans` body text.
2. **Accessible by Default:** All buttons, interactive cards, and navigation elements must maintain keyboard focus styles (`focus-visible:ring-2`), semantic HTML tags, and accessible ARIA attributes.
3. **No Horizontal Overflow:** All layouts must be verified for 320px mobile up to 1920px desktop without horizontal scrollbars.
4. **Verification Step:** Run `npm run build` and `npm test` after any structural change to guarantee 0 TypeScript errors and 0 route generation faults.
