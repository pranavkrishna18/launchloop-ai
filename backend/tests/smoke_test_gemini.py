"""Optional live smoke test for Google Gemini API integration.

To run with a live key:
$env:GEMINI_API_KEY="your-real-key"; python -m pytest backend/tests/smoke_test_gemini.py -s
"""

import os
import pytest
from app.schemas.magnet import MagnetRequest, SkillLevel
from app.ai_providers.gemini_provider import GeminiProvider


@pytest.mark.asyncio
async def test_live_gemini_api_call():
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        pytest.skip("Skipping live Gemini smoke test: GEMINI_API_KEY environment variable is not set.")

    provider = GeminiProvider(api_key=api_key)
    request = MagnetRequest(
        interests=["Computer Vision", "Generative AI"],
        skill_level=SkillLevel.BEGINNER,
        technologies_known=["Python", "FastAPI"],
        career_goal="Build an impressive AI project for upcoming campus placements"
    )

    recommendation = await provider.generate_project_recommendation(request)
    assert recommendation.project_title
    assert len(recommendation.first_three_steps) == 3
    assert recommendation.workshop_learning_outcome
    print(f"\n[LIVE TEST PASSED] Generated project: {recommendation.project_title}")
