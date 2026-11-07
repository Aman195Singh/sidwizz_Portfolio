import { describe, expect, it } from "vitest";
import {
  CMS_PAGE_SLUGS,
  CMS_THEME_PRESETS,
  CmsThemeTokensSchema,
  applyDraftUpdateToPage,
  canActorPerformCmsAction,
  checkMediaDeleteSafety,
  computeCmsMediaUsages,
  evaluateThemeContrast,
  extractPublicSitePayload,
  isFormFieldActive,
  promotePageDraftToPublished,
  rollbackPageToRevision,
  themeTokensToCssVars,
  validateDynamicFormSubmission,
  type CmsContactFormConfig,
} from "@/lib/cms-schema";
import {
  DEFAULT_SYSTEM_ROLES,
  computeEffectiveFeatures,
  computeEffectivePermissions,
} from "@/lib/rbac-schema";
import { buildDefaultCmsWorkspaceSeed } from "@/cms/seeds/default-site-seed";

describe("SIDD.WHIZZ Website CMS & Contact Form Builder", () => {
  it("seeds all 6 public pages with valid sections, SEO, theme tokens, and 9-field contact form", () => {
    const seed = buildDefaultCmsWorkspaceSeed();

    for (const slug of CMS_PAGE_SLUGS) {
      const page = seed.pages[slug];
      expect(page.slug).toBe(slug);
      expect(page.status).toBe("published");
      expect(page.publishedSections.length).toBeGreaterThan(0);
      expect(page.draftSections.length).toBe(page.publishedSections.length);
      expect(page.publishedSeo.metaTitle.length).toBeGreaterThan(5);
    }

    expect(seed.publishedContactForm.fields.length).toBe(9);
    expect(seed.mediaUsages.length).toBeGreaterThan(5);
  });

  it("strictly isolates Draft edits from Published public payloads until explicitly promoted", () => {
    const seed = buildDefaultCmsWorkspaceSeed();
    const home = seed.pages.home;

    const modifiedDraftSections = structuredClone(home.draftSections);
    const firstHero = modifiedDraftSections[0];
    expect(firstHero?.data.kind).toBe("hero");
    if (firstHero && firstHero.data.kind === "hero") {
      firstHero.data.eyebrow = "UNPUBLISHED DRAFT EYEBROW";
    }

    const updatedHome = applyDraftUpdateToPage(
      home,
      modifiedDraftSections,
      { ...home.draftSeo, metaTitle: "DRAFT ONLY TITLE" },
      "editor@siddwhizz.com",
      "2026-11-07T10:00:00.000Z"
    );

    expect(updatedHome.status).toBe("draft");
    expect(updatedHome.draftSeo.metaTitle).toBe("DRAFT ONLY TITLE");
    expect(updatedHome.publishedSeo.metaTitle).not.toBe("DRAFT ONLY TITLE");

    seed.pages.home = updatedHome;
    const publicPayload = extractPublicSitePayload(seed);

    const liveHero = publicPayload.pages.home.sections[0];
    expect(liveHero?.data.kind).toBe("hero");
    if (liveHero && liveHero.data.kind === "hero") {
      expect(liveHero.data.eyebrow).not.toBe("UNPUBLISHED DRAFT EYEBROW");
    }
    expect(publicPayload.pages.home.seo.metaTitle).not.toBe("DRAFT ONLY TITLE");
  });

  it("enforces RBAC Separation of Duties across cms_editor, cms_publisher, super_admin, organizer, and member", () => {
    const findRole = (key: string) => {
      const r = DEFAULT_SYSTEM_ROLES.find((item) => item.key === key);
      if (!r) throw new Error(`Missing role ${key}`);
      return r;
    };

    const editorRole = findRole("cms_editor");
    const editorPerms = computeEffectivePermissions({
      assignedRoles: [editorRole],
      overrides: [],
    });
    const editorFeats = computeEffectiveFeatures({
      assignedRoles: [editorRole],
      organizationIds: [],
      userId: "usr_editor_1",
      rules: [],
    });

    expect(canActorPerformCmsAction(editorPerms, editorFeats, "view")).toBe(true);
    expect(canActorPerformCmsAction(editorPerms, editorFeats, "edit")).toBe(true);
    expect(canActorPerformCmsAction(editorPerms, editorFeats, "media_upload")).toBe(true);
    // Editor CANNOT modify form schema, publish live, or permanently delete media!
    expect(canActorPerformCmsAction(editorPerms, editorFeats, "forms")).toBe(false);
    expect(canActorPerformCmsAction(editorPerms, editorFeats, "publish")).toBe(false);
    expect(canActorPerformCmsAction(editorPerms, editorFeats, "media_delete")).toBe(false);

    const publisherRole = findRole("cms_publisher");
    const publisherPerms = computeEffectivePermissions({
      assignedRoles: [publisherRole],
      overrides: [],
    });
    const publisherFeats = computeEffectiveFeatures({
      assignedRoles: [publisherRole],
      organizationIds: [],
      userId: "usr_pub_1",
      rules: [],
    });
    expect(canActorPerformCmsAction(publisherPerms, publisherFeats, "forms")).toBe(true);
    expect(canActorPerformCmsAction(publisherPerms, publisherFeats, "publish")).toBe(true);

    const adminRole = findRole("super_admin");
    const adminPerms = computeEffectivePermissions({
      assignedRoles: [adminRole],
      overrides: [],
    });
    const adminFeats = computeEffectiveFeatures({
      assignedRoles: [adminRole],
      organizationIds: [],
      userId: "usr_admin_1",
      rules: [],
    });
    expect(canActorPerformCmsAction(adminPerms, adminFeats, "publish")).toBe(true);
    expect(canActorPerformCmsAction(adminPerms, adminFeats, "media_delete")).toBe(true);

    const orgRole = findRole("organizer");
    const orgPerms = computeEffectivePermissions({
      assignedRoles: [orgRole],
      overrides: [],
    });
    const orgFeats = computeEffectiveFeatures({
      assignedRoles: [orgRole],
      organizationIds: ["org_1"],
      userId: "usr_org_1",
      rules: [],
    });
    expect(canActorPerformCmsAction(orgPerms, orgFeats, "view")).toBe(false);
    expect(canActorPerformCmsAction(orgPerms, orgFeats, "edit")).toBe(false);
  });

  it("supports immediate publish, scheduled future release hold, and atomic revision rollback", () => {
    const seed = buildDefaultCmsWorkspaceSeed();
    const v1Revision = seed.revisions.find((r) => r.pageSlug === "about")!;
    expect(v1Revision).toBeDefined();

    // Create Draft v2
    const v2Draft = applyDraftUpdateToPage(
      seed.pages.about,
      seed.pages.about.draftSections,
      { ...seed.pages.about.draftSeo, metaTitle: "About Sid v2 Live" },
      "editor@siddwhizz.com"
    );

    // 1. Future-scheduled release holds live SEO on v1 while marking status 'scheduled'
    const futureIso = new Date(Date.now() + 86_400_000).toISOString();
    const scheduled = promotePageDraftToPublished(
      v2Draft,
      "publisher@siddwhizz.com",
      "Scheduled Q1 Launch",
      futureIso
    );
    expect(scheduled.updatedPage.status).toBe("scheduled");
    expect(scheduled.updatedPage.publishedSeo.metaTitle).toBe(
      seed.pages.about.publishedSeo.metaTitle
    );

    // 2. Immediate publish promotes v2 to live publishedSeo
    const published = promotePageDraftToPublished(
      v2Draft,
      "publisher@siddwhizz.com",
      "Immediate v2 Release",
      null
    );
    expect(published.updatedPage.status).toBe("published");
    expect(published.updatedPage.publishedSeo.metaTitle).toBe("About Sid v2 Live");
    expect(published.newRevision.versionNumber).toBe(2);

    // 3. Atomic Rollback restores v1 snapshot to both draft & published
    const rolledBack = rollbackPageToRevision(
      published.updatedPage,
      v1Revision,
      "admin@siddwhizz.com"
    );
    expect(rolledBack.updatedPage.status).toBe("published");
    expect(rolledBack.updatedPage.publishedSeo.metaTitle).toBe(v1Revision.seoSnapshot.metaTitle);
    expect(rolledBack.updatedPage.draftSeo.metaTitle).toBe(v1Revision.seoSnapshot.metaTitle);
    expect(rolledBack.rollbackRevision.versionNumber).toBe(3);

    // Cross-page rollback must throw
    const homeRev = seed.revisions.find((r) => r.pageSlug === "home")!;
    expect(() =>
      rollbackPageToRevision(rolledBack.updatedPage, homeRev, "admin@siddwhizz.com")
    ).toThrow();
  });

  it("blocks deleting media assets actively referenced in CMS pages and allows unused assets", () => {
    const seed = buildDefaultCmsWorkspaceSeed();
    const usages = computeCmsMediaUsages(seed.pages, seed.publishedSiteSettings);

    const activeOgUrl = seed.publishedSiteSettings.defaultOgImage;
    const blockedCheck = checkMediaDeleteSafety(activeOgUrl, usages);
    expect(blockedCheck.allowed).toBe(false);
    expect(blockedCheck.blockingUsages.length).toBeGreaterThan(0);

    const unusedCheck = checkMediaDeleteSafety(
      "https://example.com/unused-orphan-photo.jpg",
      usages
    );
    expect(unusedCheck.allowed).toBe(true);
    expect(unusedCheck.blockingUsages).toHaveLength(0);
  });

  it("validates Controlled Theme Tokens, rejects unapproved fonts/raw injection, and computes WCAG 2.1 AA contrast", () => {
    for (const preset of CMS_THEME_PRESETS) {
      const parsed = CmsThemeTokensSchema.safeParse(preset.tokens);
      expect(parsed.success).toBe(true);

      const contrast = evaluateThemeContrast(preset.tokens);
      expect(contrast.passesAA).toBe(true);
      expect(contrast.warnings).toHaveLength(0);

      const cssVars = themeTokensToCssVars(preset.tokens);
      expect(cssVars["--primary"]).toBe(preset.tokens.primaryHex);
      expect(cssVars["--accent"]).toContain("color-mix(in oklab");
    }

    // Reject unapproved font family or non-hex string
    const invalidFont = CmsThemeTokensSchema.safeParse({
      ...CMS_THEME_PRESETS[0]!.tokens,
      headingFont: "Comic Sans MS; background:url(javascript:alert(1))",
    });
    expect(invalidFont.success).toBe(false);

    // Flag low contrast combinations
    const lowContrast = evaluateThemeContrast({
      ...CMS_THEME_PRESETS[0]!.tokens,
      backgroundHex: "#FFFFFF",
      foregroundHex: "#BDBDBD",
    });
    expect(lowContrast.passesAA).toBe(false);
    expect(lowContrast.warnings.length).toBeGreaterThan(0);
  });

  it("validates Dynamic Contact Form fields, conditional visibility rules, and honeypot bot protection", () => {
    const seed = buildDefaultCmsWorkspaceSeed();
    const baseForm: CmsContactFormConfig = structuredClone(seed.publishedContactForm);

    // Add a conditional field that only activates when Event Type === "Wedding & Social"
    const formatField = baseForm.fields.find((f) => f.crmMapping === "format")!;
    baseForm.fields.push({
      id: "fld_wedding_rituals",
      name: "wedding_rituals",
      label: "Sangeet / Wedding Segments",
      type: "text",
      placeholder: "e.g. Ring Ceremony + Sangeet",
      tooltip: "",
      required: true,
      visible: true,
      width: "full",
      maxLength: 200,
      options: [],
      crmMapping: "custom",
      conditionalRule: {
        dependsOnFieldName: formatField.name,
        equalsValue: "Wedding & Social",
      },
    });

    const conditionalField = baseForm.fields.find((f) => f.id === "fld_wedding_rituals")!;

    // 1. Inactive when Corporate Summit is chosen -> valid without wedding_rituals!
    const corporateValues = {
      name: "Rohan Mehta",
      phone: "+91 98200 12345",
      email: "rohan@technova.in",
      date: "2027-02-14",
      organization: "TechNova India",
      city: "Mumbai",
      type: "Corporate Summit",
      packageTier: "Full-Day Summit / Gala (₹3,50,000 - ₹5,00,000)",
      message: "Two-day flagship AI & Cloud leadership summit at Jio World Centre.",
    };
    expect(isFormFieldActive(conditionalField, corporateValues)).toBe(false);
    const validCorporate = validateDynamicFormSubmission(baseForm, corporateValues);
    expect(validCorporate.valid).toBe(true);

    // 2. Active when Wedding & Social is chosen -> fails if wedding_rituals is missing!
    const weddingMissingConditional = {
      ...corporateValues,
      type: "Wedding & Social",
    };
    expect(isFormFieldActive(conditionalField, weddingMissingConditional)).toBe(true);
    const invalidWedding = validateDynamicFormSubmission(baseForm, weddingMissingConditional);
    expect(invalidWedding.valid).toBe(false);
    expect(invalidWedding.errors["wedding_rituals"]).toBeDefined();

    // 3. Honeypot bot submission is rejected immediately
    const botAttempt = validateDynamicFormSubmission(baseForm, {
      ...corporateValues,
      _company_website_hp: "https://spam-bot.example",
    });
    expect(botAttempt.valid).toBe(false);
    expect(botAttempt.errors["_form"]).toBeDefined();
  });
});
