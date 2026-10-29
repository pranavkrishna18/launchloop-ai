"""Pydantic schemas for the referral engine, tracking, and leaderboard.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class ReferralClickRequest(BaseModel):
    """Payload when a visitor arrives via a referral link."""
    referral_code: str = Field(..., min_length=4, max_length=16)


class ReferralClickResponse(BaseModel):
    recorded: bool
    referral_code: str


class PublicReferralValidationResponse(BaseModel):
    """Public validation info: returns minimal fields to protect advocate privacy."""
    valid: bool
    referral_code: str
    inviter_display_name: Optional[str] = None
    campaign_title: str = "Build Your First AI Project in 60 Minutes"


class ReferralMilestone(BaseModel):
    target: int
    reward: str
    achieved: bool


class StudentReferralStatsResponse(BaseModel):
    """Protected personal referral stats accessible only with student_access_token."""
    referral_code: str
    student_name: str
    clicks_count: int
    conversions_count: int
    conversion_rate_percentage: float
    referral_url: str
    milestones: List[ReferralMilestone]
    rank: Optional[int] = None


class LeaderboardItem(BaseModel):
    """Minimal, privacy-conscious leaderboard entry."""
    rank: int
    display_name: str
    college: str
    verified_referrals: int


class LeaderboardResponse(BaseModel):
    leaderboard: List[LeaderboardItem]
    total_advocates: int
    last_updated: str
