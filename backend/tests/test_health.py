"""Unit tests for the health check endpoint.
"""

def test_health_check_returns_200(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "launchloop-backend"
    assert "version" in data
    assert "timestamp" in data
    assert data["ai_provider"] == "gemini"
    assert data["gemini_model"] == "gemini-3.8-flash"


def test_root_endpoint_returns_200(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "health" in data
