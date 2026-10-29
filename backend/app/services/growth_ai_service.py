"""AI Growth Intelligence Service for LaunchLoop AI Organizer Dashboard.

Analyzes aggregated campaign telemetry and generates grounded, tactical growth hypotheses
using Google Gemini (or transparent deterministic heuristics if AI is offline).
Zero PII is sent to the LLM.
"""

import asyncio
from datetime import datetime, timezone
import json
import logging
from typing import Dict, Any, List, Optional
from pydantic import ValidationError
from app.core.config import settings
from app.schemas.analytics import (
    CampaignOverviewKPIs,
    GrowthRecommendationItem,
    AIGrowthIntelligenceResponse
)
from app.services.analytics_service import analytics_service

logger = logging.getLogger("launchloop.growth_ai")

GROWTH_SYSTEM_INSTRUCTION = """You are a Principal Growth Marketing & Acquisition Intelligence Architect advising NxtWave organizers on their student acquisition challenge:
'Build Your First AI Project in 60 Minutes' (Goal: 500 final-year engineering student registrations in 7 days, ₹2,000 total budget).

STRICT GUARDRAILS:
1. Grounding: You MUST ground every recommendation in the real, measured telemetry metrics provided in the prompt.
2. No Metric Inventions: Do NOT fabricate clicks, impressions, or conversions that are not in the telemetry summary.
3. No False Promises: Do NOT guarantee the campaign will reach 500 registrations.
4. No Causal Overclaiming: Do NOT assert correlation implies causation. Explicitly label expected impact as a testable hypothesis or estimate.
5. Low-Data Protocol: If registrations or clicks are 0 or very low, recommend low-cost discovery experiments to collect evidence (e.g., college placement WhatsApp groups, LinkedIn alumni outreach) rather than drawing sweeping conclusions.
6. Privacy & Scope: Never request or assume access to personal student identities.
7. Output: Provide exactly 3 to 4 actionable, prioritized recommendations adhering strictly to the JSON schema.
"""


