import { createFileRoute } from "@tanstack/react-router";
import { CmsPageRenderer } from "@/lib/cms-client";
import { usePublishedCms, useSyncPublishedPageSeo } from "@/lib/cms-context";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Siddharth “Sid” Maurya — SIDD.WHIZZ" },
      { name: "description", content: "Meet Sid — an event host, emcee and moderator who turns ideas, people and moments into high-energy stage experiences." },
      { property: "og:title", content: "About SIDD.WHIZZ — A Voice That Moves Audiences" },
      { property: "og:description", content: "The journey, principles and strengths behind Siddharth “Sid” Maurya." },
      { property: "og:url", content: "https://sidwizz-portfolio.vercel.app/about" },
      { property: "og:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
      { property: "og:image:secure_url", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
    ],
  }),
  component: About,
});

function About() {
  const { cms } = usePublishedCms();
  useSyncPublishedPageSeo("about");

  return (
    <CmsPageRenderer
      pageSlug="about"
      sections={cms.pages.about.sections}
      signatureText={cms.siteSettings.signatureText}
      contactFormConfig={cms.contactForm}
    />
  );
}
