-- ============================================================================
-- LaunchLoop AI — Row Level Security (RLS) Policies (02_rls_policies.sql)
-- Enforces least privilege across public, student-authenticated, and organizer roles.
-- Safe and idempotent: Drops existing policies before creating to allow clean re-runs.
-- ============================================================================

-- Enable RLS on all 7 tables
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 1. CAMPAIGNS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view active campaigns" ON campaigns;
CREATE POLICY "Public can view active campaigns"
ON campaigns FOR SELECT
TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "Organizers have full access to campaigns" ON campaigns;
CREATE POLICY "Organizers have full access to campaigns"
ON campaigns FOR ALL
TO authenticated
USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') IN ('organizer', 'admin')
    OR auth.jwt() ->> 'email' LIKE '%@nxtwave.tech'
);

-- ----------------------------------------------------------------------------
-- 2. STUDENTS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Deny public access to student roster" ON students;
CREATE POLICY "Deny public access to student roster"
ON students FOR SELECT
TO anon
USING (false);

DROP POLICY IF EXISTS "Organizers can view student directory" ON students;
CREATE POLICY "Organizers can view student directory"
ON students FOR SELECT
TO authenticated
USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') IN ('organizer', 'admin')
    OR auth.jwt() ->> 'email' LIKE '%@nxtwave.tech'
);

-- ----------------------------------------------------------------------------
-- 3. REGISTRATIONS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Deny public select on registrations" ON registrations;
CREATE POLICY "Deny public select on registrations"
ON registrations FOR SELECT
TO anon
USING (false);

DROP POLICY IF EXISTS "Organizers can view registrations" ON registrations;
CREATE POLICY "Organizers can view registrations"
ON registrations FOR SELECT
TO authenticated
USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') IN ('organizer', 'admin')
    OR auth.jwt() ->> 'email' LIKE '%@nxtwave.tech'
);

-- ----------------------------------------------------------------------------
-- 4. REFERRAL_LINKS & LEADERBOARD
-- ----------------------------------------------------------------------------
-- All referral validation and leaderboard rankings are mediated by the FastAPI backend
-- which queries via service_role and returns only sanitized, anonymized fields.
-- Direct anon access to the raw table is denied to prevent scraping of student UUIDs.
DROP POLICY IF EXISTS "Public can verify referral code validity" ON referral_links;
DROP POLICY IF EXISTS "Deny direct public select on referral links" ON referral_links;
CREATE POLICY "Deny direct public select on referral links"
ON referral_links FOR SELECT
TO anon
USING (false);

DROP POLICY IF EXISTS "Organizers can view referral links" ON referral_links;
CREATE POLICY "Organizers can view referral links"
ON referral_links FOR SELECT
TO authenticated
USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') IN ('organizer', 'admin')
    OR auth.jwt() ->> 'email' LIKE '%@nxtwave.tech'
);

-- ----------------------------------------------------------------------------
-- 5. REFERRAL_EVENTS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Deny public read on referral events" ON referral_events;
CREATE POLICY "Deny public read on referral events"
ON referral_events FOR SELECT
TO anon
USING (false);

DROP POLICY IF EXISTS "Organizers can view referral events" ON referral_events;
CREATE POLICY "Organizers can view referral events"
ON referral_events FOR SELECT
TO authenticated
USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') IN ('organizer', 'admin')
    OR auth.jwt() ->> 'email' LIKE '%@nxtwave.tech'
);

-- ----------------------------------------------------------------------------
-- 6. CAMPAIGN_VARIANTS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view campaign variants" ON campaign_variants;
CREATE POLICY "Public can view campaign variants"
ON campaign_variants FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Organizers can manage campaign variants" ON campaign_variants;
CREATE POLICY "Organizers can manage campaign variants"
ON campaign_variants FOR ALL
TO authenticated
USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') IN ('organizer', 'admin')
    OR auth.jwt() ->> 'email' LIKE '%@nxtwave.tech'
);

-- ----------------------------------------------------------------------------
-- 7. AI_GENERATION_LOGS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Deny public read on AI logs" ON ai_generation_logs;
CREATE POLICY "Deny public read on AI logs"
ON ai_generation_logs FOR SELECT
TO anon
USING (false);

DROP POLICY IF EXISTS "Organizers can view AI logs" ON ai_generation_logs;
CREATE POLICY "Organizers can view AI logs"
ON ai_generation_logs FOR SELECT
TO authenticated
USING (
    COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') IN ('organizer', 'admin')
    OR auth.jwt() ->> 'email' LIKE '%@nxtwave.tech'
);

-- Note: The FastAPI backend connects using the Supabase Service Role Key which
-- automatically bypasses RLS for trusted server-side transactions (registration inserts,
-- deduplication, and aggregated metrics). Application-level authorization guards
-- in FastAPI verify user roles before exposing organizer endpoints.
