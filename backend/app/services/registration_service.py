"""Student Registration Service for LaunchLoop AI.

Enforces email normalization, duplicate prevention, campaign attribution,
cryptographically secure referral code generation, and self-referral prevention.
"""

import hashlib
import logging
import secrets
from typing import Optional, Dict, Any, Tuple
from app.core.database import db_manager
from app.schemas.registration import StudentRegistrationRequest, StudentRegistrationResponse

logger = logging.getLogger("launchloop.registration")

# Base character set for referral codes: unambiguous uppercase characters (no 0/O, 1/I)
REFERRAL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


class DuplicateRegistrationError(Exception):
    """Raised when an email is already registered for the specified campaign."""
    def __init__(self, message: str, existing_code: Optional[str] = None):
        super().__init__(message)
        self.message = message
        self.existing_code = existing_code


class DatabaseUnavailableError(Exception):
    """Raised when the database connection is offline or schema is unmigrated."""
    pass


class CampaignNotFoundError(Exception):
    """Raised when the requested campaign slug does not exist."""
    pass


def generate_unique_referral_code(prefix: str = "NXT", length: int = 5) -> str:
    """Generates a cryptographically secure, human-readable referral code.
    Example: NXTA7K9M
    """
    random_chars = "".join(secrets.choice(REFERRAL_ALPHABET) for _ in range(length))
    return f"{prefix}{random_chars}"


def hash_ip(ip: str, salt: str = "launchloop_attribution_salt_2026") -> str:
    """Produces a privacy-preserving salted SHA-256 hash of a visitor IP."""
    return hashlib.sha256(f"{ip}_{salt}".encode()).hexdigest()


