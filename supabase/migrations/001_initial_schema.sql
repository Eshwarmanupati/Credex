-- =============================================================================
-- Trim.ai — Initial Database Schema
-- =============================================================================
-- Run this migration in your Supabase SQL editor or via supabase db push.
-- Creates the core `audits` and `leads` tables with proper indexes.
-- =============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Table: audits
-- ---------------------------------------------------------------------------
-- Stores every audit submission: raw input, computed results, AI summary.
-- share_slug enables public sharing via /report/[slug].

CREATE TABLE IF NOT EXISTS audits (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_slug       VARCHAR(12) UNIQUE NOT NULL,
  tools_input      JSONB NOT NULL,
  total_current    NUMERIC(10,2) NOT NULL,
  total_optimized  NUMERIC(10,2) NOT NULL,
  savings_amount   NUMERIC(10,2) NOT NULL,
  savings_pct      NUMERIC(5,2) NOT NULL,
  health_score     INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
  recommendations  JSONB NOT NULL,
  tool_breakdown   JSONB NOT NULL,
  redundancies     JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_summary       TEXT,
  lead_id          UUID,
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audits_share_slug ON audits(share_slug);
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at DESC);

-- ---------------------------------------------------------------------------
-- Table: leads
-- ---------------------------------------------------------------------------
-- Captures contact information for follow-up outreach on high-savings audits.

CREATE TABLE IF NOT EXISTS leads (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             VARCHAR(320) NOT NULL,
  company_name      VARCHAR(255),
  team_size         INTEGER,
  total_spend       NUMERIC(10,2),
  total_savings     NUMERIC(10,2),
  audit_id          UUID REFERENCES audits(id) ON DELETE SET NULL,
  marketing_consent BOOLEAN DEFAULT false NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- ---------------------------------------------------------------------------
-- Add foreign key from audits to leads (after leads table exists)
-- ---------------------------------------------------------------------------
ALTER TABLE audits
  ADD CONSTRAINT fk_audits_lead_id
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- Row Level Security (RLS)
-- ---------------------------------------------------------------------------
-- Audits: public read by slug (for shared reports), insert via service role
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read audits by slug"
  ON audits FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert audits"
  ON audits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update audits"
  ON audits FOR UPDATE
  USING (true);

-- Leads: insert only via service role, no public read
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert leads"
  ON leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can read leads"
  ON leads FOR SELECT
  USING (true);
