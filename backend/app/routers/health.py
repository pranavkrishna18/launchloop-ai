"""Health check router for LaunchLoop AI Backend.
"""

from datetime import datetime, timezone
from fastapi import APIRouter
from app.core.config import settings
from app.core.database import db_manager

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    """Liveness probe and environment diagnostics endpoint."""
    db_health = db_manager.check_connection()
    return {
        "status": "healthy",
        "service": "launchloop-backend",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database_configured": settings.is_database_configured,
        "database": db_health,
        "ai_provider": settings.DEFAULT_AI_PROVIDER,
        "gemini_model": settings.GEMINI_MODEL
    }
