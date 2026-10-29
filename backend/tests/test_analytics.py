"""Automated unit and integration tests for Phase 4 Analytics & AI Growth Intelligence.
"""

import json
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from main import app
from app.core.config import settings
from app.schemas.analytics import (
    CampaignOverviewKPIs,
    GrowthRecommendationItem,
    AIGrowthIntelligenceResponse
)
from app.services.analytics_service import AnalyticsService
from app.services.growth_ai_service import GrowthAIService


@pytest.fixture
def client():
    return TestClient(app)


# --- Security & Auth Tests for All Analytics Endpoints ---

ANALYTICS_ENDPOINTS = [
    ("/api/v1/analytics/overview", "GET"),
    ("/api/v1/analytics/registrations/daily", "GET"),
    ("/api/v1/analytics/channels", "GET"),
    ("/api/v1/analytics/referrals", "GET"),
    ("/api/v1/analytics/ai-usage", "GET"),
    ("/api/v1/analytics/copy-variants", "GET"),
    ("/api/v1/analytics/ai-growth-insights", "POST"),
]


@pytest.mark.parametrize("endpoint,method", ANALYTICS_ENDPOINTS)
def test_analytics_endpoints_require_auth(client, endpoint, method):
    """Every admin analytics endpoint must return 401 when no auth header is provided."""
    if method == "GET":
        res = client.get(endpoint)
    else:
        res = client.post(endpoint)
    assert res.status_code == 401
    assert "Authentication required" in res.json()["detail"]


@pytest.mark.parametrize("endpoint,method", ANALYTICS_ENDPOINTS)
def test_analytics_endpoints_reject_invalid_secret(client, endpoint, method):
    """Every admin analytics endpoint must return 403 when given invalid admin passkey."""
    headers = {"X-Admin-Secret": "wrong-secret"}
    if method == "GET":
        res = client.get(endpoint, headers=headers)
    else:
        res = client.post(endpoint, headers=headers)
    assert res.status_code == 403
    assert "Invalid admin credentials" in res.json()["detail"]


def test_dev_admin_secret_succeeds_in_development(client):
    """Valid dev secret grants organizer access when ENVIRONMENT != production."""
    headers = {"X-Admin-Secret": settings.ADMIN_DEMO_SECRET}
    res = client.get("/api/v1/analytics/overview", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "target_registrations" in data
    assert data["target_registrations"] == 500


def test_admin_secret_strictly_forbidden_in_production(client, monkeypatch):
    """Dev secret is permanently disabled and forbidden in production."""
    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    headers = {"X-Admin-Secret": settings.ADMIN_DEMO_SECRET}
    res = client.get("/api/v1/analytics/overview", headers=headers)
    assert res.status_code == 403
    assert "permanently disabled in production" in res.json()["detail"]


# --- Analytics KPI Calculation & Formula Tests ---

def test_kpi_formulas_and_zero_denominators():
    """Verify core math for target achievement, remaining registrations, and budget allocation."""
    service = AnalyticsService()
    
    mock_db = MagicMock()
    service.db = MagicMock()
    service.db.get_client.return_value = mock_db

    # Mock campaign
    mock_db.table().select().eq().execute.side_effect = [
        MagicMock(data=[{
            "id": "c0000000-0000-0000-0000-000000000001",
            "slug": "ai-in-60-mins",
            "title": "Build Your First AI Project in 60 Minutes",
            "target_registrations": 500,
            "budget_inr": 2000.0
        }]),
        # Registrations: 3 real, 2 seed
        MagicMock(data=[
            {"id": "r1", "is_seed": False, "referral_code_used": None, "registered_at": "2026-10-28T10:00:00Z"},
            {"id": "r2", "is_seed": False, "referral_code_used": "NXTAAR01", "registered_at": "2026-10-28T11:00:00Z"},
            {"id": "r3", "is_seed": False, "referral_code_used": "NXTAAR01", "registered_at": "2026-10-28T12:00:00Z"},
            {"id": "s1", "is_seed": True, "referral_code_used": None, "registered_at": "2026-10-28T09:00:00Z"},
            {"id": "s2", "is_seed": True, "referral_code_used": None, "registered_at": "2026-10-28T09:30:00Z"},
        ]),
        # Referral links
        MagicMock(data=[
            {"id": "l1", "clicks_count": 20, "conversions_count": 2}
        ])
    ]

    kpis = service.get_campaign_overview("ai-in-60-mins")

    # Formula 1: Real vs Seed segregation
    assert kpis.real_registrations == 3
    assert kpis.seed_registrations == 2

    # Formula 2: Target achievement % = (3 / 500) * 100 = 0.6%
    assert kpis.target_achievement_percentage == 0.6
    assert kpis.remaining_registrations == 497

    # Formula 3: Budget allocation per registration = ₹2,000 / 3 = ₹666.67
    assert kpis.budget_allocation_per_registration_inr == 666.67

    # Formula 4: Referral conversion rate = (2 / 20) * 100 = 10.0%
    assert kpis.referral_clicks == 20
    assert kpis.referral_conversions == 2
    assert kpis.referral_conversion_rate_percentage == 10.0


def test_zero_denominator_safe_handling():
    """When registrations and clicks are zero, calculations must not raise ZeroDivisionError."""
    service = AnalyticsService()
    mock_db = MagicMock()
    service.db = MagicMock()
    service.db.get_client.return_value = mock_db

    mock_db.table().select().eq().execute.side_effect = [
        MagicMock(data=[{
            "id": "c0000000-0000-0000-0000-000000000001",
            "slug": "ai-in-60-mins",
            "title": "Build Your First AI Project in 60 Minutes",
            "target_registrations": 500,
            "budget_inr": 2000.0
        }]),
        # 0 registrations
        MagicMock(data=[]),
        # 0 referral links
        MagicMock(data=[])
    ]

    kpis = service.get_campaign_overview("ai-in-60-mins")
    assert kpis.real_registrations == 0
    assert kpis.target_achievement_percentage == 0.0
    assert kpis.remaining_registrations == 500
    assert kpis.budget_allocation_per_registration_inr is None
    assert kpis.referral_clicks == 0
    assert kpis.referral_conversions == 0
    assert kpis.referral_conversion_rate_percentage is None


def test_channel_attribution_calculation():
    """Verify UTM channel aggregation and percentage calculations."""
    service = AnalyticsService()
    mock_db = MagicMock()
    service.db = MagicMock()
    service.db.get_client.return_value = mock_db

    def table_router(table_name):
        t_mock = MagicMock()
        if table_name == "campaigns":
            t_mock.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[{"id": "c1", "slug": "ai-in-60-mins"}])
        elif table_name == "registrations":
            t_mock.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[
                {"utm_source": "whatsapp", "utm_medium": "college_group", "is_seed": False},
                {"utm_source": "whatsapp", "utm_medium": "college_group", "is_seed": False},
                {"utm_source": "whatsapp", "utm_medium": "peer_dm", "is_seed": False},
                {"utm_source": "linkedin", "utm_medium": "feed_post", "is_seed": False},
            ])
        return t_mock

    mock_db.table.side_effect = table_router

    channels_resp = service.get_channel_attribution("ai-in-60-mins")
    assert channels_resp.total_real_registrations == 4
    assert len(channels_resp.channels) == 2

    # Top channel should be whatsapp (3/4 = 75%)
    top = channels_resp.channels[0]
    assert top.channel == "whatsapp"
    assert top.registrations_count == 3
    assert top.percentage_of_total == 75.0
    assert len(top.mediums) == 2


