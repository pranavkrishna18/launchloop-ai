"""Google Gemini AI Provider for LaunchLoop AI Project Magnet.

Implements structured JSON output using Google's official GenAI SDK (google-genai).
Features multi-key failover fallback, bounded retry logic, input validation,
and comprehensive error translation.
"""

import asyncio
import json
import logging
from typing import Optional, List, Any
from pydantic import ValidationError
from app.core.config import settings
from app.schemas.magnet import MagnetRequest, ProjectRecommendation
from app.ai_providers.base import (
    BaseAIProvider,
    AIConfigurationError,
    AIValidationError,
    AITimeoutError,
    AIRateLimitError,
    AIProviderUnavailableError
)

logger = logging.getLogger("launchloop.ai.gemini")

SYSTEM_INSTRUCTION = """You are a senior engineering curriculum architect and career mentor for NxtWave.
Your goal is to suggest an inspiring, beginner-friendly, and actionable AI project for an engineering student attending the live workshop:
"Build Your First AI Project in 60 Minutes".

Guidelines:
1. Feasibility: The student must be able to build a functional prototype within a 60-minute live workshop session.
2. Architecture: Suggest modern, beginner-accessible stacks (Python/FastAPI or Node/React with pre-trained Gemini/OpenCV/HuggingFace APIs). Do NOT propose training custom LLMs from scratch.
3. Clarity: Provide 3 clear, sequential implementation steps.
4. Relevance: Explain specifically why this project fits their listed interests, known technologies, and career aspiration.
5. Tone: Technical, supportive, inspiring, and professional.
"""


