"""Security & Authorization Module for LaunchLoop AI Backend.

Enforces strict backend verification of organizers and admins.
Never trusts frontend-asserted roles.
In production, requires valid Supabase Auth JWT with organizer claims.
"""

import logging
from typing import Optional
from fastapi import Header, HTTPException, status, Depends
from app.core.config import settings

logger = logging.getLogger("launchloop.security")


async def verify_organizer_access(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    x_admin_secret: Optional[str] = Header(None, alias="X-Admin-Secret")
) -> dict:
    """Verifies that the incoming request is authorized to perform organizer operations.
    
    Rules:
    1. In production (ENVIRONMENT=production):
       - Strict Supabase Auth JWT is required.
       - X-Admin-Secret is permanently disabled and rejected with 403.
    2. In non-production (development / evaluation):
       - If X-Admin-Secret matches ADMIN_DEMO_SECRET, access is granted with a demo audit log.
       - Alternatively, valid Supabase JWT is accepted.
    """
    # 1. Reject unauthorized request immediately if no credentials provided
    if not authorization and not x_admin_secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required: Provide a valid Authorization bearer token or admin credential.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2. Check X-Admin-Secret header
    if x_admin_secret:
        if settings.is_production:
            logger.warning("Attempted use of X-Admin-Secret in production environment rejected.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Demo secret authentication is permanently disabled in production. Use Supabase Auth."
            )
        
        if settings.ADMIN_DEMO_SECRET and x_admin_secret == settings.ADMIN_DEMO_SECRET:
            logger.info("Organizer access granted via development demo passkey.")
            return {
                "auth_method": "demo_secret",
                "role": "organizer",
                "email": "demo.organizer@nxtwave.local"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid admin credentials."
            )

    # 3. Check Supabase Auth Bearer Token
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "").strip()
        # Note: In Phase 1/2, token verification checks with Supabase Auth or verifies JWT signature
        # Real decoding will occur using Supabase Auth Client when Supabase URL/Key is configured
        if token == "mock-valid-organizer-jwt" and not settings.is_production:
            return {
                "auth_method": "supabase_jwt",
                "role": "organizer",
                "email": "organizer@nxtwave.tech"
            }
        
        # When Supabase is configured:
        if settings.is_database_configured:
            try:
                # We will import supabase client and call auth.get_user(token)
                from supabase import create_client
                client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
                user_res = client.auth.get_user(token)
                if user_res and user_res.user:
                    user_metadata = user_res.user.app_metadata or {}
                    user_role = user_metadata.get("role")
                    user_email = user_res.user.email or ""
                    
                    if user_role in ("organizer", "admin") or user_email.endswith("@nxtwave.tech"):
                        return {
                            "auth_method": "supabase_jwt",
                            "role": "organizer",
                            "user_id": user_res.user.id,
                            "email": user_email
                        }
            except Exception as e:
                logger.error(f"Supabase JWT verification failed: {e}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired authentication token."
                )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: User lacks organizer/admin permissions."
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication scheme. Bearer token expected."
    )
