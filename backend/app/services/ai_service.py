"""AI Orchestration Service for LaunchLoop AI Project Magnet.

Coordinates model requests, caching, per-client abuse control,
performance telemetry, and zero-downtime fallback resolution.
"""

import hashlib
import json
import logging
import time
from typing import Dict, Tuple, Optional
from app.core.config import settings
from app.schemas.magnet import MagnetRequest, MagnetResponse, MagnetMetadata, ProjectRecommendation
from app.ai_providers.gemini_provider import GeminiProvider
from app.services.fallbacks import get_curated_fallback

logger = logging.getLogger("launchloop.ai.service")


class CacheItem:
    def __init__(self, data: ProjectRecommendation, timestamp: float):
        self.data = data
        self.timestamp = timestamp


class AIService:
    """Singleton service for AI generation, caching, and fallback management."""

    def __init__(self):
        self.provider = GeminiProvider()
        # In-memory TTL cache: hash -> CacheItem
        self._cache: Dict[str, CacheItem] = {}
        self._cache_ttl_seconds = 600  # 10 minutes
        # Simple client rate limiting: ip -> list of request timestamps
        self._rate_limits: Dict[str, list] = {}
        self._rate_limit_window = 60  # seconds
        self._max_requests_per_window = 10

    def compute_input_hash(self, request: MagnetRequest) -> str:
        """Generates a reproducible SHA-256 hash of normalized inputs for privacy-preserving caching & logging."""
        normalized = {
            "interests": sorted([i.lower().strip() for i in request.interests]),
            "skill_level": request.skill_level.value.lower(),
            "technologies": sorted([t.lower().strip() for t in request.technologies_known]),
            "career_goal": request.career_goal.lower().strip()
        }
        serialized = json.dumps(normalized, sort_keys=True)
        return hashlib.sha256(serialized.encode("utf-8")).hexdigest()

    def check_rate_limit(self, client_ip: str) -> bool:
        """Checks if a client IP has exceeded the allowed rate limit."""
        now = time.time()
        timestamps = self._rate_limits.get(client_ip, [])
        # Prune older than window
        timestamps = [t for t in timestamps if now - t < self._rate_limit_window]
        
        if len(timestamps) >= self._max_requests_per_window:
            self._rate_limits[client_ip] = timestamps
            return False

        timestamps.append(now)
        self._rate_limits[client_ip] = timestamps
        return True

    async def get_project_recommendation(
        self, request: MagnetRequest, client_ip: str = "127.0.0.1"
    ) -> MagnetResponse:
        """Generates or retrieves a personalized project recommendation.
        Guarantees response even if Gemini is unconfigured or unavailable.
        """
        start_time = time.time()
        input_hash = self.compute_input_hash(request)

        # 1. Check Rate Limit
        if not self.check_rate_limit(client_ip):
            logger.warning(f"Rate limit exceeded for client hash: {hashlib.sha256(client_ip.encode()).hexdigest()[:8]}")
            # Serve fallback gracefully instead of throwing 500
            fallback = get_curated_fallback(request.interests, request.skill_level, request.technologies_known)
            return MagnetResponse(
                recommendation=fallback,
                metadata=MagnetMetadata(
                    is_fallback=True,
                    provider="fallback-catalogue",
                    model="curated-rule-engine",
                    latency_ms=int((time.time() - start_time) * 1000),
                    status="fallback",
                    note="Rate limit reached for client. Curated blueprint served."
                )
            )

        # 2. Check In-Memory Cache
        now = time.time()
        if input_hash in self._cache:
            item = self._cache[input_hash]
            if now - item.timestamp < self._cache_ttl_seconds:
                latency_ms = int((time.time() - start_time) * 1000)
                logger.info(f"Cache hit for input_hash={input_hash[:8]} (latency={latency_ms}ms)")
                return MagnetResponse(
                    recommendation=item.data,
                    metadata=MagnetMetadata(
                        is_fallback=False,
                        provider=settings.DEFAULT_AI_PROVIDER,
                        model=settings.GEMINI_MODEL,
                        latency_ms=latency_ms,
                        cached=True,
                        status="success"
                    )
                )

        # 3. Attempt Gemini Generation if configured
        if self.provider.is_configured:
            try:
                recommendation = await self.provider.generate_project_recommendation(request)
                latency_ms = int((time.time() - start_time) * 1000)
                logger.info(f"Gemini generation successful for input_hash={input_hash[:8]} (latency={latency_ms}ms)")

                # Store in cache
                self._cache[input_hash] = CacheItem(recommendation, now)

                return MagnetResponse(
                    recommendation=recommendation,
                    metadata=MagnetMetadata(
                        is_fallback=False,
                        provider=settings.DEFAULT_AI_PROVIDER,
                        model=settings.GEMINI_MODEL,
                        latency_ms=latency_ms,
                        cached=False,
                        status="success"
                    )
                )

            except Exception as e:
                latency_ms = int((time.time() - start_time) * 1000)
                logger.warning(f"Gemini call failed for input_hash={input_hash[:8]}: {e}. Triggering curated fallback.")

        # 4. Fallback Catalogue Activation
        fallback_rec = get_curated_fallback(
            request.interests, request.skill_level, request.technologies_known
        )
        latency_ms = int((time.time() - start_time) * 1000)

        fallback_note = (
            "Gemini API key is not configured; serving curated project blueprint."
            if not self.provider.is_configured
            else "Gemini service temporarily unavailable; serving verified project blueprint."
        )

        logger.info(f"Curated fallback served for input_hash={input_hash[:8]} (latency={latency_ms}ms)")

        return MagnetResponse(
            recommendation=fallback_rec,
            metadata=MagnetMetadata(
                is_fallback=True,
                provider="fallback-catalogue",
                model="curated-curriculum",
                latency_ms=latency_ms,
                cached=False,
                status="fallback",
                note=fallback_note
            )
        )


# Global singleton instance
ai_service = AIService()
