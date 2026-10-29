-- ============================================================================
-- LaunchLoop AI — Optional Demonstration Simulation Data (04_demo_simulation_data.sql)
-- OPTIONAL: Run ONLY if you wish to pre-populate simulated student advocates
-- for UI demonstration and offline cohort evaluation.
-- Uses valid RFC-4122 hexadecimal UUIDs and sets is_seed = true.
-- ============================================================================

-- 1. Insert Sample Demonstration Students (RFC-4122 Hexadecimal UUIDs)
INSERT INTO students (id, full_name, email, college, graduation_year, student_access_token)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Aarav Sharma', 'aarav.seed@iitm.ac.in', 'IIT Madras', 2026, 'token_seed_aarav_001'),
    ('a0000000-0000-0000-0000-000000000002', 'Kavya Murthy', 'kavya.seed@nitt.edu', 'NIT Trichy', 2026, 'token_seed_kavya_002'),
    ('a0000000-0000-0000-0000-000000000003', 'Rahul Verma', 'rahul.seed@rvce.edu.in', 'RV College of Engineering', 2027, 'token_seed_rahul_003')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Demonstration Referral Links
INSERT INTO referral_links (id, student_id, campaign_id, referral_code, clicks_count, conversions_count)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'NXTAAR01', 42, 12),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'NXTKAV02', 31, 8),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'NXTRAH03', 19, 5)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Demonstration Registrations (is_seed = true)
INSERT INTO registrations (student_id, campaign_id, referral_code_used, utm_source, utm_medium, utm_campaign, is_seed)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', NULL, 'whatsapp', 'college_group', 'launch_blast', true),
    ('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'NXTAAR01', 'referral', 'peer_invite', 'peer_share', true),
    ('a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'NXTAAR01', 'referral', 'peer_invite', 'peer_share', true)
ON CONFLICT DO NOTHING;
