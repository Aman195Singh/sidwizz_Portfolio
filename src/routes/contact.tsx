import { createFileRoute } from "@tanstack/react-router";
import { CmsPageRenderer } from "@/lib/cms-client";
import { usePublishedCms, useSyncPublishedPageSeo } from "@/lib/cms-context";

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): { format?: string | undefined } => ({
    format: typeof search["format"] === "string" ? search["format"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Contact & Book Siddharth “Sid” Maurya — SIDD.WHIZZ" },
      { name: "description", content: "Send an enquiry to book Sid as your event host, emcee or moderator. Typically replies within 24 hours." },
      { property: "og:title", content: "Let's Create Your Next Big Event — SIDD.WHIZZ" },
      { property: "og:description", content: "Get in touch to discuss your requirements and availability." },
      { property: "og:url", content: "https://sidwizz-portfolio.vercel.app/contact" },
      { property: "og:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
      { property: "og:image:secure_url", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { format: formatParam } = Route.useSearch();
  const { cms } = usePublishedCms();
  useSyncPublishedPageSeo("contact");

  return (
    <CmsPageRenderer
      pageSlug="contact"
      sections={cms.pages.contact.sections}
      signatureText={cms.siteSettings.signatureText}
      contactFormConfig={cms.contactForm}
      initialContactFormat={formatParam}
    />
  );
}
