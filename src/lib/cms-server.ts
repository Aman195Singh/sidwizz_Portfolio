import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { getRequestIP, setResponseStatus } from "@tanstack/react-start/server";
import { neon } from "@neondatabase/serverless";
import { put } from "@vercel/blob";
import { z } from "zod";
import {
  CMS_PAGE_SLUGS,
  CmsThemeTokensSchema,
  applyDraftUpdateToPage,
  checkMediaDeleteSafety,
  computeCmsMediaUsages,
  evaluateThemeContrast,
  extractPublicSitePayload,
  promotePageDraftToPublished,
  rollbackPageToRevision,
  validateDynamicFormSubmission,
  type AdminCmsWorkspacePayload,
  type CmsContactFormConfig,
  type CmsFormSubmissionRecord,
  type CmsGlobalSiteSettings,
  type CmsMediaAsset,
  type CmsNavigationConfig,
  type CmsPageDocument,
  type CmsPageRevision,
  type CmsPageSection,
  type CmsPageSeo,
  type CmsPageSlug,
  type CmsThemeTokens,
  type CrmLeadStage,
  type PublicSiteCmsPayload,
} from "@/lib/cms-schema";
import { buildDefaultCmsWorkspaceSeed } from "@/cms/seeds/default-site-seed";
import { requireServerAuth } from "@/lib/auth-server";
import { checkServerRateLimit, generateSecureToken, sha256Hex } from "@/lib/server-crypto";

interface ServerCmsState extends AdminCmsWorkspacePayload {
  bootstrapped: boolean;
  neonSynced: boolean;
}

let cmsState: ServerCmsState | null = null;

function getDatabaseUrl(): string {
  if (typeof process === "undefined") return "";
  return (process.env?.["DATABASE_URL"] || process.env?.["DIRECT_URL"] || "").trim();
}

function getNeonClient() {
  const url = getDatabaseUrl();
  if (!url) return null;
  try {
    return neon(url);
  } catch {
    return null;
  }
}

