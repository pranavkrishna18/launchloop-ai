"""LaunchLoop AI — FastAPI Application Entry Point.
"""

import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.routers.health import router as health_router
from app.routers.magnet import router as magnet_router
from app.routers.registrations import router as registrations_router
from app.routers.referrals import router as referrals_router
from app.routers.analytics import router as analytics_router

logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("launchloop.main")

app = FastAPI(
    title="LaunchLoop AI API",
    version="1.0.0",
    description="Backend API for NxtWave LaunchLoop AI Student Acquisition & Growth Platform",
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred. Please try again later."
            }
        }
    )

# Include Routers under /api/v1
app.include_router(health_router, prefix="/api/v1")
app.include_router(magnet_router, prefix="/api/v1")
app.include_router(registrations_router, prefix="/api/v1")
app.include_router(referrals_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "message": "LaunchLoop AI Backend Gateway",
        "docs": "/docs" if not settings.is_production else None,
        "health": "/api/v1/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=not settings.is_production)
