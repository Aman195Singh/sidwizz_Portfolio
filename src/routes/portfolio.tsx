import { createFileRoute } from "@tanstack/react-router";
import { CmsPageRenderer } from "@/lib/cms-client";
import { usePublishedCms, useSyncPublishedPageSeo } from "@/lib/cms-context";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Stage Moments by SIDD.WHIZZ" },
      { name: "description", content: "Showreel, event highlights and snapshots from summits, award nights, conclaves, festivals and weddings hosted by Sid." },
      { property: "og:title", content: "Portfolio — SIDD.WHIZZ" },
      { property: "og:description", content: "Stage moments, real experiences, lasting impact." },
      { property: "og:url", content: "https://sidwizz-portfolio.vercel.app/portfolio" },
      { property: "og:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
      { property: "og:image:secure_url", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
    ],
  }),
  component: Portfolio,
});

function Portfolio() {
  const { cms } = usePublishedCms();
  useSyncPublishedPageSeo("portfolio");

  return (
    <CmsPageRenderer
      pageSlug="portfolio"
      sections={cms.pages.portfolio.sections}
      signatureText={cms.siteSettings.signatureText}
      contactFormConfig={cms.contactForm}
    />
  );
}
