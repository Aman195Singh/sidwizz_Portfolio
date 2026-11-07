import { z } from "zod";
import { type PermissionKey } from "@/lib/rbac-schema";

/**
 * SIDD.WHIZZ — Enterprise Website CMS, Controlled Design Token & Form Builder Schema
 *
 * Security & Architecture Guarantees:
 * 1. Zero unrestricted raw CSS / raw HTML script injection — all visual customization flows
 *    through curated typography whitelists, WCAG-checked palette tokens, and component presets.
 * 2. Strict Draft vs Published snapshot isolation — public visitors never see unreviewed drafts.
 * 3. Separation of Duties — `cms.edit` saves drafts & submits for review; `cms.publish` publishes & rolls back.
 * 4. Media Reference Safeguard — scans all draft, published, and SEO image URLs before allowing deletion.
 */

export const CMS_PAGE_SLUGS = [
  "home",
  "about",
  "services",
  "portfolio",
  "gallery",
  "contact",
] as const;

export type CmsPageSlug = (typeof CMS_PAGE_SLUGS)[number];

export type CmsWorkflowStatus = "draft" | "in_review" | "scheduled" | "published";

/* ========================================================================== */
/* 1. CONTROLLED TYPOGRAPHY & DESIGN TOKEN SYSTEM                             */
/* ========================================================================== */

export const CURATED_HEADING_FONTS = [
  "Montserrat",
  "Oswald",
  "Syne",
  "Playfair Display",
  "Plus Jakarta Sans",
  "Space Grotesk",
] as const;

export const CURATED_BODY_FONTS = [
  "DM Sans",
  "Inter",
  "Plus Jakarta Sans",
  "Source Sans 3",
  "Work Sans",
] as const;

export const CURATED_SIGNATURE_FONTS = [
  "Great Vibes",
  "Playfair Display",
  "Montserrat",
] as const;

export type CuratedHeadingFont = (typeof CURATED_HEADING_FONTS)[number];
export type CuratedBodyFont = (typeof CURATED_BODY_FONTS)[number];
export type CuratedSignatureFont = (typeof CURATED_SIGNATURE_FONTS)[number];

export type CmsButtonPreset = "pill" | "rounded" | "sharp";
export type CmsCardPreset = "elevated" | "bordered" | "glass";
export type CmsSectionDensity = "compact" | "comfortable" | "spacious";

export interface CmsThemeTokens {
  presetId: string;
  headingFont: CuratedHeadingFont;
  bodyFont: CuratedBodyFont;
  signatureFont: CuratedSignatureFont;
  /** Brand primary accent (Hex #RRGGBB for deterministic contrast math + CSS custom prop injection) */
  primaryHex: string;
  /** Deeper primary shade for gradients & hover states */
  primaryDeepHex: string;
  /** Primary button foreground text (#FFFFFF or #111111) */
  primaryForegroundHex: string;
  /** Stage dark surface color (footer, stats bar, dark cards) */
  inkHex: string;
  /** Light page canvas color */
  backgroundHex: string;
  /** Main body text color */
  foregroundHex: string;
  /** Soft blush/accent tint surface */
  accentSurfaceHex: string;
  /** Gold/crimson star rating color */
  starHex: string;
  buttonPreset: CmsButtonPreset;
  cardPreset: CmsCardPreset;
  sectionDensity: CmsSectionDensity;
}

export interface CmsThemePreset {
  id: string;
  name: string;
  description: string;
  tokens: CmsThemeTokens;
}

