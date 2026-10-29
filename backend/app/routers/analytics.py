"""FastAPI Router for Organizer Campaign Analytics & AI Growth Intelligence.

All endpoints are strictly protected by `verify_organizer_access`.
Excludes seed data from authentic growth calculations.
"""

import logging
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from app.core.security import verify_organizer_access
from app.schemas.analytics import (
    CampaignOverviewKPIs,
    DailyRegistrationResponse,
    ChannelAttributionResponse,
    ReferralAnalyticsResponse,
    AIUsageTelemetryResponse,
    CopyVariantsResponse,
    AIGrowthIntelligenceResponse
)
from app.services.analytics_service import analytics_service, AnalyticsService
from app.services.growth_ai_service import growth_ai_service, GrowthAIService

logger = logging.getLogger("launchloop.routers.analytics")

router = APIRouter(
    prefix="/analytics",
    tags=["Organizer Analytics & AI Intelligence"],
    dependencies=[Depends(verify_organizer_access)]
)


def get_analytics_service() -> AnalyticsService:
    return analytics_service


def get_growth_ai_service() -> GrowthAIService:
    return growth_ai_service


@router.get("/overview", response_model=CampaignOverviewKPIs)
def get_campaign_overview(
    campaign_slug: str = Query("ai-in-60-mins", description="Target campaign identifier"),
    service: AnalyticsService = Depends(get_analytics_service)
):
    """Returns high-level campaign KPIs, target progress, budget allocation, and funnel metrics."""
    return service.get_campaign_overview(campaign_slug=campaign_slug)


@router.get("/registrations/daily", response_model=DailyRegistrationResponse)
def get_daily_registration_trend(
    campaign_slug: str = Query("ai-in-60-mins", description="Target campaign identifier"),
    date_from: Optional[str] = Query(None, description="Optional start date ISO string (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Optional end date ISO string (YYYY-MM-DD)"),
    service: AnalyticsService = Depends(get_analytics_service)
):
    """Returns daily registration time-series for chart visualization (excluding seed records)."""
    return service.get_daily_registration_trend(
        campaign_slug=campaign_slug,
        date_from=date_from,
        date_to=date_to
    )


@router.get("/channels", response_model=ChannelAttributionResponse)
def get_channel_attribution(
    campaign_slug: str = Query("ai-in-60-mins", description="Target campaign identifier"),
    service: AnalyticsService = Depends(get_analytics_service)
):
    """Returns registration breakdown by UTM acquisition source and medium."""
    return service.get_channel_attribution(campaign_slug=campaign_slug)


@router.get("/referrals", response_model=ReferralAnalyticsResponse)
def get_referral_analytics(
    campaign_slug: str = Query("ai-in-60-mins", description="Target campaign identifier"),
    service: AnalyticsService = Depends(get_analytics_service)
):
    """Returns aggregate referral advocate counts, clicks, verified conversions, and top advocates."""
    return service.get_referral_analytics(campaign_slug=campaign_slug)


@router.get("/ai-usage", response_model=AIUsageTelemetryResponse)
def get_ai_usage_telemetry(
    service: AnalyticsService = Depends(get_analytics_service)
):
    """Returns LLM usage, fallback rates, and average latency from audit logs."""
    return service.get_ai_usage_telemetry()


@router.get("/copy-variants", response_model=CopyVariantsResponse)
def get_copy_variants(
    campaign_slug: str = Query("ai-in-60-mins", description="Target campaign identifier"),
    service: AnalyticsService = Depends(get_analytics_service)
):
    """Returns marketing copy variants, impressions, clicks, registrations, and calculated CTR/CR."""
    return service.get_copy_variants(campaign_slug=campaign_slug)


@router.post("/ai-growth-insights", response_model=AIGrowthIntelligenceResponse)
async def generate_growth_insights(
    campaign_slug: str = Query("ai-in-60-mins", description="Target campaign identifier"),
    service: GrowthAIService = Depends(get_growth_ai_service)
):
    """Generates AI growth hypotheses and recommendations based on real measured telemetry."""
    return await service.generate_growth_recommendations(campaign_slug=campaign_slug)
