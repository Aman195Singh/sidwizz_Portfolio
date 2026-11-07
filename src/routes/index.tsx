import { createFileRoute } from "@tanstack/react-router";
import { CmsPageRenderer } from "@/lib/cms-client";
import { usePublishedCms, useSyncPublishedPageSeo } from "@/lib/cms-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SIDD.WHIZZ — Command the Stage | Event Host & Emcee" },
      { name: "description", content: "Siddharth “Sid” Maurya is a professional event host and emcee who turns events into unforgettable experiences." },
      { property: "og:title", content: "SIDD.WHIZZ — Command the Stage" },
      { property: "og:description", content: "Professional event host, emcee and moderator for summits, awards, conclaves and festivals." },
      { property: "og:url", content: "https://sidwizz-portfolio.vercel.app/" },
      { property: "og:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
      { property: "og:image:secure_url", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "SIDD.WHIZZ — Command the Stage" },
      { name: "twitter:description", content: "Professional event host, emcee and moderator for summits, awards, conclaves and festivals." },
      { name: "twitter:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
    ],
  }),
  component: Home,
});

function Home() {
  const { cms } = usePublishedCms();
  useSyncPublishedPageSeo("home");

  return (
    <CmsPageRenderer
      pageSlug="home"
      sections={cms.pages.home.sections}
      signatureText={cms.siteSettings.signatureText}
      contactFormConfig={cms.contactForm}
    />
  );
}
