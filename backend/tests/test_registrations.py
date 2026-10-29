"""Automated tests for student registration and duplicate prevention.
"""

import pytest
from unittest.mock import MagicMock, patch
from pydantic import ValidationError
from app.schemas.registration import StudentRegistrationRequest
from app.services.registration_service import RegistrationService, DuplicateRegistrationError, DatabaseUnavailableError


def test_registration_request_normalizes_email():
    req = StudentRegistrationRequest(
        full_name="Priya Sharma",
        email="  Priya.Sharma@College.Edu  ",
        college="Government Engineering College",
        graduation_year=2026,
        referral_code_used="  nxtpri42  "
    )
    assert req.email == "priya.sharma@college.edu"
    assert req.referral_code_used == "NXTPRI42"


def test_registration_request_invalid_graduation_year_fails():
    with pytest.raises(ValidationError):
        StudentRegistrationRequest(
            full_name="Priya Sharma",
            email="priya@college.edu",
            college="College",
            graduation_year=2015  # Out of valid range (2024-2030)
        )


def test_successful_registration_with_mock_db():
    service = RegistrationService()
    mock_client = MagicMock()

    # Query mocks
    camp_mock = MagicMock(data=[{"id": "camp_uuid_1", "slug": "ai-in-60-mins", "title": "Build Your First AI Project"}])
    student_lookup_mock = MagicMock(data=[])
    existing_link_mock = MagicMock(data=[])

    mock_client.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
        camp_mock, student_lookup_mock
    ]
    mock_client.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = existing_link_mock

    # Insert mocks
    mock_client.table.return_value.insert.return_value.execute.side_effect = [
        MagicMock(data=[{"id": "student_uuid_1"}]),
        MagicMock(data=[{"id": "reg_uuid_1"}]),
        MagicMock(data=[{"id": "ref_uuid_1", "referral_code": "NXTAAR01"}])
    ]

    with patch.object(service.db, "get_client", return_value=mock_client):
        payload = StudentRegistrationRequest(
            full_name="Aarav Sharma",
            email="aarav@iitm.ac.in",
            college="IIT Madras",
            graduation_year=2026
        )
        res = service.register_student(payload)
        assert res.status == "confirmed"
        assert res.email == "aarav@iitm.ac.in"
        assert res.referral_code.startswith("NXT")
        assert res.student_access_token
        assert res.registration_id == "reg_uuid_1"


def test_duplicate_registration_raises_error():
    service = RegistrationService()
    mock_client = MagicMock()

    camp_mock = MagicMock(data=[{"id": "camp_1", "slug": "ai-in-60-mins"}])
    student_mock = MagicMock(data=[{"id": "student_1", "email": "aarav@iitm.ac.in", "student_access_token": "token123"}])
    reg_mock = MagicMock(data=[{"id": "reg_1"}])
    link_mock = MagicMock(data=[{"referral_code": "NXTAAR01"}])

    mock_client.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
        camp_mock, student_mock
    ]
    mock_client.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.side_effect = [
        reg_mock, link_mock
    ]

    with patch.object(service.db, "get_client", return_value=mock_client):
        payload = StudentRegistrationRequest(
            full_name="Aarav Sharma",
            email="aarav@iitm.ac.in",
            college="IIT Madras",
            graduation_year=2026
        )
        with pytest.raises(DuplicateRegistrationError) as exc_info:
            service.register_student(payload)
        assert "already registered" in exc_info.value.message
        assert exc_info.value.existing_code == "NXTAAR01"


def test_registration_endpoint_returns_409_on_duplicate(client):
    with patch("app.routers.registrations.registration_service.register_student") as mock_reg:
        mock_reg.side_effect = DuplicateRegistrationError("This email address is already registered.", "NXTAAR01")

        payload = {
            "full_name": "Aarav Sharma",
            "email": "aarav@iitm.ac.in",
            "college": "IIT Madras",
            "graduation_year": 2026
        }
        response = client.post("/api/v1/registrations", json=payload)
        assert response.status_code == 409
        data = response.json()
        assert data["detail"]["code"] == "DUPLICATE_REGISTRATION"
        assert data["detail"]["existing_referral_code"] == "NXTAAR01"
