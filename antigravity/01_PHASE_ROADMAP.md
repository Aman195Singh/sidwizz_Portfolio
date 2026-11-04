# Phase Roadmap — TanStack Start + Vite Portfolio

## 1. Verified Runtime & Framework Versions
- **Node.js:** `v22.16.x` (Active LTS)
- **Framework & SSR:** TanStack Start `1.168.x` with Nitro server engine
- **Bundler & Dev Server:** Vite `8.1.x` running on `http://localhost:8080/`
- **Routing:** TanStack Router `1.170.x` (`src/routes/`)
- **Runtime Libraries:** React `19.2.x`, React DOM `19.2.x`
- **Language:** TypeScript `5.8.x` (strict mode enabled)
- **Styling:** Tailwind CSS `4.2.x` (`@tailwindcss/vite`), `tw-animate-css`
- **Component Primitives:** Radix UI primitives (`@radix-ui/react-*`), `class-variance-authority`, `tailwind-merge`, `clsx`, `lucide-react`
- **Testing:** Vitest `4.1.x` (`src/test/app-routing.test.tsx`)

---

## 2. Phase Definitions

### Phase 0: Project & Runtime Foundation [COMPLETE & VERIFIED]
- In-place TanStack Start + Vite configuration with Nitro SSR.
- Tailwind CSS v4 configured with `@theme inline` in `src/styles.css`.
- Root route shell in `src/routes/__root.tsx` with Google fonts (`Montserrat` + `DM Sans`), meta tags, and soundwave favicons.
- Production build verified: Client, SSR, and Nitro server bundles generate with 0 errors.
- Vitest test suite verified: 100% passing.

### Phase 1: Core Cinematic Homepage [COMPLETE & VERIFIED]
- Full-bleed hero banner in `src/routes/index.tsx` featuring the iconic stage backdrop and dual-tone crimson/white typography.
- Event statistics bar: 600+ Events, 15+ Years, 1.2M+ Audience Reach, 92% Re-engagement.
- 4 Primary Service Cards: Tech & Innovation Summits, Corporate Galas, Conclaves & Panels, Live Festivals.
- Why Choose Grid (High Energy, Relatable, Audience Connect, Versatile, Professional).
- Filterable Event Highlights with photo and video preview modals.
- Client Testimonial cards with verified avatar photos and roles.
- Trusted brands grid: Google, Microsoft, AWS, Infosys, IBM, HCLTech, TATA.
- Sticky Navigation bar (`Nav`) and global `Footer`.

### Phase 2: Content Routes & Experience Pages [COMPLETE & VERIFIED]
- **About Route (`src/routes/about.tsx`):** Bio, career milestones, stage philosophy, hosting persona, and handwritten signature.
- **Services Route (`src/routes/services.tsx`):** Detailed breakdown of 8 hosting formats, 3 curated packages, hosting deliverables, and FAQ accordion.
- **Portfolio Route (`src/routes/portfolio.tsx`):** High-stakes summits, galas, conclaves, filterable event case studies, and showreel video modal player.
- **Gallery Route (`src/routes/gallery.tsx`):** Multi-format stage photography grid with full-screen interactive `Lightbox` viewer and keyboard navigation.

### Phase 3: Lead Generation & Direct Booking [COMPLETE & VERIFIED]
- **Contact & Booking Route (`src/routes/contact.tsx`):** Direct booking enquiry form with date picker, event type selector, budget range, and message input.
- Real-time client-side validation using React Hook Form + Zod.
- Immediate visual feedback with Sonner toast notifications and direct WhatsApp / email reach-out links.

### Phase 4: Branding, Social Share & Asset Optimization [COMPLETE & VERIFIED]
- Custom red/magenta equalizer soundwave logo integrated into header, footer, and SVG brand marks.
- Multi-resolution favicons: `favicon.ico` (16×16, 32×32, 48×48), `favicon.png` (512×512), `favicon-32x32.png`, `apple-touch-icon.png`.
- High-definition Open Graph social share banner: `public/og-image.png` (1200×630) and `public/og-square.png` (600×600) with dynamic meta tags across all routes.
- Zero-layout-shift image bundling via `src/assets/*.jpg` imports.

### Phase 5: Production Deployment & Maintenance [IN PROGRESS]
- Continuous automated deployment via GitHub `main` branch to Vercel.
- Local production preview via `npm run build` and `npx vite preview`.
- Automated routing test suite regression check on every pull request.
