"""Pydantic schemas for Campaign Analytics, KPIs, and AI Growth Intelligence.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class FunnelStage(BaseModel):
    stage: str
    count: int
    conversion_from_previous: Optional[float] = None


class CampaignOverviewKPIs(BaseModel):
    """Core Campaign KPI summary for organizer dashboard."""
    campaign_id: str
    campaign_slug: str
    campaign_title: str
    target_registrations: int = Field(500, description="Campaign objective: 500 final-year students")
    real_registrations: int = Field(0, description="Authentic registrations with is_seed = false")
    seed_registrations: int = Field(0, description="Demo/seed registrations excluded from real performance")
    target_achievement_percentage: float = Field(0.0, description="(real_registrations / target) * 100")
    remaining_registrations: int = Field(500, description="max(target - real_registrations, 0)")
    budget_inr: float = Field(2000.0, description="Total campaign budget allocated (₹2,000)")
    budget_allocation_per_registration_inr: Optional[float] = Field(
        None,
        description="Budget allocation per real registration (₹2,000 / real_registrations). Note: Represents allocated budget ceiling, not actual ad spend."
    )
    referral_clicks: int = 0
    referral_conversions: int = 0
    referral_conversion_rate_percentage: Optional[float] = Field(
        None,
        description="(referral_conversions / referral_clicks) * 100. Null if zero clicks."
    )
    funnel: List[FunnelStage] = Field(default_factory=list)
    data_status: str = Field("live", description="'live' | 'schema_pending' | 'empty'")
    last_updated: str


class DailyRegistrationTrendItem(BaseModel):
    """Daily time-series bucket for registrations."""
    date: str = Field(..., description="Date formatted as YYYY-MM-DD")
    count: int = Field(..., description="Number of real registrations on this day")
    cumulative_count: int = Field(..., description="Running total of registrations to date")


class DailyRegistrationResponse(BaseModel):
    items: List[DailyRegistrationTrendItem] = Field(default_factory=list)
    total_real_registrations: int = 0
    date_from: Optional[str] = None
    date_to: Optional[str] = None


class ChannelMediumBreakdown(BaseModel):
    medium: str
    count: int


class ChannelAttributionItem(BaseModel):
    channel: str
    registrations_count: int
    percentage_of_total: float
    mediums: List[ChannelMediumBreakdown] = Field(default_factory=list)


class ChannelAttributionResponse(BaseModel):
    channels: List[ChannelAttributionItem] = Field(default_factory=list)
    total_real_registrations: int = 0


class ReferralAdvocateItem(BaseModel):
    rank: int
    display_name: str
    college: str
    referral_code: str
    clicks: int
    conversions: int
    conversion_rate_percentage: Optional[float] = None


class ReferralAnalyticsResponse(BaseModel):
    total_advocates: int = 0
    total_clicks: int = 0
    total_conversions: int = 0
    overall_conversion_rate_percentage: Optional[float] = None
    top_advocates: List[ReferralAdvocateItem] = Field(default_factory=list)


class AIUsageTelemetryResponse(BaseModel):
    total_requests: int = 0
    fallback_requests: int = 0
    fallback_rate_percentage: float = 0.0
    avg_latency_ms: float = 0.0
    provider_breakdown: Dict[str, int] = Field(default_factory=dict)
    feature_breakdown: Dict[str, int] = Field(default_factory=dict)
    note: str = "Telemetry recorded in ai_generation_logs."


class CopyVariantPerformanceItem(BaseModel):
    variant_key: str
    channel: str
    target_segment: str
    headline: str
    impressions: int
    clicks: int
    registrations: int
    ctr_percentage: Optional[float] = None
    conversion_rate_percentage: Optional[float] = None
    is_seed: bool = False


class CopyVariantsResponse(BaseModel):
    variants: List[CopyVariantPerformanceItem] = Field(default_factory=list)
    total_variants: int = 0


# --- AI Growth Intelligence Schemas ---

class GrowthRecommendationItem(BaseModel):
    """Structured AI growth recommendation with evidence and rationale."""
    title: str = Field(..., description="Action-oriented concise title")
    observed_evidence: str = Field(..., description="Specific measured metric or ratio from telemetry")
    proposed_action: str = Field(..., description="Concrete, low-cost tactical intervention")
    rationale: str = Field(..., description="Why this might work based on viral loop / conversion dynamics")
    effort: str = Field(..., description="'Low' | 'Medium' | 'High'")
    expected_impact: str = Field(..., description="Estimated impact framed explicitly as a hypothesis")
    confidence_and_limitations: str = Field(..., description="Confidence level, data limits, and risk assumptions")


class AIGrowthIntelligenceResponse(BaseModel):
    """Complete structured response from AI Growth Intelligence."""
    campaign_slug: str
    generated_at: str
    provider: str
    model: str
    is_ai_generated: bool
    status: str = "success"
    recommendations: List[GrowthRecommendationItem] = Field(default_factory=list)
    disclaimer: str = (
        "AI-generated hypotheses based strictly on measured aggregated telemetry. "
        "Does not guarantee campaign outcomes or claim definitive causal proof."
    )
