# 09 — Environment and Local Setup (TanStack Start + Vite)

## 1. Prerequisites
- **Node.js:** `v22.16.x` or `v20.x` LTS
- **Package Manager:** `npm` (v10+)
- **Operating System:** Windows, macOS, or Linux
- **Local Dev Port:** `http://localhost:8080/`

---

## 2. Installation & Quick Start

```sh
# Clone or open repository
cd SiddWhizz_Portfolio

# Install dependencies
npm install

# Start development server
npm run dev
```

On Windows, you can also double-click **`start_website.bat`** to launch the dev server and open `http://localhost:8080/` in your default browser.

---

## 3. Project Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts Vite development server with HMR on `http://localhost:8080/` |
| `npm run build` | Compiles client, SSR, and Nitro production bundles |
| `npm run preview` | Runs local production preview of built site |
| `npm test` | Runs Vitest test suite (`src/test/app-routing.test.tsx`) |
| `npm run lint` | Runs ESLint check across all project files |
| `npm run format` | Runs Prettier code formatting |

---

## 4. Key Configuration Files
- **`vite.config.ts`:** Vite bundler and TanStack Start configuration.
- **`src/styles.css`:** Tailwind CSS v4 import and OKLCH design tokens.
- **`src/routes/__root.tsx`:** App shell, Google Fonts, meta tags, and favicon/OG declarations.
- **`src/routeTree.gen.ts`:** Auto-generated route tree (do not edit manually).
