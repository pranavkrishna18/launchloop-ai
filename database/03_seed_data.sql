-- ============================================================================
-- LaunchLoop AI — Baseline Campaign Data (03_seed_data.sql)
-- Initializes the primary workshop campaign and baseline copy variants.
-- Clean and truthful: Does NOT create fake students or artificial registrations.
-- All metrics start at 0 to accurately track the 500-student growth objective.
-- ============================================================================

-- 1. Insert Target Campaign (Active by default)
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

-- 2. Insert Baseline Promotional Variants (Copy Lab Templates)
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
