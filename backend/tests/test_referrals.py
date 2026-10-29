"""Automated tests for referral engine, attribution, and leaderboard.
"""

from unittest.mock import MagicMock, patch
from app.services.registration_service import generate_unique_referral_code
from app.services.referral_service import ReferralService, anonymize_name, UnauthorizedStudentAccess


def test_referral_code_generator():
    code1 = generate_unique_referral_code()
    code2 = generate_unique_referral_code()
    assert code1.startswith("NXT")
    assert len(code1) == 8
    assert code1 != code2  # Highly random


def test_anonymize_name():
    assert anonymize_name("Rahul Verma") == "Rahul V."
    assert anonymize_name("Priya") == "Priya"
    assert anonymize_name("Aarav Kumar Sharma") == "Aarav S."


def test_validate_code_public():
    service = ReferralService()
    mock_client = MagicMock()

    # Mock referral_links lookup
    mock_client.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
        MagicMock(data=[{"id": "link_1", "student_id": "student_1", "campaign_id": "camp_1"}]),
        MagicMock(data=[{"full_name": "Kavya Murthy"}])
    ]

    with patch.object(service.db, "get_client", return_value=mock_client):
        res = service.validate_code("NXTKAV02")
        assert res.valid is True
        assert res.referral_code == "NXTKAV02"
        assert res.inviter_display_name == "Kavya M."


def test_get_student_stats_requires_valid_token():
    service = ReferralService()
    mock_client = MagicMock()

    # Student not found with token
    mock_client.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[])

    with patch.object(service.db, "get_client", return_value=mock_client):
        try:
            service.get_student_stats("invalid_token")
            assert False, "Should have raised UnauthorizedStudentAccess"
        except UnauthorizedStudentAccess as e:
            assert "Invalid student access token" in str(e)


def test_get_student_stats_success():
    service = ReferralService()
    mock_client = MagicMock()

    student_data = [{"id": "student_1", "full_name": "Rahul Verma", "college": "RV College"}]
    link_data = [{"id": "link_1", "referral_code": "NXTRAH03", "clicks_count": 25, "conversions_count": 5}]
    registrations_data = [{"id": "r1"}, {"id": "r2"}, {"id": "r3"}, {"id": "r4"}, {"id": "r5"}]

    mock_client.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
        MagicMock(data=student_data),
        MagicMock(data=link_data),
        MagicMock(data=registrations_data)
    ]
    # For rank calculation gt
    mock_client.table.return_value.select.return_value.gt.return_value.execute.return_value = MagicMock(data=[{"id": "other_link"}])

    with patch.object(service.db, "get_client", return_value=mock_client):
        stats = service.get_student_stats("valid_token_123")
        assert stats.referral_code == "NXTRAH03"
        assert stats.student_name == "Rahul Verma"
        assert stats.clicks_count == 25
        assert stats.conversions_count == 5
        assert stats.conversion_rate_percentage == 20.0
        assert stats.rank == 2
        # Check milestones
        assert stats.milestones[0].achieved is True   # target 3
        assert stats.milestones[1].achieved is True   # target 5
        assert stats.milestones[2].achieved is False  # target 10


def test_stats_endpoint_returns_401_when_no_token(client):
    response = client.get("/api/v1/referrals/stats")
    assert response.status_code == 401
    assert "token required" in response.json()["detail"]["message"].lower()


def test_public_leaderboard_endpoint(client):
    with patch("app.routers.referrals.referral_service.get_leaderboard") as mock_lb:
        from app.schemas.referral import LeaderboardResponse, LeaderboardItem
        mock_lb.return_value = LeaderboardResponse(
            leaderboard=[
                LeaderboardItem(rank=1, display_name="Aarav S.", college="IIT Madras", verified_referrals=15),
                LeaderboardItem(rank=2, display_name="Kavya M.", college="NIT Trichy", verified_referrals=8),
            ],
            total_advocates=2,
            last_updated="2026-10-28T10:00:00Z"
        )
        response = client.get("/api/v1/referrals/leaderboard")
        assert response.status_code == 200
        data = response.json()
        assert len(data["leaderboard"]) == 2
        assert data["leaderboard"][0]["display_name"] == "Aarav S."
        assert data["leaderboard"][0]["verified_referrals"] == 15
