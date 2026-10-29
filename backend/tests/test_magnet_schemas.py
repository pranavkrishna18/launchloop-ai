"""Tests for Magnet Pydantic Schemas.
"""

import pytest
from pydantic import ValidationError
from app.schemas.magnet import MagnetRequest, ProjectRecommendation, SkillLevel


def test_valid_magnet_request():
    req = MagnetRequest(
        interests=["Computer Vision", "Healthcare AI"],
        skill_level=SkillLevel.BEGINNER,
        technologies_known=["Python", "OpenCV"],
        career_goal="Build a final year AI project to crack campus placements"
    )
    assert req.interests == ["Computer Vision", "Healthcare AI"]
    assert req.skill_level == SkillLevel.BEGINNER
    assert req.technologies_known == ["Python", "OpenCV"]


def test_invalid_skill_level_fails():
    with pytest.raises(ValidationError):
        MagnetRequest(
            interests=["Computer Vision"],
            skill_level="expert",  # Invalid enum value
            technologies_known=["Python"],
            career_goal="Placement preparation"
        )


def test_empty_interests_fails():
    with pytest.raises(ValidationError):
        MagnetRequest(
            interests=[],
            skill_level=SkillLevel.INTERMEDIATE,
            technologies_known=["Python"],
            career_goal="Placement preparation"
        )


def test_short_career_goal_fails():
    with pytest.raises(ValidationError):
        MagnetRequest(
            interests=["Computer Vision"],
            skill_level=SkillLevel.BEGINNER,
            technologies_known=["Python"],
            career_goal="job"  # < 5 chars
        )


def test_valid_project_recommendation_schema():
    rec = ProjectRecommendation(
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
    assert rec.project_title == "MediVision: Pneumonia X-Ray Classifier"
    assert len(rec.first_three_steps) == 3


def test_project_recommendation_must_have_exactly_three_steps():
    with pytest.raises(ValidationError):
        ProjectRecommendation(
            project_title="Test Project Title",
            problem_statement="A realistic problem statement of sufficient length here.",
            project_description="A realistic description of sufficient length describing the project.",
            fit_explanation="A realistic explanation of sufficient length explaining fit.",
            recommended_tech_stack=["Python"],
            difficulty_level="Beginner",
            estimated_scope="Realistic scope of sufficient length here.",
            first_three_steps=["Step 1", "Step 2"],  # Only 2 steps!
            workshop_learning_outcome="A realistic learning outcome of sufficient length."
        )
