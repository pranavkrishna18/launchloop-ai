"""Application Configuration module for LaunchLoop AI Backend.

Uses Pydantic BaseSettings to read and validate environment variables.
"""

from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
_ENV_FILE = _BACKEND_DIR / ".env"


class Settings(BaseSettings):
    # App
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    LOG_LEVEL: str = "INFO"
    
    # Security / CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    ADMIN_DEMO_SECRET: str = "dev-demo-admin-passkey-change-me"
    
    # Supabase Database & Auth
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    
    # AI Provider
    DEFAULT_AI_PROVIDER: str = "gemini"
    GEMINI_API_KEY: str = ""
    GEMINI_API_KEYS: str = ""
    GEMINI_MODEL: str = "gemini-3.8-flash"
    GEMINI_TIMEOUT_SECONDS: float = 20.0
    GEMINI_MAX_RETRIES: int = 1

    model_config = SettingsConfigDict(
        env_file=(_ENV_FILE, ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def gemini_api_key_list(self) -> List[str]:
        """Returns clean list of all configured Gemini API keys for failover rotation."""
        keys = []
        if self.GEMINI_API_KEYS:
            for k in self.GEMINI_API_KEYS.split(","):
                k_clean = k.strip()
                if k_clean and k_clean not in keys:
                    keys.append(k_clean)
        if self.GEMINI_API_KEY:
            k_clean = self.GEMINI_API_KEY.strip()
            if k_clean and k_clean not in keys:
                keys.append(k_clean)
        return keys

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @property
    def is_database_configured(self) -> bool:
        return bool(self.SUPABASE_URL and self.SUPABASE_SERVICE_ROLE_KEY)


settings = Settings()
