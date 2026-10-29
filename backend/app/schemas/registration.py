"""Pydantic schemas for student workshop registration and attribution.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, field_validator


class StudentRegistrationRequest(BaseModel):
    """Payload submitted by student to register for the workshop."""
    full_name: str = Field(
        ...,
        min_length=2,
        max_length=120,
        description="Student full name"
    )
    email: EmailStr = Field(
        ...,
        description="Student email address (will be normalized to lowercase)"
    )
    college: str = Field(
        ...,
        min_length=2,
        max_length=150,
        description="Engineering college or university name"
    )
    graduation_year: int = Field(
        ...,
        ge=2024,
        le=2030,
        description="Expected graduation year (e.g., 2026 for final year students)"
    )
    campaign_slug: str = Field(
        default="ai-in-60-mins",
        description="Target workshop campaign identifier"
    )
    referral_code_used: Optional[str] = Field(
        default=None,
        max_length=16,
        description="Referral code of student advocate who invited them"
    )
    utm_source: str = Field(
        default="direct",
        max_length=64,
        description="Acquisition channel (e.g., whatsapp, linkedin, direct)"
    )
    utm_medium: Optional[str] = Field(
        default=None,
        max_length=64
    )
    utm_campaign: Optional[str] = Field(
        default=None,
        max_length=64
    )
    utm_content: Optional[str] = Field(
        default=None,
        max_length=64
    )
    interests: Optional[List[str]] = Field(
        default=None,
        description="Optional student project interests"
    )
    technologies_known: Optional[List[str]] = Field(
        default=None,
        description="Optional technologies known"
    )

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("full_name", "college")
    @classmethod
    def clean_text_fields(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Field cannot be blank")
        return cleaned

    @field_validator("referral_code_used")
    @classmethod
    def clean_referral_code(cls, v: Optional[str]) -> Optional[str]:
        if not v or not v.strip():
            return None
        return v.strip().upper()


class StudentRegistrationResponse(BaseModel):
    """Confirmation payload returned upon successful workshop registration."""
    registration_id: str
    status: str = "confirmed"
    message: str
    student_name: str
    email: str
    referral_code: str
    referral_url: str
    student_access_token: str
    campaign: Dict[str, Any]