function safeClientIp(): string {
  try {
    return getRequestIP({ xForwardedFor: true }) || "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}

async function logCmsAudit(params: {
  actorUserId: string;
  actorEmail: string;
  actorRole: string;
  actionKey: string;
  entityType: string;
  entityId: string;
  summary: string;
}) {
  const sql = getNeonClient();
  if (!sql) return;
  try {
    await sql.query(
      `INSERT INTO audit_logs (
        id, actor_user_id, actor_email, actor_role, action_key, module,
        entity_type, entity_id, summary, ip_address, severity, created_at
      ) VALUES ($1,$2,$3,$4,$5,'CMS',$6,$7,$8,$9,'info',NOW())
      ON CONFLICT (id) DO NOTHING;`,
      [
        `aud_cms_${Date.now().toString(36)}_${generateSecureToken(4)}`,
        params.actorUserId,
        params.actorEmail,
        params.actorRole,
        params.actionKey,
        params.entityType,
        params.entityId,
        params.summary,
        safeClientIp(),
      ]
    );
  } catch {
    // Non-fatal if audit_logs table not yet migrated in external DB
  }
}

async function ensureNeonCmsTables(sql: {
  query: (q: string, params?: unknown[]) => Promise<unknown>;
}) {
  try {
    await sql.query(`
      CREATE TABLE IF NOT EXISTS cms_site_settings (
        id TEXT PRIMARY KEY DEFAULT 'global',
        draft_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
        published_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_by TEXT,
        published_by TEXT,
        published_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await sql.query(`
      CREATE TABLE IF NOT EXISTS cms_theme_tokens (
        id TEXT PRIMARY KEY DEFAULT 'global',
        draft_tokens JSONB NOT NULL DEFAULT '{}'::jsonb,
        published_tokens JSONB NOT NULL DEFAULT '{}'::jsonb,
        contrast_verified BOOLEAN NOT NULL DEFAULT TRUE,
        updated_by TEXT,
        published_by TEXT,
        published_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await sql.query(`
      CREATE TABLE IF NOT EXISTS cms_navigation_menus (
        id TEXT PRIMARY KEY DEFAULT 'global',
        draft_navigation JSONB NOT NULL DEFAULT '{}'::jsonb,
        published_navigation JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_by TEXT,
        published_by TEXT,
        published_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await sql.query(`
      CREATE TABLE IF NOT EXISTS cms_pages (
        slug TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        route_path TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'published',
        scheduled_publish_at TIMESTAMPTZ,
        draft_seo JSONB NOT NULL DEFAULT '{}'::jsonb,
        published_seo JSONB NOT NULL DEFAULT '{}'::jsonb,
        draft_sections JSONB NOT NULL DEFAULT '[]'::jsonb,
        published_sections JSONB NOT NULL DEFAULT '[]'::jsonb,
        current_version INTEGER NOT NULL DEFAULT 1,
        updated_by TEXT,
        published_by TEXT,
        published_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await sql.query(`
      CREATE TABLE IF NOT EXISTS cms_page_revisions (
        id TEXT PRIMARY KEY,
        page_slug TEXT NOT NULL,
        version_number INTEGER NOT NULL,
        label TEXT NOT NULL,
        workflow_status TEXT NOT NULL,
        sections_snapshot JSONB NOT NULL,
        seo_snapshot JSONB NOT NULL,
        created_by_email TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await sql.query(`
      CREATE TABLE IF NOT EXISTS cms_forms (
        id TEXT PRIMARY KEY DEFAULT 'contact_main',
        name TEXT NOT NULL,
        draft_config JSONB NOT NULL DEFAULT '{}'::jsonb,
        published_config JSONB NOT NULL DEFAULT '{}'::jsonb,
        current_version INTEGER NOT NULL DEFAULT 1,
        updated_by TEXT,
        published_by TEXT,
        published_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await sql.query(`
      CREATE TABLE IF NOT EXISTS cms_form_submissions (
        id TEXT PRIMARY KEY,
        form_id TEXT NOT NULL,
        form_version INTEGER NOT NULL DEFAULT 1,
        mapped_enquiry_id TEXT,
        client_name TEXT NOT NULL,
        client_email TEXT NOT NULL,
        client_phone TEXT NOT NULL,
        organization TEXT NOT NULL DEFAULT '',
        event_date TEXT NOT NULL DEFAULT '',
        event_city TEXT NOT NULL DEFAULT '',
        event_format TEXT NOT NULL DEFAULT '',
        package_tier TEXT NOT NULL DEFAULT '',
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        crm_stage TEXT NOT NULL DEFAULT 'New',
        assigned_staff_email TEXT,
        internal_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
        ip_hash TEXT,
        submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  } catch {
    // Non-fatal fallback to in-memory seed
  }
}

async function persistPageToNeon(page: CmsPageDocument) {
  const sql = getNeonClient();
  if (!sql) return;
  try {
    await sql.query(
      `INSERT INTO cms_pages (
        slug, title, route_path, status, scheduled_publish_at,
        draft_seo, published_seo, draft_sections, published_sections,
        current_version, updated_by, published_by, published_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8::jsonb,$9::jsonb,$10,$11,$12,$13,NOW())
      ON CONFLICT (slug) DO UPDATE SET
        status = EXCLUDED.status,
        scheduled_publish_at = EXCLUDED.scheduled_publish_at,
        draft_seo = EXCLUDED.draft_seo,
        published_seo = EXCLUDED.published_seo,
        draft_sections = EXCLUDED.draft_sections,
        published_sections = EXCLUDED.published_sections,
        current_version = EXCLUDED.current_version,
        updated_by = EXCLUDED.updated_by,
        published_by = EXCLUDED.published_by,
        published_at = EXCLUDED.published_at,
        updated_at = NOW();`,
      [
        page.slug,
        page.title,
        page.routePath,
        page.status,
        page.scheduledPublishAt,
        JSON.stringify(page.draftSeo),
        JSON.stringify(page.publishedSeo),
        JSON.stringify(page.draftSections),
        JSON.stringify(page.publishedSections),
        page.currentVersion,
        page.updatedBy,
        page.publishedBy,
        page.publishedAt,
      ]
    );
  } catch {
    // Graceful fallback
  }
}

async function persistRevisionToNeon(rev: CmsPageRevision) {
  const sql = getNeonClient();
  if (!sql) return;
  try {
    await sql.query(
      `INSERT INTO cms_page_revisions (
        id, page_slug, version_number, label, workflow_status,
        sections_snapshot, seo_snapshot, created_by_email, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8,$9)
      ON CONFLICT (id) DO NOTHING;`,
      [
        rev.id,
        rev.pageSlug,
        rev.versionNumber,
        rev.label,
        rev.workflowStatus,
        JSON.stringify(rev.sectionsSnapshot),
        JSON.stringify(rev.seoSnapshot),
        rev.createdByEmail,
        rev.createdAt,
      ]
    );
  } catch {
    // Graceful fallback
  }
}

async function ensureCmsBootstrapped(): Promise<ServerCmsState> {
  if (!cmsState) {
    const seed = buildDefaultCmsWorkspaceSeed();
    cmsState = {
      ...seed,
      bootstrapped: true,
      neonSynced: false,
    };
  }

  // Auto-promote any scheduled pages whose scheduledPublishAt timestamp has arrived
  const nowMs = Date.now();
  let changedSchedule = false;
  for (const slug of CMS_PAGE_SLUGS) {
    const p = cmsState.pages[slug];
    if (
      p.status === "scheduled" &&
      p.scheduledPublishAt &&
      new Date(p.scheduledPublishAt).getTime() <= nowMs
    ) {
      const nowIso = new Date().toISOString();
      cmsState.pages[slug] = {
        ...p,
        status: "published",
        scheduledPublishAt: null,
        publishedSections: structuredClone(p.draftSections),
        publishedSeo: structuredClone(p.draftSeo),
        publishedAt: nowIso,
        updatedAt: nowIso,
      };
      changedSchedule = true;
    }
  }
  if (changedSchedule) {
    cmsState.mediaUsages = computeCmsMediaUsages(
      cmsState.pages,
      cmsState.publishedSiteSettings
    );
  }

  if (!cmsState.neonSynced) {
    cmsState.neonSynced = true;
    const sql = getNeonClient();
    if (sql) {
      await ensureNeonCmsTables(sql);
      try {
        const rows = (await sql.query(`SELECT * FROM cms_pages;`)) as Array<
          Record<string, unknown>
        >;
        if (Array.isArray(rows) && rows.length > 0) {
          for (const row of rows) {
            const slug = String(row["slug"] ?? "") as CmsPageSlug;
            if (CMS_PAGE_SLUGS.includes(slug) && cmsState.pages[slug]) {
              const existing = cmsState.pages[slug];
              cmsState.pages[slug] = {
                ...existing,
                status: (row["status"] as CmsPageDocument["status"]) || existing.status,
                scheduledPublishAt: row["scheduled_publish_at"]
                  ? String(row["scheduled_publish_at"])
                  : null,
                currentVersion: Number(row["current_version"] ?? existing.currentVersion),
                draftSeo: (row["draft_seo"] as CmsPageSeo) || existing.draftSeo,
                publishedSeo: (row["published_seo"] as CmsPageSeo) || existing.publishedSeo,
                draftSections:
                  (row["draft_sections"] as CmsPageSection[]) || existing.draftSections,
                publishedSections:
                  (row["published_sections"] as CmsPageSection[]) ||
                  existing.publishedSections,
              };
            }
          }
          cmsState.mediaUsages = computeCmsMediaUsages(
            cmsState.pages,
            cmsState.publishedSiteSettings
          );
        }
      } catch {
        // Use baseline V1 seed if Neon has no CMS rows yet
      }
    }
  }

  return cmsState;
}

export const getServerCmsUsageCheck = createServerOnlyFn(async (assetUrl: string) => {
  const state = await ensureCmsBootstrapped();
  return checkMediaDeleteSafety(assetUrl, state.mediaUsages);
});

/* ========================================================================== */
/* PUBLIC READ ENDPOINT (Returns ONLY Published Snapshots — Zero Draft Leak)  */
/* ========================================================================== */

export const getPublishedSiteCmsServerFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicSiteCmsPayload> => {
    const state = await ensureCmsBootstrapped();
    return extractPublicSitePayload(state);
  }
);

/* ========================================================================== */
/* ADMIN WORKSPACE ENDPOINT (Protected by `feature.cms` + `cms.view`)         */
/* ========================================================================== */

export const getAdminCmsWorkspaceServerFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminCmsWorkspacePayload> => {
    await requireServerAuth({
      feature: "feature.cms",
      permission: "cms.view",
    });
    const state = await ensureCmsBootstrapped();
    return {
      draftSiteSettings: structuredClone(state.draftSiteSettings),
      publishedSiteSettings: structuredClone(state.publishedSiteSettings),
      draftThemeTokens: structuredClone(state.draftThemeTokens),
      publishedThemeTokens: structuredClone(state.publishedThemeTokens),
      draftNavigation: structuredClone(state.draftNavigation),
      publishedNavigation: structuredClone(state.publishedNavigation),
      pages: structuredClone(state.pages),
      revisions: structuredClone(state.revisions),
      mediaAssets: structuredClone(state.mediaAssets),
      mediaUsages: structuredClone(state.mediaUsages),
      draftContactForm: structuredClone(state.draftContactForm),
      publishedContactForm: structuredClone(state.publishedContactForm),
      contactFormVersion: state.contactFormVersion,
      submissions: structuredClone(state.submissions),
    };
  }
);

/* ========================================================================== */
/* SAVE PAGE DRAFT (`cms.edit` — Never Overwrites Live Published Snapshot)    */
/* ========================================================================== */

const SaveDraftInputSchema = z.object({
  slug: z.enum(CMS_PAGE_SLUGS),
  draftSectionsJson: z.string().min(2).max(950000),
  draftSeo: z.object({
    metaTitle: z.string().min(2).max(160),
    metaDescription: z.string().min(2).max(360),
    canonicalUrl: z.string().max(300),
    ogTitle: z.string().max(160),
    ogDescription: z.string().max(360),
    ogImage: z.string().max(500),
    robotsIndex: z.boolean(),
  }),
  submitForReview: z.boolean().optional(),
});

export const saveCmsPageDraftServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => SaveDraftInputSchema.parse(data))
  .handler(async ({ data }): Promise<{ page: CmsPageDocument; mediaCount: number }> => {
    const auth = await requireServerAuth({
      isMutation: true,
      feature: "feature.cms",
      permission: "cms.edit",
    });

    const state = await ensureCmsBootstrapped();
    const parsedSections = JSON.parse(data.draftSectionsJson) as CmsPageSection[];
    if (!Array.isArray(parsedSections)) {
      setResponseStatus(400);
      throw new Error("Invalid sections payload.");
    }

    const updated = applyDraftUpdateToPage(
      state.pages[data.slug],
      parsedSections,
      data.draftSeo,
      auth.user.email
    );
    if (data.submitForReview) {
      updated.status = "in_review";
    }

    state.pages[data.slug] = updated;
    state.mediaUsages = computeCmsMediaUsages(state.pages, state.publishedSiteSettings);
    await persistPageToNeon(updated);

    await logCmsAudit({
      actorUserId: auth.user.id,
      actorEmail: auth.user.email,
      actorRole: auth.session.primaryRoleKey,
      actionKey: data.submitForReview ? "cms.page.submitted_review" : "cms.page.draft_saved",
      entityType: "cms_page",
      entityId: data.slug,
      summary: data.submitForReview
        ? `Submitted "${updated.title}" draft for publisher review.`
        : `Saved draft changes on "${updated.title}" (${parsedSections.length} sections).`,
    });

    return {
      page: structuredClone(updated),
      mediaCount: state.mediaUsages.length,
    };
  });

/* ========================================================================== */
/* PUBLISH OR SCHEDULE PAGE (`cms.publish` — Enforces Separation of Duties)   */
/* ========================================================================== */

const PublishPageInputSchema = z.object({
  slug: z.enum(CMS_PAGE_SLUGS),
  revisionLabel: z.string().max(140).optional(),
  scheduledPublishAt: z.string().nullable().optional(),
});

export const publishCmsPageServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => PublishPageInputSchema.parse(data))
  .handler(
    async ({
      data,
    }): Promise<{ page: CmsPageDocument; revision: CmsPageRevision }> => {
      const auth = await requireServerAuth({
        isMutation: true,
        feature: "feature.cms",
        permission: "cms.publish",
      });

      const state = await ensureCmsBootstrapped();
      const { updatedPage, newRevision } = promotePageDraftToPublished(
        state.pages[data.slug],
        auth.user.email,
        data.revisionLabel,
        data.scheduledPublishAt ?? null
      );

      state.pages[data.slug] = updatedPage;
      state.revisions.unshift(newRevision);
      if (state.revisions.length > 150) {
        state.revisions.length = 150;
      }
      state.mediaUsages = computeCmsMediaUsages(
        state.pages,
        state.publishedSiteSettings
      );

      await persistPageToNeon(updatedPage);
      await persistRevisionToNeon(newRevision);

      await logCmsAudit({
        actorUserId: auth.user.id,
        actorEmail: auth.user.email,
        actorRole: auth.session.primaryRoleKey,
        actionKey:
          updatedPage.status === "scheduled"
            ? "cms.page.scheduled"
            : "cms.page.published",
        entityType: "cms_page",
        entityId: data.slug,
        summary: `${
          updatedPage.status === "scheduled" ? "Scheduled" : "Published"
        } "${updatedPage.title}" v${updatedPage.currentVersion} (${newRevision.label}).`,
      });

      return {
        page: structuredClone(updatedPage),
        revision: structuredClone(newRevision),
      };
    }
  );

/* ========================================================================== */
/* ATOMIC REVISION ROLLBACK (`cms.publish`)                                   */
/* ========================================================================== */

const RollbackInputSchema = z.object({
  slug: z.enum(CMS_PAGE_SLUGS),
  revisionId: z.string().min(3).max(120),
});

export const rollbackCmsPageRevisionServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => RollbackInputSchema.parse(data))
  .handler(
    async ({
      data,
    }): Promise<{ page: CmsPageDocument; revision: CmsPageRevision }> => {
      const auth = await requireServerAuth({
        isMutation: true,
        feature: "feature.cms",
        permission: "cms.publish",
      });

      const state = await ensureCmsBootstrapped();
      const targetRev = state.revisions.find(
        (r) => r.id === data.revisionId && r.pageSlug === data.slug
      );
      if (!targetRev) {
        setResponseStatus(404);
        throw new Error("Target revision snapshot not found.");
      }

      const { updatedPage, rollbackRevision } = rollbackPageToRevision(
        state.pages[data.slug],
        targetRev,
        auth.user.email
      );

      state.pages[data.slug] = updatedPage;
      state.revisions.unshift(rollbackRevision);
      state.mediaUsages = computeCmsMediaUsages(
        state.pages,
        state.publishedSiteSettings
      );

      await persistPageToNeon(updatedPage);
      await persistRevisionToNeon(rollbackRevision);

      await logCmsAudit({
        actorUserId: auth.user.id,
        actorEmail: auth.user.email,
        actorRole: auth.session.primaryRoleKey,
        actionKey: "cms.page.rolled_back",
        entityType: "cms_page",
        entityId: data.slug,
        summary: `Rolled back "${updatedPage.title}" to v${targetRev.versionNumber} -> new live v${updatedPage.currentVersion}.`,
      });

      return {
        page: structuredClone(updatedPage),
        revision: structuredClone(rollbackRevision),
      };
    }
  );

/* ========================================================================== */
/* CONTROLLED THEME TOKENS, NAVIGATION & GLOBAL SITE SETTINGS                 */
/* ========================================================================== */

const SaveGlobalDesignInputSchema = z.object({
  themeTokens: CmsThemeTokensSchema,
  navigationJson: z.string().min(2).max(200000),
  siteSettings: z.object({
    brandNamePrefix: z.string().min(1).max(32),
    brandNameAccent: z.string().min(1).max(32),
    hostFullName: z.string().min(2).max(80),
    hostRoleTagline: z.string().min(2).max(120),
    signatureText: z.string().min(2).max(60),
    footerCopyright: z.string().min(4).max(240),
    defaultOgImage: z.string().max(500),
  }),
  publishNow: z.boolean(),
});

export const saveCmsGlobalDesignServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => SaveGlobalDesignInputSchema.parse(data))
  .handler(
    async ({
      data,
    }): Promise<{
      publishedThemeTokens: CmsThemeTokens;
      draftThemeTokens: CmsThemeTokens;
      publishedNavigation: CmsNavigationConfig;
      publishedSiteSettings: CmsGlobalSiteSettings;
      contrastWarnings: string[];
    }> => {
      const auth = await requireServerAuth({
        isMutation: true,
        feature: "feature.cms",
        permission: data.publishNow ? "cms.publish" : "cms.edit",
      });

      const contrast = evaluateThemeContrast(data.themeTokens);
      if (data.publishNow && contrast.bodyOnBackgroundRatio < 3.5) {
        setResponseStatus(422);
        throw new Error(
          `Cannot publish unreadable theme: ${contrast.warnings[0] ?? "Insufficient WCAG contrast."}`
        );
      }

      const parsedNav = JSON.parse(data.navigationJson) as CmsNavigationConfig;
      const state = await ensureCmsBootstrapped();

      state.draftThemeTokens = structuredClone(data.themeTokens);
      state.draftNavigation = structuredClone(parsedNav);
      state.draftSiteSettings = structuredClone(data.siteSettings);

      if (data.publishNow) {
        state.publishedThemeTokens = structuredClone(data.themeTokens);
        state.publishedNavigation = structuredClone(parsedNav);
        state.publishedSiteSettings = structuredClone(data.siteSettings);
      }

      state.mediaUsages = computeCmsMediaUsages(
        state.pages,
        state.publishedSiteSettings
      );

      const sql = getNeonClient();
      if (sql) {
        try {
          await sql.query(
            `INSERT INTO cms_theme_tokens (id, draft_tokens, published_tokens, contrast_verified, updated_by, published_by, published_at, updated_at)
             VALUES ('global', $1::jsonb, $2::jsonb, $3, $4, $5, NOW(), NOW())
             ON CONFLICT (id) DO UPDATE SET
               draft_tokens = EXCLUDED.draft_tokens,
               published_tokens = EXCLUDED.published_tokens,
               contrast_verified = EXCLUDED.contrast_verified,
               updated_by = EXCLUDED.updated_by,
               published_by = EXCLUDED.published_by,
               updated_at = NOW();`,
            [
              JSON.stringify(state.draftThemeTokens),
              JSON.stringify(state.publishedThemeTokens),
              contrast.passesAA,
              auth.user.email,
              data.publishNow ? auth.user.email : null,
            ]
          );
          await sql.query(
            `INSERT INTO cms_navigation_menus (id, draft_navigation, published_navigation, updated_by, published_by, published_at, updated_at)
             VALUES ('global', $1::jsonb, $2::jsonb, $3, $4, NOW(), NOW())
             ON CONFLICT (id) DO UPDATE SET
               draft_navigation = EXCLUDED.draft_navigation,
               published_navigation = EXCLUDED.published_navigation,
               updated_by = EXCLUDED.updated_by,
               published_by = EXCLUDED.published_by,
               updated_at = NOW();`,
            [
              JSON.stringify(state.draftNavigation),
              JSON.stringify(state.publishedNavigation),
              auth.user.email,
              data.publishNow ? auth.user.email : null,
            ]
          );
          await sql.query(
            `INSERT INTO cms_site_settings (id, draft_settings, published_settings, updated_by, published_by, published_at, updated_at)
             VALUES ('global', $1::jsonb, $2::jsonb, $3, $4, NOW(), NOW())
             ON CONFLICT (id) DO UPDATE SET
               draft_settings = EXCLUDED.draft_settings,
               published_settings = EXCLUDED.published_settings,
               updated_by = EXCLUDED.updated_by,
               published_by = EXCLUDED.published_by,
               updated_at = NOW();`,
            [
              JSON.stringify(state.draftSiteSettings),
              JSON.stringify(state.publishedSiteSettings),
              auth.user.email,
              data.publishNow ? auth.user.email : null,
            ]
          );
        } catch {
          // Non-fatal
        }
      }

      await logCmsAudit({
        actorUserId: auth.user.id,
        actorEmail: auth.user.email,
        actorRole: auth.session.primaryRoleKey,
        actionKey: data.publishNow
          ? "cms.theme.published"
          : "cms.theme.draft_saved",
        entityType: "cms_theme",
        entityId: "global",
        summary: `${
          data.publishNow ? "Published" : "Saved draft"
        } global theme tokens (${data.themeTokens.headingFont} / ${
          data.themeTokens.primaryHex
        }) & navigation.`,
      });

      return {
        publishedThemeTokens: structuredClone(state.publishedThemeTokens),
        draftThemeTokens: structuredClone(state.draftThemeTokens),
        publishedNavigation: structuredClone(state.publishedNavigation),
        publishedSiteSettings: structuredClone(state.publishedSiteSettings),
        contrastWarnings: contrast.warnings,
      };
    }
  );

/* ========================================================================== */
/* 3-COLUMN CONTACT FORM BUILDER SAVE / PUBLISH (`cms.forms.manage`)          */
/* ========================================================================== */

const SaveFormInputSchema = z.object({
  formConfigJson: z.string().min(2).max(250000),
  publishNow: z.boolean(),
});

export const saveCmsContactFormServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => SaveFormInputSchema.parse(data))
  .handler(
    async ({
      data,
    }): Promise<{
      draftContactForm: CmsContactFormConfig;
      publishedContactForm: CmsContactFormConfig;
      version: number;
    }> => {
      const auth = await requireServerAuth({
        isMutation: true,
        feature: "feature.cms",
        permission: "cms.forms.manage",
      });
      if (data.publishNow && !auth.session.permissions.includes("cms.publish")) {
        setResponseStatus(403);
        throw new Error(
          "Publishing Contact Form changes to the live website requires `cms.publish` permission."
        );
      }

      const parsed = JSON.parse(data.formConfigJson) as CmsContactFormConfig;
      if (!parsed.fields || parsed.fields.length === 0) {
        setResponseStatus(400);
        throw new Error("Contact form must contain at least one field.");
      }

      const state = await ensureCmsBootstrapped();
      state.draftContactForm = structuredClone(parsed);
      if (data.publishNow) {
        state.publishedContactForm = structuredClone(parsed);
        state.contactFormVersion += 1;
      }

      const sql = getNeonClient();
      if (sql) {
        try {
          await sql.query(
            `INSERT INTO cms_forms (id, name, draft_config, published_config, current_version, updated_by, published_by, published_at, updated_at)
             VALUES ('contact_main', $1, $2::jsonb, $3::jsonb, $4, $5, $6, NOW(), NOW())
             ON CONFLICT (id) DO UPDATE SET
               name = EXCLUDED.name,
               draft_config = EXCLUDED.draft_config,
               published_config = EXCLUDED.published_config,
               current_version = EXCLUDED.current_version,
               updated_by = EXCLUDED.updated_by,
               published_by = EXCLUDED.published_by,
               updated_at = NOW();`,
            [
              parsed.name,
              JSON.stringify(state.draftContactForm),
              JSON.stringify(state.publishedContactForm),
              state.contactFormVersion,
              auth.user.email,
              data.publishNow ? auth.user.email : null,
            ]
          );
        } catch {
          // Non-fatal
        }
      }

      await logCmsAudit({
        actorUserId: auth.user.id,
        actorEmail: auth.user.email,
        actorRole: auth.session.primaryRoleKey,
        actionKey: data.publishNow ? "cms.form.published" : "cms.form.draft_saved",
        entityType: "cms_form",
        entityId: "contact_main",
        summary: `${data.publishNow ? "Published" : "Saved draft"} Contact Form Builder (${
          parsed.fields.length
        } fields, v${state.contactFormVersion}).`,
      });

      return {
        draftContactForm: structuredClone(state.draftContactForm),
        publishedContactForm: structuredClone(state.publishedContactForm),
        version: state.contactFormVersion,
      };
    }
  );

/* ========================================================================== */
/* MEDIA UPLOAD (`@vercel/blob` + Safe Fallback) & IN-USE DELETION SAFEGUARD  */
/* ========================================================================== */

const UploadMediaInputSchema = z.object({
  title: z.string().min(1).max(140),
  altText: z.string().max(240),
  category: z.string().min(1).max(60),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
  base64DataUrl: z.string().min(20).max(6_500_000),
});

export const uploadCmsMediaAssetServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => UploadMediaInputSchema.parse(data))
  .handler(async ({ data }): Promise<{ asset: CmsMediaAsset }> => {
    const auth = await requireServerAuth({
      isMutation: true,
      feature: "feature.cms",
      permission: "cms.manage_media",
    });

    const commaIndex = data.base64DataUrl.indexOf(",");
    const base64Body =
      commaIndex >= 0 ? data.base64DataUrl.slice(commaIndex + 1) : data.base64DataUrl;
    const byteBuffer = Buffer.from(base64Body, "base64");

    if (byteBuffer.byteLength > 4_500_000) {
      setResponseStatus(413);
      throw new Error("Image exceeds 4.5 MB server upload limit.");
    }

    let publicUrl = data.base64DataUrl;
    let storageProvider: CmsMediaAsset["storageProvider"] = "inline_fallback";

    const blobToken =
      typeof process !== "undefined"
        ? (process.env?.["BLOB_READ_WRITE_TOKEN"] || "").trim()
        : "";

    if (blobToken) {
      try {
        const ext =
          data.mimeType === "image/png"
            ? "png"
            : data.mimeType === "image/webp"
            ? "webp"
            : data.mimeType === "image/gif"
            ? "gif"
            : "jpg";
        const safeSlug = data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 48);
        const blobResult = await put(
          `siddwhizz-cms/${Date.now()}-${safeSlug || "stage"}.${ext}`,
          byteBuffer,
          {
            access: "public",
            contentType: data.mimeType,
            token: blobToken,
          }
        );
        publicUrl = blobResult.url;
        storageProvider = "vercel_blob";
      } catch {
        // Fallback gracefully to inline data URL if Vercel Blob token is invalid/offline
        storageProvider = "inline_fallback";
      }
    }

    const asset: CmsMediaAsset = {
      id: `cms_asset_${Date.now().toString(36)}_${generateSecureToken(3)}`,
      title: data.title.trim(),
      mediaType: "image",
      storageProvider,
      publicUrl,
      altText: data.altText.trim() || data.title.trim(),
      category: data.category,
      mimeType: data.mimeType,
      byteSize: byteBuffer.byteLength,
      uploadedByEmail: auth.user.email,
      createdAt: new Date().toISOString(),
    };

    const state = await ensureCmsBootstrapped();
    state.mediaAssets.unshift(asset);

    await logCmsAudit({
      actorUserId: auth.user.id,
      actorEmail: auth.user.email,
      actorRole: auth.session.primaryRoleKey,
      actionKey: "cms.media.uploaded",
      entityType: "cms_media",
      entityId: asset.id,
      summary: `Uploaded CMS media "${asset.title}" via ${storageProvider}.`,
    });

    return { asset };
  });

const DeleteMediaInputSchema = z.object({
  assetIdOrUrl: z.string().min(1).max(1000),
});

export const deleteCmsMediaAssetServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => DeleteMediaInputSchema.parse(data))
  .handler(
    async ({
      data,
    }): Promise<{
      deleted: boolean;
      inUse: boolean;
      blockingLocations: string[];
    }> => {
      const auth = await requireServerAuth({
        isMutation: true,
        permission: "media.delete",
      });

      const state = await ensureCmsBootstrapped();
      state.mediaUsages = computeCmsMediaUsages(
        state.pages,
        state.publishedSiteSettings
      );

      const targetAsset = state.mediaAssets.find(
        (a) => a.id === data.assetIdOrUrl || a.publicUrl === data.assetIdOrUrl
      );
      const targetUrl = targetAsset ? targetAsset.publicUrl : data.assetIdOrUrl;

      const safety = checkMediaDeleteSafety(targetUrl, state.mediaUsages);
      if (!safety.allowed) {
        const blockingLocations = Array.from(
          new Set(
            safety.blockingUsages.map(
              (u) => `${u.pageSlug.toUpperCase()} → ${u.sectionLabel} (${u.environment})`
            )
          )
        );
        return {
          deleted: false,
          inUse: true,
          blockingLocations,
        };
      }

      if (targetAsset) {
        state.mediaAssets = state.mediaAssets.filter((a) => a.id !== targetAsset.id);
      }

      await logCmsAudit({
        actorUserId: auth.user.id,
        actorEmail: auth.user.email,
        actorRole: auth.session.primaryRoleKey,
        actionKey: "cms.media.deleted",
        entityType: "cms_media",
        entityId: targetAsset?.id || "external_asset",
        summary: `Deleted unused media asset "${targetAsset?.title || targetUrl}".`,
      });

      return {
        deleted: true,
        inUse: false,
        blockingLocations: [],
      };
    }
  );

/* ========================================================================== */
/* PUBLIC DYNAMIC CONTACT FORM SUBMISSION + ADMIN CRM MANAGEMENT              */
/* ========================================================================== */

const SubmitContactFormSchema = z.object({
  values: z.record(z.string(), z.string()),
});

export const submitPublicContactFormServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => SubmitContactFormSchema.parse(data))
  .handler(
    async ({
      data,
    }): Promise<{
      ok: boolean;
      submissionId: string;
      message: string;
      fieldErrors: Record<string, string>;
    }> => {
      const state = await ensureCmsBootstrapped();
      const formConfig = state.publishedContactForm;
      const ip = safeClientIp();

      const limit = checkServerRateLimit({
        key: `cms_contact:${ip}`,
        maxRequests: formConfig.rateLimitPerTenMinutes || 8,
        windowMs: 10 * 60 * 1000,
      });
      if (!limit.allowed) {
        setResponseStatus(429);
        return {
          ok: false,
          submissionId: "",
          message: "Too many enquiries sent recently. Please try again in a few minutes.",
          fieldErrors: {},
        };
      }

      const validation = validateDynamicFormSubmission(formConfig, data.values);
      if (!validation.valid) {
        setResponseStatus(422);
        return {
          ok: false,
          submissionId: "",
          message:
            validation.errors["_form"] ||
            Object.values(validation.errors)[0] ||
            "Please check the highlighted form fields.",
          fieldErrors: validation.errors,
        };
      }

      const vals = validation.sanitizedValues;
      const getByMapping = (mapping: string, fallbackName: string): string => {
        const matchedField = formConfig.fields.find((f) => f.crmMapping === mapping);
        if (matchedField && vals[matchedField.name]) return vals[matchedField.name] ?? "";
        return vals[fallbackName] ?? "";
      };

      const nowIso = new Date().toISOString();
      const submission: CmsFormSubmissionRecord = {
        id: `sub_${Date.now().toString(36)}_${generateSecureToken(3)}`,
        formId: formConfig.id,
        formVersion: state.contactFormVersion,
        mappedEnquiryId: `ENQ-${Math.floor(1000 + Math.random() * 9000)}`,
        clientName: getByMapping("clientName", "name") || "Website Visitor",
        clientEmail: getByMapping("email", "email"),
        clientPhone: getByMapping("phone", "phone"),
        organization: getByMapping("organization", "organization"),
        eventDate: getByMapping("date", "date"),
        eventCity: getByMapping("city", "city"),
        eventFormat: getByMapping("format", "type") || "Corporate Summit",
        packageTier: getByMapping("packageTier", "packageTier"),
        values: vals,
        isRead: false,
        crmStage: "New",
        assignedStaffEmail: "admin@siddwhizz.com",
        internalNotes: [],
        submittedAt: nowIso,
        updatedAt: nowIso,
      };

      state.submissions.unshift(submission);
      if (state.submissions.length > 300) {
        state.submissions.length = 300;
      }

      const sql = getNeonClient();
      if (sql) {
        try {
          const ipHash = await sha256Hex(ip);
          await sql.query(
            `INSERT INTO cms_form_submissions (
              id, form_id, form_version, mapped_enquiry_id,
              client_name, client_email, client_phone, organization,
              event_date, event_city, event_format, package_tier,
              payload, is_read, crm_stage, assigned_staff_email, ip_hash, submitted_at, updated_at
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,FALSE,'New',$14,$15,$16,$16);`,
            [
              submission.id,
              submission.formId,
              submission.formVersion,
              submission.mappedEnquiryId,
              submission.clientName,
              submission.clientEmail,
              submission.clientPhone,
              submission.organization,
              submission.eventDate,
              submission.eventCity,
              submission.eventFormat,
              submission.packageTier,
              JSON.stringify(submission.values),
              submission.assignedStaffEmail,
              ipHash,
              nowIso,
            ]
          );
        } catch {
          // Non-fatal
        }
      }

      return {
        ok: true,
        submissionId: submission.id,
        message: formConfig.successToastMessage,
        fieldErrors: {},
      };
    }
  );

const UpdateCrmSubmissionSchema = z.object({
  submissionId: z.string().min(2).max(120),
  isRead: z.boolean().optional(),
  crmStage: z.enum(["New", "Contacted", "Qualified", "Converted", "Closed"]).optional(),
  assignedStaffEmail: z.string().max(120).optional(),
  note: z.string().max(500).optional(),
});

export const updateCmsSubmissionCrmServerFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => UpdateCrmSubmissionSchema.parse(data))
  .handler(async ({ data }): Promise<{ submission: CmsFormSubmissionRecord }> => {
    const auth = await requireServerAuth({
      isMutation: true,
      permission: "enquiries.manage",
    });

    const state = await ensureCmsBootstrapped();
    const target = state.submissions.find((s) => s.id === data.submissionId);
    if (!target) {
      setResponseStatus(404);
      throw new Error("Submission record not found.");
    }

    if (typeof data.isRead === "boolean") target.isRead = data.isRead;
    if (data.crmStage) target.crmStage = data.crmStage as CrmLeadStage;
    if (typeof data.assignedStaffEmail === "string") {
      target.assignedStaffEmail = data.assignedStaffEmail;
    }
    if (data.note && data.note.trim()) {
      target.internalNotes.push(`${auth.user.name}: ${data.note.trim()}`);
    }
    target.updatedAt = new Date().toISOString();

    return { submission: structuredClone(target) };
  });
