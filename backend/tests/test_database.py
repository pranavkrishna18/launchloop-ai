"""Unit tests for Supabase database connection and diagnostics.
"""

from unittest.mock import MagicMock, patch
from app.core.database import DatabaseManager


def test_db_check_connection_unconfigured():
    manager = DatabaseManager()
    with patch("app.core.config.settings.SUPABASE_URL", ""):
        with patch("app.core.config.settings.SUPABASE_SERVICE_ROLE_KEY", ""):
            res = manager.check_connection()
            assert res["status"] == "unconfigured"
            assert res["connected"] is False
            assert "sb_secret" not in str(res)


def test_db_check_connection_handles_schema_pending():
    manager = DatabaseManager()
    mock_client = MagicMock()
    # Mock PostgREST table query raising missing table error (PGRST205)
    mock_client.table.return_value.select.return_value.limit.return_value.execute.side_effect = Exception("PGRST205: Could not find the table 'public.campaigns'")
    
    with patch.object(manager, "get_client", return_value=mock_client):
        with patch("app.core.config.settings.SUPABASE_URL", "https://mock.supabase.co"):
            with patch("app.core.config.settings.SUPABASE_SERVICE_ROLE_KEY", "sb_secret_mock"):
                res = manager.check_connection()
                assert res["status"] == "schema_pending"
                assert "action_required" in res
                assert res["connected"] is False


def test_db_check_connection_success():
    manager = DatabaseManager()
    mock_client = MagicMock()
    mock_res = MagicMock()
    mock_res.data = [{"id": "c1", "slug": "ai-in-60-mins", "is_active": True}]
    mock_client.table.return_value.select.return_value.limit.return_value.execute.return_value = mock_res
    
    with patch.object(manager, "get_client", return_value=mock_client):
        with patch("app.core.config.settings.SUPABASE_URL", "https://mock.supabase.co"):
            with patch("app.core.config.settings.SUPABASE_SERVICE_ROLE_KEY", "sb_secret_mock"):
                res = manager.check_connection()
                assert res["status"] == "connected"
                assert res["connected"] is True
                assert res["campaigns_found"] == 1
