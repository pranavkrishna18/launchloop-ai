"""Analytics Service for LaunchLoop AI Organizer Dashboard.

Aggregates real-time campaign performance, channel attributions, referral viral loops,
budget allocations, and AI system telemetry.
Filters out seed/demo data from authentic performance KPIs.
"""

from collections import defaultdict
from datetime import datetime, timezone, timedelta
import logging
from typing import Optional, List, Dict, Any
from app.core.database import db_manager
from app.schemas.analytics import (
    CampaignOverviewKPIs,
    FunnelStage,
    DailyRegistrationTrendItem as DailyRegistrationItem,
    DailyRegistrationResponse,
    ChannelAttributionItem,
    ChannelMediumBreakdown,
    ChannelAttributionResponse,
    ReferralAdvocateItem,
    ReferralAnalyticsResponse,
    AIUsageTelemetryResponse,
    CopyVariantPerformanceItem,
    CopyVariantsResponse
)

logger = logging.getLogger("launchloop.analytics")


def anonymize_name(full_name: str) -> str:
    """Anonymizes student name for safe display (e.g. 'Rahul Verma' -> 'Rahul V.')."""
    if not full_name:
        return "Student"
    parts = full_name.strip().split()
    if len(parts) == 1:
        return parts[0]
    return f"{parts[0]} {parts[-1][0]}."


