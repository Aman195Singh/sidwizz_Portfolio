-- ============================================================================
-- SIDD.WHIZZ — Migration 003: Enterprise Notification Manager & Alert Center
-- Multi-Role Engine (Admin, Organizer, Member), Real-time In-App, Infrastructure
-- Telemetry (Neon DB & Vercel Hosting), and Cross-Channel Notification Preferences.
-- Target: Neon Serverless PostgreSQL 16+
-- Idempotent: Safe to re-run in any environment
-- ============================================================================

BEGIN;

-- 1. Core Notifications Master Table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low', 'success')),
  role_target TEXT NOT NULL CHECK (role_target IN ('admin', 'client', 'member', 'all')),
  target_user_id TEXT,
  target_organization_id TEXT,
  event_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  link TEXT,
  action_label TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notifications_role ON notifications(role_target);
CREATE INDEX IF NOT EXISTS idx_notifications_target_user ON notifications(target_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 2. Notification Recipients & User Read/Archive States
CREATE TABLE IF NOT EXISTS notification_recipients (
  id TEXT PRIMARY KEY,
  notification_id TEXT NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_starred BOOLEAN NOT NULL DEFAULT FALSE,
  internal_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_notification_user UNIQUE (notification_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_notif_recip_user_read ON notification_recipients(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_notif_recip_archived ON notification_recipients(user_id, archived_at);
CREATE INDEX IF NOT EXISTS idx_notif_recip_pinned ON notification_recipients(user_id, is_pinned);

-- 3. Per-User Notification Channel & Category Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id TEXT PRIMARY KEY,
  in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  push_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  sound_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  critical_alerts_always_on BOOLEAN NOT NULL DEFAULT TRUE,
  category_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Infrastructure Telemetry & Operational Incident Alerts (Neon & Vercel)
CREATE TABLE IF NOT EXISTS infrastructure_telemetry (
  id TEXT PRIMARY KEY,
  service TEXT NOT NULL CHECK (service IN ('neon', 'vercel')),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'success')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_infra_service_time ON infrastructure_telemetry(service, timestamp DESC);

COMMIT;