export const CMS_THEME_PRESETS: CmsThemePreset[] = [
  {
    id: "concert-crimson",
    name: "Concert Crimson (Default)",
    description: "Official SIDD.WHIZZ concert crimson, deep stage ink, and high-contrast arena white.",
    tokens: {
      presetId: "concert-crimson",
      headingFont: "Montserrat",
      bodyFont: "DM Sans",
      signatureFont: "Great Vibes",
      primaryHex: "#D91E36",
      primaryDeepHex: "#9E1224",
      primaryForegroundHex: "#FFFFFF",
      inkHex: "#171416",
      backgroundHex: "#FDFDFD",
      foregroundHex: "#1E1B1C",
      accentSurfaceHex: "#FDF2F4",
      starHex: "#D91E36",
      buttonPreset: "rounded",
      cardPreset: "elevated",
      sectionDensity: "comfortable",
    },
  },
  {
    id: "royal-gold-gala",
    name: "Royal Ruby & Gala Gold",
    description: "Warm burgundy velvet accent paired with executive gold star highlights for black-tie galas.",
    tokens: {
      presetId: "royal-gold-gala",
      headingFont: "Playfair Display",
      bodyFont: "Plus Jakarta Sans",
      signatureFont: "Great Vibes",
      primaryHex: "#B5173A",
      primaryDeepHex: "#7F0E27",
      primaryForegroundHex: "#FFFFFF",
      inkHex: "#15131B",
      backgroundHex: "#FFFEFC",
      foregroundHex: "#1D1922",
      accentSurfaceHex: "#FBF4F6",
      starHex: "#C58B16",
      buttonPreset: "pill",
      cardPreset: "elevated",
      sectionDensity: "spacious",
    },
  },
  {
    id: "electric-summit",
    name: "Electric Tech Summit",
    description: "Crisp cobalt-indigo keynote palette engineered for AI, SaaS, and leadership conclaves.",
    tokens: {
      presetId: "electric-summit",
      headingFont: "Space Grotesk",
      bodyFont: "Inter",
      signatureFont: "Great Vibes",
      primaryHex: "#2546F0",
      primaryDeepHex: "#1930B5",
      primaryForegroundHex: "#FFFFFF",
      inkHex: "#0F1528",
      backgroundHex: "#FCFDFF",
      foregroundHex: "#131A2E",
      accentSurfaceHex: "#F1F5FF",
      starHex: "#2546F0",
      buttonPreset: "rounded",
      cardPreset: "bordered",
      sectionDensity: "comfortable",
    },
  },
  {
    id: "emerald-conclave",
    name: "Emerald Global Forum",
    description: "Editorial forest emerald and slate stone palette suited for policy forums and CXO roundtables.",
    tokens: {
      presetId: "emerald-conclave",
      headingFont: "Syne",
      bodyFont: "Source Sans 3",
      signatureFont: "Playfair Display",
      primaryHex: "#0C7C59",
      primaryDeepHex: "#07563E",
      primaryForegroundHex: "#FFFFFF",
      inkHex: "#101E1A",
      backgroundHex: "#FCFDFC",
      foregroundHex: "#15231F",
      accentSurfaceHex: "#EFFAF5",
      starHex: "#0C7C59",
      buttonPreset: "sharp",
      cardPreset: "bordered",
      sectionDensity: "comfortable",
    },
  },
];

