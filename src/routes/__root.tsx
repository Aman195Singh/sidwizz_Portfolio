import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Header, Footer } from "@/components/site";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="display text-7xl text-primary">404</h1>
        <h2 className="mt-4 text-xl font-bold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link to="/" className="btn-red">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-red"
          >
            Try again
          </button>
          <a href="/" className="btn-outline">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SIDD.WHIZZ — Siddharth “Sid” Maurya, Event Host & Emcee" },
      { name: "description", content: "Siddharth “Sid” Maurya — professional event host, emcee and moderator for tech summits, corporate galas, conclaves, and live festivals." },
      { property: "og:site_name", content: "SIDD.WHIZZ" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://sidwizz-portfolio.vercel.app/" },
      { property: "og:title", content: "SIDD.WHIZZ — Event Host, Emcee & Moderator" },
      { property: "og:description", content: "High-energy, polished hosting for every kind of stage — summits, awards, conclaves and festivals." },
      { property: "og:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
      { property: "og:image:secure_url", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "SIDD.WHIZZ — Siddharth “Sid” Maurya, Event Host & Emcee" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "SIDD.WHIZZ — Event Host, Emcee & Moderator" },
      { name: "twitter:description", content: "High-energy, polished hosting for every kind of stage — summits, awards, conclaves and festivals." },
      { name: "twitter:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg?v=5" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png?v=5" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png?v=5" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png?v=5" },
      { rel: "shortcut icon", href: "/favicon.ico?v=5" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Great+Vibes&family=Montserrat:wght@600;700;800;900&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  const isPanel = pathname.startsWith("/admin") || pathname.startsWith("/organizer");

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {!isPanel && <Header />}
        <main key={pathname} className={isPanel ? "min-h-screen bg-background" : "animate-page"}>
          <Outlet />
        </main>
        {!isPanel && <Footer />}
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}