class GeminiProvider(BaseAIProvider):
    """Google Gemini implementation using official Google GenAI SDK with multi-key failover rotation."""

    def __init__(
        self,
        api_keys: Optional[List[str]] = None,
        api_key: Optional[str] = None,
        model: Optional[str] = None
    ):
        self.model = model or settings.GEMINI_MODEL
        
        # Build key pool from explicit list, single key, or settings
        raw_keys = api_keys or []
        if api_key and api_key not in raw_keys:
            raw_keys.append(api_key)
        if not raw_keys:
            raw_keys = settings.gemini_api_key_list

        self.api_keys = [k.strip() for k in raw_keys if k and k.strip()]
        self.api_key = self.api_keys[0] if self.api_keys else (api_key or settings.GEMINI_API_KEY or "")
        self._current_key_idx = 0
        self._clients: List[Any] = []
        self._client = None

        if self.api_keys:
            try:
                from google import genai
                for k in self.api_keys:
                    try:
                        client = genai.Client(api_key=k)
                        self._clients.append(client)
                    except Exception as ce:
                        masked = f"{k[:8]}...{k[-4:]}" if len(k) > 12 else "***"
                        logger.warning(f"Failed to initialize GenAI client for key {masked}: {ce}")
                if self._clients:
                    self._client = self._clients[0]
            except Exception as e:
                logger.error(f"Failed to import Google GenAI SDK: {e}")

        # Single key fallback if provided explicitly without pool
        if not self._clients and self.api_key:
            try:
                from google import genai
                single_client = genai.Client(api_key=self.api_key)
                self._clients.append(single_client)
                self._client = single_client
            except Exception as e:
                logger.error(f"Failed to initialize GenAI client: {e}")

    @property
    def is_configured(self) -> bool:
        # If test or caller explicitly set api_key to empty or _client to None, honor it!
        if not self.api_key or self._client is None:
            return False
        return len(self._clients) > 0 or self._client is not None

    def _mask_key(self, key: str) -> str:
        if not key or len(key) <= 12:
            return "***"
        return f"{key[:8]}...{key[-4:]}"

    async def generate_project_recommendation(
        self, request: MagnetRequest
    ) -> ProjectRecommendation:
        """Invokes Google Gemini with structured JSON output, multi-key failover, and retry logic."""
        if not self.is_configured:
            raise AIConfigurationError("Google Gemini API keys are missing or all clients failed to initialize.")

        from google.genai import types

        prompt = f"""Generate a personalized AI project recommendation for an engineering student with this profile:
- Interests: {', '.join(request.interests)}
- Current Skill Level: {request.skill_level.value}
- Known Technologies: {', '.join(request.technologies_known)}
- Career/Learning Goal: {request.career_goal}

Provide a complete, realistic project blueprint following the ProjectRecommendation schema."""

        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            response_schema=ProjectRecommendation,
            temperature=0.7,
        )

        clients_pool = self._clients if self._clients else [self._client]
        total_keys = len(clients_pool)
        max_attempts = total_keys * (1 + settings.GEMINI_MAX_RETRIES)
        attempts = 0

        # Primary and backup models
        # Prioritize gemini-3.5-flash-lite which has confirmed capacity, while supporting configured model and gemini-3.5-flash
        models_to_try = ["gemini-3.5-flash-lite", self.model, "gemini-3.5-flash"]
        seen = set()
        models_to_try = [m for m in models_to_try if not (m in seen or seen.add(m))]

        while attempts < max_attempts:
            attempts += 1
            client_idx = self._current_key_idx % total_keys
            client = clients_pool[client_idx]
            active_key_str = self.api_keys[client_idx] if (client_idx < len(self.api_keys)) else self.api_key
            masked_key = self._mask_key(active_key_str)

            # Try models with this key
            for active_model in models_to_try:
                try:
                    # Wrap synchronous SDK call in asyncio.to_thread with a timeout
                    response = await asyncio.wait_for(
                        asyncio.to_thread(
                            client.models.generate_content,
                            model=active_model,
                            contents=prompt,
                            config=config
                        ),
                        timeout=settings.GEMINI_TIMEOUT_SECONDS
                    )

                    if not response or not response.text:
                        raise AIValidationError("Gemini returned an empty response.")

                    raw_text = response.text.strip()

                    # Parse JSON
                    try:
                        data = json.loads(raw_text)
                    except json.JSONDecodeError as jde:
                        logger.warning(f"Failed to parse Gemini response as JSON: {jde}")
                        raise AIValidationError(f"Invalid JSON returned by Gemini: {jde}")

                    # Validate with Pydantic
                    try:
                        recommendation = ProjectRecommendation(**data)
                    except ValidationError as ve:
                        logger.warning(f"Pydantic schema validation failed on Gemini output: {ve}")
                        raise AIValidationError(f"Schema validation failure: {ve}")

                    # Semantic check: must have exactly 3 steps
                    if len(recommendation.first_three_steps) != 3:
                        raise AIValidationError("Recommendation must contain exactly 3 first implementation steps.")

                    return recommendation

                except asyncio.TimeoutError:
                    logger.warning(
                        f"Gemini API request timed out on key {masked_key} with model {active_model}. "
                        f"Trying next model or key..."
                    )
                    continue

                except Exception as e:
                    err_str = str(e).lower()
                    # If 503 unavailable (spikes in demand / no capacity), 404 (model unavailable)
                    if any(x in err_str for x in ["503", "unavailable", "capacity", "404", "not_found"]):
                        logger.info(f"Model {active_model} returned availability/capacity error on key {masked_key}: {e}. Trying alternate model...")
                        continue

                    # Rate limit or quota exhausted -> failover to next key
                    is_rate_limit_or_quota = any(
                        x in err_str for x in ["429", "resource_exhausted", "quota", "rate limit", "limit exceeded"]
                    )
                    if is_rate_limit_or_quota:
                        logger.warning(
                            f"Gemini rate limit or quota on key {masked_key}: {e}. "
                            f"Failing over to next available key in pool..."
                        )
                        break

                    if isinstance(e, (AIConfigurationError, AIValidationError)):
                        raise e

                    logger.warning(f"Error on key {masked_key} with {active_model} ({e}). Trying next model or key...")
                    continue

            # Rotate to next key in the pool
            self._current_key_idx = (self._current_key_idx + 1) % total_keys
            if attempts < max_attempts:
                await asyncio.sleep(0.3)
                continue

        raise AIProviderUnavailableError("All Gemini invocation attempts failed across all configured API keys.")
