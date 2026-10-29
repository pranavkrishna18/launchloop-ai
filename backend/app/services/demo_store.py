"""In-Memory Demo Store for LaunchLoop AI.

Provides persistent demo state for student registrations, referral attribution,
and campaign metrics when Supabase schema migrations are pending or local evaluation
is running without cloud PostgreSQL tables.
Automatically hands over to Supabase PostgreSQL once database/01_schema.sql is executed.
"""

import hashlib
import secrets
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from app.schemas.registration import StudentRegistrationRequest, StudentRegistrationResponse
from app.schemas.referral import (
    StudentReferralStatsResponse,
    ReferralMilestone,
    LeaderboardItem,
    LeaderboardResponse,
    PublicReferralValidationResponse
)

def anonymize_name(full_name: str) -> str:
    parts = full_name.strip().split()
    if len(parts) == 1:
        return parts[0]
    return f"{parts[0]} {parts[-1][0]}."

class DemoStore:
    def __init__(self):
        self.students: Dict[str, Dict[str, Any]] = {}
        self.students_by_email: Dict[str, Dict[str, Any]] = {}
        self.students_by_token: Dict[str, Dict[str, Any]] = {}
        self.registrations: List[Dict[str, Any]] = []
        self.referral_links: Dict[str, Dict[str, Any]] = {}  # code -> link dict
        self.referral_links_by_student: Dict[str, Dict[str, Any]] = {}
        self.clicks_log: List[Dict[str, Any]] = []
        self._seed_initial_cohort()

    def _seed_initial_cohort(self):
        """Initializes realistic baseline ambassadors for initial demonstration."""
        ambassadors = [
            ("Priya Sharma", "priya.s@iitb.ac.in", "IIT Bombay", 2026, "NXTPRIYA", 18, 5),
            ("Arjun Mehta", "arjun.m@bits-pilani.ac.in", "BITS Pilani", 2026, "NXTARJUN", 14, 3),
            ("Sneha Rao", "sneha.rao@nitk.edu.in", "NIT Surathkal", 2025, "NXTSNEHA", 9, 2),
            ("Kavya Nair", "kavya.n@dtu.ac.in", "Delhi Technological University", 2026, "NXTKAVYA", 6, 1),
        ]
        for name, email, college, grad_yr, code, clicks, conversions in ambassadors:
            s_id = f"demo-ambassador-{code.lower()}"
            token = f"demo-token-{code.lower()}"
            s_dict = {
                "id": s_id,
                "full_name": name,
                "email": email.lower(),
                "college": college,
                "graduation_year": grad_yr,
                "student_access_token": token
            }
            self.students[s_id] = s_dict
            self.students_by_email[email.lower()] = s_dict
            self.students_by_token[token] = s_dict

            link_dict = {
                "id": f"link-{code.lower()}",
                "student_id": s_id,
                "referral_code": code,
                "clicks_count": clicks,
                "conversions_count": conversions
            }
            self.referral_links[code] = link_dict
            self.referral_links_by_student[s_id] = link_dict

            self.registrations.append({
                "id": f"reg-{code.lower()}",
                "student_id": s_id,
                "campaign_id": "ai-in-60-mins",
                "referral_code_used": None,
                "utm_source": "direct",
                "registered_at": datetime.now(timezone.utc).isoformat(),
                "is_seed": True
            })

    def register(self, payload: StudentRegistrationRequest, client_ip: str = "127.0.0.1") -> StudentRegistrationResponse:
        email = payload.email.lower().strip()
        if email in self.students_by_email:
            existing = self.students_by_email[email]
            link = self.referral_links_by_student.get(existing["id"], {})
            from app.services.registration_service import DuplicateRegistrationError
            raise DuplicateRegistrationError(
                "This email address is already registered for this workshop.",
                existing_code=link.get("referral_code", "NXT")
            )

        student_id = f"student-{secrets.token_hex(4)}"
        token = secrets.token_hex(24)
        new_student = {
            "id": student_id,
            "full_name": payload.full_name.strip(),
            "email": email,
            "college": payload.college.strip(),
            "graduation_year": payload.graduation_year,
            "student_access_token": token
        }
        self.students[student_id] = new_student
        self.students_by_email[email] = new_student
        self.students_by_token[token] = new_student

        # Generate unique referral code
        candidate_code = f"NXT{secrets.token_hex(3).upper()}"
        while candidate_code in self.referral_links:
            candidate_code = f"NXT{secrets.token_hex(3).upper()}"

        link_dict = {
            "id": f"link-{candidate_code.lower()}",
            "student_id": student_id,
            "referral_code": candidate_code,
            "clicks_count": 0,
            "conversions_count": 0
        }
        self.referral_links[candidate_code] = link_dict
        self.referral_links_by_student[student_id] = link_dict

        # Attribution handling
        ref_used = payload.referral_code_used.strip().upper() if payload.referral_code_used else None
        valid_attribution = None
        if ref_used and ref_used in self.referral_links:
            inviter_link = self.referral_links[ref_used]
            if inviter_link["student_id"] != student_id:
                valid_attribution = ref_used
                inviter_link["conversions_count"] += 1

        reg_id = f"reg-{secrets.token_hex(4)}"
        self.registrations.append({
            "id": reg_id,
            "student_id": student_id,
            "campaign_id": payload.campaign_slug,
            "referral_code_used": valid_attribution,
            "utm_source": "referral" if valid_attribution else (payload.utm_source or "direct"),
            "registered_at": datetime.now(timezone.utc).isoformat(),
            "is_seed": False
        })

        return StudentRegistrationResponse(
            registration_id=reg_id,
            status="confirmed",
            message="Registration confirmed! Your seat is reserved for 'Build Your First AI Project in 60 Minutes'.",
            student_name=payload.full_name.strip(),
            email=email,
            referral_code=candidate_code,
            referral_url=f"http://localhost:5173/register?ref={candidate_code}",
            student_access_token=token,
            campaign={
                "title": "Build Your First AI Project in 60 Minutes",
                "slug": payload.campaign_slug,
                "date": "Sunday, Live Online Workshop",
                "time": "7:00 PM IST"
            }
        )

    def track_click(self, referral_code: str) -> bool:
        code = referral_code.strip().upper()
        if code in self.referral_links:
            self.referral_links[code]["clicks_count"] += 1
            return True
        return False

    def validate_code(self, referral_code: str) -> PublicReferralValidationResponse:
        code = referral_code.strip().upper()
        if code in self.referral_links:
            link = self.referral_links[code]
            student = self.students.get(link["student_id"])
            name = student.get("full_name") if student else "Classmate"
            return PublicReferralValidationResponse(
                valid=True,
                referral_code=code,
                inviter_display_name=anonymize_name(name),
                campaign_title="Build Your First AI Project in 60 Minutes"
            )
        return PublicReferralValidationResponse(
            valid=False,
            referral_code=code,
            inviter_display_name=None,
            campaign_title="Build Your First AI Project in 60 Minutes"
        )

    def get_stats(self, token: str) -> StudentReferralStatsResponse:
        student = self.students_by_token.get(token)
        if not student:
            from app.services.referral_service import UnauthorizedStudentAccess
            raise UnauthorizedStudentAccess("Invalid student access token.")

        link = self.referral_links_by_student.get(student["id"], {})
        code = link.get("referral_code", "NXT")
        clicks = link.get("clicks_count", 0)
        conversions = link.get("conversions_count", 0)
        conv_rate = round((conversions / clicks * 100), 2) if clicks > 0 else 0.0

        milestones = [
            ReferralMilestone(target=3, reward="Priority Workshop Q&A Pass", achieved=conversions >= 3),
            ReferralMilestone(target=5, reward="NxtWave AI Starter Kit Blueprint", achieved=conversions >= 5),
            ReferralMilestone(target=10, reward="1-on-1 Placement Resume Review", achieved=conversions >= 10),
        ]

        # Rank
        sorted_links = sorted(self.referral_links.values(), key=lambda x: x["conversions_count"], reverse=True)
        rank = 1
        for idx, l in enumerate(sorted_links):
            if l["referral_code"] == code:
                rank = idx + 1
                break

        return StudentReferralStatsResponse(
            referral_code=code,
            student_name=student["full_name"],
            clicks_count=clicks,
            conversions_count=conversions,
            conversion_rate_percentage=conv_rate,
            referral_url=f"http://localhost:5173/register?ref={code}",
            milestones=milestones,
            rank=rank
        )

    def get_leaderboard(self, limit: int = 10) -> LeaderboardResponse:
        sorted_links = sorted(self.referral_links.values(), key=lambda x: x["conversions_count"], reverse=True)
        items = []
        for idx, l in enumerate(sorted_links[:limit]):
            student = self.students.get(l["student_id"], {})
            items.append(
                LeaderboardItem(
                    rank=idx + 1,
                    display_name=anonymize_name(student.get("full_name", "Student Advocate")),
                    college=student.get("college", "Engineering College"),
                    verified_referrals=l["conversions_count"]
                )
            )
        return LeaderboardResponse(
            leaderboard=items,
            total_advocates=len(self.referral_links),
            last_updated=datetime.now(timezone.utc).isoformat()
        )

demo_store = DemoStore()
