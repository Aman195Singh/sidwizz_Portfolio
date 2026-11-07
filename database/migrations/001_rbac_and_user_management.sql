-- ==============================================================================
-- SIDD.WHIZZ — Migration 001: Enterprise RBAC, Entitlements & User Governance
-- Compatible with Neon PostgreSQL 16+ (Idempotent, Non-Destructive Additive DDL)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Upgrade Legacy Users Table Non-Destructively
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_account_status_check'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_account_status_check
      CHECK (account_status IN ('pending_approval', 'active', 'suspended', 'deactivated'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- 2. Extended User Profiles & Default Data Access Scope
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  display_title TEXT,
  bio_summary TEXT,
  default_data_scope TEXT NOT NULL DEFAULT 'OWN'
    CHECK (default_data_scope IN ('GLOBAL', 'ORGANIZATION', 'ASSIGNED', 'OWN')),
  scoped_event_ids TEXT[] NOT NULL DEFAULT '{}',
  mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  internal_admin_notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Organizations & Memberships (Multi-Tenant Organizer Boundary)
CREATE TABLE IF NOT EXISTS organizations (
  id VARCHAR(64) PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  org_type TEXT NOT NULL DEFAULT 'Corporate / Agency',
  website TEXT,
  verification_status TEXT NOT NULL DEFAULT 'verified'
    CHECK (verification_status IN ('pending', 'verified', 'suspended')),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_memberships (
  id VARCHAR(64) PRIMARY KEY,
  organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_role TEXT NOT NULL DEFAULT 'owner' CHECK (org_role IN ('owner', 'manager', 'coordinator')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_memberships_user ON organization_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_org_memberships_org ON organization_memberships(organization_id);

-- 4. Controlled Organizer Onboarding Applications
CREATE TABLE IF NOT EXISTS organizer_applications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  organization_name TEXT NOT NULL,
  organization_type TEXT NOT NULL DEFAULT 'Corporate Brand',
  website_or_social TEXT,
  expected_event_formats TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'approved', 'changes_requested', 'rejected')),
  reviewed_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  review_reason TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizer_apps_status ON organizer_applications(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_organizer_apps_user ON organizer_applications(user_id);

-- 5. Granular RBAC Roles & Permissions
CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(64) PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  is_system_protected BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
  id VARCHAR(64) PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  module TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  is_critical BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id VARCHAR(64) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id VARCHAR(64) NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_perm ON role_permissions(permission_id);

CREATE TABLE IF NOT EXISTS user_roles (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id VARCHAR(64) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);

-- 6. Explicit User-Level Permission Overrides (Allow / Deny with Mandatory Reason)
CREATE TABLE IF NOT EXISTS user_permission_overrides (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL,
  effect TEXT NOT NULL CHECK (effect IN ('allow', 'deny')),
  reason TEXT NOT NULL,
  granted_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, permission_key)
);

CREATE INDEX IF NOT EXISTS idx_user_perm_overrides_user ON user_permission_overrides(user_id);

-- 7. Hierarchical Feature Entitlements (Global / Role / Organization / User)
CREATE TABLE IF NOT EXISTS feature_entitlements (
  id VARCHAR(64) PRIMARY KEY,
  feature_key TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('global', 'role', 'organization', 'user')),
  target_id TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (feature_key, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_feature_entitlements_target ON feature_entitlements(target_type, target_id);

-- 8. Server-Verified User Sessions (Hashed Cookie Token — Never Raw Secret)
CREATE TABLE IF NOT EXISTS user_sessions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  device_label TEXT,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active_hash ON user_sessions(token_hash) WHERE revoked_at IS NULL;

-- 9. Immutable Append-Only Security & Operational Audit Trail
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  actor_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  actor_email TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action_key TEXT NOT NULL,
  module TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  before_state JSONB,
  after_state JSONB,
  ip_address TEXT,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id, created_at DESC);

-- 10. Soft-Delete Governance Columns on Operational Tables
ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS assigned_user_id VARCHAR(64);
ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS organization_id VARCHAR(64);

ALTER TABLE events ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE events ADD COLUMN IF NOT EXISTS organization_id VARCHAR(64);

ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

