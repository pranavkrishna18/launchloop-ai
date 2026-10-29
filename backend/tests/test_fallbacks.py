"""Tests for the Curated Fallback Catalogue.
"""

from app.schemas.magnet import SkillLevel, ProjectRecommendation
from app.services.fallbacks import FALLBACK_PROJECTS, get_curated_fallback


def test_fallback_catalogue_contains_at_least_15_projects():
    assert len(FALLBACK_PROJECTS) >= 15


def test_all_fallback_projects_adhere_to_schema():
    for item in FALLBACK_PROJECTS:
        rec = ProjectRecommendation(**item["data"])
        assert rec.project_title
        assert len(rec.first_three_steps) == 3
        assert rec.estimated_scope
        assert rec.workshop_learning_outcome


def test_matching_logic_returns_computer_vision_for_cv_interest():
    rec = get_curated_fallback(
        interests=["Computer Vision"],
        skill_level=SkillLevel.BEGINNER,
        technologies_known=["Python", "OpenCV"]
    )
    assert any(term in rec.project_title.lower() or term in rec.project_description.lower() for term in ["vision", "posture", "scanner", "scan", "agri"])


def test_matching_logic_returns_nlp_for_nlp_interest():
    rec = get_curated_fallback(
        interests=["Natural Language Processing"],
        skill_level=SkillLevel.BEGINNER,
        technologies_known=["Python", "FastAPI"]
    )
    assert any(term in rec.project_title.lower() or term in rec.project_description.lower() for term in ["resume", "nlp", "text", "ticket", "pulse"])
