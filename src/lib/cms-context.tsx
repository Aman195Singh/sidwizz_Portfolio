import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import {
  buildCuratedGoogleFontsUrl,
  extractPublicSitePayload,
  themeTokensToCssVars,
  type CmsPageSlug,
  type CmsThemeTokens,
  type PublicSiteCmsPayload,
} from "@/lib/cms-schema";
import { buildDefaultCmsWorkspaceSeed } from "@/cms/seeds/default-site-seed";
import { getPublishedSiteCmsServerFn } from "@/lib/cms-server";

export interface CmsSiteContextValue {
  cms: PublicSiteCmsPayload;
  refreshPublishedCms: () => Promise<void>;
}

const initialSeedPayload = extractPublicSitePayload(buildDefaultCmsWorkspaceSeed());

const CmsSiteContext = createContext<CmsSiteContextValue>({
  cms: initialSeedPayload,
  refreshPublishedCms: async () => {},
});

export function CmsSiteProvider({ children }: { children: React.ReactNode }) {
  const [cms, setCms] = useState<PublicSiteCmsPayload>(() => initialSeedPayload);

  const refreshPublishedCms = useCallback(async () => {
    try {
      const latest = await getPublishedSiteCmsServerFn();
      setCms(latest);
    } catch {
      // Keep baseline seed on offline/SSR edge fallback
    }
  }, []);

  useEffect(() => {
    void refreshPublishedCms();
    const onCmsPublished = () => {
      void refreshPublishedCms();
    };
    window.addEventListener("siddwhizz_cms_published", onCmsPublished);
    return () => window.removeEventListener("siddwhizz_cms_published", onCmsPublished);
  }, [refreshPublishedCms]);

  // Inject curated Google Fonts stylesheet when theme typography changes
  useEffect(() => {
    if (typeof document === "undefined") return;
    const href = buildCuratedGoogleFontsUrl(cms.themeTokens);
    const id = "siddwhizz-cms-curated-fonts";
    let linkEl = document.getElementById(id) as HTMLLinkElement | null;
    if (!linkEl) {
      linkEl = document.createElement("link");
      linkEl.id = id;
      linkEl.rel = "stylesheet";
      document.head.appendChild(linkEl);
    }
    if (linkEl.href !== href) {
      linkEl.href = href;
    }
  }, [cms.themeTokens]);

  const value = useMemo(
    () => ({ cms, refreshPublishedCms }),
    [cms, refreshPublishedCms]
  );

  return <CmsSiteContext.Provider value={value}>{children}</CmsSiteContext.Provider>;
}

export function usePublishedCms(): CmsSiteContextValue {
  return useContext(CmsSiteContext);
}

export function useSyncPublishedPageSeo(pageSlug: CmsPageSlug): void {
  const { cms } = usePublishedCms();
  const seo = cms.pages[pageSlug].seo;

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (seo.metaTitle) {
      document.title = seo.metaTitle;
    }
    const setMeta = (selector: string, content: string) => {
      if (!content) return;
      const el = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (el) el.content = content;
    };
    setMeta('meta[name="description"]', seo.metaDescription);
    setMeta('meta[property="og:title"]', seo.ogTitle || seo.metaTitle);
    setMeta('meta[property="og:description"]', seo.ogDescription || seo.metaDescription);
    setMeta('meta[property="og:image"]', seo.ogImage);
  }, [seo]);
}

/**
 * Wraps public layout or the Admin CMS Preview Canvas with scoped CSS variables
 * derived from `CmsThemeTokens` + button/card/density data attributes.
 */
export function CmsThemedSurface({
  tokens,
  className = "",
  children,
}: {
  tokens: CmsThemeTokens;
  className?: string;
  children: React.ReactNode;
}) {
  const styleVars = useMemo(
    () => themeTokensToCssVars(tokens) as CSSProperties,
    [tokens]
  );

  return (
    <div
      className={`cms-themed-surface bg-background text-foreground ${className}`}
      data-cms-buttons={tokens.buttonPreset}
      data-cms-cards={tokens.cardPreset}
      data-cms-density={tokens.sectionDensity}
      style={styleVars}
    >
      {children}
    </div>
  );
}
