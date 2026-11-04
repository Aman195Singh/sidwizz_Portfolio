# 14 — Testing & Acceptance Criteria (Vitest 4)

## 1. Automated Test Suite (`npm test`)
The test runner is powered by **Vitest 4.x** with jsdom environment.
- Test location: `src/test/app-routing.test.tsx`
- Setup file: `src/test/setup.ts`
- Command: `npm test` (`vitest run`)

### What is Tested:
1. **Router & Route Tree Initialization:** Verifies that TanStack Router creates valid route contracts for `/`, `/about`, `/services`, `/portfolio`, `/gallery`, `/contact`.
2. **Page Component Rendering:** Verifies that route components render without runtime React or TypeScript exceptions.
3. **Link Integrity:** Ensures all internal links navigate properly within the client router.

---

## 2. Production Build Acceptance (`npm run build`)
A successful release requires `vite build` to compile:
1. **Client Bundle:** Transforms all modules, outputs hashed assets (`.output/public/assets/*.js`, `*.css`).
2. **SSR Bundle:** Compiles server render entry points into `node_modules/.nitro/vite/services/ssr/`.
3. **Nitro Production Server:** Generates deployment manifests and production worker files with **0 errors**.

---

## 3. Responsive Quality Assurance Viewports
Every route must be visually verified across 6 standard responsive breakpoints without horizontal scrollbars:
- **Desktop:** 1920 × 1080, 1440 × 900, 1366 × 768
- **Tablet:** 1024 × 768 (Landscape), 768 × 1024 (Portrait)
- **Mobile:** 390 × 844 (iPhone), 375 × 812, 320 × 700 (Small screen)
