"""API Router for Referral Engine, Tracking, and Public Leaderboard.
"""

from typing import Optional
from fastapi import APIRouter, Request, Header, Query, HTTPException, status
from app.schemas.referral import (
    ReferralClickRequest,
    ReferralClickResponse,
    PublicReferralValidationResponse,
    StudentReferralStatsResponse,
    LeaderboardResponse
)
from app.services.referral_service import (
    referral_service,
    UnauthorizedStudentAccess
)

router = APIRouter(prefix="/referrals", tags=["Referral Engine"])


def extract_client_ip(request: Request) -> str:
    """Extracts client IP from proxy headers or socket."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


@router.post(
    "/click",
    response_model=ReferralClickResponse,
    summary="Record visit attribution from a referral link"
)
async def record_referral_click(
    payload: ReferralClickRequest,
    request: Request
):
    """Logs visit event with salted SHA-256 IP hash and increments click counter."""
    client_ip = extract_client_ip(request)
    recorded = referral_service.track_click(payload.referral_code, client_ip=client_ip)
    return ReferralClickResponse(recorded=recorded, referral_code=payload.referral_code)


@router.get(
    "/validate/{code}",
    response_model=PublicReferralValidationResponse,
    summary="Validate referral code publicly without exposing student PII"
)
async def validate_code(code: str):
    """Returns whether code is valid and minimal inviter display name for invitation banner."""
    return referral_service.validate_code(code)


@router.get(
    "/stats",
    response_model=StudentReferralStatsResponse,
    summary="Fetch private referral stats for authenticated student"
)
async def get_student_referral_stats(
    token: Optional[str] = Query(None, description="Student personal access token"),
    x_student_token: Optional[str] = Header(None, alias="X-Student-Token")
):
    """Protected endpoint: student must provide their unique student_access_token
    (delivered upon registration) to view their personal referral dashboard.
    """
    effective_token = x_student_token or token
    if not effective_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "AUTHENTICATION_REQUIRED",
                "message": "Student access token required to view personal referral statistics."
            }
        )

    try:
        return referral_service.get_student_stats(effective_token)
    except UnauthorizedStudentAccess as usa:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "UNAUTHORIZED_ACCESS",
                "message": str(usa)
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "SERVER_ERROR",
                "message": f"Unable to fetch referral statistics: {str(e)}"
            }
        )


@router.get(
    "/leaderboard",
    response_model=LeaderboardResponse,
    summary="Public campus advocate referral leaderboard"
)
async def get_public_leaderboard(
    limit: int = Query(default=10, ge=1, le=50)
):
    """Returns top student advocates with verified referral counts, anonymized names, and colleges."""
    return referral_service.get_leaderboard(limit=limit)
