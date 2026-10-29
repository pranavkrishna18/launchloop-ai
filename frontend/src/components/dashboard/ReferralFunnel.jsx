import { Filter, ArrowDown, UserCheck, Share2, Users, MousePointerClick } from 'lucide-react';

const STAGE_ICONS = {
  0: MousePointerClick,
  1: UserCheck,
  2: Share2,
  3: Users,
};

export default function ReferralFunnel({ funnelData }) {
  const stages = funnelData || [];

  if (stages.length === 0) {
    return (
      <div className="atelier-card rounded-2xl p-6 border border-border-atelier text-center py-10">
        <Filter className="w-8 h-8 text-soft-gray mx-auto mb-2 opacity-40" />
        <h4 className="text-sm font-display font-bold text-warm-paper">Funnel Telemetry Standby</h4>
        <p className="text-xs text-soft-gray max-w-xs mx-auto mt-1 font-mono">
          Viral funnel stages will render as peer links are shared and clicked.
        </p>
      </div>
    );
  }

  const topCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="atelier-card rounded-2xl p-5 sm:p-6 border border-border-atelier">
      <div className="flex items-center space-x-2 mb-1">
        <Filter className="w-4 h-4 text-lime" />
        <h3 className="text-sm font-display font-bold text-warm-paper tracking-tight">
          Acquisition & Viral Funnel
        </h3>
      </div>
      <p className="text-xs text-soft-gray mb-6 font-mono">
        Student progression from peer click to active advocate
      </p>

      <div className="space-y-3">
        {stages.map((stage, idx) => {
          const Icon = STAGE_ICONS[idx] || Users;
          const widthPct = Math.max(Math.round((stage.count / topCount) * 100), 12);

          return (
            <div key={stage.stage} className="relative">
              <div className="flex items-center justify-between text-xs mb-1 px-1">
                <div className="flex items-center space-x-2">
                  <Icon className="w-3.5 h-3.5 text-lime" />
                  <span className="font-mono text-xs font-semibold text-warm-paper">{stage.stage}</span>
                </div>
                <div className="flex items-center space-x-2 font-mono">
                  <span className="font-bold text-warm-paper text-sm">{stage.count}</span>
                  {stage.conversion_from_previous !== null && stage.conversion_from_previous !== undefined && (
                    <span className="text-[10px] font-bold text-lime bg-lime-muted px-1.5 py-0.5 rounded border border-lime/30">
                      {stage.conversion_from_previous}%
                    </span>
                  )}
                </div>
              </div>

              {/* Funnel Bar */}
              <div className="w-full bg-obsidian rounded-xl h-8 overflow-hidden p-1 border border-border-atelier flex items-center">
                <div
                  className="bg-graphite-light border border-lime/40 h-full rounded-lg transition-all duration-500 flex items-center px-3"
                  style={{ width: `${widthPct}%` }}
                >
                  <span className="text-[10px] font-mono font-bold text-lime truncate">
                    {stage.count} ({widthPct}%)
                  </span>
                </div>
              </div>

              {idx < stages.length - 1 && (
                <div className="flex justify-center my-1 text-soft-gray">
                  <ArrowDown className="w-3 h-3 text-soft-gray" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
