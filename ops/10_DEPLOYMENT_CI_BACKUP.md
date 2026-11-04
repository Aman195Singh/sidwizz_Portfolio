# 10 — Deployment, CI & Release (TanStack Start + Vite)

## 1. Vercel Production Deployment
This repository is connected to **Vercel** (`sidwizz-portfolio.vercel.app`):
- **Framework Preset:** Vite / Other (TanStack Start)
- **Build Command:** `npm run build` (`vite build`)
- **Output Directory:** `.output/public`
- **Install Command:** `npm install`
- **Automated Deployments:** Pushing commits to the `main` branch of `https://github.com/Aman195Singh/sidwizz_Portfolio.git` triggers automated zero-downtime builds and instant edge deployment.

---

## 2. Release & Pre-Push Checklist
Before pushing any change to `origin/main`:
1. **Typecheck & Lint:** Verify zero TypeScript compilation errors.
2. **Build Verification:** Run `npm run build` and ensure all client and SSR assets compile with 0 errors.
3. **Run Tests:** Execute `npm test` and verify that all test suites pass.
4. **Inspect Port 8080:** Verify dev server loads without console errors or broken assets.
5. **Commit & Push:**
   ```sh
   git add -A
   git commit -m "feat: description of change"
   git push origin main
   ```