export const CmsThemeTokensSchema = z.object({
  presetId: z.string().min(1).max(64),
  headingFont: z.enum(CURATED_HEADING_FONTS),
  bodyFont: z.enum(CURATED_BODY_FONTS),
  signatureFont: z.enum(CURATED_SIGNATURE_FONTS),
  primaryHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a 6-digit hex color (#RRGGBB)"),
  primaryDeepHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  primaryForegroundHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  inkHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  backgroundHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  foregroundHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  accentSurfaceHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  starHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  buttonPreset: z.enum(["pill", "rounded", "sharp"]),
  cardPreset: z.enum(["elevated", "bordered", "glass"]),
  sectionDensity: z.enum(["compact", "comfortable", "spacious"]),
});

/**
 * Computes WCAG 2.1 relative luminance and contrast ratio for two #RRGGBB colors.
 */
export function hexToRelativeLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return 0;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function computeWcagContrastRatio(hexA: string, hexB: string): number {
  const l1 = hexToRelativeLuminance(hexA);
  const l2 = hexToRelativeLuminance(hexB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

export interface CmsContrastReport {
  passesAA: boolean;
  bodyOnBackgroundRatio: number;
  buttonTextOnPrimaryRatio: number;
  primaryOnBackgroundRatio: number;
  inkTextOnInkRatio: number;
  warnings: string[];
}

export function evaluateThemeContrast(tokens: CmsThemeTokens): CmsContrastReport {
  const bodyOnBackgroundRatio = computeWcagContrastRatio(tokens.foregroundHex, tokens.backgroundHex);
  const buttonTextOnPrimaryRatio = computeWcagContrastRatio(tokens.primaryForegroundHex, tokens.primaryHex);
  const primaryOnBackgroundRatio = computeWcagContrastRatio(tokens.primaryHex, tokens.backgroundHex);
  const inkTextOnInkRatio = computeWcagContrastRatio("#FAFAFA", tokens.inkHex);

  const warnings: string[] = [];
  if (bodyOnBackgroundRatio < 4.5) {
    warnings.push(
      `Body text vs page background contrast is ${bodyOnBackgroundRatio}:1 (minimum 4.5:1 WCAG AA required).`
    );
  }
  if (buttonTextOnPrimaryRatio < 4.5) {
    warnings.push(
      `Button label vs primary accent contrast is ${buttonTextOnPrimaryRatio}:1 (minimum 4.5:1 WCAG AA required).`
    );
  }
  if (primaryOnBackgroundRatio < 3.0) {
    warnings.push(
      `Primary brand accent vs background contrast is ${primaryOnBackgroundRatio}:1 (minimum 3.0:1 UI component contrast required).`
    );
  }
  if (inkTextOnInkRatio < 4.5) {
    warnings.push(
      `Light text vs stage ink surface contrast is ${inkTextOnInkRatio}:1 (minimum 4.5:1 required).`
    );
  }

  return {
    passesAA: warnings.length === 0,
    bodyOnBackgroundRatio,
    buttonTextOnPrimaryRatio,
    primaryOnBackgroundRatio,
    inkTextOnInkRatio,
    warnings,
  };
}

export function buildCuratedGoogleFontsUrl(tokens: CmsThemeTokens): string {
  const families = new Set<string>();
  const mapWeights: Record<string, string> = {
    Montserrat: "Montserrat:wght@600;700;800;900",
    Oswald: "Oswald:wght@500;600;700",
    Syne: "Syne:wght@600;700;800",
    "Playfair Display": "Playfair+Display:ital,wght@0,600;0,700;0,800;1,600",
    "Plus Jakarta Sans": "Plus+Jakarta+Sans:wght@400;500;600;700;800",
    "Space Grotesk": "Space+Grotesk:wght@500;600;700",
    "DM Sans": "DM+Sans:wght@400;500;600;700",
    Inter: "Inter:wght@400;500;600;700",
    "Source Sans 3": "Source+Sans+3:wght@400;600;700",
    "Work Sans": "Work+Sans:wght@400;500;600;700",
    "Great Vibes": "Great+Vibes",
  };
  for (const fontName of [tokens.headingFont, tokens.bodyFont, tokens.signatureFont]) {
    const spec = mapWeights[fontName];
    if (spec) families.add(`family=${spec}`);
  }
  return `https://fonts.googleapis.com/css2?${Array.from(families).join("&")}&display=swap`;
}

export function themeTokensToCssVars(tokens: CmsThemeTokens): Record<string, string> {
  const radius =
    tokens.buttonPreset === "pill"
      ? "1.25rem"
      : tokens.buttonPreset === "sharp"
      ? "0.375rem"
      : "0.75rem";
  return {
    "--font-display": `"${tokens.headingFont}", system-ui, sans-serif`,
    "--font-sans": `"${tokens.bodyFont}", system-ui, sans-serif`,
    "--cms-signature-font": `"${tokens.signatureFont}", cursive`,
    "--primary": tokens.primaryHex,
    "--primary-deep": tokens.primaryDeepHex,
    "--primary-foreground": tokens.primaryForegroundHex,
    "--ring": tokens.primaryHex,
    "--ink": tokens.inkHex,
    "--background": tokens.backgroundHex,
    "--foreground": tokens.foregroundHex,
    "--card-foreground": tokens.foregroundHex,
    "--blush": tokens.accentSurfaceHex,
    "--accent": `color-mix(in oklab, ${tokens.primaryHex} 8%, ${tokens.backgroundHex})`,
    "--accent-foreground": tokens.primaryDeepHex,
    "--star": tokens.starHex,
    "--radius": radius,
    "--gradient-red": `linear-gradient(180deg, ${tokens.primaryHex}, ${tokens.primaryDeepHex})`,
    "--shadow-red": `0 14px 30px -12px color-mix(in oklab, ${tokens.primaryHex} 55%, transparent)`,
  };
}

/* ========================================================================== */
/* 2. GLOBAL SITE SETTINGS, NAVIGATION & SEO                                  */
/* ========================================================================== */

export interface CmsNavItem {
  id: string;
  label: string;
  to: "/" | "/about" | "/services" | "/portfolio" | "/gallery" | "/contact";
  visible: boolean;
  description: string;
}

export interface CmsNavigationConfig {
  primaryNav: CmsNavItem[];
  moreActiveNav: CmsNavItem[];
  footerLinks: CmsNavItem[];
  headerCtaLabel: string;
  headerCtaTo: "/contact" | "/portfolio" | "/services";
  announcementBannerText: string;
  announcementBannerEnabled: boolean;
}

export interface CmsGlobalSiteSettings {
  brandNamePrefix: string;
  brandNameAccent: string;
  hostFullName: string;
  hostRoleTagline: string;
  signatureText: string;
  footerCopyright: string;
  defaultOgImage: string;
}

export interface CmsPageSeo {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  robotsIndex: boolean;
}

/* ========================================================================== */
/* 3. STRUCTURED PAGE SECTION CATALOG                                         */
/* ========================================================================== */

export type CmsSectionSurface = "default" | "blush" | "muted" | "ink" | "accent";
export type CmsSectionSpacing = "compact" | "normal" | "spacious";

export interface CmsHeroSectionData {
  kind: "hero";
  eyebrow: string;
  lines: string[];
  redFrom: number;
  description: string;
  image: string;
  imagePosition: string;
  big: boolean;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
}

export interface CmsStatItem {
  id: string;
  iconKey: string;
  value: string;
  label: string;
}

export interface CmsStatsSectionData {
  kind: "stats";
  overlapHero: boolean;
  items: CmsStatItem[];
}

export interface CmsSplitBulletItem {
  id: string;
  iconKey: string;
  title: string;
  description: string;
}

export interface CmsSplitStorySectionData {
  kind: "split_story";
  layout: "text_left_cards_right" | "image_left_text_right";
  eyebrow: string;
  title: string;
  highlightText: string;
  body: string;
  image: string;
  imageAlt: string;
  showSignature: boolean;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  bullets: CmsSplitBulletItem[];
}

export interface CmsServiceCardItem {
  id: string;
  title: string;
  description: string;
  image: string;
  iconKey: string;
  ctaLabel: string;
  formatQuery: string;
}

export interface CmsServiceCardsSectionData {
  kind: "service_cards";
  eyebrow: string;
  title: string;
  highlightText: string;
  subtitle: string;
  columns: 2 | 3 | 4;
  cards: CmsServiceCardItem[];
}

export interface CmsFeatureGridItem {
  id: string;
  iconKey: string;
  title: string;
  description: string;
}

export interface CmsFeatureGridSectionData {
  kind: "feature_grid";
  variant: "pillars" | "cards" | "timeline" | "formats_strip" | "steps";
  centerHeader: boolean;
  eyebrow: string;
  title: string;
  highlightText: string;
  items: CmsFeatureGridItem[];
}

export interface CmsReelItem {
  id: string;
  title: string;
  duration: string;
  image: string;
}

export interface CmsShowcaseMediaItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  image: string;
  isVideo: boolean;
  span: string;
  audience: string;
  location: string;
  summary: string;
  clientQuote: string;
}

export interface CmsHighlightsGallerySectionData {
  kind: "highlights_gallery";
  displayMode: "home_highlights" | "portfolio_full" | "gallery_mosaic";
  eyebrow: string;
  title: string;
  subtitle: string;
  categories: string[];
  featuredVideoTitle: string;
  featuredVideoDuration: string;
  featuredVideoImage: string;
  reels: CmsReelItem[];
  items: CmsShowcaseMediaItem[];
  snapshots: { id: string; src: string; alt: string }[];
  ctaLabel: string;
  ctaHref: string;
}

export interface CmsPackageCardItem {
  id: string;
  iconKey: string;
  title: string;
  fee: string;
  description: string;
  ctaLabel: string;
  formatQuery: string;
  popular: boolean;
}

export interface CmsPackagesAddonsSectionData {
  kind: "packages_addons";
  addonsEyebrow: string;
  addonsTitle: string;
  addonsImage: string;
  addonsList: string[];
  packagesEyebrow: string;
  packagesTitle: string;
  packages: CmsPackageCardItem[];
}

export interface CmsLanguagesStrengthsSectionData {
  kind: "languages_strengths";
  languagesEyebrow: string;
  languagesTitle: string;
  languages: string[];
  strengthsEyebrow: string;
  strengths: string[];
}

export interface CmsFaqSectionData {
  kind: "faq";
  eyebrow: string;
  title: string;
  subtitle: string;
  items: { id: string; question: string; answer: string }[];
}

export interface CmsTestimonialsSectionData {
  kind: "testimonials";
  eyebrow: string;
  title: string;
  items: {
    id: string;
    quote: string;
    author: string;
    role: string;
    avatar: string;
    rating: number;
  }[];
}

export interface CmsBrandsSectionData {
  kind: "brands";
  eyebrow: string;
  title: string;
  brands: string[];
}

export interface CmsContactChannelItem {
  id: string;
  iconKey: string;
  label: string;
  value: string;
  href: string;
}

export interface CmsContactHubSectionData {
  kind: "contact_hub";
  formHeading: string;
  formSubheading: string;
  availabilityActiveLabel: string;
  availabilityPausedLabel: string;
  showLiveStageCalendarStrip: boolean;
  directHeading: string;
  directSubheading: string;
  channels: CmsContactChannelItem[];
  socialHeading: string;
  quickResponseTitle: string;
  quickResponseItems: { id: string; iconKey: string; text: string }[];
}

export interface CmsCtaBannerSectionData {
  kind: "cta_banner";
  variant: "host" | "crowd";
  title: string;
  highlightText: string;
  subtitle: string;
  primaryLabel: string;
  secondaryLabel: string;
  secondaryTo: "/contact" | "/portfolio";
  customBackgroundImage: string;
}

export type CmsSectionPayload =
  | CmsHeroSectionData
  | CmsStatsSectionData
  | CmsSplitStorySectionData
  | CmsServiceCardsSectionData
  | CmsFeatureGridSectionData
  | CmsHighlightsGallerySectionData
  | CmsPackagesAddonsSectionData
  | CmsLanguagesStrengthsSectionData
  | CmsFaqSectionData
  | CmsTestimonialsSectionData
  | CmsBrandsSectionData
  | CmsContactHubSectionData
  | CmsCtaBannerSectionData;

export interface CmsPageSection {
  id: string;
  label: string;
  visible: boolean;
  surface: CmsSectionSurface;
  spacing: CmsSectionSpacing;
  data: CmsSectionPayload;
}

export interface CmsPageDocument {
  slug: CmsPageSlug;
  title: string;
  routePath: "/" | "/about" | "/services" | "/portfolio" | "/gallery" | "/contact";
  status: CmsWorkflowStatus;
  scheduledPublishAt: string | null;
  currentVersion: number;
  draftSeo: CmsPageSeo;
  publishedSeo: CmsPageSeo;
  draftSections: CmsPageSection[];
  publishedSections: CmsPageSection[];
  updatedBy: string;
  publishedBy: string;
  publishedAt: string;
  updatedAt: string;
}

export interface CmsPageRevision {
  id: string;
  pageSlug: CmsPageSlug;
  versionNumber: number;
  label: string;
  workflowStatus: CmsWorkflowStatus;
  sectionsSnapshot: CmsPageSection[];
  seoSnapshot: CmsPageSeo;
  createdByEmail: string;
  createdAt: string;
}

/* ========================================================================== */
/* 4. DYNAMIC CONTACT FORM BUILDER & CRM SUBMISSIONS                          */
/* ========================================================================== */

export const CMS_FORM_FIELD_TYPES = [
  "text",
  "email",
  "phone",
  "date",
  "select",
  "radio",
  "yes_no",
  "checkbox",
  "textarea",
  "number",
  "section_header",
] as const;

export type CmsFormFieldType = (typeof CMS_FORM_FIELD_TYPES)[number];

export type CmsCrmFieldMapping =
  | "clientName"
  | "phone"
  | "email"
  | "date"
  | "organization"
  | "city"
  | "format"
  | "packageTier"
  | "crowdSize"
  | "budget"
  | "brief"
  | "custom";

export interface CmsFormConditionalRule {
  dependsOnFieldName: string;
  equalsValue: string;
}

export interface CmsFormField {
  id: string;
  name: string;
  label: string;
  type: CmsFormFieldType;
  placeholder: string;
  tooltip: string;
  required: boolean;
  visible: boolean;
  width: "half" | "full";
  maxLength: number;
  options: string[];
  crmMapping: CmsCrmFieldMapping;
  conditionalRule: CmsFormConditionalRule | null;
}

export interface CmsContactFormConfig {
  id: string;
  name: string;
  submitButtonLabel: string;
  submittingButtonLabel: string;
  successToastMessage: string;
  honeypotEnabled: boolean;
  rateLimitPerTenMinutes: number;
  fields: CmsFormField[];
}

export type CrmLeadStage = "New" | "Contacted" | "Qualified" | "Converted" | "Closed";

export interface CmsFormSubmissionRecord {
  id: string;
  formId: string;
  formVersion: number;
  mappedEnquiryId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  organization: string;
  eventDate: string;
  eventCity: string;
  eventFormat: string;
  packageTier: string;
  values: Record<string, string>;
  isRead: boolean;
  crmStage: CrmLeadStage;
  assignedStaffEmail: string;
  internalNotes: string[];
  submittedAt: string;
  updatedAt: string;
}

/**
 * Evaluates whether a field is currently visible given conditional rules and form values.
 */
export function isFormFieldActive(
  field: CmsFormField,
  values: Record<string, string>
): boolean {
  if (!field.visible) return false;
  if (!field.conditionalRule) return true;
  const depVal = (values[field.conditionalRule.dependsOnFieldName] ?? "").trim();
  return depVal.toLowerCase() === field.conditionalRule.equalsValue.trim().toLowerCase();
}

export interface DynamicFormValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  sanitizedValues: Record<string, string>;
}

/**
 * Shared client + server validator for dynamic Contact Form submissions.
 */
export function validateDynamicFormSubmission(
  config: CmsContactFormConfig,
  rawValues: Record<string, string>
): DynamicFormValidationResult {
  const errors: Record<string, string> = {};
  const sanitizedValues: Record<string, string> = {};

  // Anti-spam honeypot check
  if (config.honeypotEnabled && (rawValues["_company_website_hp"] ?? "").trim().length > 0) {
    return {
      valid: false,
      errors: { _form: "Automated spam submission rejected." },
      sanitizedValues: {},
    };
  }

  for (const field of config.fields) {
    if (field.type === "section_header") continue;
    if (!isFormFieldActive(field, rawValues)) continue;

    const raw = (rawValues[field.name] ?? "").trim();
    const capped = field.maxLength > 0 ? raw.slice(0, field.maxLength) : raw;
    sanitizedValues[field.name] = capped;

    if (field.required && capped.length === 0) {
      errors[field.name] = `${field.label.replace(/\s*\*$/, "")} is required.`;
      continue;
    }

    if (capped.length === 0) continue;

    if (field.type === "email" && !/^\S+@\S+\.\S+$/.test(capped)) {
      errors[field.name] = "Please enter a valid email address.";
    } else if (field.type === "phone" && !/^[+\d][\d\s()-]{7,20}$/.test(capped)) {
      errors[field.name] = "Please enter a valid phone number.";
    } else if (field.type === "number" && Number.isNaN(Number(capped))) {
      errors[field.name] = "Please enter a valid number.";
    } else if (
      (field.type === "select" || field.type === "radio") &&
      field.options.length > 0 &&
      !field.options.includes(capped)
    ) {
      errors[field.name] = `Please select a valid option for ${field.label}.`;
    } else if (field.type === "textarea" && field.required && capped.length < 10) {
      errors[field.name] = "Please provide at least 10 characters.";
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitizedValues,
  };
}

/* ========================================================================== */
/* 5. MEDIA ASSET LIBRARY & LIVE REFERENCE DELETION SAFEGUARD                 */
/* ========================================================================== */

export interface CmsMediaAsset {
  id: string;
  title: string;
  mediaType: "image" | "video" | "document" | "audio";
  storageProvider: "vercel_blob" | "bundled_asset" | "inline_fallback";
  publicUrl: string;
  altText: string;
  category: string;
  mimeType: string;
  byteSize: number;
  uploadedByEmail: string;
  createdAt: string;
}

export interface CmsMediaUsageRef {
  assetUrl: string;
  pageSlug: string;
  sectionId: string;
  sectionLabel: string;
  environment: "published" | "draft" | "seo";
}

function collectUrlsFromSection(section: CmsPageSection): string[] {
  const urls: string[] = [];
  const d = section.data;
  switch (d.kind) {
    case "hero":
      if (d.image) urls.push(d.image);
      break;
    case "split_story":
      if (d.image) urls.push(d.image);
      break;
    case "service_cards":
      for (const c of d.cards) {
        if (c.image) urls.push(c.image);
      }
      break;
    case "highlights_gallery":
      if (d.featuredVideoImage) urls.push(d.featuredVideoImage);
      for (const r of d.reels) if (r.image) urls.push(r.image);
      for (const it of d.items) if (it.image) urls.push(it.image);
      for (const s of d.snapshots) if (s.src) urls.push(s.src);
      break;
    case "packages_addons":
      if (d.addonsImage) urls.push(d.addonsImage);
      break;
    case "testimonials":
      for (const t of d.items) if (t.avatar) urls.push(t.avatar);
      break;
    case "cta_banner":
      if (d.customBackgroundImage) urls.push(d.customBackgroundImage);
      break;
    default:
      break;
  }
  return urls;
}

/**
 * Scans all 6 CMS pages (both published and draft sections + SEO OG banners)
 * to produce an exact live usage index so referenced media can never be deleted by mistake.
 */
export function computeCmsMediaUsages(
  pages: Record<CmsPageSlug, CmsPageDocument>,
  globalSettings?: CmsGlobalSiteSettings
): CmsMediaUsageRef[] {
  const refs: CmsMediaUsageRef[] = [];

  for (const slug of CMS_PAGE_SLUGS) {
    const page = pages[slug];
    if (!page) continue;

    for (const sec of page.publishedSections) {
      for (const url of collectUrlsFromSection(sec)) {
        refs.push({
          assetUrl: url,
          pageSlug: slug,
          sectionId: sec.id,
          sectionLabel: sec.label,
          environment: "published",
        });
      }
    }

    for (const sec of page.draftSections) {
      for (const url of collectUrlsFromSection(sec)) {
        refs.push({
          assetUrl: url,
          pageSlug: slug,
          sectionId: sec.id,
          sectionLabel: sec.label,
          environment: "draft",
        });
      }
    }

    if (page.publishedSeo.ogImage) {
      refs.push({
        assetUrl: page.publishedSeo.ogImage,
        pageSlug: slug,
        sectionId: "seo_published",
        sectionLabel: "Published OpenGraph Image",
        environment: "seo",
      });
    }
    if (page.draftSeo.ogImage && page.draftSeo.ogImage !== page.publishedSeo.ogImage) {
      refs.push({
        assetUrl: page.draftSeo.ogImage,
        pageSlug: slug,
        sectionId: "seo_draft",
        sectionLabel: "Draft OpenGraph Image",
        environment: "seo",
      });
    }
  }

  if (globalSettings?.defaultOgImage) {
    refs.push({
      assetUrl: globalSettings.defaultOgImage,
      pageSlug: "global",
      sectionId: "default_og",
      sectionLabel: "Global Default OG Banner",
      environment: "seo",
    });
  }

  return refs;
}

export function checkMediaDeleteSafety(
  assetUrl: string,
  usages: CmsMediaUsageRef[]
): { allowed: boolean; blockingUsages: CmsMediaUsageRef[] } {
  const blockingUsages = usages.filter((u) => u.assetUrl === assetUrl);
  return {
    allowed: blockingUsages.length === 0,
    blockingUsages,
  };
}

/* ========================================================================== */
/* 6. PURE WORKFLOW & SEPARATION-OF-DUTIES ENGINE (Draft -> Publish -> Rollback) */
/* ========================================================================== */

export function canActorPerformCmsAction(
  effectivePermissions: readonly PermissionKey[],
  effectiveFeatures: readonly string[],
  action: "view" | "edit" | "publish" | "forms" | "media_upload" | "media_delete"
): boolean {
  if (!effectiveFeatures.includes("feature.cms")) return false;
  switch (action) {
    case "view":
      return effectivePermissions.includes("cms.view");
    case "edit":
      return effectivePermissions.includes("cms.edit");
    case "publish":
      return effectivePermissions.includes("cms.publish");
    case "forms":
      return effectivePermissions.includes("cms.forms.manage");
    case "media_upload":
      return effectivePermissions.includes("cms.manage_media");
    case "media_delete":
      return effectivePermissions.includes("media.delete");
  }
}

export function applyDraftUpdateToPage(
  page: CmsPageDocument,
  draftSections: CmsPageSection[],
  draftSeo: CmsPageSeo,
  actorEmail: string,
  nowIso: string = new Date().toISOString()
): CmsPageDocument {
  // Public publishedSections & publishedSeo remain 100% untouched!
  return {
    ...page,
    status: "draft",
    draftSections: structuredClone(draftSections),
    draftSeo: structuredClone(draftSeo),
    updatedBy: actorEmail,
    updatedAt: nowIso,
  };
}

export function promotePageDraftToPublished(
  page: CmsPageDocument,
  actorEmail: string,
  revisionLabel?: string,
  scheduledPublishAt?: string | null,
  nowIso: string = new Date().toISOString()
): { updatedPage: CmsPageDocument; newRevision: CmsPageRevision } {
  const nextVersion = page.currentVersion + 1;
  const isScheduled = Boolean(scheduledPublishAt && new Date(scheduledPublishAt).getTime() > Date.now());

  const updatedPage: CmsPageDocument = {
    ...page,
    status: isScheduled ? "scheduled" : "published",
    scheduledPublishAt: isScheduled ? (scheduledPublishAt ?? null) : null,
    currentVersion: nextVersion,
    // Only overwrite live publishedSections immediately when not future-scheduled
    publishedSections: isScheduled
      ? structuredClone(page.publishedSections)
      : structuredClone(page.draftSections),
    publishedSeo: isScheduled
      ? structuredClone(page.publishedSeo)
      : structuredClone(page.draftSeo),
    updatedBy: actorEmail,
    publishedBy: isScheduled ? page.publishedBy : actorEmail,
    publishedAt: isScheduled ? page.publishedAt : nowIso,
    updatedAt: nowIso,
  };

  const newRevision: CmsPageRevision = {
    id: `rev_${page.slug}_v${nextVersion}_${Date.now().toString(36)}`,
    pageSlug: page.slug,
    versionNumber: nextVersion,
    label:
      revisionLabel?.trim() ||
      (isScheduled ? `Scheduled release v${nextVersion}` : `Published v${nextVersion}`),
    workflowStatus: updatedPage.status,
    sectionsSnapshot: structuredClone(page.draftSections),
    seoSnapshot: structuredClone(page.draftSeo),
    createdByEmail: actorEmail,
    createdAt: nowIso,
  };

  return { updatedPage, newRevision };
}

export function rollbackPageToRevision(
  page: CmsPageDocument,
  targetRevision: CmsPageRevision,
  actorEmail: string,
  nowIso: string = new Date().toISOString()
): { updatedPage: CmsPageDocument; rollbackRevision: CmsPageRevision } {
  if (targetRevision.pageSlug !== page.slug) {
    throw new Error(`Revision ${targetRevision.id} does not belong to page "${page.slug}".`);
  }

  const nextVersion = page.currentVersion + 1;
  const restoredSections = structuredClone(targetRevision.sectionsSnapshot);
  const restoredSeo = structuredClone(targetRevision.seoSnapshot);

  const updatedPage: CmsPageDocument = {
    ...page,
    status: "published",
    scheduledPublishAt: null,
    currentVersion: nextVersion,
    draftSections: restoredSections,
    publishedSections: structuredClone(restoredSections),
    draftSeo: restoredSeo,
    publishedSeo: structuredClone(restoredSeo),
    updatedBy: actorEmail,
    publishedBy: actorEmail,
    publishedAt: nowIso,
    updatedAt: nowIso,
  };

  const rollbackRevision: CmsPageRevision = {
    id: `rev_${page.slug}_v${nextVersion}_rb_${Date.now().toString(36)}`,
    pageSlug: page.slug,
    versionNumber: nextVersion,
    label: `Rolled back to v${targetRevision.versionNumber} (${targetRevision.label})`,
    workflowStatus: "published",
    sectionsSnapshot: structuredClone(restoredSections),
    seoSnapshot: structuredClone(restoredSeo),
    createdByEmail: actorEmail,
    createdAt: nowIso,
  };

  return { updatedPage, rollbackRevision };
}

/* ========================================================================== */
/* 7. PUBLIC SNAPSHOT DTO vs ADMIN WORKSPACE DTO                              */
/* ========================================================================== */

export interface PublicPublishedPageSnapshot {
  slug: CmsPageSlug;
  title: string;
  routePath: string;
  version: number;
  seo: CmsPageSeo;
  sections: CmsPageSection[];
  publishedAt: string;
}

export interface PublicSiteCmsPayload {
  siteSettings: CmsGlobalSiteSettings;
  themeTokens: CmsThemeTokens;
  navigation: CmsNavigationConfig;
  pages: Record<CmsPageSlug, PublicPublishedPageSnapshot>;
  contactForm: CmsContactFormConfig;
  contactFormVersion: number;
}

export interface AdminCmsWorkspacePayload {
  draftSiteSettings: CmsGlobalSiteSettings;
  publishedSiteSettings: CmsGlobalSiteSettings;
  draftThemeTokens: CmsThemeTokens;
  publishedThemeTokens: CmsThemeTokens;
  draftNavigation: CmsNavigationConfig;
  publishedNavigation: CmsNavigationConfig;
  pages: Record<CmsPageSlug, CmsPageDocument>;
  revisions: CmsPageRevision[];
  mediaAssets: CmsMediaAsset[];
  mediaUsages: CmsMediaUsageRef[];
  draftContactForm: CmsContactFormConfig;
  publishedContactForm: CmsContactFormConfig;
  contactFormVersion: number;
  submissions: CmsFormSubmissionRecord[];
}

export function extractPublicSitePayload(
  state: Pick<
    AdminCmsWorkspacePayload,
    | "publishedSiteSettings"
    | "publishedThemeTokens"
    | "publishedNavigation"
    | "pages"
    | "publishedContactForm"
    | "contactFormVersion"
  >
): PublicSiteCmsPayload {
  const pages = {} as Record<CmsPageSlug, PublicPublishedPageSnapshot>;
  for (const slug of CMS_PAGE_SLUGS) {
    const doc = state.pages[slug];
    pages[slug] = {
      slug,
      title: doc.title,
      routePath: doc.routePath,
      version: doc.currentVersion,
      seo: structuredClone(doc.publishedSeo),
      sections: structuredClone(doc.publishedSections),
      publishedAt: doc.publishedAt,
    };
  }
  return {
    siteSettings: structuredClone(state.publishedSiteSettings),
    themeTokens: structuredClone(state.publishedThemeTokens),
    navigation: structuredClone(state.publishedNavigation),
    pages,
    contactForm: structuredClone(state.publishedContactForm),
    contactFormVersion: state.contactFormVersion,
  };
}

