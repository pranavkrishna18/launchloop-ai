"""API Router for AI Project Magnet endpoints.
"""

from fastapi import APIRouter, Request, HTTPException, status
from app.schemas.magnet import MagnetRequest, MagnetResponse, ALLOWED_DOMAINS
from app.services.ai_service import ai_service
from app.services.fallbacks import FALLBACK_PROJECTS
from app.core.config import settings

router = APIRouter(prefix="/magnet", tags=["AI Project Magnet"])


def extract_client_ip(request: Request) -> str:
    """Safely extracts client IP from headers or socket connection."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


@router.post(
    "/recommend",
    response_model=MagnetResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate personalized AI project recommendation"
)
async def generate_recommendation(
    payload: MagnetRequest,
    request: Request
):
    """Accepts student profile parameters and returns a structured AI project blueprint.
    Guarantees response through Google Gemini or curated fallback catalogue.
    """
    client_ip = extract_client_ip(request)
    try:
        response = await ai_service.get_project_recommendation(payload, client_ip=client_ip)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "MAGNET_GENERATION_FAILED",
                "message": f"An error occurred while generating project recommendation: {str(e)}"
            }
        )


@router.get(
    "/config",
    summary="Public configuration and domain metadata for the Project Magnet"
)
async def get_magnet_config():
    """Returns supported domain categories and operational status without leaking credentials."""
    return {
        "allowed_domains": ALLOWED_DOMAINS,
        "active_provider": settings.DEFAULT_AI_PROVIDER,
        "model": settings.GEMINI_MODEL,
        "is_ai_key_configured": bool(settings.gemini_api_key_list),
        "active_keys_count": len(settings.gemini_api_key_list),
        "fallback_catalogue_size": len(FALLBACK_PROJECTS),
        "timeout_seconds": settings.GEMINI_TIMEOUT_SECONDS
    }
