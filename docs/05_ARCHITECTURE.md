# 05 — Technical Architecture (TanStack Start + Vite)

## 1. Selected Stack & Engine
- **Frontend & Fullstack Runtime:** TanStack Start (`@tanstack/react-start`) running on Vite 8 and Nitro.
- **Client Routing:** TanStack Router (`@tanstack/react-router`) with full TypeScript route inference.
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite` + `tw-animate-css`).
- **UI Primitives:** Radix UI primitives (`@radix-ui/react-*`), Lucide React icons.
- **State Management:** TanStack React Query (`@tanstack/react-query`) wired in router context.
- **Hosting / Deployment:** Vercel (or Cloudflare / Node Nitro targets).

---

## 2. Directory & Component Map

```text
c:\Users\Aman Singh\OneDrive\Desktop\Saas\Portfolio-web\SiddWhizz_Portfolio\
├── public/                     # Static web assets (favicons, robots.txt, og-image.png)
│   ├── favicon.ico             # Multi-resolution ICO (16x16, 32x32, 48x48)
│   ├── favicon.png             # 512x512 transparent PNG
│   ├── og-image.png            # 1200x630 social share banner
│   └── robots.txt
├── src/
│   ├── assets/                 # 26 cinematic images imported as ES modules
│   │   ├── hero-home.jpg       # Main stage backdrop
│   │   ├── tech-summit.jpg     # Summit photo
│   │   ├── avatar-priya.jpg    # Testimonial avatar
│   │   └── ...
│   ├── components/
│   │   ├── site.tsx            # Unified cinematic site components (PageHero, Nav, Footer, Lightbox, etc.)
│   │   └── ui/                 # Radix shadcn UI primitives (button, dialog, accordion, etc.)
│   ├── hooks/                  # Custom React hooks (use-mobile.tsx)
│   ├── lib/                    # Utilities (utils.ts, error-capture.ts)
│   ├── routes/                 # File-based routes
│   │   ├── __root.tsx          # Root HTML shell, meta links, <Outlet />, <Scripts />
│   │   ├── index.tsx           # Homepage (/)
│   │   ├── about.tsx           # About page (/about)
│   │   ├── services.tsx        # Services page (/services)
│   │   ├── portfolio.tsx       # Portfolio & video showreel (/portfolio)
│   │   ├── gallery.tsx         # Stage photos & Lightbox (/gallery)
│   │   └── contact.tsx         # Booking enquiry form (/contact)
│   ├── routeTree.gen.ts        # Auto-generated TanStack Router route tree
│   ├── router.tsx              # Router instantiation with QueryClient
│   ├── server.ts               # SSR error handling & server entry
│   ├── start.ts                # TanStack Start client entry point
│   ├── styles.css              # Tailwind v4 import & OKLCH design tokens
│   └── test/                   # Vitest tests (app-routing.test.tsx)
├── vite.config.ts              # Vite & TanStack Start config
├── tsconfig.json               # Strict TypeScript configuration
└── package.json                # Dependencies & scripts
```

---

## 3. Server-Side Rendering & Hydration Flow
1. **Request:** Browser sends GET request to server (e.g. `http://localhost:8080/services`).
2. **Nitro / Vite SSR:** TanStack Start matches the route in `src/routes/services.tsx`, evaluates loaders/meta, and renders initial HTML using `src/routes/__root.tsx`.
3. **Delivery:** Fast static HTML + CSS is streamed to the browser with zero layout shifts.
4. **Hydration:** Client bundles take over via `src/start.ts`, enabling instant SPA-like transitions between pages via `@tanstack/react-router`.

---

## 4. Asset Bundling & Performance Architecture
- **Direct ES Module Image Imports:** Photos in `src/assets/*.jpg` are imported directly:
  ```tsx
  import heroHome from "@/assets/hero-home.jpg";
  <img src={heroHome} alt="..." />
  ```
  Vite automatically optimizes, hashes, and code-splits these assets. This eliminates broken paths, ensures 100% cacheability on CDNs, and guarantees sub-second page loads.
- **Font Optimization:** Google Fonts (`Montserrat`, `DM Sans`) are preconnected in `<head>` and loaded asynchronously without blocking first paint.