class AnalyticsService:
    """Computes trustworthy campaign analytics and KPI metrics."""

    def __init__(self):
        self.db = db_manager

    def _get_active_campaign(self, client, campaign_slug: str) -> Optional[Dict[str, Any]]:
        """Retrieves campaign metadata."""
        try:
            res = client.table("campaigns").select("*").eq("slug", campaign_slug).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.warning(f"Error fetching campaign {campaign_slug}: {e}")
        return None

    def get_campaign_overview(self, campaign_slug: str = "ai-in-60-mins") -> CampaignOverviewKPIs:
        """Calculates core KPI metrics for campaign overview."""
        now_iso = datetime.now(timezone.utc).isoformat()
        client = self.db.get_client()

        # Build fallback / demo store KPIs if DB is offline or tables pending
        from app.services.demo_store import demo_store
        real_reg = [r for r in demo_store.registrations if not r.get("is_seed", False)]
        seed_reg = [r for r in demo_store.registrations if r.get("is_seed", False)]
        real_count = len(real_reg)
        seed_count = len(seed_reg)
        total_clicks = sum(l.get("clicks_count", 0) for l in demo_store.referral_links.values())
        total_conv = sum(l.get("conversions_count", 0) for l in demo_store.referral_links.values())
        ref_rate = round((total_conv / total_clicks * 100), 2) if total_clicks > 0 else None
        target_pct = round((real_count / 500 * 100), 2)
        cost_per_reg = round(2000.0 / real_count, 2) if real_count > 0 else None

        default_kpis = CampaignOverviewKPIs(
            campaign_id="pending",
            campaign_slug=campaign_slug,
            campaign_title="Build Your First AI Project in 60 Minutes",
            target_registrations=500,
            real_registrations=real_count,
            seed_registrations=seed_count,
            target_achievement_percentage=target_pct,
            remaining_registrations=max(0, 500 - real_count),
            budget_inr=2000.0,
            budget_allocation_per_registration_inr=cost_per_reg,
            referral_clicks=total_clicks,
            referral_conversions=total_conv,
            referral_conversion_rate_percentage=ref_rate,
            funnel=[
                FunnelStage(stage="Referral Clicks", count=total_clicks, conversion_from_previous=None),
                FunnelStage(stage="Total Registrations", count=real_count + seed_count, conversion_from_previous=round(((real_count + seed_count)/total_clicks*100), 1) if total_clicks > 0 else None),
                FunnelStage(stage="Peer Conversions", count=total_conv, conversion_from_previous=round((total_conv/max(1, real_count + seed_count)*100), 1)),
                FunnelStage(stage="Active Advocates", count=len([l for l in demo_store.referral_links.values() if l.get("conversions_count", 0) > 0]), conversion_from_previous=None)
            ],
            data_status="schema_pending" if client else "unconfigured",
            last_updated=now_iso
        )

        if not client:
            return default_kpis

        try:
            campaign = self._get_active_campaign(client, campaign_slug)
            if not campaign:
                return default_kpis

            campaign_id = campaign["id"]
            target_registrations = campaign.get("target_registrations", 500)
            budget_inr = float(campaign.get("budget_inr", 2000.0))

            # 1. Fetch Registrations for this campaign
            reg_res = client.table("registrations").select("id, is_seed, referral_code_used, registered_at").eq("campaign_id", campaign_id).execute()
            all_registrations = reg_res.data or []

            # Segregate real registrations from seed
            real_registrations_list = [r for r in all_registrations if not r.get("is_seed", False)]
            seed_registrations_list = [r for r in all_registrations if r.get("is_seed", False)]

            real_count = len(real_registrations_list)
            seed_count = len(seed_registrations_list)

            target_achievement = round((real_count / target_registrations * 100), 2) if target_registrations > 0 else 0.0
            remaining = max(target_registrations - real_count, 0)

            # Budget Allocation per Registration (Ceiling allocation, explicitly labeled)
            budget_allocation = round(budget_inr / real_count, 2) if real_count > 0 else None

            # 2. Fetch Referral Performance (clicks & conversions)
            ref_links_res = client.table("referral_links").select("id, clicks_count, conversions_count").eq("campaign_id", campaign_id).execute()
            ref_links = ref_links_res.data or []

            total_clicks = sum(l.get("clicks_count", 0) for l in ref_links)

            # Authoritative count of verified referral conversions from real registrations
            verified_conversions = len([r for r in real_registrations_list if r.get("referral_code_used")])
            if verified_conversions == 0 and ref_links:
                # If registrations table has no referral_code_used, fallback to link counter
                verified_conversions = sum(l.get("conversions_count", 0) for l in ref_links)

            referral_conversion_rate = (
                round((verified_conversions / total_clicks * 100), 2) if total_clicks > 0 else None
            )

            # 3. Active advocates (students who have >= 1 verified referral)
            active_advocates = len([l for l in ref_links if l.get("conversions_count", 0) > 0])

            # 4. Construct Funnel
            funnel = [
                FunnelStage(stage="Referral Link Clicks", count=total_clicks),
                FunnelStage(
                    stage="Total Real Registrations",
                    count=real_count,
                    conversion_from_previous=round((real_count / total_clicks * 100), 2) if total_clicks > 0 else None
                ),
                FunnelStage(
                    stage="Peer Referral Conversions",
                    count=verified_conversions,
                    conversion_from_previous=round((verified_conversions / real_count * 100), 2) if real_count > 0 else None
                ),
                FunnelStage(
                    stage="Active Student Advocates",
                    count=active_advocates,
                    conversion_from_previous=round((active_advocates / verified_conversions * 100), 2) if verified_conversions > 0 else None
                )
            ]

            return CampaignOverviewKPIs(
                campaign_id=str(campaign_id),
                campaign_slug=campaign.get("slug", campaign_slug),
                campaign_title=campaign.get("title", "Build Your First AI Project in 60 Minutes"),
                target_registrations=target_registrations,
                real_registrations=real_count,
                seed_registrations=seed_count,
                target_achievement_percentage=target_achievement,
                remaining_registrations=remaining,
                budget_inr=budget_inr,
                budget_allocation_per_registration_inr=budget_allocation,
                referral_clicks=total_clicks,
                referral_conversions=verified_conversions,
                referral_conversion_rate_percentage=referral_conversion_rate,
                funnel=funnel,
                data_status="live",
                last_updated=now_iso
            )

        except Exception as e:
            logger.error(f"Error computing campaign overview KPIs: {e}")
            default_kpis.data_status = "error"
            return default_kpis

    def get_daily_registration_trend(
        self,
        campaign_slug: str = "ai-in-60-mins",
        date_from: Optional[str] = None,
        date_to: Optional[str] = None
    ) -> DailyRegistrationResponse:
        """Aggregates authentic registrations into daily time buckets."""
        client = self.db.get_client()
        if not client:
            from app.services.demo_store import demo_store
            real_regs = [r for r in demo_store.registrations if not r.get("is_seed", False)]
            daily_counts = defaultdict(int)
            for r in real_regs:
                ts = r.get("registered_at", "")[:10]
                if ts:
                    daily_counts[ts] += 1
            items = []
            cum = 0
            for d in sorted(daily_counts.keys()):
                cnt = daily_counts[d]
                cum += cnt
                items.append(DailyRegistrationItem(date=d, count=cnt, cumulative_count=cum))
            return DailyRegistrationResponse(items=items, total_real_registrations=len(real_regs))

        try:
            campaign = self._get_active_campaign(client, campaign_slug)
            if not campaign:
                from app.services.demo_store import demo_store
                real_regs = [r for r in demo_store.registrations if not r.get("is_seed", False)]
                daily_counts = defaultdict(int)
                for r in real_regs:
                    ts = r.get("registered_at", "")[:10]
                    if ts:
                        daily_counts[ts] += 1
                items = []
                cum = 0
                for d in sorted(daily_counts.keys()):
                    cnt = daily_counts[d]
                    cum += cnt
                    items.append(DailyRegistrationItem(date=d, count=cnt, cumulative_count=cum))
                return DailyRegistrationResponse(items=items, total_real_registrations=len(real_regs))

            campaign_id = campaign["id"]

            query = client.table("registrations").select("registered_at, is_seed").eq("campaign_id", campaign_id).eq("is_seed", False)

            if date_from:
                query = query.gte("registered_at", date_from)
            if date_to:
                query = query.lte("registered_at", date_to)

            res = query.order("registered_at", desc=False).execute()
            registrations = res.data or []

            # Group by day YYYY-MM-DD
            daily_counts = defaultdict(int)
            for r in registrations:
                ts = r.get("registered_at")
                if ts:
                    day_str = ts[:10]  # Take YYYY-MM-DD
                    daily_counts[day_str] += 1

            # Build continuous trend or sorted buckets
            sorted_days = sorted(daily_counts.keys())
            items = []
            running_total = 0

            for day in sorted_days:
                count = daily_counts[day]
                running_total += count
                items.append(
                    DailyRegistrationItem(
                        date=day,
                        count=count,
                        cumulative_count=running_total
                    )
                )

            return DailyRegistrationResponse(
                items=items,
                total_real_registrations=len(registrations),
                date_from=date_from,
                date_to=date_to
            )

        except Exception as e:
            logger.error(f"Error computing daily registration trend: {e}")
            return DailyRegistrationResponse(items=[], total_real_registrations=0)

    def get_channel_attribution(self, campaign_slug: str = "ai-in-60-mins") -> ChannelAttributionResponse:
        """Groups authentic registrations by acquisition channel and UTM medium."""
        client = self.db.get_client()
        if not client:
            from app.services.demo_store import demo_store
            real_regs = [r for r in demo_store.registrations if not r.get("is_seed", False)]
            channel_counts = defaultdict(int)
            for r in real_regs:
                channel_counts[(r.get("utm_source") or "direct").strip().lower()] += 1
            total_real = len(real_regs)
            channel_items = [
                ChannelAttributionItem(
                    channel=ch,
                    registrations_count=cnt,
                    percentage_of_total=round((cnt / total_real * 100), 2) if total_real > 0 else 0.0,
                    mediums=[ChannelMediumBreakdown(medium="organic", count=cnt)]
                )
                for ch, cnt in sorted(channel_counts.items(), key=lambda x: x[1], reverse=True)
            ]
            return ChannelAttributionResponse(channels=channel_items, total_real_registrations=total_real)

        try:
            campaign = self._get_active_campaign(client, campaign_slug)
            if not campaign:
                from app.services.demo_store import demo_store
                real_regs = [r for r in demo_store.registrations if not r.get("is_seed", False)]
                channel_counts = defaultdict(int)
                for r in real_regs:
                    channel_counts[(r.get("utm_source") or "direct").strip().lower()] += 1
                total_real = len(real_regs)
                channel_items = [
                    ChannelAttributionItem(
                        channel=ch,
                        registrations_count=cnt,
                        percentage_of_total=round((cnt / total_real * 100), 2) if total_real > 0 else 0.0,
                        mediums=[ChannelMediumBreakdown(medium="organic", count=cnt)]
                    )
                    for ch, cnt in sorted(channel_counts.items(), key=lambda x: x[1], reverse=True)
                ]
                return ChannelAttributionResponse(channels=channel_items, total_real_registrations=total_real)

            campaign_id = campaign["id"]

            res = client.table("registrations").select("utm_source, utm_medium, is_seed").eq("campaign_id", campaign_id).eq("is_seed", False).execute()
            registrations = res.data or []
            total_real = len(registrations)

            # Group: channel -> medium -> count
            channel_medium_counts = defaultdict(lambda: defaultdict(int))
            for r in registrations:
                source = (r.get("utm_source") or "direct").strip().lower()
                medium = (r.get("utm_medium") or "organic").strip().lower()
                channel_medium_counts[source][medium] += 1

            channel_items = []
            for channel, mediums in channel_medium_counts.items():
                channel_total = sum(mediums.values())
                pct = round((channel_total / total_real * 100), 2) if total_real > 0 else 0.0

                medium_breakdowns = [
                    ChannelMediumBreakdown(medium=m, count=c)
                    for m, c in sorted(mediums.items(), key=lambda x: x[1], reverse=True)
                ]

                channel_items.append(
                    ChannelAttributionItem(
                        channel=channel,
                        registrations_count=channel_total,
                        percentage_of_total=pct,
                        mediums=medium_breakdowns
                    )
                )

            channel_items.sort(key=lambda x: x.registrations_count, reverse=True)

            return ChannelAttributionResponse(
                channels=channel_items,
                total_real_registrations=total_real
            )

        except Exception as e:
            logger.error(f"Error computing channel attribution: {e}")
            return ChannelAttributionResponse(channels=[], total_real_registrations=0)

    def get_referral_analytics(self, campaign_slug: str = "ai-in-60-mins") -> ReferralAnalyticsResponse:
        """Aggregates referral advocate performance and viral loop rankings."""
        client = self.db.get_client()
        if not client:
            return ReferralAnalyticsResponse(total_advocates=0, total_clicks=0, total_conversions=0)

        try:
            campaign = self._get_active_campaign(client, campaign_slug)
            if not campaign:
                return ReferralAnalyticsResponse(total_advocates=0, total_clicks=0, total_conversions=0)

            campaign_id = campaign["id"]

            # Query all referral links
            links_res = client.table("referral_links").select("id, student_id, referral_code, clicks_count, conversions_count").eq("campaign_id", campaign_id).order("conversions_count", desc=True).execute()
            links = links_res.data or []

            total_advocates = len(links)
            total_clicks = sum(l.get("clicks_count", 0) for l in links)
            total_conversions = sum(l.get("conversions_count", 0) for l in links)

            overall_rate = (
                round((total_conversions / total_clicks * 100), 2) if total_clicks > 0 else None
            )

            # Build top advocate items with student metadata
            top_advocates = []
            for idx, link in enumerate(links[:20]):
                student_id = link.get("student_id")
                student_name = "Student Advocate"
                college = "Engineering College"

                if student_id:
                    s_res = client.table("students").select("full_name, college").eq("id", student_id).execute()
                    if s_res.data:
                        student_info = s_res.data[0]
                        student_name = anonymize_name(student_info.get("full_name", ""))
                        college = student_info.get("college", college)

                clicks = link.get("clicks_count", 0)
                convs = link.get("conversions_count", 0)
                rate = round((convs / clicks * 100), 2) if clicks > 0 else None

                top_advocates.append(
                    ReferralAdvocateItem(
                        rank=idx + 1,
                        display_name=student_name,
                        college=college,
                        referral_code=link.get("referral_code", ""),
                        clicks=clicks,
                        conversions=convs,
                        conversion_rate_percentage=rate
                    )
                )

            return ReferralAnalyticsResponse(
                total_advocates=total_advocates,
                total_clicks=total_clicks,
                total_conversions=total_conversions,
                overall_conversion_rate_percentage=overall_rate,
                top_advocates=top_advocates
            )

        except Exception as e:
            logger.error(f"Error computing referral analytics: {e}")
            return ReferralAnalyticsResponse(total_advocates=0, total_clicks=0, total_conversions=0)

    def get_ai_usage_telemetry(self) -> AIUsageTelemetryResponse:
        """Summarizes LLM usage, fallback rates, and average latency from audit logs."""
        client = self.db.get_client()
        if not client:
            return AIUsageTelemetryResponse()

        try:
            logs_res = client.table("ai_generation_logs").select("feature_type, provider_used, latency_ms, status, is_fallback").execute()
            logs = logs_res.data or []

            total = len(logs)
            if total == 0:
                return AIUsageTelemetryResponse(note="No AI invocations recorded in database yet.")

            fallbacks = len([l for l in logs if l.get("is_fallback", False) or l.get("status") == "fallback"])
            fallback_rate = round((fallbacks / total * 100), 2)

            latencies = [l.get("latency_ms", 0) for l in logs if isinstance(l.get("latency_ms"), (int, float))]
            avg_latency = round(sum(latencies) / len(latencies), 1) if latencies else 0.0

            providers = defaultdict(int)
            features = defaultdict(int)
            for l in logs:
                providers[l.get("provider_used", "unknown")] += 1
                features[l.get("feature_type", "unknown")] += 1

            return AIUsageTelemetryResponse(
                total_requests=total,
                fallback_requests=fallbacks,
                fallback_rate_percentage=fallback_rate,
                avg_latency_ms=avg_latency,
                provider_breakdown=dict(providers),
                feature_breakdown=dict(features)
            )

        except Exception as e:
            logger.warning(f"Error reading ai_generation_logs (schema may be pending): {e}")
            return AIUsageTelemetryResponse(note="AI telemetry log table pending in database.")

    def get_copy_variants(self, campaign_slug: str = "ai-in-60-mins") -> CopyVariantsResponse:
        """Returns campaign variants and performance metrics from campaign_variants table."""
        client = self.db.get_client()
        if not client:
            return CopyVariantsResponse(variants=[], total_variants=0)

        try:
            campaign = self._get_active_campaign(client, campaign_slug)
            if not campaign:
                return CopyVariantsResponse(variants=[], total_variants=0)

            campaign_id = campaign["id"]

            res = client.table("campaign_variants").select("*").eq("campaign_id", campaign_id).execute()
            variants = res.data or []

            items = []
            for v in variants:
                impr = v.get("impressions", 0)
                clicks = v.get("clicks", 0)
                regs = v.get("registrations", 0)

                ctr = round((clicks / impr * 100), 2) if impr > 0 else None
                conv_rate = round((regs / clicks * 100), 2) if clicks > 0 else None

                items.append(
                    CopyVariantPerformanceItem(
                        variant_key=v.get("variant_key", ""),
                        channel=v.get("channel", "general"),
                        target_segment=v.get("target_segment", ""),
                        headline=v.get("headline", ""),
                        impressions=impr,
                        clicks=clicks,
                        registrations=regs,
                        ctr_percentage=ctr,
                        conversion_rate_percentage=conv_rate,
                        is_seed=v.get("is_seed", False)
                    )
                )

            return CopyVariantsResponse(variants=items, total_variants=len(items))

        except Exception as e:
            logger.warning(f"Error reading campaign_variants: {e}")
            return CopyVariantsResponse(variants=[], total_variants=0)


# Global singleton instance
analytics_service = AnalyticsService()
