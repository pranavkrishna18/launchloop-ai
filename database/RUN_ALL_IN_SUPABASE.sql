-- ============================================================================
-- LaunchLoop AI — Complete One-Click Supabase Setup Script
-- Combines 01_schema.sql, 02_rls_policies.sql, and 03_seed_data.sql
-- Paste and run this once in https://supabase.com/dashboard/project/alspsjdgtacgmacrzmfh/sql/new
-- ============================================================================

-- Enable pgcrypto for UUID generation and cryptographic hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. CAMPAIGNS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    target_registrations INTEGER NOT NULL DEFAULT 500 CHECK (target_registrations > 0),
    budget_inr NUMERIC(10, 2) NOT NULL DEFAULT 2000.00 CHECK (budget_inr >= 0),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. STUDENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    college VARCHAR(255) NOT NULL,
    graduation_year INTEGER NOT NULL CHECK (graduation_year BETWEEN 2024 AND 2030),
    student_access_token VARCHAR(64) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_students_email_unique ON students (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_students_token ON students (student_access_token);

-- ----------------------------------------------------------------------------
-- 3. REGISTRATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE RESTRICT,
    referral_code_used VARCHAR(16) DEFAULT NULL,
    utm_source VARCHAR(64) NOT NULL DEFAULT 'direct',
    utm_medium VARCHAR(64) DEFAULT NULL,
    utm_campaign VARCHAR(64) DEFAULT NULL,
    utm_content VARCHAR(64) DEFAULT NULL,
    is_seed BOOLEAN NOT NULL DEFAULT false,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_campaign UNIQUE (student_id, campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_registrations_campaign_time ON registrations (campaign_id, registered_at DESC);
CREATE INDEX IF NOT EXISTS idx_registrations_referral_code ON registrations (referral_code_used) WHERE referral_code_used IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_registrations_utm_source ON registrations (utm_source);
CREATE INDEX IF NOT EXISTS idx_registrations_is_seed ON registrations (is_seed);

-- ----------------------------------------------------------------------------
-- 4. REFERRAL_LINKS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS referral_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE RESTRICT,
    referral_code VARCHAR(16) UNIQUE NOT NULL,
    clicks_count INTEGER NOT NULL DEFAULT 0 CHECK (clicks_count >= 0),
    conversions_count INTEGER NOT NULL DEFAULT 0 CHECK (conversions_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_referral_campaign UNIQUE (student_id, campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_referral_links_code ON referral_links (referral_code);

-- ----------------------------------------------------------------------------
-- 5. REFERRAL_EVENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS referral_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_link_id UUID NOT NULL REFERENCES referral_links(id) ON DELETE CASCADE,
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('click', 'conversion')),
    visitor_ip_hash VARCHAR(64) DEFAULT NULL,
    registered_student_id UUID DEFAULT NULL REFERENCES students(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_events_link_type ON referral_events (referral_link_id, event_type);
CREATE INDEX IF NOT EXISTS idx_referral_events_created_at ON referral_events (created_at);

-- ----------------------------------------------------------------------------
-- 6. CAMPAIGN_VARIANTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaign_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE RESTRICT,
    variant_key VARCHAR(64) UNIQUE NOT NULL,
    channel VARCHAR(64) NOT NULL,
    target_segment VARCHAR(255) NOT NULL,
    headline TEXT NOT NULL,
    body_copy TEXT NOT NULL,
    cta_text VARCHAR(100) NOT NULL,
    impressions INTEGER NOT NULL DEFAULT 0 CHECK (impressions >= 0),
    clicks INTEGER NOT NULL DEFAULT 0 CHECK (clicks >= 0),
    registrations INTEGER NOT NULL DEFAULT 0 CHECK (registrations >= 0),
    is_seed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_variants_channel ON campaign_variants (channel);

-- ----------------------------------------------------------------------------
-- 7. AI_GENERATION_LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_generation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(64) NOT NULL,
    feature_type VARCHAR(32) NOT NULL CHECK (feature_type IN ('magnet', 'growth_insights', 'copy_lab')),
    input_hash VARCHAR(64) NOT NULL,
    provider_used VARCHAR(64) NOT NULL,
    latency_ms INTEGER NOT NULL CHECK (latency_ms >= 0),
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'fallback', 'error')),
    is_fallback BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_logs_feature_time ON ai_generation_logs (feature_type, created_at DESC);

-- ----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_logs ENABLE ROW LEVEL SECURITY;

-- Campaigns: Public can read active campaigns
DROP POLICY IF EXISTS "Public can view active campaigns" ON campaigns;
CREATE POLICY "Public can view active campaigns"
ON campaigns FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Protect student roster from public scraping
DROP POLICY IF EXISTS "Deny public access to student roster" ON students;
CREATE POLICY "Deny public access to student roster"
ON students FOR SELECT
TO anon
USING (false);

-- Protect registrations from public scraping
DROP POLICY IF EXISTS "Deny public select on registrations" ON registrations;
CREATE POLICY "Deny public select on registrations"
ON registrations FOR SELECT
TO anon
USING (false);

-- Protect referral links from public scraping
DROP POLICY IF EXISTS "Deny direct public select on referral links" ON referral_links;
CREATE POLICY "Deny direct public select on referral links"
ON referral_links FOR SELECT
TO anon
USING (false);

-- Protect referral events from public scraping
DROP POLICY IF EXISTS "Deny public read on referral events" ON referral_events;
CREATE POLICY "Deny public read on referral events"
ON referral_events FOR SELECT
TO anon
USING (false);

-- Campaign variants public read
DROP POLICY IF EXISTS "Public can view campaign copy variants" ON campaign_variants;
CREATE POLICY "Public can view campaign copy variants"
ON campaign_variants FOR SELECT
TO anon, authenticated
USING (true);

-- ----------------------------------------------------------------------------
-- 9. BASELINE SEED DATA
-- ----------------------------------------------------------------------------
INSERT INTO campaigns (
    id,
    slug,
    title,
    target_registrations,
    budget_inr,
    start_date,
    end_date,
    is_active
)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'ai-in-60-mins',
    'Build Your First AI Project in 60 Minutes',
    500,
    2000.00,
    NOW(),
    NOW() + INTERVAL '7 days',
    true
)
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    target_registrations = EXCLUDED.target_registrations,
    budget_inr = EXCLUDED.budget_inr,
    is_active = EXCLUDED.is_active;

INSERT INTO campaign_variants (
    campaign_id,
    variant_key,
    channel,
    target_segment,
    headline,
    body_copy,
    cta_text,
    impressions,
    clicks,
    registrations,
    is_seed
)
VALUES
    (
        'c0000000-0000-0000-0000-000000000001',
        'VAR-WA-CSE-01',
        'whatsapp',
        'Final Year CSE/IT students lacking AI project for resume',
        'Struggling with your Final Year AI Project? Build one in 60 minutes.',
        'Don''t spend months reading confusing research papers. Build and deploy a real working AI project with NxtWave this Sunday. Free verified certificate included.',
        'Claim Free Seat 👉',
        0,
        0,
        0,
        true
    ),
    (
        'c0000000-0000-0000-0000-000000000001',
        'VAR-LI-PLACEMENT-02',
        'linkedin',
        'Engineering students targeting upcoming AI/ML campus drives',
        'Stand out in campus placements with a working AI project on GitHub.',
        'Recruiters look for demonstrated project execution, not just certificates. In 60 minutes, code a full Computer Vision project and publish it live.',
        'Register in 30 Seconds',
        0,
        0,
        0,
        true
    )
ON CONFLICT (variant_key) DO UPDATE
SET headline = EXCLUDED.headline,
    body_copy = EXCLUDED.body_copy,
    cta_text = EXCLUDED.cta_text;

