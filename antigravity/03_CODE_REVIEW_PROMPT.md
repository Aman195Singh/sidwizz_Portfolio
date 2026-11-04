# Code Review Prompt — TanStack Start + Vite

Perform a strict code review of all recent changes against repository standards:

1. **Framework Discipline:**
   - Are all routes located in `src/routes/`?
   - Is `createFileRoute` used for route definitions?
   - Are there ANY accidental Next.js imports (`next/navigation`, `next/link`, `next/image`, `next/font`)? If yes, flag as **CRITICAL**.
   - Are all navigation links using `<Link to="..." />` from `@tanstack/react-router`?

2. **Styling & Design Tokens:**
   - Is Tailwind CSS v4 respected? Verify no obsolete `tailwind.config.ts` was added.
   - Are theme variables (`--primary`, `--ink`, `--gold`, `font-display`, `font-sans`) referenced consistently?
   - Is contrast WCAG 2.2 AA compliant across dark backgrounds?

3. **Asset Handling:**
   - Are photos imported directly from `src/assets/*.jpg` rather than raw unverified strings?
   - Do all images have descriptive `alt` attributes?

4. **Performance & Responsiveness:**
   - Is there any horizontal scrollbar or element overflow on small screens (320px, 375px, 390px)?
   - Are below-the-fold images lazily loaded?

5. **Build & Test Verification:**
   - Does `npm run build` succeed with 0 warnings or errors across Vite client, SSR, and Nitro server outputs?
   - Does `npm test` pass 100%?
