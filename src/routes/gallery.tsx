import { createFileRoute } from "@tanstack/react-router";
import { CmsPageRenderer } from "@/lib/cms-client";
import { usePublishedCms, useSyncPublishedPageSeo } from "@/lib/cms-context";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Event Moments in Pictures | SIDD.WHIZZ" },
      { name: "description", content: "A glimpse of the energy, audiences and memorable stages hosted by Siddharth “Sid” Maurya." },
      { property: "og:title", content: "Gallery — SIDD.WHIZZ" },
      { property: "og:description", content: "Event moments in pictures." },
      { property: "og:url", content: "https://sidwizz-portfolio.vercel.app/gallery" },
      { property: "og:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
      { property: "og:image:secure_url", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
    ],
  }),
  component: Gallery,
});

function Gallery() {
  const { cms } = usePublishedCms();
  useSyncPublishedPageSeo("gallery");

  return (
    <CmsPageRenderer
      pageSlug="gallery"
      sections={cms.pages.gallery.sections}
      signatureText={cms.siteSettings.signatureText}
      contactFormConfig={cms.contactForm}
    />
  );
}
