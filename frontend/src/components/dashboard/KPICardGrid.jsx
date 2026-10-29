import { Users, Target, Share2, IndianRupee, Info } from 'lucide-react';

export default function KPICardGrid({ data }) {
  if (!data) return null;

  const target = data.target_registrations || 500;
  const real = data.real_registrations || 0;
  const targetPct = data.target_achievement_percentage || 0;
  const remaining = data.remaining_registrations !== undefined ? data.remaining_registrations : (target - real);
  const costPerReg = data.budget_allocation_per_registration_inr;
  const clicks = data.referral_clicks || 0;
  const refRate = data.referral_conversion_rate_percentage;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Authentic Registrations */}
      <div className="atelier-card rounded-2xl p-5 border border-border-atelier relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-semibold text-soft-gray uppercase">
            Real Registrations
          </span>
          <div className="w-8 h-8 rounded-lg bg-graphite-light border border-border-atelier flex items-center justify-center text-lime">
            <Users className="w-4 h-4 text-lime" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-3xl sm:text-4xl font-display font-bold text-warm-paper tracking-tight font-mono">
            {real}
          </span>
          <span className="text-xs font-mono text-soft-gray">/ {target} target</span>
        </div>

        <div className="mt-4">
          <div className="w-full bg-obsidian rounded-full h-1.5 overflow-hidden border border-border-atelier">
            <div
              className="bg-lime h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(targetPct, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-[11px] font-mono">
            <span className="text-lime font-bold">{targetPct}% of goal</span>
            {data.seed_registrations > 0 && (
              <span className="text-soft-gray text-[10px]">({data.seed_registrations} seed excluded)</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Remaining to Target */}
      <div className="atelier-card rounded-2xl p-5 border border-border-atelier relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-semibold text-soft-gray uppercase">
            Remaining To Goal
          </span>
          <div className="w-8 h-8 rounded-lg bg-graphite-light border border-border-atelier flex items-center justify-center text-soft-gray">
            <Target className="w-4 h-4 text-soft-gray" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-3xl sm:text-4xl font-display font-bold text-warm-paper tracking-tight font-mono">
            {remaining}
          </span>
          <span className="text-xs font-mono text-soft-gray">students needed</span>
        </div>

        <p className="mt-4 text-[11px] font-mono text-soft-gray">
          Pace: {Math.ceil(remaining / 7)} registrations/day across 7-day sprint.
        </p>
      </div>

      {/* 3. Referral Conversion Rate */}
      <div className="atelier-card rounded-2xl p-5 border border-border-atelier relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-semibold text-soft-gray uppercase">
            Peer Viral Rate
          </span>
          <div className="w-8 h-8 rounded-lg bg-graphite-light border border-border-atelier flex items-center justify-center text-tangerine">
            <Share2 className="w-4 h-4 text-tangerine" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-3xl sm:text-4xl font-display font-bold text-warm-paper tracking-tight font-mono">
            {refRate !== null && refRate !== undefined ? `${refRate}%` : 'N/A'}
          </span>
          <span className="text-xs font-mono text-soft-gray">
            ({data.referral_conversions || 0} / {clicks} clicks)
          </span>
        </div>

        <p className="mt-4 text-[11px] font-mono text-soft-gray">
          Student referral conversion efficiency.
        </p>
      </div>

      {/* 4. Budget Allocation per Registration */}
      <div className="atelier-card rounded-2xl p-5 border border-border-atelier relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            <span className="text-xs font-mono font-semibold text-soft-gray uppercase">
              Budget Allocation
            </span>
            <span title="Calculated as total allocated campaign budget (₹2,000 ceiling) divided by real registrations. Not actual ad spend.">
              <Info className="w-3 h-3 text-soft-gray cursor-help" />
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-graphite-light border border-border-atelier flex items-center justify-center text-sage">
            <IndianRupee className="w-4 h-4 text-sage" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-3xl sm:text-4xl font-display font-bold text-warm-paper tracking-tight font-mono">
            {costPerReg !== null && costPerReg !== undefined ? `₹${costPerReg}` : '₹0'}
          </span>
          <span className="text-xs font-mono text-soft-gray">/ seat (cap ₹2k)</span>
        </div>

        <p className="mt-4 text-[11px] font-mono text-soft-gray">
          Max allocation per student based on ₹2,000 campaign ceiling.
        </p>
      </div>
    </div>
  );
}
