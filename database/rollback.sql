-- ============================================================================
-- LaunchLoop AI — Teardown & Reset Script (rollback.sql)
-- Drops all tables, triggers, and types in reverse dependency order.
-- ============================================================================

DROP TABLE IF EXISTS ai_generation_logs CASCADE;
DROP TABLE IF EXISTS campaign_variants CASCADE;
DROP TABLE IF EXISTS referral_events CASCADE;
DROP TABLE IF EXISTS referral_links CASCADE;
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