# --- AI Growth Intelligence & Privacy Sanitization Tests ---

def test_sanitized_summary_contains_zero_pii():
    """Verify that NO student names, emails, phones, tokens, or IP addresses are passed to AI."""
    growth_service = GrowthAIService()
    summary = growth_service.build_sanitized_summary("ai-in-60-mins")

    # Serialize to JSON string to check against any forbidden PII keys
    serialized = json.dumps(summary).lower()
    forbidden_tokens = ["email", "student_access_token", "visitor_ip_hash", "phone", "password", "secret", "student_id"]
    for token in forbidden_tokens:
        assert token not in serialized, f"Forbidden PII token '{token}' leaked into AI summary!"


def test_growth_ai_heuristic_fallback_when_gemini_offline():
    """When Gemini is not configured, service generates transparent heuristic diagnostic."""
    growth_service = GrowthAIService()
    summary = {
        "campaign_title": "Build Your First AI Project in 60 Minutes",
        "target_registrations": 500,
        "real_registrations": 5,
        "target_achievement_pct": 1.0,
        "remaining_to_target": 495,
        "total_budget_inr": 2000.0,
        "budget_allocation_per_reg_inr": 400.0,
        "referral_clicks": 10,
        "referral_conversions": 1,
        "referral_conversion_rate_pct": 10.0,
        "top_channels": [{"channel": "whatsapp", "registrations": 4, "share_pct": 80.0}],
        "data_status": "live"
    }

    result = growth_service.generate_heuristic_fallback(summary, "Test Fallback Activation")
    assert result.is_ai_generated is False
    assert result.provider == "heuristic-diagnostic-engine"
    assert result.model == "rule-based-heuristics"
    assert len(result.recommendations) >= 3

    for rec in result.recommendations:
        assert rec.title
        assert rec.observed_evidence
        assert rec.proposed_action
        assert rec.rationale
        assert rec.effort in ("Low", "Medium", "High")
        assert "Hypothesis" in rec.expected_impact or "estimate" in rec.expected_impact.lower()


def test_growth_ai_endpoint_with_auth(client):
    """POST /api/v1/analytics/ai-growth-insights returns structured recommendations when authenticated."""
    headers = {"X-Admin-Secret": settings.ADMIN_DEMO_SECRET}
    res = client.post("/api/v1/analytics/ai-growth-insights?campaign_slug=ai-in-60-mins", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "recommendations" in data
    assert len(data["recommendations"]) >= 3
    assert "disclaimer" in data