class RegistrationService:
    """Orchestrates transactional student registration, attribution, and referral provisioning."""

    def __init__(self):
        self.db = db_manager

    def register_student(
        self, payload: StudentRegistrationRequest, client_ip: str = "127.0.0.1"
    ) -> StudentRegistrationResponse:
        """Executes a student registration transaction with attribution and duplicate prevention."""
        client = self.db.get_client()
        if not client:
            raise DatabaseUnavailableError(
                "Database is not configured. Please verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
            )

        # 1. Fetch Target Campaign
        try:
            camp_res = client.table("campaigns").select("*").eq("slug", payload.campaign_slug).execute()
        except Exception as e:
            logger.warning(f"Failed to query campaigns table in Supabase: {e}")
            from app.core.config import settings
            if not settings.is_production:
                logger.info("Supabase schema pending or unmigrated; completing registration via demo store.")
                from app.services.demo_store import demo_store
                return demo_store.register(payload, client_ip)
            raise DatabaseUnavailableError(
                "Unable to connect to database tables. Ensure database migrations have been executed in Supabase."
            )

        if not camp_res.data:
            raise CampaignNotFoundError(f"Active campaign '{payload.campaign_slug}' not found.")

        campaign = camp_res.data[0]
        campaign_id = campaign["id"]

        # 2. Check If Student Already Exists
        normalized_email = payload.email.lower().strip()
        student_res = client.table("students").select("*").eq("email", normalized_email).execute()

        existing_student = student_res.data[0] if student_res.data else None
        student_id = None
        student_access_token = None

        if existing_student:
            student_id = existing_student["id"]
            student_access_token = existing_student.get("student_access_token")

            # Check duplicate registration for this campaign
            reg_check = client.table("registrations").select("id").eq("student_id", student_id).eq("campaign_id", campaign_id).execute()
            if reg_check.data:
                # Fetch their referral code
                ref_link_res = client.table("referral_links").select("referral_code").eq("student_id", student_id).eq("campaign_id", campaign_id).execute()
                existing_code = ref_link_res.data[0].get("referral_code") if (ref_link_res.data and isinstance(ref_link_res.data[0], dict)) else None

                logger.info(f"Duplicate registration attempt rejected for email hash: {hashlib.sha256(normalized_email.encode()).hexdigest()[:8]}")
                raise DuplicateRegistrationError(
                    "This email address is already registered for this workshop.",
                    existing_code=existing_code
                )
        else:
            # Generate a secure personal access token for new student
            student_access_token = secrets.token_hex(24)
            new_student_data = {
                "full_name": payload.full_name.strip(),
                "email": normalized_email,
                "college": payload.college.strip(),
                "graduation_year": payload.graduation_year,
                "student_access_token": student_access_token
            }
            insert_student_res = client.table("students").insert(new_student_data).execute()
            if not insert_student_res.data:
                raise DatabaseUnavailableError("Failed to create student record in database.")
            student_id = insert_student_res.data[0]["id"]

        # 3. Referral Attribution & Self-Referral Prevention
        valid_referral_code_to_attribute = None
        referral_link_owner_id = None
        referral_link_id = None

        if payload.referral_code_used:
            code_query = client.table("referral_links").select("id, student_id, referral_code").eq("referral_code", payload.referral_code_used).execute()
            if code_query.data:
                matched_link = code_query.data[0]
                referral_link_owner_id = matched_link["student_id"]
                referral_link_id = matched_link["id"]

                # Self-Referral Prevention: Owner cannot refer themselves
                if referral_link_owner_id == student_id:
                    logger.warning(f"Self-referral attempt detected and blocked for student_id: {student_id}")
                    valid_referral_code_to_attribute = None
                else:
                    valid_referral_code_to_attribute = matched_link["referral_code"]
            else:
                logger.info(f"Unrecognized referral code '{payload.referral_code_used}' ignored. Proceeding as direct.")
                valid_referral_code_to_attribute = None

        # 4. Insert Registration Record
        registration_data = {
            "student_id": student_id,
            "campaign_id": campaign_id,
            "referral_code_used": valid_referral_code_to_attribute,
            "utm_source": payload.utm_source if not valid_referral_code_to_attribute else "referral",
            "utm_medium": payload.utm_medium,
            "utm_campaign": payload.utm_campaign,
            "utm_content": payload.utm_content,
            "is_seed": False
        }

        reg_insert_res = client.table("registrations").insert(registration_data).execute()
        if not reg_insert_res.data:
            raise DatabaseUnavailableError("Failed to record workshop registration.")

        registration_id = reg_insert_res.data[0]["id"]

        # 5. Provision Unique Referral Code for Student
        # Check if referral link already exists for this student on this campaign
        existing_link_res = client.table("referral_links").select("referral_code").eq("student_id", student_id).eq("campaign_id", campaign_id).execute()
        if existing_link_res.data and isinstance(existing_link_res.data[0], dict) and isinstance(existing_link_res.data[0].get("referral_code"), str):
            assigned_referral_code = existing_link_res.data[0]["referral_code"]
        else:
            # Generate new unique code with collision retry loop
            for _ in range(5):
                candidate_code = generate_unique_referral_code()
                try:
                    link_data = {
                        "student_id": student_id,
                        "campaign_id": campaign_id,
                        "referral_code": candidate_code,
                        "clicks_count": 0,
                        "conversions_count": 0
                    }
                    link_res = client.table("referral_links").insert(link_data).execute()
                    if link_res.data:
                        assigned_referral_code = candidate_code
                        break
                except Exception:
                    continue
            else:
                assigned_referral_code = f"NXT{secrets.token_hex(3).upper()}"

        # 6. If Valid Referral: Record Conversion Event & Update Counter
        if valid_referral_code_to_attribute and referral_link_id:
            try:
                # Log conversion event
                client.table("referral_events").insert({
                    "referral_link_id": referral_link_id,
                    "event_type": "conversion",
                    "visitor_ip_hash": hash_ip(client_ip),
                    "registered_student_id": student_id
                }).execute()

                # Authoritatively recalculate or increment conversions_count
                curr_link = client.table("referral_links").select("conversions_count").eq("id", referral_link_id).execute()
                if curr_link.data:
                    new_count = curr_link.data[0].get("conversions_count", 0) + 1
                    client.table("referral_links").update({"conversions_count": new_count}).eq("id", referral_link_id).execute()

                logger.info(f"Referral conversion credited to code {valid_referral_code_to_attribute}")
            except Exception as e:
                logger.warning(f"Non-critical error logging referral event: {e}")

        logger.info(f"Registration successful for student_id={student_id}, code={assigned_referral_code}")

        return StudentRegistrationResponse(
            registration_id=str(registration_id),
            status="confirmed",
            message="Registration confirmed! Your seat is reserved for 'Build Your First AI Project in 60 Minutes'.",
            student_name=payload.full_name.strip(),
            email=normalized_email,
            referral_code=assigned_referral_code,
            referral_url=f"http://localhost:5173/?ref={assigned_referral_code}",
            student_access_token=str(student_access_token),
            campaign={
                "title": campaign.get("title", "Build Your First AI Project in 60 Minutes"),
                "slug": campaign.get("slug", "ai-in-60-mins"),
                "date": "Sunday, Live Online Workshop",
                "time": "7:00 PM IST"
            }
        )


# Global singleton instance
registration_service = RegistrationService()
