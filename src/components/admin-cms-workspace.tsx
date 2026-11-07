import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CalendarClock,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  FileCheck2,
  FormInput,
  Globe,
  History,
  Image as ImageIcon,
  Layers,
  Monitor,
  Navigation,
  Palette,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tablet,
  Trash2,
  Upload,
  UploadCloud,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  CMS_PAGE_SLUGS,
  CMS_THEME_PRESETS,
  CURATED_BODY_FONTS,
  CURATED_HEADING_FONTS,
  CURATED_SIGNATURE_FONTS,
  computeCmsMediaUsages,
  evaluateThemeContrast,
  type AdminCmsWorkspacePayload,
  type CmsButtonPreset,
  type CmsCardPreset,
  type CmsMediaAsset,
  type CmsPageDocument,
  type CmsPageRevision,
  type CmsPageSection,
  type CmsPageSlug,
  type CmsSectionDensity,
  type CmsSectionSpacing,
  type CmsSectionSurface,
  type CuratedBodyFont,
  type CuratedHeadingFont,
  type CuratedSignatureFont,
} from "@/lib/cms-schema";
import { buildDefaultCmsWorkspaceSeed } from "@/cms/seeds/default-site-seed";
import { CmsPageRenderer, CmsThemedSurface } from "@/lib/cms-client";
import { AdminContactFormBuilder } from "@/components/admin-contact-form-builder";
import {
  deleteCmsMediaAssetServerFn,
  getAdminCmsWorkspaceServerFn,
  publishCmsPageServerFn,
  rollbackCmsPageRevisionServerFn,
  saveCmsGlobalDesignServerFn,
  saveCmsPageDraftServerFn,
  uploadCmsMediaAssetServerFn,
} from "@/lib/cms-server";

type CmsStudioArea =
  | "pages"
  | "theme"
  | "navigation"
  | "forms"
  | "media"
  | "seo";

type PreviewViewport = "desktop" | "tablet" | "mobile";

const NEW_SECTION_TEMPLATES: {
  key: string;
  label: string;
  build: () => CmsPageSection;
}[] = [
  {
    key: "split_story",
    label: "Split Story + Image",
    build: () => ({
      id: `sec_split_${Date.now().toString(36)}`,
      label: "Custom Stage Highlight",
      visible: true,
      surface: "default",
      spacing: "normal",
      data: {
        kind: "split_story",
        layout: "image_left_text_right",
        eyebrow: "Spotlight Segment",
        title: "Crafted for",
        highlightText: "high-stakes stages.",
        body: "Tailored scripting, executive presence, and seamless audience momentum from opening keynote to closing applause.",
        image: "https://sidwizz-portfolio.vercel.app/og-image.png?v=5",
        imageAlt: "Stage highlight",
        showSignature: false,
        primaryCtaLabel: "Book Siddharth",
        primaryCtaHref: "/contact",
        secondaryCtaLabel: "",
        secondaryCtaHref: "",
        bullets: [],
      },
    }),
  },
  {
    key: "feature_grid",
    label: "Feature Pillars Grid",
    build: () => ({
      id: `sec_grid_${Date.now().toString(36)}`,
      label: "Key Stage Pillars",
      visible: true,
      surface: "blush",
      spacing: "normal",
      data: {
        kind: "feature_grid",
        variant: "pillars",
        centerHeader: true,
        eyebrow: "Stage Advantage",
        title: "Precision meets high energy.",
        highlightText: "",
        items: [
          { id: `fg_${Date.now()}_1`, iconKey: "Zap", title: "Commanding Opening", description: "Sets instant momentum in the first 60 seconds." },
          { id: `fg_${Date.now()}_2`, iconKey: "Users", title: "CXO Moderation", description: "Sharp, researched questions for leadership panels." },
          { id: `fg_${Date.now()}_3`, iconKey: "Trophy", title: "Flawless Cues", description: "Zero-drift run-of-show timing with show callers." },
        ],
      },
    }),
  },
  {
    key: "faq",
    label: "FAQ Accordion",
    build: () => ({
      id: `sec_faq_${Date.now().toString(36)}`,
      label: "Event Organizer FAQ",
      visible: true,
      surface: "default",
      spacing: "normal",
      data: {
        kind: "faq",
        eyebrow: "Organizer FAQ",
        title: "Common booking questions.",
        subtitle: "Everything your production team needs to know.",
        items: [
          {
            id: `fq_${Date.now()}_1`,
            question: "How early should we lock dates for flagship summits?",
            answer: "We recommend locking dates 4–8 weeks in advance for peak Q4/Q1 summit seasons.",
          },
        ],
      },
    }),
  },
  {
    key: "cta_banner",
    label: "Closing CTA Banner",
    build: () => ({
      id: `sec_cta_${Date.now().toString(36)}`,
      label: "Closing Stage CTA",
      visible: true,
      surface: "default",
      spacing: "normal",
      data: {
        kind: "cta_banner",
        variant: "crowd",
        title: "Ready to elevate",
        highlightText: "your next flagship stage?",
        subtitle: "Check instant availability and lock Siddharth Maurya for your event.",
        primaryLabel: "Book Sid Now",
        secondaryLabel: "Explore Portfolio",
        secondaryTo: "/portfolio",
        customBackgroundImage: "",
      },
    }),
  },
];

