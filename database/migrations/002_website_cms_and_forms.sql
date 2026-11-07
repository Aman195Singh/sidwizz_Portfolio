-- ============================================================================
-- SIDD.WHIZZ — Migration 002: Website CMS, Controlled Theme Tokens,
-- Media Usage Safeguards & Dynamic Contact Form Builder
-- Target: Neon Serverless PostgreSQL 16+
-- Idempotent: Safe to re-run in any environment
-- ============================================================================

BEGIN;

-- 1. Global Site Settings & Branding Metadata (Draft + Published)
CREATE TABLE IF NOT EXISTS cms_site_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  draft_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by TEXT,
  published_by TEXT,
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Controlled Design & Theme Tokens (Fonts, OKLCH/Hex Palette, Component Presets)
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

-- 3. Global Navigation & Footer Menus (Draft + Published)
CREATE TABLE IF NOT EXISTS cms_navigation_menus (
  id TEXT PRIMARY KEY DEFAULT 'global',
  draft_navigation JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_navigation JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by TEXT,
  published_by TEXT,
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Public Website Pages (home, about, services, portfolio, gallery, contact)
CREATE TABLE IF NOT EXISTS cms_pages (
  slug TEXT PRIMARY KEY CHECK (slug IN ('home', 'about', 'services', 'portfolio', 'gallery', 'contact')),
  title TEXT NOT NULL,
  route_path TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'in_review', 'scheduled', 'published')),
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

CREATE INDEX IF NOT EXISTS idx_cms_pages_status
  ON cms_pages (status);

CREATE INDEX IF NOT EXISTS idx_cms_pages_scheduled_publish
  ON cms_pages (scheduled_publish_at)
  WHERE status = 'scheduled' AND scheduled_publish_at IS NOT NULL;

-- 5. Immutable Page Revision History & Atomic Rollback Snapshots
CREATE TABLE IF NOT EXISTS cms_page_revisions (
  id TEXT PRIMARY KEY,
  page_slug TEXT NOT NULL REFERENCES cms_pages(slug) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  label TEXT NOT NULL,
  workflow_status TEXT NOT NULL,
  sections_snapshot JSONB NOT NULL,
  seo_snapshot JSONB NOT NULL,
  theme_snapshot JSONB,
  created_by_id TEXT,
  created_by_email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (page_slug, version_number)
);

CREATE INDEX IF NOT EXISTS idx_cms_page_revisions_lookup
  ON cms_page_revisions (page_slug, version_number DESC);

-- 6. CMS Media Assets & Live Reference Usage Index (Prevents Broken Public Images)
CREATE TABLE IF NOT EXISTS cms_media_assets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video', 'document', 'audio')),
  storage_provider TEXT NOT NULL DEFAULT 'vercel_blob' CHECK (storage_provider IN ('vercel_blob', 'bundled_asset', 'inline_fallback')),
  public_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Stage Moments',
  mime_type TEXT NOT NULL DEFAULT 'image/jpeg',
  byte_size INTEGER NOT NULL DEFAULT 0,
  width INTEGER,
  height INTEGER,
  uploaded_by_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cms_media_assets_category
  ON cms_media_assets (category, created_at DESC);

CREATE TABLE IF NOT EXISTS cms_media_usages (
  id TEXT PRIMARY KEY,
  asset_url TEXT NOT NULL,
  page_slug TEXT NOT NULL,
  section_id TEXT NOT NULL,
  section_label TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('published', 'draft', 'seo')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cms_media_usages_url
  ON cms_media_usages (asset_url);

CREATE INDEX IF NOT EXISTS idx_cms_media_usages_page
  ON cms_media_usages (page_slug);

-- 7. Dynamic Contact Form Builder Definitions & Enriched CRM Submissions
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

CREATE TABLE IF NOT EXISTS cms_form_submissions (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL REFERENCES cms_forms(id) ON DELETE RESTRICT,
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
  crm_stage TEXT NOT NULL DEFAULT 'New' CHECK (crm_stage IN ('New', 'Contacted', 'Qualified', 'Converted', 'Closed')),
  assigned_staff_email TEXT,
  internal_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  ip_hash TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cms_form_submissions_crm
  ON cms_form_submissions (crm_stage, is_read, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_cms_form_submissions_assigned
  ON cms_form_submissions (assigned_staff_email)
  WHERE assigned_staff_email IS NOT NULL;

COMMIT;

