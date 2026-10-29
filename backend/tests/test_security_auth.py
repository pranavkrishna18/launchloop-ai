"""Security tests for organizer authorization rules.
"""

import pytest
from fastapi import Depends
from main import app
from app.core.security import verify_organizer_access
from app.core.config import settings

# Test endpoint requiring organizer access
@app.get("/api/v1/test-protected-organizer-endpoint")
async def test_protected_route(auth_context: dict = Depends(verify_organizer_access)):
    return {"status": "authorized", "context": auth_context}


def test_missing_credentials_returns_401(client):
    response = client.get("/api/v1/test-protected-organizer-endpoint")
    assert response.status_code == 401
    assert "Authentication required" in response.json()["detail"]


def test_invalid_admin_secret_returns_403(client):
    response = client.get(
        "/api/v1/test-protected-organizer-endpoint",
        headers={"X-Admin-Secret": "wrong-secret-token"}
    )
    assert response.status_code == 403
    assert "Invalid admin credentials" in response.json()["detail"]


def test_valid_dev_demo_secret_succeeds_in_development(client):
    response = client.get(
        "/api/v1/test-protected-organizer-endpoint",
        headers={"X-Admin-Secret": settings.ADMIN_DEMO_SECRET}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "authorized"
    assert response.json()["context"]["role"] == "organizer"


def test_admin_secret_forbidden_in_production(client, monkeypatch):
    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    response = client.get(
        "/api/v1/test-protected-organizer-endpoint",
        headers={"X-Admin-Secret": settings.ADMIN_DEMO_SECRET}
    )
    assert response.status_code == 403
    assert "disabled in production" in response.json()["detail"]
