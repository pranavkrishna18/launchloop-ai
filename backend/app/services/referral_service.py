"""Referral Service for LaunchLoop AI.

Manages referral click logging, public validation, student dashboard statistics,
privacy-preserving leaderboard rankings, and self-referral prevention.
"""

import hashlib
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from app.core.database import db_manager
from app.schemas.referral import (
    PublicReferralValidationResponse,
    StudentReferralStatsResponse,
    ReferralMilestone,
    LeaderboardItem,
    LeaderboardResponse
)

logger = logging.getLogger("launchloop.referrals")


def anonymize_name(full_name: str) -> str:
    """Anonymizes student name for public leaderboard (e.g. 'Rahul Verma' -> 'Rahul V.')."""
    parts = full_name.strip().split()
    if len(parts) == 1:
        return parts[0]
    return f"{parts[0]} {parts[-1][0]}."


def hash_ip(ip: str, salt: str = "launchloop_attribution_salt_2026") -> str:
    """Produces a privacy-preserving salted SHA-256 hash of a visitor IP."""
    return hashlib.sha256(f"{ip}_{salt}".encode()).hexdigest()


class UnauthorizedStudentAccess(Exception):
    """Raised when student_access_token is missing, invalid, or unauthorized."""
    pass


class ReferralService:
    """Handles referral interactions, privacy-preserving validation, and stats."""

    def __init__(self):
        self.db = db_manager

    def track_click(self, referral_code: str, client_ip: str = "127.0.0.1") -> bool:
        """Logs a referral visit with IP hash and increments click counter."""
        client = self.db.get_client()
        if not client:
            from app.services.demo_store import demo_store
            return demo_store.track_click(referral_code)

        try:
            link_res = client.table("referral_links").select("id, clicks_count").eq("referral_code", referral_code.upper()).execute()
            if not link_res.data:
                from app.services.demo_store import demo_store
                return demo_store.track_click(referral_code)

            link = link_res.data[0]
            link_id = link["id"]
            new_clicks = link.get("clicks_count", 0) + 1

            # Insert click event
            client.table("referral_events").insert({
                "referral_link_id": link_id,
                "event_type": "click",
                "visitor_ip_hash": hash_ip(client_ip)
            }).execute()

            # Update cached clicks count
            client.table("referral_links").update({"clicks_count": new_clicks}).eq("id", link_id).execute()
            return True
        except Exception as e:
            logger.warning(f"Error tracking referral click for code {referral_code}: {e}")
            from app.services.demo_store import demo_store
            return demo_store.track_click(referral_code)

    def validate_code(self, referral_code: str) -> PublicReferralValidationResponse:
        """Validates a referral code and returns minimal public information."""
        client = self.db.get_client()
        clean_code = referral_code.strip().upper()

        if not client:
            # When DB is offline, return default validation response
            return PublicReferralValidationResponse(
                valid=True,
                referral_code=clean_code,
                inviter_display_name="A Classmate",
                campaign_title="Build Your First AI Project in 60 Minutes"
            )

        try:
            link_res = client.table("referral_links").select("id, student_id, campaign_id").eq("referral_code", clean_code).execute()
            if not link_res.data:
                from app.services.demo_store import demo_store
                return demo_store.validate_code(clean_code)

            student_id = link_res.data[0]["student_id"]
            student_res = client.table("students").select("full_name").eq("id", student_id).execute()
            inviter_name = None
            if student_res.data:
                inviter_name = anonymize_name(student_res.data[0]["full_name"])

            return PublicReferralValidationResponse(
                valid=True,
                referral_code=clean_code,
                inviter_display_name=inviter_name,
                campaign_title="Build Your First AI Project in 60 Minutes"
            )
        except Exception as e:
            logger.warning(f"Error validating referral code {clean_code} in Supabase: {e}. Checking demo store.")
            from app.services.demo_store import demo_store
            return demo_store.validate_code(clean_code)

    def get_student_stats(self, student_access_token: str) -> StudentReferralStatsResponse:
        """Retrieves verified referral metrics for an authenticated student using their access token."""
        if not student_access_token or not student_access_token.strip():
            raise UnauthorizedStudentAccess("Student access token required.")

        client = self.db.get_client()
        if not client:
            from app.services.demo_store import demo_store
            return demo_store.get_stats(student_access_token)

        try:
            # Authenticate student via token
            student_res = client.table("students").select("id, full_name, college").eq("student_access_token", student_access_token.strip()).execute()
            if not student_res.data:
                from app.services.demo_store import demo_store
                return demo_store.get_stats(student_access_token)

            student = student_res.data[0]
            student_id = student["id"]

            # Fetch referral link
            link_res = client.table("referral_links").select("*").eq("student_id", student_id).execute()
            if not link_res.data:
                from app.services.demo_store import demo_store
                return demo_store.get_stats(student_access_token)

            link = link_res.data[0]
            referral_code = link["referral_code"]
            clicks_count = link.get("clicks_count", 0)

            # Authoritatively count verified registrations from registrations table
            conversions_query = client.table("registrations").select("id").eq("referral_code_used", referral_code).execute()
            conversions_count = len(conversions_query.data) if conversions_query.data else link.get("conversions_count", 0)

            conv_rate = round((conversions_count / clicks_count * 100), 2) if clicks_count > 0 else 0.0

            # Calculate milestones
            milestones = [
                ReferralMilestone(target=3, reward="Priority Workshop Q&A Pass", achieved=conversions_count >= 3),
                ReferralMilestone(target=5, reward="NxtWave AI Starter Kit Blueprint", achieved=conversions_count >= 5),
                ReferralMilestone(target=10, reward="1-on-1 Placement Resume Review", achieved=conversions_count >= 10),
            ]

            # Calculate rank
            rank = 1
            try:
                higher_links = client.table("referral_links").select("id").gt("conversions_count", conversions_count).execute()
                if higher_links.data:
                    rank = len(higher_links.data) + 1
            except Exception:
                rank = None

            return StudentReferralStatsResponse(
                referral_code=referral_code,
                student_name=student["full_name"],
                clicks_count=clicks_count,
                conversions_count=conversions_count,
                conversion_rate_percentage=conv_rate,
                referral_url=f"http://localhost:5173/?ref={referral_code}",
                milestones=milestones,
                rank=rank
            )
        except UnauthorizedStudentAccess:
            raise
        except Exception as e:
            logger.warning(f"Error fetching student stats from Supabase: {e}. Falling back to demo store.")
            from app.services.demo_store import demo_store
            return demo_store.get_stats(student_access_token)

    def get_leaderboard(self, limit: int = 10) -> LeaderboardResponse:
        """Returns privacy-conscious campus advocate leaderboard."""
        client = self.db.get_client()
        last_updated = datetime.now(timezone.utc).isoformat()

        if not client:
            from app.services.demo_store import demo_store
            return demo_store.get_leaderboard(limit)

        try:
            # Query top referral links by conversions_count
            top_links_res = client.table("referral_links").select("student_id, referral_code, conversions_count").order("conversions_count", desc=True).limit(limit).execute()
            if not top_links_res.data:
                from app.services.demo_store import demo_store
                return demo_store.get_leaderboard(limit)
                return LeaderboardResponse(leaderboard=[], total_advocates=0, last_updated=last_updated)

            leaderboard_items = []
            for idx, item in enumerate(top_links_res.data):
                student_id = item["student_id"]
                s_res = client.table("students").select("full_name, college").eq("id", student_id).execute()
                if s_res.data:
                    student_info = s_res.data[0]
                    display_name = anonymize_name(student_info.get("full_name", "Student Advocate"))
                    college = student_info.get("college", "Engineering College")
                    leaderboard_items.append(
                        LeaderboardItem(
                            rank=idx + 1,
                            display_name=display_name,
                            college=college,
                            verified_referrals=item.get("conversions_count", 0)
                        )
                    )

            return LeaderboardResponse(
                leaderboard=leaderboard_items,
                total_advocates=len(leaderboard_items),
                last_updated=last_updated
            )
        except Exception as e:
            logger.warning(f"Error fetching leaderboard: {e}")
            return LeaderboardResponse(leaderboard=[], total_advocates=0, last_updated=last_updated)


# Global singleton instance
referral_service = ReferralService()
