// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// P0 Security & Deployment Guard:
// If sensitive credentials exist with the public `VITE_` prefix (e.g. from Vercel dashboard settings),
// safely migrate them to the un-prefixed server-only environment variable (e.g. DATABASE_URL)
// and DELETE the `VITE_` prefixed key from process.env so Vite NEVER bundles it into client-side JS.
const SENSITIVE_CREDENTIAL_MAPPINGS: Record<string, string> = {
  VITE_DATABASE_URL: "DATABASE_URL",
  VITE_DIRECT_URL: "DIRECT_URL",
  VITE_SESSION_SECRET: "SESSION_SECRET",
  VITE_BETTER_AUTH_SECRET: "BETTER_AUTH_SECRET",
  VITE_BLOB_READ_WRITE_TOKEN: "BLOB_READ_WRITE_TOKEN",
};

for (const [publicPrefixedKey, serverOnlyKey] of Object.entries(SENSITIVE_CREDENTIAL_MAPPINGS)) {
  const val = process.env[publicPrefixedKey]?.trim();
  if (val) {
    if (!process.env[serverOnlyKey]?.trim()) {
      process.env[serverOnlyKey] = val;
    }
    delete process.env[publicPrefixedKey];
    console.warn(
      `[SECURITY NOTICE] Auto-migrated ${publicPrefixedKey} to server-only ${serverOnlyKey} and sanitized it from client bundle.`
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
