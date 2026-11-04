# Phase Prompts — TanStack Start + Vite Execution

Use these prompt templates sequentially when directing AI coding agents to work on this repository.

---

## Phase 0: Environment & Foundation Check
> "Inspect the current TanStack Start + Vite codebase. Verify package dependencies in `package.json`, Vite configuration in `vite.config.ts`, Tailwind CSS v4 setup in `src/styles.css`, and root shell in `src/routes/__root.tsx`. Run `npm run build` and `npm test` to confirm clean builds and passing unit tests. Do not add unapproved backend frameworks."

---

## Phase 1: Core Homepage & Design Tokens
> "Review `src/routes/index.tsx` and `src/components/site.tsx`. Ensure the hero section matches the approved cinematic stage backdrop, the dual-tone heading ('Command the stage. Energize every audience.') renders cleanly, the stats bar reflects verified milestones, and the event highlight filters function smoothly. Verify keyboard accessibility and mobile responsiveness across 320px to 1920px."

---

## Phase 2: Content Pages (About, Services, Portfolio, Gallery)
> "Review and enhance the content routes (`src/routes/about.tsx`, `src/routes/services.tsx`, `src/routes/portfolio.tsx`, `src/routes/gallery.tsx`). Ensure all images are imported from `src/assets/*.jpg` for optimal Vite asset hashing, video preview modals work with Escape/click-outside dismissal, the gallery Lightbox supports arrow key navigation, and all links use `<Link to='...' />` from `@tanstack/react-router`."

---

## Phase 3: Booking Enquiry & Contact Flow
> "Inspect `src/routes/contact.tsx`. Ensure the booking enquiry form properly collects organizer details (name, email, phone, event date, event format, expected audience size, message), validates fields with Zod, displays immediate toast feedback using Sonner, and provides direct fallback contact methods (WhatsApp, phone, email)."

---

## Phase 4: Social Share, Favicon & Brand Calibration
> "Verify that all routes define complete Open Graph (`og:image`, `og:title`, `og:description`, `og:type`) and Twitter Card metadata pointing to `https://sidwizz-portfolio.vercel.app/og-image.png`. Confirm that `public/favicon.ico`, `public/favicon.png`, and `public/apple-touch-icon.png` display the official soundwave equalizer branding with no Lovable remnants."

---

## Phase 5: Build, Test & Production Verification
> "Execute full verification pass: `npm run build` (client, SSR, and Nitro server must pass with 0 errors), `npm test` (all unit and routing tests must pass), and inspect dev server at `http://localhost:8080/`. Commit changes with semantic commit messages and push to `origin/main` for automated Vercel deployment."
