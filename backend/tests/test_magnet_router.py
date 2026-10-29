"""Integration tests for the /api/v1/magnet endpoints.
"""

def test_get_magnet_config(client):
    response = client.get("/api/v1/magnet/config")
    assert response.status_code == 200
    data = response.json()
    assert "allowed_domains" in data
    assert isinstance(data["allowed_domains"], list)
    assert len(data["allowed_domains"]) > 0
    assert "model" in data
    assert "is_ai_key_configured" in data
    assert isinstance(data["is_ai_key_configured"], bool)
    assert "GEMINI_API_KEY" not in str(data)  # No secret leaked!


def test_post_magnet_recommend_valid_payload(client):
    payload = {
        "interests": ["Computer Vision", "Healthcare AI"],
        "skill_level": "beginner",
        "technologies_known": ["Python", "OpenCV"],
        "career_goal": "Crack AI campus placements at top product firm"
    }
    response = client.post("/api/v1/magnet/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "recommendation" in data
    assert "metadata" in data
    rec = data["recommendation"]
    assert "project_title" in rec
    assert "problem_statement" in rec
    assert "project_description" in rec
    assert "recommended_tech_stack" in rec
    assert "first_three_steps" in rec
    assert len(rec["first_three_steps"]) == 3
    assert "workshop_learning_outcome" in rec
    assert "is_fallback" in data["metadata"]


def test_post_magnet_recommend_invalid_payload_returns_422(client):
    # Missing required field 'career_goal'
    payload = {
        "interests": ["Computer Vision"],
        "skill_level": "beginner",
        "technologies_known": ["Python"]
    }
    response = client.post("/api/v1/magnet/recommend", json=payload)
    assert response.status_code == 422
