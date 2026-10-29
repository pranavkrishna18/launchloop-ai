"""Supabase & Database Management Module for LaunchLoop AI Backend.

Provides a resilient database client connection, startup validation,
safe health diagnostics, and error handling.
Supports both standard Supabase JWT service keys and new `sb_secret_` formats.
"""

import logging
import re
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger("launchloop.database")

# Monkey-patch outdated JWT regex in supabase-py if using modern sb_secret_ credentials
try:
    import supabase._sync.client as sc
    _orig_init = sc.SyncClient.__init__

    def _patched_client_init(self, supabase_url: str, supabase_key: str, options=None):
        if not supabase_key.startswith("sb_secret_") and not re.match(
            r"^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$", supabase_key
        ):
            raise sc.SupabaseException("Invalid API key")
        from supabase._sync.client import ClientOptions, SyncMemoryStorage
        if options is None:
            options = ClientOptions(storage=SyncMemoryStorage())
        self.supabase_url = supabase_url
        self.supabase_key = supabase_key
        self.options = options
        options.headers.update(self._get_auth_headers())
        self.rest_url = f"{supabase_url}/rest/v1"
        self.realtime_url = f"{supabase_url}/realtime/v1".replace("http", "ws")
        self.auth_url = f"{supabase_url}/auth/v1"
        self.storage_url = f"{supabase_url}/storage/v1"
        self.functions_url = f"{supabase_url}/functions/v1"
        self.auth = self._init_supabase_auth_client(auth_url=self.auth_url, client_options=options)
        self.realtime = self._init_realtime_client(realtime_url=self.realtime_url, supabase_key=self.supabase_key, options=options.realtime if options else None)
        self._postgrest = None
        self._storage = None
        self._functions = None
        self.auth.on_auth_state_change(self._listen_to_auth_events)

    sc.SyncClient.__init__ = _patched_client_init
except Exception as e:
    logger.debug(f"Supabase SyncClient monkeypatch skipped or not required: {e}")


class DatabaseManager:
    """Manages connection to Supabase PostgreSQL and diagnostics."""

    def __init__(self):
        self._client = None
        self._initialized = False

    def get_client(self):
        """Returns the active Supabase client singleton, initializing on first call."""
        if not self._initialized:
            self._init_client()
        return self._client

    def _init_client(self):
        self._initialized = True
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            logger.info("Supabase credentials not configured in environment.")
            self._client = None
            return

        try:
            from supabase import create_client
            self._client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
            logger.info("Supabase client initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            self._client = None

    def check_connection(self) -> Dict[str, Any]:
        """Performs a safe, non-destructive health probe without leaking secrets."""
        if not settings.is_database_configured:
            return {
                "status": "unconfigured",
                "message": "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in backend/.env",
                "connected": False
            }

        client = self.get_client()
        if not client:
            return {
                "status": "initialization_failed",
                "message": "Unable to initialize Supabase client.",
                "connected": False
            }

        try:
            # Query the campaigns table to verify schema availability
            res = client.table("campaigns").select("id, slug, is_active").limit(1).execute()
            return {
                "status": "connected",
                "message": "Successfully connected to Supabase PostgreSQL.",
                "connected": True,
                "campaigns_found": len(res.data) if res.data else 0
            }
        except Exception as e:
            err_msg = str(e)
            if "PGRST205" in err_msg or "Could not find the table" in err_msg:
                return {
                    "status": "schema_pending",
                    "message": "Credentials verified and PostgREST reachable, but database schema has not been executed yet in the Supabase SQL Editor.",
                    "connected": False,
                    "action_required": "Run database/01_schema.sql and database/03_seed_data.sql in the Supabase SQL Editor."
                }
            logger.warning(f"Database health probe failed: {err_msg}")
            return {
                "status": "connection_error",
                "message": "Failed to query database.",
                "connected": False,
                "error_type": type(e).__name__
            }


# Singleton instance
db_manager = DatabaseManager()


def get_db():
    """Dependency injection helper for FastAPI routers."""
    return db_manager.get_client()
