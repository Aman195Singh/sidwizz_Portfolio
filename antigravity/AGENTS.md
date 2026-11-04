# Sidd.Whizz V1 — Repository Agent Rules (TanStack Start + Vite)

Read `README.md` and relevant docs before work. Always inspect the codebase before making assumptions.
Do not invent unrequested backend microservices or rewrite the working frontend architecture.

---

## 1. Verified Architecture & Runtime Standards
- **Framework:** TanStack Start (`@tanstack/react-start` 1.168.x) with Vite 8 + Nitro SSR engine.
- **Routing:** TanStack Router (`@tanstack/react-router` 1.170.x) — strict file-based routing in `src/routes/`.
- **Language:** TypeScript 5.8+ with `strict: true`.
- **Styling:** Tailwind CSS v4 configured via `@tailwindcss/vite` and `@theme inline` inside `src/styles.css`.
- **UI System:** Radix UI primitives (`src/components/ui/`) + custom cinematic components (`src/components/site.tsx`).
- **Icons:** `lucide-react`.
- **Dev Port:** `http://localhost:8080/`.

---

## 2. Agent Routing & Coding Rules

### A. Routing Conventions
1. All route definitions live in `src/routes/`. Do NOT create `src/app/`, `pages/`, or `src/pages/`.
2. App shell is defined in `src/routes/__root.tsx`. Always keep `<HeadContent />`, `<Outlet />`, and `<Scripts />` inside `RootShell`.
3. Route components declare files with `export const Route = createFileRoute("/...")({ component: MyComponent, head: ... })`.
4. Route links MUST use `<Link to="..." />` from `@tanstack/react-router`. Never use `<a>` for client-side navigation.
5. Dynamic segments must use the bare dollar convention (e.g., `src/routes/portfolio/$slug.tsx`), not square brackets.

### B. Styling & Design Tokens
1. Tailwind CSS v4 does NOT use `tailwind.config.ts`. All tokens, color variables, and font bindings are defined inside `src/styles.css` using the `@theme inline` block.
2. Official palette:
   - `--primary`: Crimson Red / Magenta `oklch(0.58 0.235 27)` (`#E5233B`)
   - `--primary-deep`: Deep Crimson `oklch(0.45 0.19 27)`
   - `--ink`: Concert Stage Black `oklch(0.12 0.015 285)` (`#0C0712`)
   - `--ink-foreground`: Clean Off-White `oklch(0.99 0 0)`
   - `--gold`: Spotlight Gold Accent `oklch(0.85 0.16 85)`
3. Typography:
   - Headings & Titles: `font-display` (`Montserrat`, bold/black weight)
   - Body & Prose: `font-sans` (`DM Sans`, normal/medium weight)
4. Animations:
   - Scroll reveals: Wrap sections with `<Reveal delay={...}>` (powered by `IntersectionObserver`).
   - Glowing elements: Use `.glow-accent` or `.btn-red`.

### C. Imagery & Assets
1. All hero backdrops, event photos, and portraits live in `src/assets/*.jpg` and are imported into components as ES modules to guarantee zero-layout-shift and optimal bundling by Vite.
2. Web root assets (favicons, apple-touch-icon, Open Graph images `og-image.png`, `robots.txt`) live in `public/`.
3. Every `<img>` tag must have explicit, descriptive `alt` text and appropriate `loading="lazy"` where below the fold.

---

## 3. Data & Lead Management Policy
1. For development and testing, use realistic synthetic enquiry submissions.
2. Contact and booking submissions must validate user input (name, email, phone, date, event type, message) with strict Zod validation schemas.
3. Private organizer details, enquiry budgets, and messages must remain strictly private. Never expose them via unauthenticated client endpoints.

---

## 4. Execution & Verification Flow
For every feature or modification:
1. **Inspect:** Check existing route files (`src/routes/`) and components (`src/components/site.tsx`).
2. **Implement:** Write minimal, clean, type-safe code that matches the existing design system.
3. **Verify Build:** Execute `npm run build` — must complete with 0 errors across client, SSR, and Nitro environments.
4. **Verify Tests:** Execute `npm test` — must pass 100%.
5. **Verify Dev Server:** Confirm server runs smoothly on `http://localhost:8080/`.
