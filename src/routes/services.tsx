import { createFileRoute } from "@tanstack/react-router";
import { CmsPageRenderer } from "@/lib/cms-client";
import { usePublishedCms, useSyncPublishedPageSeo } from "@/lib/cms-context";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Hosting & Moderation Services — SIDD.WHIZZ" },
      { name: "description", content: "Event hosting, panel moderation, awards & gala hosting and special live events by Siddharth “Sid” Maurya." },
      { property: "og:title", content: "Professional Hosting & Moderation Services — SIDD.WHIZZ" },
      { property: "og:description", content: "From corporate summits to grand celebrations — energy, clarity and audience connection." },
      { property: "og:url", content: "https://sidwizz-portfolio.vercel.app/services" },
      { property: "og:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
      { property: "og:image:secure_url", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
    ],
  }),
  component: Services,
});

function Services() {
  const { cms } = usePublishedCms();
  useSyncPublishedPageSeo("services");

  return (
    <CmsPageRenderer
      pageSlug="services"
      sections={cms.pages.services.sections}
      signatureText={cms.siteSettings.signatureText}
      contactFormConfig={cms.contactForm}
    />
  );
}
