"""API Router for Student Registration endpoints.
"""

from fastapi import APIRouter, Request, HTTPException, status
from app.schemas.registration import StudentRegistrationRequest, StudentRegistrationResponse
from app.services.registration_service import (
    registration_service,
    DuplicateRegistrationError,
    DatabaseUnavailableError,
    CampaignNotFoundError
)

router = APIRouter(prefix="/registrations", tags=["Student Registration"])


def extract_client_ip(request: Request) -> str:
    """Extracts client IP from proxy headers or socket."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


@router.post(
    "",
    response_model=StudentRegistrationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register student for workshop and provision referral link"
)
async def register_student(
    payload: StudentRegistrationRequest,
    request: Request
):
    """Enforces email normalization, duplicate prevention, campaign attribution,
    and automatic unique referral link creation.
    """
    client_ip = extract_client_ip(request)
    try:
        response = registration_service.register_student(payload, client_ip=client_ip)
        return response
    except DuplicateRegistrationError as dre:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "DUPLICATE_REGISTRATION",
                "message": dre.message,
                "existing_referral_code": dre.existing_code
            }
        )
    except DatabaseUnavailableError as due:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "code": "DATABASE_UNAVAILABLE",
                "message": str(due)
            }
        )
    except CampaignNotFoundError as cne:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "CAMPAIGN_NOT_FOUND",
                "message": str(cne)
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "REGISTRATION_FAILED",
                "message": f"Unexpected error processing registration: {str(e)}"
            }
        )
