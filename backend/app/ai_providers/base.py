"""Base AI Provider Interface and Exception Definitions for LaunchLoop AI.
"""

from abc import ABC, abstractmethod
from app.schemas.magnet import MagnetRequest, ProjectRecommendation


class AIError(Exception):
    """Base exception for all AI provider operations."""
    def __init__(self, message: str, status_code: int = 500):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class AIConfigurationError(AIError):
    """Raised when provider configuration or credentials are missing/invalid."""
    def __init__(self, message: str = "AI Provider is not configured or missing API credentials."):
        super().__init__(message, status_code=500)


class AIRateLimitError(AIError):
    """Raised when the AI provider throttles requests (HTTP 429)."""
    def __init__(self, message: str = "AI Provider rate limit reached."):
        super().__init__(message, status_code=429)


class AITimeoutError(AIError):
    """Raised when the AI provider request exceeds timeout deadline."""
    def __init__(self, message: str = "AI Provider request timed out."):
        super().__init__(message, status_code=504)


class AIValidationError(AIError):
    """Raised when the generated output fails schema validation or semantic checks."""
    def __init__(self, message: str = "AI generated response failed validation."):
        super().__init__(message, status_code=502)


class AIProviderUnavailableError(AIError):
    """Raised when the remote provider is down or unreachable."""
    def __init__(self, message: str = "AI Provider is currently unavailable."):
        super().__init__(message, status_code=503)


class BaseAIProvider(ABC):
    """Abstract Base Class for AI model providers."""

    @abstractmethod
    async def generate_project_recommendation(
        self, request: MagnetRequest
    ) -> ProjectRecommendation:
        """Generates a structured beginner-friendly project recommendation from student inputs."""
        pass
