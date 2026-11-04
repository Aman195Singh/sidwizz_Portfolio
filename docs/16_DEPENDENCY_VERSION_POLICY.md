# 16 — Dependency Version Policy

## 1. Locked Production Stack

| Package | Version | Purpose |
|---|---|---|
| `@tanstack/react-start` | `1.168.60` | Fullstack SSR framework engine |
| `@tanstack/react-router` | `1.170.41` | Type-safe client router and route matcher |
| `react` & `react-dom` | `^19.2.0` | UI render engine |
| `@tailwindcss/vite` & `tailwindcss` | `^4.2.1` | Next-generation utility CSS engine |
| `vite` | `8.1.5` | Bundler, HMR engine and dev server |
| `typescript` | `^5.8.3` | Type checking and strict code safety |
| `vitest` | `^4.1.10` | Unit and integration test runner |
| `lucide-react` | `^0.575.0` | Vector icon system |
| `@radix-ui/react-*` | Latest stable | Accessible headless UI primitives |
| `zod` | `^3.25.76` | Schema validation |
| `sonner` | `^2.0.7` | Toast notification system |

---

## 2. Upgrade Guidelines
- Do NOT downgrade packages or mix legacy Next.js dependencies into this repository.
- Tailwind CSS v4 eliminates the legacy `tailwind.config.ts` file; do not reinstall `@tailwindcss/postcss` or Tailwind v3 plugins.
- Always run `npm run build` and `npm test` after adding or updating any npm package.