class GrowthAIService:
    """Orchestrates AI Growth Intelligence recommendations."""

    def __init__(self):
        self._provider = None

    def _get_gemini_clients(self) -> List[Any]:
        keys = settings.gemini_api_key_list
        if not keys:
            return []
        clients = []
        try:
            from google import genai
            for k in keys:
                try:
                    clients.append(genai.Client(api_key=k))
                except Exception as ce:
                    logger.warning(f"Failed to initialize Gemini client for key: {ce}")
        except Exception as e:
            logger.error(f"Failed to import GenAI SDK: {e}")
        return clients

    def build_sanitized_summary(self, campaign_slug: str = "ai-in-60-mins") -> Dict[str, Any]:
        """Gathers aggregated campaign metrics with zero PII.
        Strictly excludes student names, emails, phones, tokens, and IP addresses.
        """
        overview = analytics_service.get_campaign_overview(campaign_slug)
        channels = analytics_service.get_channel_attribution(campaign_slug)
        referrals = analytics_service.get_referral_analytics(campaign_slug)
        variants = analytics_service.get_copy_variants(campaign_slug)

        # Build clean, compact dictionary of aggregated numbers only
        top_channels = [
            {
                "channel": c.channel,
                "registrations": c.registrations_count,
                "share_pct": c.percentage_of_total
            }
            for c in channels.channels[:5]
        ]

        variant_summary = [
            {
                "key": v.variant_key,
                "channel": v.channel,
                "clicks": v.clicks,
                "registrations": v.registrations,
                "ctr": v.ctr_percentage
            }
            for v in variants.variants[:4]
        ]

        return {
            "campaign_title": overview.campaign_title,
            "target_registrations": overview.target_registrations,
            "real_registrations": overview.real_registrations,
            "target_achievement_pct": overview.target_achievement_percentage,
            "remaining_to_target": overview.remaining_registrations,
            "total_budget_inr": overview.budget_inr,
            "budget_allocation_per_reg_inr": overview.budget_allocation_per_registration_inr,
            "referral_clicks": overview.referral_clicks,
            "referral_conversions": overview.referral_conversions,
            "referral_conversion_rate_pct": overview.referral_conversion_rate_percentage,
            "active_student_advocates": referrals.total_advocates,
            "top_channels": top_channels,
            "variants_tracked": variant_summary,
            "data_status": overview.data_status
        }

    def generate_heuristic_fallback(
        self, summary: Dict[str, Any], reason: str
    ) -> AIGrowthIntelligenceResponse:
        """Generates deterministic, rule-based diagnostic recommendations when Gemini is offline.
        Transparently declares itself as non-AI heuristic to prevent misleading users.
        """
        now_iso = datetime.now(timezone.utc).isoformat()
        real_regs = summary.get("real_registrations", 0)
        target = summary.get("target_registrations", 500)
        ref_rate = summary.get("referral_conversion_rate_pct")
        clicks = summary.get("referral_clicks", 0)
        channels = summary.get("top_channels", [])

        recommendations = []

        # Rule 1: Cold Start or Low Registrations
        if real_regs < 20:
            recommendations.append(
                GrowthRecommendationItem(
                    title="Cold-Start Experiment: Activate Department WhatsApp Placement Groups",
                    observed_evidence=f"Current authentic registrations stand at {real_regs}/{target} ({summary.get('target_achievement_pct', 0)}% of target).",
                    proposed_action="Mobilize 5 campus ambassadors to post verified workshop invites directly in final-year CSE/IT placement and project WhatsApp groups.",
                    rationale="Engineering students in placement semester actively share career-relevant technical sessions with immediate peers when shared by trusted classmates rather than public ads.",
                    effort="Low",
                    expected_impact="Hypothesis: 30–50 initial registrations within 24 hours at zero incremental ad spend.",
                    confidence_and_limitations="High feasibility; limited by ambassador network reach and peer group admin approvals."
                )
            )

        # Rule 2: Referral Loop Activation
        if clicks == 0 or ref_rate is None or ref_rate < 15.0:
            recommendations.append(
                GrowthRecommendationItem(
                    title="Optimize Post-Registration Viral Share Kit with WhatsApp 1-Click CTA",
                    observed_evidence=f"Referral conversion rate is currently {ref_rate or 0}% across {clicks} total referral link clicks.",
                    proposed_action="Ensure the post-registration success modal pre-fills a 1-click WhatsApp message highlighting the free certificate and verified project capstone.",
                    rationale="Minimizing friction between confirming a seat and sharing the invite link with college project partners increases viral k-factor.",
                    effort="Low",
                    expected_impact="Hypothesis: Increase referral conversion rate from {ref_rate or 0}% to 18–25% among registrants.",
                    confidence_and_limitations="Moderate confidence; depends on students having active study groups seeking similar capstones."
                )
            )

        # Rule 3: Channel Concentration / Diversification
        if channels:
            top_channel = channels[0]["channel"]
            recommendations.append(
                GrowthRecommendationItem(
                    title=f"Scale Dominant Acquisition Channel: {top_channel.title()}",
                    observed_evidence=f"{top_channel.title()} currently drives {channels[0]['registrations']} registrations ({channels[0]['share_pct']}% of total traffic).",
                    proposed_action=f"Double down on {top_channel.title()} by releasing targeted variations tailored to specific branches (e.g., ECE/EEE students seeking software roles).",
                    rationale="Focusing limited time and energy on proven channels yields higher conversion density than spreading effort across unproven mediums.",
                    effort="Medium",
                    expected_impact="Hypothesis: 1.5x throughput from primary channel within 48 hours.",
                    confidence_and_limitations="Depends on audience saturation in existing groups."
                )
            )
        else:
            recommendations.append(
                GrowthRecommendationItem(
                    title="Launch Channel Discovery Experiment across LinkedIn & College Portals",
                    observed_evidence="No primary attribution channel has established statistical dominance yet.",
                    proposed_action="Deploy 2 distinct tracking links (UTM source 'linkedin' and 'whatsapp') across campus student circles to identify highest-converting traffic source.",
                    rationale="Establishing channel attribution benchmarks early prevents misallocating the ₹2,000 budget on underperforming channels.",
                    effort="Low",
                    expected_impact="Hypothesis: Reveal winning channel with >2x higher conversion efficiency within 36 hours.",
                    confidence_and_limitations="Requires active distribution across at least 3 distinct college campus networks."
                )
            )

        # Rule 4: Budget CAC Guardrail
        recommendations.append(
            GrowthRecommendationItem(
                title="Preserve ₹2,000 Budget for Milestone Acceleration Blitz (Days 5–7)",
                observed_evidence=f"Remaining registrations to target: {summary.get('remaining_to_target', target)}. Total budget ceiling: ₹2,000.",
                proposed_action="Keep paid promotion paused until viral loops validate initial organic registration quality. Reserve ₹1,500 for a targeted 48-hour LinkedIn/Instagram push 2 days before the workshop.",
                rationale="Paid acquisition performs 3x better when combined with social proof from early organic peer registrations.",
                effort="Low",
                expected_impact="Hypothesis: Maximize urgency and fill final 150 seats at target CAC < ₹10/student.",
                confidence_and_limitations="Requires strict timing and compelling countdown creatives."
            )
        )

        return AIGrowthIntelligenceResponse(
            campaign_slug="ai-in-60-mins",
            generated_at=now_iso,
            provider="heuristic-diagnostic-engine",
            model="rule-based-heuristics",
            is_ai_generated=False,
            status="fallback",
            recommendations=recommendations,
            disclaimer=f"Diagnostic recommendations generated by rule-based heuristic engine ({reason}). Telemetry data is measured; suggestions are strategic hypotheses."
        )

    async def generate_growth_recommendations(
        self, campaign_slug: str = "ai-in-60-mins"
    ) -> AIGrowthIntelligenceResponse:
        """Generates AI growth recommendations via Gemini using sanitized telemetry.
        Falls back gracefully across configured API keys, and to heuristic diagnostics if all keys fail.
        """
        now_iso = datetime.now(timezone.utc).isoformat()
        sanitized_summary = self.build_sanitized_summary(campaign_slug)

        clients = self._get_gemini_clients()
        if not clients:
            logger.info("No Gemini API keys configured; serving heuristic growth diagnostic.")
            return self.generate_heuristic_fallback(
                sanitized_summary, "Gemini API key not configured in backend/.env"
            )

        from google.genai import types

        prompt = f"""Analyze this aggregated campaign telemetry for our free AI workshop:
Telemetry Summary (Sanitized - Zero Personal Data):
{json.dumps(sanitized_summary, indent=2)}

Generate 3 to 4 actionable, grounded growth recommendations following the AIGrowthIntelligenceResponse schema."""

        config = types.GenerateContentConfig(
            system_instruction=GROWTH_SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            response_schema=AIGrowthIntelligenceResponse,
            temperature=0.6,
        )

        models_to_try = ["gemini-3.5-flash-lite", settings.GEMINI_MODEL, "gemini-3.5-flash"]
        seen = set()
        models_to_try = [m for m in models_to_try if not (m in seen or seen.add(m))]

        last_error = None
        for idx, client in enumerate(clients):
            for active_model in models_to_try:
                try:
                    # Wrap SDK call with configured timeout
                    response = await asyncio.wait_for(
                        asyncio.to_thread(
                            client.models.generate_content,
                            model=active_model,
                            contents=prompt,
                            config=config
                        ),
                        timeout=settings.GEMINI_TIMEOUT_SECONDS
                    )

                    if not response or not response.text:
                        raise ValueError("Empty response from Gemini")

                    raw_text = response.text.strip()
                    data = json.loads(raw_text)

                    # Validate against Pydantic schema
                    parsed = AIGrowthIntelligenceResponse(**data)
                    parsed.is_ai_generated = True
                    parsed.provider = "gemini"
                    parsed.model = active_model
                    parsed.status = "success"
                    parsed.generated_at = now_iso

                    logger.info(f"Gemini growth intelligence generated {len(parsed.recommendations)} recommendations using key #{idx+1} with model {active_model}.")
                    return parsed

                except Exception as e:
                    last_error = e
                    err_str = str(e).lower()
                    if any(x in err_str for x in ["503", "unavailable", "capacity", "404", "not_found"]):
                        logger.info(f"Model {active_model} returned {e} on key #{idx+1}. Trying next model...")
                        continue
                    logger.warning(f"Gemini growth intelligence failed on key #{idx+1} with model {active_model}: {e}. Trying next...")
                    break

        logger.warning(f"All Gemini growth intelligence attempts failed: {last_error}. Serving heuristic fallback.")
        return self.generate_heuristic_fallback(sanitized_summary, f"Gemini error: {type(last_error).__name__}")


# Global singleton instance
growth_ai_service = GrowthAIService()