export function AdminCmsWorkspace() {
  const { hasPermission, hasFeature } = useAuth();
  const canView = hasFeature("feature.cms") && hasPermission("cms.view");
  const canEdit = hasFeature("feature.cms") && hasPermission("cms.edit");
  const canPublish = hasFeature("feature.cms") && hasPermission("cms.publish");
  const canManageForms = hasFeature("feature.cms") && hasPermission("cms.forms.manage");
  const canUploadMedia = hasFeature("feature.cms") && hasPermission("cms.manage_media");
  const canDeleteMedia = hasPermission("media.delete");

  const [workspace, setWorkspace] = useState<AdminCmsWorkspacePayload>(() =>
    buildDefaultCmsWorkspaceSeed()
  );
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const [studioArea, setStudioArea] = useState<CmsStudioArea>("pages");
  const [activePageSlug, setActivePageSlug] = useState<CmsPageSlug>("home");
  const [viewport, setViewport] = useState<PreviewViewport>("desktop");
  const [inspectorTab, setInspectorTab] = useState<"general" | "style">("general");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("home_hero");

  // Modals & Drawers
  const [historyOpen, setHistoryOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleInput, setScheduleInput] = useState("");
  const [revisionNote, setRevisionNote] = useState("");
  const [addSectionMenuOpen, setAddSectionMenuOpen] = useState(false);

  // Media Picker Modal
  const [mediaPickerCallback, setMediaPickerCallback] = useState<
    ((url: string) => void) | null
  >(null);
  const [mediaSearch, setMediaSearch] = useState("");
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminCmsWorkspaceServerFn();
      setWorkspace(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not load CMS workspace."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canView) {
      void loadWorkspace();
    } else {
      setLoading(false);
    }
  }, [canView, loadWorkspace]);

  const activePage: CmsPageDocument = workspace.pages[activePageSlug];

  useEffect(() => {
    const exists = activePage.draftSections.some((s) => s.id === selectedSectionId);
    if (!exists && activePage.draftSections[0]) {
      setSelectedSectionId(activePage.draftSections[0].id);
    }
  }, [activePage, selectedSectionId]);

  const selectedSection = useMemo(
    () =>
      activePage.draftSections.find((s) => s.id === selectedSectionId) ??
      activePage.draftSections[0],
    [activePage.draftSections, selectedSectionId]
  );

  // Live recomputed media usages including unsaved local draft edits
  const liveMediaUsages = useMemo(
    () => computeCmsMediaUsages(workspace.pages, workspace.draftSiteSettings),
    [workspace.pages, workspace.draftSiteSettings]
  );

  const contrastReport = useMemo(
    () => evaluateThemeContrast(workspace.draftThemeTokens),
    [workspace.draftThemeTokens]
  );

  const updateActivePageDraftSections = (
    updater: (prev: CmsPageSection[]) => CmsPageSection[]
  ) => {
    if (!canEdit) return;
    setWorkspace((prev) => {
      const cur = prev.pages[activePageSlug];
      const nextSections = updater(cur.draftSections);
      return {
        ...prev,
        pages: {
          ...prev.pages,
          [activePageSlug]: {
            ...cur,
            status: "draft",
            draftSections: nextSections,
          },
        },
      };
    });
  };

  const updateSectionById = (
    sectionId: string,
    updater: (sec: CmsPageSection) => CmsPageSection
  ) => {
    updateActivePageDraftSections((prev) =>
      prev.map((s) => (s.id === sectionId ? updater(s) : s))
    );
  };

  const moveSection = (sectionId: string, dir: -1 | 1) => {
    updateActivePageDraftSections((prev) => {
      const idx = prev.findIndex((s) => s.id === sectionId);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(idx, 1);
      if (!moved) return prev;
      copy.splice(target, 0, moved);
      return copy;
    });
  };

  const duplicateSection = (sectionId: string) => {
    updateActivePageDraftSections((prev) => {
      const idx = prev.findIndex((s) => s.id === sectionId);
      const orig = prev[idx];
      if (!orig) return prev;
      const clone: CmsPageSection = {
        ...structuredClone(orig),
        id: `${orig.id}_copy_${Date.now().toString(36)}`,
        label: `${orig.label} (Copy)`,
      };
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      setSelectedSectionId(clone.id);
      return next;
    });
    toast.success("Duplicated section into page draft.");
  };

  const removeSection = (sectionId: string) => {
    if (activePage.draftSections.length <= 1) {
      toast.error("A public page must keep at least 1 section.");
      return;
    }
    updateActivePageDraftSections((prev) => prev.filter((s) => s.id !== sectionId));
    toast.info("Removed section from draft (live page unaffected until Publish).");
  };

  const handleSaveDraft = async (submitForReview = false) => {
    setBusyAction(submitForReview ? "review" : "save");
    try {
      const res = await saveCmsPageDraftServerFn({
        data: {
          slug: activePageSlug,
          draftSectionsJson: JSON.stringify(activePage.draftSections),
          draftSeo: activePage.draftSeo,
          submitForReview,
        },
      });
      setWorkspace((prev) => ({
        ...prev,
        pages: { ...prev.pages, [activePageSlug]: res.page },
      }));
      toast.success(
        submitForReview
          ? `"${res.page.title}" submitted for Publisher review!`
          : `Saved draft for "${res.page.title}" (live website unchanged).`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save draft.");
    } finally {
      setBusyAction(null);
    }
  };

  const handlePublishPage = async (scheduledPublishAt: string | null = null) => {
    setBusyAction("publish");
    try {
      // Save latest local draft edits first so publish captures everything on screen
      if (canEdit) {
        await saveCmsPageDraftServerFn({
          data: {
            slug: activePageSlug,
            draftSectionsJson: JSON.stringify(activePage.draftSections),
            draftSeo: activePage.draftSeo,
          },
        });
      }
      const res = await publishCmsPageServerFn({
        data: {
          slug: activePageSlug,
          ...(revisionNote.trim() ? { revisionLabel: revisionNote.trim() } : {}),
          scheduledPublishAt,
        },
      });
      setWorkspace((prev) => ({
        ...prev,
        pages: { ...prev.pages, [activePageSlug]: res.page },
        revisions: [res.revision, ...prev.revisions],
      }));
      setRevisionNote("");
      setScheduleOpen(false);
      window.dispatchEvent(new Event("siddwhizz_cms_published"));
      toast.success(
        scheduledPublishAt
          ? `Scheduled "${res.page.title}" v${res.page.currentVersion} for automatic release!`
          : `Published "${res.page.title}" v${res.page.currentVersion} live to website!`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Publish failed.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleRollback = async (rev: CmsPageRevision) => {
    setBusyAction("rollback");
    try {
      const res = await rollbackCmsPageRevisionServerFn({
        data: {
          slug: activePageSlug,
          revisionId: rev.id,
        },
      });
      setWorkspace((prev) => ({
        ...prev,
        pages: { ...prev.pages, [activePageSlug]: res.page },
        revisions: [res.revision, ...prev.revisions],
      }));
      setHistoryOpen(false);
      window.dispatchEvent(new Event("siddwhizz_cms_published"));
      toast.success(
        `Atomically rolled back "${res.page.title}" to v${rev.versionNumber}!`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Rollback failed.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleSaveGlobalDesign = async (publishNow: boolean) => {
    setBusyAction(publishNow ? "publish_theme" : "save_theme");
    try {
      const res = await saveCmsGlobalDesignServerFn({
        data: {
          themeTokens: workspace.draftThemeTokens,
          navigationJson: JSON.stringify(workspace.draftNavigation),
          siteSettings: workspace.draftSiteSettings,
          publishNow,
        },
      });
      setWorkspace((prev) => ({
        ...prev,
        draftThemeTokens: res.draftThemeTokens,
        publishedThemeTokens: res.publishedThemeTokens,
        publishedNavigation: res.publishedNavigation,
        publishedSiteSettings: res.publishedSiteSettings,
      }));
      if (publishNow) {
        window.dispatchEvent(new Event("siddwhizz_cms_published"));
        toast.success(
          "Published global Theme Tokens, Fonts, Navigation & Footer live!"
        );
      } else {
        toast.success("Saved global Theme & Navigation draft.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save design tokens.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleUploadMediaFile = (file: File) => {
    if (!canUploadMedia) {
      toast.error("Missing `cms.manage_media` permission.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, WebP, GIF).");
      return;
    }
    if (file.size > 4.5 * 1024 * 1024) {
      toast.error("Image must be under 4.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64DataUrl = String(reader.result || "");
      setBusyAction("upload_media");
      try {
        const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        const mimeType = (
          ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)
            ? file.type
            : "image/jpeg"
        ) as "image/jpeg" | "image/png" | "image/webp" | "image/gif";
        const res = await uploadCmsMediaAssetServerFn({
          data: {
            title: cleanTitle || "Stage Visual",
            altText: cleanTitle || "SIDD.WHIZZ Stage Visual",
            category: "CMS Uploads",
            mimeType,
            base64DataUrl,
          },
        });
        setWorkspace((prev) => ({
          ...prev,
          mediaAssets: [res.asset, ...prev.mediaAssets],
        }));
        if (mediaPickerCallback) {
          mediaPickerCallback(res.asset.publicUrl);
          setMediaPickerCallback(null);
        }
        toast.success(
          `Uploaded "${res.asset.title}" (${
            res.asset.storageProvider === "vercel_blob"
              ? "Vercel Blob CDN"
              : "Managed Fallback Store"
          })!`
        );
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed.");
      } finally {
        setBusyAction(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteMediaAsset = async (asset: CmsMediaAsset) => {
    if (!canDeleteMedia) {
      toast.error("Missing `media.delete` permission.");
      return;
    }
    try {
      const res = await deleteCmsMediaAssetServerFn({
        data: { assetIdOrUrl: asset.id },
      });
      if (res.inUse) {
        toast.error(
          `Deletion blocked — "${asset.title}" is actively used in: ${res.blockingLocations
            .slice(0, 2)
            .join(", ")}`
        );
        return;
      }
      setWorkspace((prev) => ({
        ...prev,
        mediaAssets: prev.mediaAssets.filter((a) => a.id !== asset.id),
      }));
      toast.success(`Deleted unused asset "${asset.title}".`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete check failed.");
    }
  };

  if (!canView) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-card p-8 text-center space-y-3">
        <ShieldAlert className="mx-auto h-8 w-8 text-destructive" />
        <h3 className="font-display text-lg font-black uppercase">
          CMS Entitlement Required
        </h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Your role does not currently have the staff-only `feature.cms` entitlement and
          `cms.view` permission enabled.
        </p>
      </div>
    );
  }

  const pageRevisions = workspace.revisions.filter(
    (r) => r.pageSlug === activePageSlug
  );

  const statusBadge = (status: CmsPageDocument["status"]) => {
    if (status === "published") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
          <CheckCircle2 className="h-3 w-3" /> Published
        </span>
      );
    }
    if (status === "in_review") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/35 bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
          <FileCheck2 className="h-3 w-3" /> In Review
        </span>
      );
    }
    if (status === "scheduled") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/35 bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
          <CalendarClock className="h-3 w-3" /> Scheduled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-primary/35 bg-primary/12 px-2.5 py-0.5 text-[11px] font-bold text-primary">
        <Sparkles className="h-3 w-3" /> Unsaved / Draft
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Upload Input for Media Picker & Media Manager */}
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUploadMediaFile(f);
          e.currentTarget.value = "";
        }}
      />

      {/* =================================================================== */}
      {/* TOP VISUAL CMS WORKFLOW BAR (Builder Reference Layout)              */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Left: Page Selector + Route + Workflow Status */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-display text-xs font-black">
              CMS
            </span>
            <select
              aria-label="Select Public Page"
              value={activePageSlug}
              onChange={(e) => {
                setActivePageSlug(e.target.value as CmsPageSlug);
                if (studioArea === "forms" && e.target.value !== "contact") {
                  setStudioArea("pages");
                }
              }}
              className="rounded-xl border border-border bg-background px-3 py-1.5 font-display text-xs font-extrabold uppercase tracking-wider text-foreground cursor-pointer"
            >
              {CMS_PAGE_SLUGS.map((slug) => (
                <option key={slug} value={slug}>
                  {workspace.pages[slug].title} ({workspace.pages[slug].routePath})
                </option>
              ))}
            </select>
          </div>

          {statusBadge(activePage.status)}

          <span className="font-mono text-[11px] font-bold text-muted-foreground">
            v{activePage.currentVersion}
          </span>

          {loading && (
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Center: Viewport Responsive Preview Toggle */}
        {studioArea !== "forms" && studioArea !== "media" && (
          <div
            className="inline-flex items-center rounded-xl border border-border bg-muted/40 p-0.5"
            role="group"
            aria-label="Preview viewport size"
          >
            {(
              [
                { id: "desktop", label: "Desktop", icon: Monitor },
                { id: "tablet", label: "Tablet", icon: Tablet },
                { id: "mobile", label: "Mobile", icon: Smartphone },
              ] as const
            ).map((vp) => {
              const Icon = vp.icon;
              return (
                <button
                  key={vp.id}
                  type="button"
                  onClick={() => setViewport(vp.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                    viewport === vp.id
                      ? "bg-card text-primary shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">{vp.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Right: History, Live Link, Save Draft, Submit Review, Publish */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            className="btn-outline !py-1.5 !px-3 text-xs !normal-case cursor-pointer"
          >
            <History className="h-3.5 w-3.5 text-primary" /> History ({pageRevisions.length})
          </button>

          <Link
            to={activePage.routePath}
            target="_blank"
            className="btn-outline !py-1.5 !px-2.5 text-xs !normal-case"
            title="Open live public route in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5 text-primary" />
          </Link>

          {canEdit && (
            <button
              type="button"
              disabled={busyAction !== null}
              onClick={() => void handleSaveDraft(false)}
              className="btn-outline !py-1.5 !px-3.5 text-xs !normal-case cursor-pointer"
            >
              <Save className="h-3.5 w-3.5 text-primary" />
              {busyAction === "save" ? "Saving…" : "Save Draft"}
            </button>
          )}

          {canEdit && !canPublish && (
            <button
              type="button"
              disabled={busyAction !== null}
              onClick={() => void handleSaveDraft(true)}
              className="btn-red !py-1.5 !px-3.5 text-xs !normal-case cursor-pointer"
            >
              <FileCheck2 className="h-3.5 w-3.5" /> Submit for Review
            </button>
          )}

          {canPublish && (
            <div className="relative inline-flex items-center">
              <button
                type="button"
                disabled={busyAction !== null}
                onClick={() => void handlePublishPage(null)}
                className="btn-red !rounded-r-none !py-1.5 !px-4 text-xs !normal-case cursor-pointer"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                {busyAction === "publish" ? "Publishing…" : "Publish"}
              </button>
              <button
                type="button"
                aria-label="Schedule release or add version note"
                onClick={() => setScheduleOpen((o) => !o)}
                className="btn-red !rounded-l-none border-l border-white/25 !py-1.5 !px-2 text-xs cursor-pointer"
              >
                <CalendarClock className="h-3.5 w-3.5" />
              </button>

              {scheduleOpen && (
                <div className="absolute right-0 top-11 z-40 w-80 rounded-2xl border border-border bg-card p-4 shadow-2xl space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="font-display font-black uppercase text-foreground">
                      Release Options
                    </p>
                    <button
                      type="button"
                      onClick={() => setScheduleOpen(false)}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div>
                    <label className="font-bold text-muted-foreground block mb-1">
                      Revision Release Note
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Updated Q1 summit hero & fees"
                      value={revisionNote}
                      onChange={(e) => setRevisionNote(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-muted-foreground block mb-1">
                      Schedule Future Publish (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduleInput}
                      onChange={(e) => setScheduleInput(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-xs"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        void handlePublishPage(
                          scheduleInput ? new Date(scheduleInput).toISOString() : null
                        )
                      }
                      className="btn-red flex-1 !py-2 text-xs !normal-case cursor-pointer"
                    >
                      {scheduleInput ? "Schedule Release" : "Publish Immediately"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* STUDIO NAVIGATION PILLS                                             */}
      {/* =================================================================== */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {(
          [
            { id: "pages", label: "Pages & Section Layers", icon: Layers },
            { id: "theme", label: "Theme, Fonts & Colors", icon: Palette },
            { id: "navigation", label: "Header & Footer", icon: Navigation },
            { id: "forms", label: "Contact Form Builder", icon: FormInput },
            {
              id: "media",
              label: `CMS Media & Guard (${workspace.mediaAssets.length})`,
              icon: ImageIcon,
            },
            { id: "seo", label: "Page SEO & OpenGraph", icon: Globe },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const active = studioArea === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setStudioArea(item.id);
                if (item.id === "forms") {
                  setActivePageSlug("contact");
                }
              }}
              className={`shrink-0 inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer border ${
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                  : "bg-card text-foreground/80 border-border hover:bg-accent"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* =================================================================== */}
      {/* AREA 4: DEDICATED 3-COLUMN CONTACT FORM BUILDER                     */}
      {/* =================================================================== */}
      {studioArea === "forms" && (
        <AdminContactFormBuilder
          draftForm={workspace.draftContactForm}
          formVersion={workspace.contactFormVersion}
          submissions={workspace.submissions}
          canEditForms={canManageForms}
          canPublish={canPublish}
          onDraftFormChange={(next) =>
            setWorkspace((prev) => ({ ...prev, draftContactForm: next }))
          }
          onSavedOrPublished={(res) =>
            setWorkspace((prev) => ({
              ...prev,
              draftContactForm: res.draftContactForm,
              publishedContactForm: res.publishedContactForm,
              contactFormVersion: res.version,
            }))
          }
          onSubmissionUpdated={(updated) =>
            setWorkspace((prev) => ({
              ...prev,
              submissions: prev.submissions.map((s) =>
                s.id === updated.id ? updated : s
              ),
            }))
          }
        />
      )}

      {/* =================================================================== */}
      {/* AREA 5: CMS MEDIA LIBRARY & LIVE REFERENCE DELETION SAFEGUARD       */}
      {/* =================================================================== */}
      {studioArea === "media" && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-black uppercase text-foreground">
                CMS Media Assets &amp; Live Usage Guard
              </h3>
              <p className="text-xs text-muted-foreground">
                Uploads route through `@vercel/blob` when `BLOB_READ_WRITE_TOKEN` is set
                (with automatic managed fallback). Assets referenced on any draft or
                published page cannot be deleted accidentally.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search stage media..."
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                  className="rounded-xl border border-input bg-background py-1.5 pl-8 pr-3 text-xs"
                />
              </div>
              {canUploadMedia && (
                <button
                  type="button"
                  onClick={() => uploadInputRef.current?.click()}
                  className="btn-red !py-2 !px-4 text-xs !normal-case cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5" /> Upload Image
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {workspace.mediaAssets
              .filter(
                (a) =>
                  !mediaSearch.trim() ||
                  a.title.toLowerCase().includes(mediaSearch.toLowerCase()) ||
                  a.category.toLowerCase().includes(mediaSearch.toLowerCase())
              )
              .map((asset) => {
                const usages = liveMediaUsages.filter(
                  (u) => u.assetUrl === asset.publicUrl
                );
                const inUse = usages.length > 0;
                return (
                  <div
                    key={asset.id}
                    className="rounded-xl border border-border bg-background overflow-hidden flex flex-col"
                  >
                    <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                      <img
                        src={asset.publicUrl}
                        alt={asset.altText}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                      <span
                        className={`absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold shadow-xs ${
                          inUse
                            ? "bg-emerald-600 text-white"
                            : "bg-ink/80 text-ink-foreground"
                        }`}
                      >
                        {inUse ? (
                          <>
                            <ShieldCheck className="h-3 w-3" /> In Use ({usages.length})
                          </>
                        ) : (
                          "Unused"
                        )}
                      </span>
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between gap-2 text-xs">
                      <div>
                        <p className="font-bold text-foreground truncate">
                          {asset.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {asset.category} • {asset.storageProvider}
                        </p>
                        {inUse && (
                          <p
                            className="mt-1 text-[10px] text-primary font-semibold truncate"
                            title={usages
                              .map((u) => `${u.pageSlug}: ${u.sectionLabel}`)
                              .join(", ")}
                          >
                            Used on:{" "}
                            {Array.from(new Set(usages.map((u) => u.pageSlug))).join(
                              ", "
                            )}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-border">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(asset.publicUrl);
                            toast.success("Copied asset URL.");
                          }}
                          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-semibold hover:bg-accent cursor-pointer"
                        >
                          <Copy className="h-3 w-3" /> URL
                        </button>
                        {canDeleteMedia && (
                          <button
                            type="button"
                            onClick={() => void handleDeleteMediaAsset(asset)}
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold cursor-pointer ${
                              inUse
                                ? "border border-amber-500/40 bg-amber-500/10 text-amber-800"
                                : "border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white"
                            }`}
                            title={
                              inUse
                                ? "Protected by CMS In-Use Guard"
                                : "Delete unused media"
                            }
                          >
                            <Trash2 className="h-3 w-3" />
                            {inUse ? "Guarded" : "Delete"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3-PANE VISUAL EDITOR (`pages` | `theme` | `navigation` | `seo`)     */}
      {/* =================================================================== */}
      {studioArea !== "forms" && studioArea !== "media" && (
        <div className="grid grid-cols-1 xl:grid-cols-[270px_1fr_350px] gap-4 items-start">
          {/* =============================================================== */}
          {/* LEFT PANE: PAGE TREE / SECTION LAYERS / THEME PRESETS           */}
          {/* =============================================================== */}
          <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm space-y-3">
            {studioArea === "pages" && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-xs font-black uppercase tracking-wider text-foreground">
                      Section Layers
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {activePage.title} ({activePage.draftSections.length} blocks)
                    </p>
                  </div>
                  {canEdit && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setAddSectionMenuOpen((v) => !v)}
                        className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Block
                      </button>
                      {addSectionMenuOpen && (
                        <div className="absolute right-0 top-8 z-30 w-52 rounded-xl border border-border bg-card p-1.5 shadow-xl space-y-1">
                          {NEW_SECTION_TEMPLATES.map((tpl) => (
                            <button
                              key={tpl.key}
                              type="button"
                              onClick={() => {
                                const built = tpl.build();
                                updateActivePageDraftSections((prev) => [
                                  ...prev,
                                  built,
                                ]);
                                setSelectedSectionId(built.id);
                                setAddSectionMenuOpen(false);
                                toast.success(`Added "${tpl.label}" section.`);
                              }}
                              className="w-full rounded-lg px-2.5 py-2 text-left text-xs font-semibold hover:bg-accent cursor-pointer"
                            >
                              + {tpl.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-0.5">
                  {activePage.draftSections.map((sec, idx) => {
                    const isSelected = selectedSection?.id === sec.id;
                    return (
                      <div
                        key={sec.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedSectionId(sec.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedSectionId(sec.id);
                          }
                        }}
                        className={`rounded-xl border p-2.5 transition cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          isSelected
                            ? "border-primary bg-primary/8 shadow-2xs"
                            : "border-border bg-background hover:border-primary/40"
                        } ${!sec.visible ? "opacity-55" : ""}`}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">
                              {idx + 1}. {sec.label}
                            </p>
                            <p className="font-mono text-[10px] uppercase text-muted-foreground">
                              {sec.data.kind}
                            </p>
                          </div>
                          {canEdit && (
                            <div
                              className="flex items-center gap-0.5 shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                title={sec.visible ? "Hide section" : "Show section"}
                                onClick={() =>
                                  updateSectionById(sec.id, (s) => ({
                                    ...s,
                                    visible: !s.visible,
                                  }))
                                }
                                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                              >
                                {sec.visible ? (
                                  <Eye className="h-3.5 w-3.5" />
                                ) : (
                                  <EyeOff className="h-3.5 w-3.5" />
                                )}
                              </button>
                              <button
                                type="button"
                                title="Move Up"
                                onClick={() => moveSection(sec.id, -1)}
                                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Move Down"
                                onClick={() => moveSection(sec.id, 1)}
                                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Duplicate"
                                onClick={() => duplicateSection(sec.id)}
                                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                title="Remove"
                                onClick={() => removeSection(sec.id)}
                                className="rounded p-1 text-muted-foreground hover:bg-destructive/15 hover:text-destructive cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {studioArea === "theme" && (
              <div className="space-y-3">
                <p className="font-display text-xs font-black uppercase tracking-wider text-foreground">
                  Curated Stage Presets
                </p>
                {CMS_THEME_PRESETS.map((preset) => {
                  const active = workspace.draftThemeTokens.presetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      disabled={!canEdit}
                      onClick={() =>
                        setWorkspace((prev) => ({
                          ...prev,
                          draftThemeTokens: structuredClone(preset.tokens),
                        }))
                      }
                      className={`w-full rounded-xl border p-3 text-left transition cursor-pointer ${
                        active
                          ? "border-primary bg-primary/8"
                          : "border-border bg-background hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold text-foreground">
                          {preset.name}
                        </span>
                        <div
                          className="flex items-center gap-1"
                          style={{ forcedColorAdjust: "none" }}
                        >
                          <span
                            className="h-4 w-4 rounded-full border border-black/15"
                            style={{ backgroundColor: preset.tokens.primaryHex }}
                          />
                          <span
                            className="h-4 w-4 rounded-full border border-black/15"
                            style={{ backgroundColor: preset.tokens.inkHex }}
                          />
                        </div>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                        {preset.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {(studioArea === "navigation" || studioArea === "seo") && (
              <div className="space-y-2">
                <p className="font-display text-xs font-black uppercase tracking-wider text-foreground">
                  Quick Page Jump
                </p>
                {CMS_PAGE_SLUGS.map((slug) => (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => setActivePageSlug(slug)}
                    className={`w-full flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-bold transition cursor-pointer ${
                      activePageSlug === slug
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-foreground hover:bg-accent"
                    }`}
                  >
                    <span>{workspace.pages[slug].title}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {workspace.pages[slug].routePath}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* =============================================================== */}
          {/* CENTER PANE: LIVE INTERACTIVE SCOPED PREVIEW CANVAS             */}
          {/* =============================================================== */}
          <div className="rounded-2xl border border-border bg-muted/40 p-3 shadow-inner overflow-hidden">
            {/* Simulated Browser Address Bar */}
            <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="font-mono text-[11px] text-muted-foreground truncate">
                https://sidwizz-portfolio.vercel.app
                {activePage.routePath === "/" ? "" : activePage.routePath} (Draft Live
                Canvas)
              </span>
              <span className="text-[10px] font-bold uppercase text-primary">
                {viewport}
              </span>
            </div>

            {/* Responsive Frame */}
            <div className="max-h-[760px] overflow-y-auto rounded-xl border border-border bg-neutral-200/50 p-1 sm:p-2">
              <div
                className={`mx-auto transition-all duration-300 overflow-hidden rounded-lg shadow-xl border border-border ${
                  viewport === "mobile"
                    ? "max-w-[390px]"
                    : viewport === "tablet"
                    ? "max-w-[768px]"
                    : "w-full"
                }`}
              >
                <CmsThemedSurface tokens={workspace.draftThemeTokens}>
                  {workspace.draftNavigation.announcementBannerEnabled && (
                    <div className="bg-primary px-4 py-1.5 text-center text-xs font-bold text-primary-foreground">
                      {workspace.draftNavigation.announcementBannerText}
                    </div>
                  )}
                  <CmsPageRenderer
                    pageSlug={activePageSlug}
                    sections={activePage.draftSections}
                    signatureText={workspace.draftSiteSettings.signatureText}
                    contactFormConfig={workspace.draftContactForm}
                    previewMode
                    selectedSectionId={selectedSection?.id}
                    onSelectSection={(secId) => {
                      setSelectedSectionId(secId);
                      setStudioArea("pages");
                    }}
                  />
                </CmsThemedSurface>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* RIGHT PANE: CONTEXTUAL INSPECTOR                                */}
          {/* =============================================================== */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm max-h-[820px] overflow-y-auto space-y-4">
            {/* RIGHT INSPECTOR — PAGES & SECTION EDITOR */}
            {studioArea === "pages" && selectedSection && (
              <>
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                      Editing Section
                    </p>
                    <h3 className="font-display text-sm font-black uppercase text-foreground">
                      {selectedSection.label}
                    </h3>
                  </div>
                  <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setInspectorTab("general")}
                      className={`rounded-md px-2.5 py-1 cursor-pointer ${
                        inspectorTab === "general"
                          ? "bg-card text-primary shadow-2xs"
                          : "text-muted-foreground"
                      }`}
                    >
                      Content
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectorTab("style")}
                      className={`rounded-md px-2.5 py-1 cursor-pointer ${
                        inspectorTab === "style"
                          ? "bg-card text-primary shadow-2xs"
                          : "text-muted-foreground"
                      }`}
                    >
                      Style
                    </button>
                  </div>
                </div>

                {inspectorTab === "style" ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-muted-foreground block mb-1">
                        Layer Display Label
                      </label>
                      <input
                        type="text"
                        disabled={!canEdit}
                        value={selectedSection.label}
                        onChange={(e) =>
                          updateSectionById(selectedSection.id, (s) => ({
                            ...s,
                            label: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-muted-foreground block mb-1">
                        Section Surface Preset
                      </label>
                      <select
                        disabled={!canEdit}
                        value={selectedSection.surface}
                        onChange={(e) =>
                          updateSectionById(selectedSection.id, (s) => ({
                            ...s,
                            surface: e.target.value as CmsSectionSurface,
                          }))
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold"
                      >
                        <option value="default">Default Canvas</option>
                        <option value="blush">Soft Brand Blush</option>
                        <option value="muted">Subtle Muted Tint</option>
                        <option value="accent">Accent Highlight</option>
                        <option value="ink">Stage Dark Ink</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-muted-foreground block mb-1">
                        Vertical Spacing Preset
                      </label>
                      <select
                        disabled={!canEdit}
                        value={selectedSection.spacing}
                        onChange={(e) =>
                          updateSectionById(selectedSection.id, (s) => ({
                            ...s,
                            spacing: e.target.value as CmsSectionSpacing,
                          }))
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold"
                      >
                        <option value="compact">Compact</option>
                        <option value="normal">Standard Stage Rhythm</option>
                        <option value="spacious">Spacious</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <SectionContentInspector
                    section={selectedSection}
                    canEdit={canEdit}
                    onChange={(nextData) =>
                      updateSectionById(selectedSection.id, (s) => ({
                        ...s,
                        data: nextData,
                      }))
                    }
                    onPickImage={(cb) => setMediaPickerCallback(() => cb)}
                  />
                )}
              </>
            )}

            {/* RIGHT INSPECTOR — CONTROLLED THEME & FONTS */}
            {studioArea === "theme" && (
              <div className="space-y-4 text-xs">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                    Controlled Design System
                  </p>
                  <h3 className="font-display text-sm font-black uppercase text-foreground">
                    Typography, Colors &amp; Presets
                  </h3>
                </div>

                {/* Live WCAG 2.1 AA Accessibility Contrast Guard */}
                <div
                  className={`rounded-xl border p-3 space-y-1.5 ${
                    contrastReport.passesAA
                      ? "border-emerald-500/35 bg-emerald-500/10"
                      : "border-amber-500/45 bg-amber-500/12"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-foreground">
                      {contrastReport.passesAA ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                      )}
                      {contrastReport.passesAA
                        ? "WCAG 2.1 AA Contrast Verified"
                        : "Contrast Attention Needed"}
                    </span>
                    <span className="font-mono text-[11px] font-bold">
                      {contrastReport.bodyOnBackgroundRatio}:1
                    </span>
                  </div>
                  {contrastReport.warnings.map((w) => (
                    <p key={w} className="text-[11px] text-amber-900">
                      • {w}
                    </p>
                  ))}
                </div>

                {/* Curated Google Fonts */}
                <div className="space-y-2.5">
                  <div>
                    <label className="font-bold text-muted-foreground block mb-1">
                      Display / Heading Font
                    </label>
                    <select
                      disabled={!canEdit}
                      value={workspace.draftThemeTokens.headingFont}
                      onChange={(e) =>
                        setWorkspace((prev) => ({
                          ...prev,
                          draftThemeTokens: {
                            ...prev.draftThemeTokens,
                            presetId: "custom",
                            headingFont: e.target.value as CuratedHeadingFont,
                          },
                        }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-bold"
                    >
                      {CURATED_HEADING_FONTS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-muted-foreground block mb-1">
                      Body Copy Font
                    </label>
                    <select
                      disabled={!canEdit}
                      value={workspace.draftThemeTokens.bodyFont}
                      onChange={(e) =>
                        setWorkspace((prev) => ({
                          ...prev,
                          draftThemeTokens: {
                            ...prev.draftThemeTokens,
                            presetId: "custom",
                            bodyFont: e.target.value as CuratedBodyFont,
                          },
                        }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-bold"
                    >
                      {CURATED_BODY_FONTS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-muted-foreground block mb-1">
                      Host Signature Font
                    </label>
                    <select
                      disabled={!canEdit}
                      value={workspace.draftThemeTokens.signatureFont}
                      onChange={(e) =>
                        setWorkspace((prev) => ({
                          ...prev,
                          draftThemeTokens: {
                            ...prev.draftThemeTokens,
                            presetId: "custom",
                            signatureFont: e.target.value as CuratedSignatureFont,
                          },
                        }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-bold"
                    >
                      {CURATED_SIGNATURE_FONTS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Color Pickers */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {(
                    [
                      ["primaryHex", "Primary Accent"],
                      ["primaryDeepHex", "Deep Gradient"],
                      ["inkHex", "Stage Dark Ink"],
                      ["backgroundHex", "Page Canvas"],
                      ["foregroundHex", "Body Text"],
                      ["accentSurfaceHex", "Blush Surface"],
                    ] as const
                  ).map(([key, label]) => (
                    <label
                      key={key}
                      className="rounded-lg border border-border bg-background p-2 flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="color"
                        disabled={!canEdit}
                        value={workspace.draftThemeTokens[key]}
                        onChange={(e) =>
                          setWorkspace((prev) => ({
                            ...prev,
                            draftThemeTokens: {
                              ...prev.draftThemeTokens,
                              presetId: "custom",
                              [key]: e.target.value,
                            },
                          }))
                        }
                        style={{ forcedColorAdjust: "none" }}
                        className="h-7 w-7 shrink-0 rounded border-0 cursor-pointer"
                      />
                      <span className="min-w-0">
                        <span className="block text-[11px] font-bold text-foreground truncate">
                          {label}
                        </span>
                        <span className="block font-mono text-[10px] uppercase text-muted-foreground">
                          {workspace.draftThemeTokens[key]}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>

                {/* Component Shape & Density Presets */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold text-muted-foreground block mb-1">
                      Button Shape
                    </label>
                    <select
                      disabled={!canEdit}
                      value={workspace.draftThemeTokens.buttonPreset}
                      onChange={(e) =>
                        setWorkspace((prev) => ({
                          ...prev,
                          draftThemeTokens: {
                            ...prev.draftThemeTokens,
                            buttonPreset: e.target.value as CmsButtonPreset,
                          },
                        }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-xs font-semibold"
                    >
                      <option value="rounded">Rounded (Default)</option>
                      <option value="pill">Stadium Pill</option>
                      <option value="sharp">Editorial Sharp</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-muted-foreground block mb-1">
                      Card Style
                    </label>
                    <select
                      disabled={!canEdit}
                      value={workspace.draftThemeTokens.cardPreset}
                      onChange={(e) =>
                        setWorkspace((prev) => ({
                          ...prev,
                          draftThemeTokens: {
                            ...prev.draftThemeTokens,
                            cardPreset: e.target.value as CmsCardPreset,
                          },
                        }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-xs font-semibold"
                    >
                      <option value="elevated">Elevated Shadow</option>
                      <option value="bordered">Crisp Bordered</option>
                      <option value="glass">Stage Frosted</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-muted-foreground block mb-1">
                    Global Section Density
                  </label>
                  <select
                    disabled={!canEdit}
                    value={workspace.draftThemeTokens.sectionDensity}
                    onChange={(e) =>
                      setWorkspace((prev) => ({
                        ...prev,
                        draftThemeTokens: {
                          ...prev.draftThemeTokens,
                          sectionDensity: e.target.value as CmsSectionDensity,
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-xs font-semibold"
                  >
                    <option value="compact">Compact</option>
                    <option value="comfortable">Comfortable (Default)</option>
                    <option value="spacious">Spacious</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  {canEdit && (
                    <button
                      type="button"
                      disabled={busyAction !== null}
                      onClick={() => void handleSaveGlobalDesign(false)}
                      className="btn-outline flex-1 !py-2 text-xs !normal-case cursor-pointer"
                    >
                      Save Draft
                    </button>
                  )}
                  {canPublish && (
                    <button
                      type="button"
                      disabled={busyAction !== null}
                      onClick={() => void handleSaveGlobalDesign(true)}
                      className="btn-red flex-1 !py-2 text-xs !normal-case cursor-pointer"
                    >
                      Publish Theme
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* RIGHT INSPECTOR — HEADER, NAVIGATION & FOOTER */}
            {studioArea === "navigation" && (
              <div className="space-y-3.5 text-xs">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                    Global Shell
                  </p>
                  <h3 className="font-display text-sm font-black uppercase text-foreground">
                    Branding, Navbar &amp; Footer
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-muted-foreground block mb-1">
                      Logo Prefix
                    </label>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={workspace.draftSiteSettings.brandNamePrefix}
                      onChange={(e) =>
                        setWorkspace((prev) => ({
                          ...prev,
                          draftSiteSettings: {
                            ...prev.draftSiteSettings,
                            brandNamePrefix: e.target.value,
                          },
                        }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-muted-foreground block mb-1">
                      Logo Accent
                    </label>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={workspace.draftSiteSettings.brandNameAccent}
                      onChange={(e) =>
                        setWorkspace((prev) => ({
                          ...prev,
                          draftSiteSettings: {
                            ...prev.draftSiteSettings,
                            brandNameAccent: e.target.value,
                          },
                        }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-2.5 py-2 text-xs font-bold text-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-muted-foreground block mb-1">
                    Header CTA Button Label
                  </label>
                  <input
                    type="text"
                    disabled={!canEdit}
                    value={workspace.draftNavigation.headerCtaLabel}
                    onChange={(e) =>
                      setWorkspace((prev) => ({
                        ...prev,
                        draftNavigation: {
                          ...prev.draftNavigation,
                          headerCtaLabel: e.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
                  <label className="flex items-center gap-2 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!canEdit}
                      checked={workspace.draftNavigation.announcementBannerEnabled}
                      onChange={(e) =>
                        setWorkspace((prev) => ({
                          ...prev,
                          draftNavigation: {
                            ...prev.draftNavigation,
                            announcementBannerEnabled: e.target.checked,
                          },
                        }))
                      }
                      className="h-4 w-4"
                    />
                    <span>Show Top Stage Announcement Strip</span>
                  </label>
                  <input
                    type="text"
                    disabled={!canEdit}
                    value={workspace.draftNavigation.announcementBannerText}
                    onChange={(e) =>
                      setWorkspace((prev) => ({
                        ...prev,
                        draftNavigation: {
                          ...prev.draftNavigation,
                          announcementBannerText: e.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <p className="font-bold text-muted-foreground mb-1.5">
                    Primary Navbar Links
                  </p>
                  <div className="space-y-1.5">
                    {workspace.draftNavigation.primaryNav.map((navItem) => (
                      <div
                        key={navItem.id}
                        className="flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5"
                      >
                        <input
                          type="checkbox"
                          disabled={!canEdit}
                          checked={navItem.visible}
                          onChange={(e) =>
                            setWorkspace((prev) => ({
                              ...prev,
                              draftNavigation: {
                                ...prev.draftNavigation,
                                primaryNav: prev.draftNavigation.primaryNav.map((n) =>
                                  n.id === navItem.id
                                    ? { ...n, visible: e.target.checked }
                                    : n
                                ),
                              },
                            }))
                          }
                          className="h-3.5 w-3.5"
                        />
                        <input
                          type="text"
                          disabled={!canEdit}
                          value={navItem.label}
                          onChange={(e) =>
                            setWorkspace((prev) => ({
                              ...prev,
                              draftNavigation: {
                                ...prev.draftNavigation,
                                primaryNav: prev.draftNavigation.primaryNav.map((n) =>
                                  n.id === navItem.id
                                    ? { ...n, label: e.target.value }
                                    : n
                                ),
                              },
                            }))
                          }
                          className="flex-1 bg-transparent text-xs font-semibold focus:outline-none"
                        />
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {navItem.to}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-muted-foreground block mb-1">
                    Handwritten Signature Text
                  </label>
                  <input
                    type="text"
                    disabled={!canEdit}
                    value={workspace.draftSiteSettings.signatureText}
                    onChange={(e) =>
                      setWorkspace((prev) => ({
                        ...prev,
                        draftSiteSettings: {
                          ...prev.draftSiteSettings,
                          signatureText: e.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-muted-foreground block mb-1">
                    Footer Copyright Notice
                  </label>
                  <textarea
                    rows={2}
                    disabled={!canEdit}
                    value={workspace.draftSiteSettings.footerCopyright}
                    onChange={(e) =>
                      setWorkspace((prev) => ({
                        ...prev,
                        draftSiteSettings: {
                          ...prev.draftSiteSettings,
                          footerCopyright: e.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
                  />
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => void handleSaveGlobalDesign(false)}
                      className="btn-outline flex-1 !py-2 text-xs !normal-case cursor-pointer"
                    >
                      Save Draft
                    </button>
                  )}
                  {canPublish && (
                    <button
                      type="button"
                      onClick={() => void handleSaveGlobalDesign(true)}
                      className="btn-red flex-1 !py-2 text-xs !normal-case cursor-pointer"
                    >
                      Publish Header &amp; Footer
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* RIGHT INSPECTOR — PER-PAGE SEO & SOCIAL METADATA */}
            {studioArea === "seo" && (
              <div className="space-y-3.5 text-xs">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                    Search &amp; OpenGraph ({activePage.routePath})
                  </p>
                  <h3 className="font-display text-sm font-black uppercase text-foreground">
                    {activePage.title} Page SEO
                  </h3>
                </div>

                {/* Live Google SERP Preview */}
                <div className="rounded-xl border border-border bg-background p-3 space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">
                    Google Search Snippet Preview
                  </p>
                  <p className="text-[11px] text-emerald-700 truncate">
                    {activePage.draftSeo.canonicalUrl}
                  </p>
                  <p className="text-sm font-semibold text-blue-700 leading-snug line-clamp-1">
                    {activePage.draftSeo.metaTitle}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {activePage.draftSeo.metaDescription}
                  </p>
                </div>

                <div>
                  <label className="font-bold text-muted-foreground block mb-1">
                    Meta Title ({activePage.draftSeo.metaTitle.length}/65)
                  </label>
                  <input
                    type="text"
                    disabled={!canEdit}
                    value={activePage.draftSeo.metaTitle}
                    onChange={(e) =>
                      setWorkspace((prev) => ({
                        ...prev,
                        pages: {
                          ...prev.pages,
                          [activePageSlug]: {
                            ...activePage,
                            draftSeo: {
                              ...activePage.draftSeo,
                              metaTitle: e.target.value,
                              ogTitle: e.target.value,
                            },
                          },
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-muted-foreground block mb-1">
                    Meta Description ({activePage.draftSeo.metaDescription.length}/160)
                  </label>
                  <textarea
                    rows={3}
                    disabled={!canEdit}
                    value={activePage.draftSeo.metaDescription}
                    onChange={(e) =>
                      setWorkspace((prev) => ({
                        ...prev,
                        pages: {
                          ...prev.pages,
                          [activePageSlug]: {
                            ...activePage,
                            draftSeo: {
                              ...activePage.draftSeo,
                              metaDescription: e.target.value,
                              ogDescription: e.target.value,
                            },
                          },
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-muted-foreground block mb-1">
                    OpenGraph Share Image URL
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={activePage.draftSeo.ogImage}
                      onChange={(e) =>
                        setWorkspace((prev) => ({
                          ...prev,
                          pages: {
                            ...prev.pages,
                            [activePageSlug]: {
                              ...activePage,
                              draftSeo: {
                                ...activePage.draftSeo,
                                ogImage: e.target.value,
                              },
                            },
                          },
                        }))
                      }
                      className="flex-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs"
                    />
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() =>
                          setMediaPickerCallback(() => (url: string) => {
                            setWorkspace((prev) => ({
                              ...prev,
                              pages: {
                                ...prev.pages,
                                [activePageSlug]: {
                                  ...activePage,
                                  draftSeo: {
                                    ...activePage.draftSeo,
                                    ogImage: url,
                                  },
                                },
                              },
                            }));
                          })
                        }
                        className="btn-outline !py-1.5 !px-2.5 text-xs cursor-pointer"
                      >
                        Pick
                      </button>
                    )}
                  </div>
                </div>

                <label className="flex items-center gap-2 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!canEdit}
                    checked={activePage.draftSeo.robotsIndex}
                    onChange={(e) =>
                      setWorkspace((prev) => ({
                        ...prev,
                        pages: {
                          ...prev.pages,
                          [activePageSlug]: {
                            ...activePage,
                            draftSeo: {
                              ...activePage.draftSeo,
                              robotsIndex: e.target.checked,
                            },
                          },
                        },
                      }))
                    }
                    className="h-4 w-4"
                  />
                  <span>Allow Search Engines to Index (`index, follow`)</span>
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: REVISION HISTORY & 1-CLICK ATOMIC ROLLBACK                 */}
      {/* =================================================================== */}
      {historyOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label="Page Revision History"
        >
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-display text-base font-black uppercase text-foreground">
                  {activePage.title} — Version History &amp; Rollback
                </h3>
                <p className="text-xs text-muted-foreground">
                  Every publish creates an immutable snapshot. Roll back any version
                  atomically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2.5">
              {pageRevisions.map((rev) => (
                <div
                  key={rev.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3.5 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-primary/15 px-2 py-0.5 font-mono text-[11px] font-black text-primary">
                        v{rev.versionNumber}
                      </span>
                      <span className="font-bold text-foreground">{rev.label}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      By {rev.createdByEmail} •{" "}
                      {new Date(rev.createdAt).toLocaleString()} •{" "}
                      {rev.sectionsSnapshot.length} sections
                    </p>
                  </div>
                  {canPublish && (
                    <button
                      type="button"
                      disabled={busyAction !== null}
                      onClick={() => void handleRollback(rev)}
                      className="btn-outline !py-1.5 !px-3 text-xs !normal-case shrink-0 cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-primary" /> Restore
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: STAGE MEDIA PICKER FOR IMAGE FIELDS                        */}
      {/* =================================================================== */}
      {mediaPickerCallback && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label="Choose Stage Image"
        >
          <div className="w-full max-w-3xl rounded-2xl border border-border bg-card p-5 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <h3 className="font-display text-base font-black uppercase text-foreground">
                  Choose Stage Visual
                </h3>
                <p className="text-xs text-muted-foreground">
                  Select an optimized library photo or upload a new image.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {canUploadMedia && (
                  <button
                    type="button"
                    onClick={() => uploadInputRef.current?.click()}
                    className="btn-red !py-1.5 !px-3.5 text-xs !normal-case cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" /> Upload New
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMediaPickerCallback(null)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
              {workspace.mediaAssets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => {
                    mediaPickerCallback(asset.publicUrl);
                    setMediaPickerCallback(null);
                  }}
                  className="group rounded-xl border border-border bg-background overflow-hidden text-left transition hover:border-primary cursor-pointer"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={asset.publicUrl}
                      alt={asset.altText}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </div>
                  <p className="p-2 text-[11px] font-bold text-foreground truncate">
                    {asset.title}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================================================================== */
/* STRUCTURED SECTION CONTENT INSPECTOR FOR ALL 13 BLOCK KINDS                */
/* ========================================================================== */

function ImageFieldControl({
  label,
  value,
  canEdit,
  onChange,
  onPick,
}: {
  label: string;
  value: string;
  canEdit: boolean;
  onChange: (val: string) => void;
  onPick: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="font-bold text-muted-foreground block text-xs">{label}</label>
      {value && (
        <div className="relative h-24 w-full overflow-hidden rounded-lg border border-border bg-muted">
          <img src={value} alt={label} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex gap-1.5">
        <input
          type="text"
          disabled={!canEdit}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... or choose from library"
          className="flex-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs"
        />
        {canEdit && (
          <button
            type="button"
            onClick={onPick}
            className="btn-outline !py-1.5 !px-2.5 text-xs !normal-case shrink-0 cursor-pointer"
          >
            Choose
          </button>
        )}
      </div>
    </div>
  );
}

function SectionContentInspector({
  section,
  canEdit,
  onChange,
  onPickImage,
}: {
  section: CmsPageSection;
  canEdit: boolean;
  onChange: (nextData: CmsPageSection["data"]) => void;
  onPickImage: (cb: (url: string) => void) => void;
}) {
  const d = section.data;

  if (d.kind === "hero") {
    return (
      <div className="space-y-3 text-xs">
        <div>
          <label className="font-bold text-muted-foreground block mb-1">
            Eyebrow Label
          </label>
          <input
            type="text"
            disabled={!canEdit}
            value={d.eyebrow}
            onChange={(e) => onChange({ ...d, eyebrow: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold"
          />
        </div>
        <div>
          <label className="font-bold text-muted-foreground block mb-1">
            Headline Lines (One per line)
          </label>
          <textarea
            rows={3}
            disabled={!canEdit}
            value={d.lines.join("\n")}
            onChange={(e) =>
              onChange({
                ...d,
                lines: e.target.value.split("\n").filter((l) => l.length > 0),
              })
            }
            className="w-full rounded-lg border border-input bg-background px-3 py-2 font-display text-xs font-bold"
          />
        </div>
        <div>
          <label className="font-bold text-muted-foreground block mb-1">
            Accent Color Starts From Line # (0-based)
          </label>
          <input
            type="number"
            min={0}
            max={4}
            disabled={!canEdit}
            value={d.redFrom}
            onChange={(e) => onChange({ ...d, redFrom: Number(e.target.value) || 0 })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
          />
        </div>
        <div>
          <label className="font-bold text-muted-foreground block mb-1">
            Lead Description
          </label>
          <textarea
            rows={3}
            disabled={!canEdit}
            value={d.description}
            onChange={(e) => onChange({ ...d, description: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
          />
        </div>
        <ImageFieldControl
          label="Hero Stage Image"
          value={d.image}
          canEdit={canEdit}
          onChange={(url) => onChange({ ...d, image: url })}
          onPick={() => onPickImage((url) => onChange({ ...d, image: url }))}
        />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="font-bold text-muted-foreground block mb-1">
              Primary Button
            </label>
            <input
              type="text"
              disabled={!canEdit}
              value={d.primaryCtaLabel}
              onChange={(e) => onChange({ ...d, primaryCtaLabel: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs"
            />
          </div>
          <div>
            <label className="font-bold text-muted-foreground block mb-1">
              Primary Link
            </label>
            <input
              type="text"
              disabled={!canEdit}
              value={d.primaryCtaHref}
              onChange={(e) => onChange({ ...d, primaryCtaHref: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 font-mono text-xs"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="font-bold text-muted-foreground block mb-1">
              Secondary Button
            </label>
            <input
              type="text"
              disabled={!canEdit}
              value={d.secondaryCtaLabel}
              onChange={(e) => onChange({ ...d, secondaryCtaLabel: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs"
            />
          </div>
          <div>
            <label className="font-bold text-muted-foreground block mb-1">
              Secondary Link
            </label>
            <input
              type="text"
              disabled={!canEdit}
              value={d.secondaryCtaHref}
              onChange={(e) => onChange({ ...d, secondaryCtaHref: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 font-mono text-xs"
            />
          </div>
        </div>
      </div>
    );
  }

  if (d.kind === "stats") {
    return (
      <div className="space-y-3 text-xs">
        <p className="font-bold text-muted-foreground">Milestone Counters</p>
        {d.items.map((it, idx) => (
          <div
            key={it.id}
            className="rounded-xl border border-border bg-background p-2.5 grid grid-cols-2 gap-2"
          >
            <div>
              <label className="text-[10px] font-bold text-muted-foreground block">
                Metric #{idx + 1} Value
              </label>
              <input
                type="text"
                disabled={!canEdit}
                value={it.value}
                placeholder="e.g. 600+"
                onChange={(e) =>
                  onChange({
                    ...d,
                    items: d.items.map((x) =>
                      x.id === it.id ? { ...x, value: e.target.value } : x
                    ),
                  })
                }
                className="w-full rounded border border-input bg-card px-2 py-1 text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground block">
                Label
              </label>
              <input
                type="text"
                disabled={!canEdit}
                value={it.label}
                onChange={(e) =>
                  onChange({
                    ...d,
                    items: d.items.map((x) =>
                      x.id === it.id ? { ...x, label: e.target.value } : x
                    ),
                  })
                }
                className="w-full rounded border border-input bg-card px-2 py-1 text-xs"
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (d.kind === "split_story") {
    return (
      <div className="space-y-3 text-xs">
        <div>
          <label className="font-bold text-muted-foreground block mb-1">Eyebrow</label>
          <input
            type="text"
            disabled={!canEdit}
            value={d.eyebrow}
            onChange={(e) => onChange({ ...d, eyebrow: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
          />
        </div>
        <div>
          <label className="font-bold text-muted-foreground block mb-1">Headline</label>
          <input
            type="text"
            disabled={!canEdit}
            value={d.title}
            onChange={(e) => onChange({ ...d, title: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-bold"
          />
        </div>
        <div>
          <label className="font-bold text-muted-foreground block mb-1">
            Highlighted Accent Line
          </label>
          <input
            type="text"
            disabled={!canEdit}
            value={d.highlightText}
            onChange={(e) => onChange({ ...d, highlightText: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-bold text-primary"
          />
        </div>
        <div>
          <label className="font-bold text-muted-foreground block mb-1">
            Story Paragraph
          </label>
          <textarea
            rows={4}
            disabled={!canEdit}
            value={d.body}
            onChange={(e) => onChange({ ...d, body: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
          />
        </div>
        <ImageFieldControl
          label="Feature Stage Photo"
          value={d.image}
          canEdit={canEdit}
          onChange={(url) => onChange({ ...d, image: url })}
          onPick={() => onPickImage((url) => onChange({ ...d, image: url }))}
        />
      </div>
    );
  }

  if (d.kind === "service_cards") {
    return (
      <div className="space-y-3 text-xs">
        <div>
          <label className="font-bold text-muted-foreground block mb-1">Eyebrow</label>
          <input
            type="text"
            disabled={!canEdit}
            value={d.eyebrow}
            onChange={(e) => onChange({ ...d, eyebrow: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="font-bold text-muted-foreground block mb-1">Title</label>
            <input
              type="text"
              disabled={!canEdit}
              value={d.title}
              onChange={(e) => onChange({ ...d, title: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-bold"
            />
          </div>
          <div>
            <label className="font-bold text-muted-foreground block mb-1">
              Highlight
            </label>
            <input
              type="text"
              disabled={!canEdit}
              value={d.highlightText}
              onChange={(e) => onChange({ ...d, highlightText: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-bold text-primary"
            />
          </div>
        </div>
        <div>
          <label className="font-bold text-muted-foreground block mb-1">
            Intro Paragraph
          </label>
          <textarea
            rows={2}
            disabled={!canEdit}
            value={d.subtitle}
            onChange={(e) => onChange({ ...d, subtitle: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs"
          />
        </div>
        <div className="space-y-2.5 pt-1">
          <p className="font-bold text-muted-foreground">Service Cards</p>
          {d.cards.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-border bg-background p-2.5 space-y-2"
            >
              <input
                type="text"
                disabled={!canEdit}
                value={c.title}
                onChange={(e) =>
                  onChange({
                    ...d,
                    cards: d.cards.map((x) =>
                      x.id === c.id ? { ...x, title: e.target.value } : x
                    ),
                  })
                }
                className="w-full rounded border border-input bg-card px-2.5 py-1.5 text-xs font-bold"
              />
              <textarea
                rows={2}
                disabled={!canEdit}
                value={c.description}
                onChange={(e) =>
                  onChange({
                    ...d,
                    cards: d.cards.map((x) =>
                      x.id === c.id ? { ...x, description: e.target.value } : x
                    ),
                  })
                }
                className="w-full rounded border border-input bg-card px-2.5 py-1 text-xs"
              />
              <ImageFieldControl
                label="Card Image"
                value={c.image}
                canEdit={canEdit}
                onChange={(url) =>
                  onChange({
                    ...d,
                    cards: d.cards.map((x) =>
                      x.id === c.id ? { ...x, image: url } : x
                    ),
                  })
                }
                onPick={() =>
                  onPickImage((url) =>
                    onChange({
                      ...d,
                      cards: d.cards.map((x) =>
                        x.id === c.id ? { ...x, image: url } : x
                      ),
                    })
                  )
                }
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (d.kind === "feature_grid") {
    return (
      <div className="space-y-3 text-xs">
        <div>
          <label className="font-bold text-muted-foreground block mb-1">Eyebrow</label>
          <input
            type="text"
            disabled={!canEdit}
            value={d.eyebrow}
            onChange={(e) => onChange({ ...d, eyebrow: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs"
          />
        </div>
        <div>
          <label className="font-bold text-muted-foreground block mb-1">Heading</label>
          <input
            type="text"
            disabled={!canEdit}
            value={d.title}
            onChange={(e) => onChange({ ...d, title: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-bold"
          />
        </div>
        <div className="space-y-2">
          {d.items.map((it) => (
            <div
              key={it.id}
              className="rounded-xl border border-border bg-background p-2.5 space-y-1.5"
            >
              <input
                type="text"
                disabled={!canEdit}
                value={it.title}
                onChange={(e) =>
                  onChange({
                    ...d,
                    items: d.items.map((x) =>
                      x.id === it.id ? { ...x, title: e.target.value } : x
                    ),
                  })
                }
                className="w-full rounded border border-input bg-card px-2 py-1 text-xs font-bold"
              />
              {d.variant !== "formats_strip" && (
                <input
                  type="text"
                  disabled={!canEdit}
                  value={it.description}
                  onChange={(e) =>
                    onChange({
                      ...d,
                      items: d.items.map((x) =>
                        x.id === it.id ? { ...x, description: e.target.value } : x
                      ),
                    })
                  }
                  className="w-full rounded border border-input bg-card px-2 py-1 text-xs"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (d.kind === "highlights_gallery") {
    return (
      <div className="space-y-3 text-xs">
        <div>
          <label className="font-bold text-muted-foreground block mb-1">Eyebrow</label>
          <input
            type="text"
            disabled={!canEdit}
            value={d.eyebrow}
            onChange={(e) => onChange({ ...d, eyebrow: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs"
          />
        </div>
        <div>
          <label className="font-bold text-muted-foreground block mb-1">Title</label>
          <input
            type="text"
            disabled={!canEdit}
            value={d.title}
            onChange={(e) => onChange({ ...d, title: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-bold"
          />
        </div>
        {d.displayMode === "portfolio_full" && (
          <>
            <div>
              <label className="font-bold text-muted-foreground block mb-1">
                Showreel Title
              </label>
              <input
                type="text"
                disabled={!canEdit}
                value={d.featuredVideoTitle}
                onChange={(e) =>
                  onChange({ ...d, featuredVideoTitle: e.target.value })
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold"
              />
            </div>
            <ImageFieldControl
              label="Featured Showreel Cover"
              value={d.featuredVideoImage}
              canEdit={canEdit}
              onChange={(url) => onChange({ ...d, featuredVideoImage: url })}
              onPick={() =>
                onPickImage((url) => onChange({ ...d, featuredVideoImage: url }))
              }
            />
          </>
        )}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-muted-foreground">
              Visual Items ({d.items.length})
            </span>
            {canEdit && (
              <button
                type="button"
                onClick={() =>
                  onPickImage((url) =>
                    onChange({
                      ...d,
                      items: [
                        {
                          id: `med_${Date.now().toString(36)}`,
                          title: "New Stage Highlight",
                          subtitle: "2026 Showcase",
                          category: d.categories[1] || "Corporate",
                          image: url,
                          isVideo: false,
                          span: "md:col-span-4",
                          audience: "1,000+ Guests",
                          location: "Mumbai",
                          summary: "High-energy stage hosting moment.",
                          clientQuote: "Unforgettable presence.",
                        },
                        ...d.items,
                      ],
                    })
                  )
                }
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                + Add Photo
              </button>
            )}
          </div>
          {d.items.slice(0, 8).map((it) => (
            <div
              key={it.id}
              className="rounded-xl border border-border bg-background p-2 flex items-center gap-2"
            >
              <img
                src={it.image}
                alt={it.title}
                className="h-10 w-14 rounded object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  disabled={!canEdit}
                  value={it.title}
                  onChange={(e) =>
                    onChange({
                      ...d,
                      items: d.items.map((x) =>
                        x.id === it.id ? { ...x, title: e.target.value } : x
                      ),
                    })
                  }
                  className="w-full bg-transparent text-xs font-bold focus:outline-none"
                />
                <p className="text-[10px] text-muted-foreground">{it.category}</p>
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() =>
                    onPickImage((url) =>
                      onChange({
                        ...d,
                        items: d.items.map((x) =>
                          x.id === it.id ? { ...x, image: url } : x
                        ),
                      })
                    )
                  }
                  className="rounded border border-border px-2 py-1 text-[10px] font-bold hover:bg-accent cursor-pointer"
                >
                  Swap
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (d.kind === "packages_addons") {
    return (
      <div className="space-y-3 text-xs">
        <div>
          <label className="font-bold text-muted-foreground block mb-1">
            Add-ons Heading
          </label>
          <input
            type="text"
            disabled={!canEdit}
            value={d.addonsTitle}
            onChange={(e) => onChange({ ...d, addonsTitle: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-bold"
          />
        </div>
        <div>
          <label className="font-bold text-muted-foreground block mb-1">
            Add-on Services (One per line)
          </label>
          <textarea
            rows={4}
            disabled={!canEdit}
            value={d.addonsList.join("\n")}
            onChange={(e) =>
              onChange({
                ...d,
                addonsList: e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs"
          />
        </div>
        <p className="font-bold text-muted-foreground pt-1">Engagement Packages</p>
        {d.packages.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-border bg-background p-2.5 space-y-1.5"
          >
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="text"
                disabled={!canEdit}
                value={p.title}
                onChange={(e) =>
                  onChange({
                    ...d,
                    packages: d.packages.map((x) =>
                      x.id === p.id ? { ...x, title: e.target.value } : x
                    ),
                  })
                }
                className="rounded border border-input bg-card px-2 py-1 text-xs font-bold"
              />
              <input
                type="text"
                disabled={!canEdit}
                value={p.fee}
                onChange={(e) =>
                  onChange({
                    ...d,
                    packages: d.packages.map((x) =>
                      x.id === p.id ? { ...x, fee: e.target.value } : x
                    ),
                  })
                }
                className="rounded border border-input bg-card px-2 py-1 font-mono text-xs font-bold text-primary"
              />
            </div>
            <textarea
              rows={2}
              disabled={!canEdit}
              value={p.description}
              onChange={(e) =>
                onChange({
                  ...d,
                  packages: d.packages.map((x) =>
                    x.id === p.id ? { ...x, description: e.target.value } : x
                  ),
                })
              }
              className="w-full rounded border border-input bg-card px-2 py-1 text-xs"
            />
          </div>
        ))}
      </div>
    );
  }

  if (d.kind === "languages_strengths") {
    return (
      <div className="space-y-3 text-xs">
        <div>
          <label className="font-bold text-muted-foreground block mb-1">
            Languages (Comma separated)
          </label>
          <input
            type="text"
            disabled={!canEdit}
            value={d.languages.join(", ")}
            onChange={(e) =>
              onChange({
                ...d,
                languages: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold"
          />
        </div>
        <div>
          <label className="font-bold text-muted-foreground block mb-1">
            Professional Strengths (One per line)
          </label>
          <textarea
            rows={5}
            disabled={!canEdit}
            value={d.strengths.join("\n")}
            onChange={(e) =>
              onChange({
                ...d,
                strengths: e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
          />
        </div>
      </div>
    );
  }

  if (d.kind === "faq") {
    return (
      <div className="space-y-3 text-xs">
        <div>
          <label className="font-bold text-muted-foreground block mb-1">Heading</label>
          <input
            type="text"
            disabled={!canEdit}
            value={d.title}
            onChange={(e) => onChange({ ...d, title: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-bold"
          />
        </div>
        {d.items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-border bg-background p-2.5 space-y-1.5"
          >
            <input
              type="text"
              disabled={!canEdit}
              value={item.question}
              onChange={(e) =>
                onChange({
                  ...d,
                  items: d.items.map((x) =>
                    x.id === item.id ? { ...x, question: e.target.value } : x
                  ),
                })
              }
              className="w-full rounded border border-input bg-card px-2 py-1 text-xs font-bold"
            />
            <textarea
              rows={2}
              disabled={!canEdit}
              value={item.answer}
              onChange={(e) =>
                onChange({
                  ...d,
                  items: d.items.map((x) =>
                    x.id === item.id ? { ...x, answer: e.target.value } : x
                  ),
                })
              }
              className="w-full rounded border border-input bg-card px-2 py-1 text-xs"
            />
          </div>
        ))}
        {canEdit && (
          <button
            type="button"
            onClick={() =>
              onChange({
                ...d,
                items: [
                  ...d.items,
                  {
                    id: `fq_${Date.now().toString(36)}`,
                    question: "New Frequently Asked Question?",
                    answer: "Clear, helpful answer for event organizers.",
                  },
                ],
              })
            }
            className="btn-outline w-full !py-1.5 text-xs !normal-case cursor-pointer"
          >
            + Add Question
          </button>
        )}
      </div>
    );
  }

  if (d.kind === "testimonials") {
    return (
      <div className="space-y-3 text-xs">
        <div>
          <label className="font-bold text-muted-foreground block mb-1">Heading</label>
          <input
            type="text"
            disabled={!canEdit}
            value={d.title}
            onChange={(e) => onChange({ ...d, title: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-bold"
          />
        </div>
        {d.items.map((t) => (
          <div
            key={t.id}
            className="rounded-xl border border-border bg-background p-2.5 space-y-1.5"
          >
            <input
              type="text"
              disabled={!canEdit}
              value={t.author}
              onChange={(e) =>
                onChange({
                  ...d,
                  items: d.items.map((x) =>
                    x.id === t.id ? { ...x, author: e.target.value } : x
                  ),
                })
              }
              className="w-full rounded border border-input bg-card px-2 py-1 text-xs font-bold"
            />
            <input
              type="text"
              disabled={!canEdit}
              value={t.role}
              onChange={(e) =>
                onChange({
                  ...d,
                  items: d.items.map((x) =>
                    x.id === t.id ? { ...x, role: e.target.value } : x
                  ),
                })
              }
              className="w-full rounded border border-input bg-card px-2 py-1 text-[11px]"
            />
            <textarea
              rows={2}
              disabled={!canEdit}
              value={t.quote}
              onChange={(e) =>
                onChange({
                  ...d,
                  items: d.items.map((x) =>
                    x.id === t.id ? { ...x, quote: e.target.value } : x
                  ),
                })
              }
              className="w-full rounded border border-input bg-card px-2 py-1 text-xs"
            />
          </div>
        ))}
      </div>
    );
  }

  if (d.kind === "brands") {
    return (
      <div className="space-y-3 text-xs">
        <div>
          <label className="font-bold text-muted-foreground block mb-1">Eyebrow</label>
          <input
            type="text"
            disabled={!canEdit}
            value={d.eyebrow}
            onChange={(e) => onChange({ ...d, eyebrow: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs"
          />
        </div>
        <div>
          <label className="font-bold text-muted-foreground block mb-1">
            Client &amp; Partner Wordmarks (Comma separated)
          </label>
          <textarea
            rows={3}
            disabled={!canEdit}
            value={d.brands.join(", ")}
            onChange={(e) =>
              onChange({
                ...d,
                brands: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold"
          />
        </div>
      </div>
    );
  }

  if (d.kind === "contact_hub") {
    return (
      <div className="space-y-3 text-xs">
        <div>
          <label className="font-bold text-muted-foreground block mb-1">
            Form Card Heading
          </label>
          <input
            type="text"
            disabled={!canEdit}
            value={d.formHeading}
            onChange={(e) => onChange({ ...d, formHeading: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-bold"
          />
        </div>
        <div>
          <label className="font-bold text-muted-foreground block mb-1">
            Form Card Subheading
          </label>
          <textarea
            rows={2}
            disabled={!canEdit}
            value={d.formSubheading}
            onChange={(e) => onChange({ ...d, formSubheading: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs"
          />
        </div>
        <label className="flex items-center gap-2 font-semibold cursor-pointer">
          <input
            type="checkbox"
            disabled={!canEdit}
            checked={d.showLiveStageCalendarStrip}
            onChange={(e) =>
              onChange({ ...d, showLiveStageCalendarStrip: e.target.checked })
            }
            className="h-4 w-4"
          />
          <span>Show Live Locked Stage Dates Strip</span>
        </label>
        <p className="font-bold text-muted-foreground pt-1">Direct Contact Channels</p>
        {d.channels.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-border bg-background p-2.5 space-y-1.5"
          >
            <input
              type="text"
              disabled={!canEdit}
              value={c.label}
              onChange={(e) =>
                onChange({
                  ...d,
                  channels: d.channels.map((x) =>
                    x.id === c.id ? { ...x, label: e.target.value } : x
                  ),
                })
              }
              className="w-full rounded border border-input bg-card px-2 py-1 text-xs font-bold"
            />
            <input
              type="text"
              disabled={!canEdit}
              value={c.value}
              onChange={(e) =>
                onChange({
                  ...d,
                  channels: d.channels.map((x) =>
                    x.id === c.id ? { ...x, value: e.target.value } : x
                  ),
                })
              }
              className="w-full rounded border border-input bg-card px-2 py-1 text-xs"
            />
            <input
              type="text"
              disabled={!canEdit}
              value={c.href}
              onChange={(e) =>
                onChange({
                  ...d,
                  channels: d.channels.map((x) =>
                    x.id === c.id ? { ...x, href: e.target.value } : x
                  ),
                })
              }
              className="w-full rounded border border-input bg-card px-2 py-1 font-mono text-[11px]"
            />
          </div>
        ))}
      </div>
    );
  }

  if (d.kind === "cta_banner") {
    return (
      <div className="space-y-3 text-xs">
        <div>
          <label className="font-bold text-muted-foreground block mb-1">
            Main Title Line
          </label>
          <input
            type="text"
            disabled={!canEdit}
            value={d.title}
            onChange={(e) => onChange({ ...d, title: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-bold"
          />
        </div>
        <div>
          <label className="font-bold text-muted-foreground block mb-1">
            Highlighted Line
          </label>
          <input
            type="text"
            disabled={!canEdit}
            value={d.highlightText}
            onChange={(e) => onChange({ ...d, highlightText: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-bold text-primary"
          />
        </div>
        <div>
          <label className="font-bold text-muted-foreground block mb-1">Subtitle</label>
          <input
            type="text"
            disabled={!canEdit}
            value={d.subtitle}
            onChange={(e) => onChange({ ...d, subtitle: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs"
          />
        </div>
        <div>
          <label className="font-bold text-muted-foreground block mb-1">
            Primary CTA Button Text
          </label>
          <input
            type="text"
            disabled={!canEdit}
            value={d.primaryLabel}
            onChange={(e) => onChange({ ...d, primaryLabel: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold"
          />
        </div>
      </div>
    );
  }

  return null;
}

