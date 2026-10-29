"""Unit tests for the AI orchestration service.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.schemas.magnet import MagnetRequest, SkillLevel, ProjectRecommendation
from app.services.ai_service import AIService
from app.ai_providers.base import AITimeoutError, AIRateLimitError


@pytest.fixture
def sample_request():
    return MagnetRequest(
        interests=["Computer Vision", "Healthcare AI"],
        skill_level=SkillLevel.BEGINNER,
        technologies_known=["Python", "OpenCV"],
        career_goal="Build a final year AI project to crack campus placements"
    )


@pytest.fixture
def mock_recommendation():
    return ProjectRecommendation(
        project_title="MediVision: Pneumonia X-Ray Classifier",
        problem_statement="Rural diagnostic centers face major backlogs in radiographic screening.",
        project_description="A lightweight CNN model that classifies pneumonia from chest radiographs.",
        fit_explanation="Fits student's Python and healthcare interest with realistic 60-min scope.",
        recommended_tech_stack=["Python", "PyTorch", "FastAPI"],
        difficulty_level="Beginner",
        estimated_scope="60-min inference prototype + 1 weekend for deployment",
        first_three_steps=[
            "Download sample chest X-ray images from open repository.",
            "Preprocess and normalize input images using OpenCV.",
            "Run inference with pre-trained ResNet-18 model."
        ],
        workshop_learning_outcome="Understand convolutional neural networks and deploy a computer vision model."
    )


@pytest.mark.asyncio
async def test_fallback_returned_when_gemini_not_configured(sample_request):
    service = AIService()
    service.provider.api_key = ""
    service.provider._client = None

    response = await service.get_project_recommendation(sample_request)
    assert response.metadata.is_fallback is True
    assert response.metadata.provider == "fallback-catalogue"
    assert response.metadata.status == "fallback"
    assert response.recommendation.project_title


@pytest.mark.asyncio
async def test_successful_gemini_call_returns_live_ai_metadata(sample_request, mock_recommendation):
    service = AIService()
    service.provider.api_key = "mock-key"
    service.provider._client = MagicMock()

    with patch.object(
        service.provider,
        "generate_project_recommendation",
        new_callable=AsyncMock,
        return_value=mock_recommendation
    ):
        response = await service.get_project_recommendation(sample_request)
        assert response.metadata.is_fallback is False
        assert response.metadata.provider == "gemini"
        assert response.metadata.status == "success"
        assert response.metadata.cached is False
        assert response.recommendation.project_title == "MediVision: Pneumonia X-Ray Classifier"


@pytest.mark.asyncio
async def test_caching_returns_cached_result_for_identical_request(sample_request, mock_recommendation):
    service = AIService()
    service.provider.api_key = "mock-key"
    service.provider._client = MagicMock()

    with patch.object(
        service.provider,
        "generate_project_recommendation",
        new_callable=AsyncMock,
        return_value=mock_recommendation
    ):
        # First request
        res1 = await service.get_project_recommendation(sample_request)
        assert res1.metadata.cached is False

        # Second identical request should be served from cache
        res2 = await service.get_project_recommendation(sample_request)
        assert res2.metadata.cached is True
        assert res2.metadata.is_fallback is False
        assert res2.recommendation.project_title == mock_recommendation.project_title


@pytest.mark.asyncio
async def test_gemini_timeout_activates_fallback(sample_request):
    service = AIService()
    service.provider.api_key = "mock-key"
    service.provider._client = MagicMock()

    with patch.object(
        service.provider,
        "generate_project_recommendation",
        new_callable=AsyncMock,
        side_effect=AITimeoutError("Gemini timed out")
    ):
        response = await service.get_project_recommendation(sample_request)
        assert response.metadata.is_fallback is True
        assert response.metadata.provider == "fallback-catalogue"
        assert response.recommendation.project_title


@pytest.mark.asyncio
async def test_gemini_rate_limit_activates_fallback(sample_request):
    service = AIService()
    service.provider.api_key = "mock-key"
    service.provider._client = MagicMock()

    with patch.object(
        service.provider,
        "generate_project_recommendation",
        new_callable=AsyncMock,
        side_effect=AIRateLimitError("Quota exceeded")
    ):
        response = await service.get_project_recommendation(sample_request)
        assert response.metadata.is_fallback is True
        assert response.metadata.provider == "fallback-catalogue"
        assert response.recommendation.project_title


def test_input_hash_is_deterministic(sample_request):
    service = AIService()
    hash1 = service.compute_input_hash(sample_request)
    hash2 = service.compute_input_hash(sample_request)
    assert hash1 == hash2
    assert len(hash1) == 64  # SHA-256
