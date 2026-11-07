// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// P0 Security Guard: Fail production builds if sensitive credentials use the public VITE_ prefix.
const FORBIDDEN_PUBLIC_ENV_KEYS = [
  "VITE_DATABASE_URL",
  "VITE_DIRECT_URL",
  "VITE_SESSION_SECRET",
  "VITE_BETTER_AUTH_SECRET",
  "VITE_BLOB_READ_WRITE_TOKEN",
] as const;

for (const forbiddenKey of FORBIDDEN_PUBLIC_ENV_KEYS) {
  if (process.env[forbiddenKey]?.trim()) {
    throw new Error(
      `[SECURITY BLOCK] ${forbiddenKey} must NOT be prefixed with VITE_ because Vite bundles VITE_* variables into public client JavaScript. Remove ${forbiddenKey} and use the server-only variable name instead.`
    );
  }
}

export default defineConfig({
  vite: {
    server: {
      watch: {
        ignored: ["**/.output/**", "**/.wrangler/**", "**/dist/**"],
      },
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
