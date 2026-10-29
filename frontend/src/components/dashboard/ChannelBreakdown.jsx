import { Layers, MessageSquare, Share2, Globe, Tag } from 'lucide-react';

const LinkedinIcon = ({ className = 'w-3 h-3' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28" />
  </svg>
);

const CHANNEL_ICONS = {
  whatsapp: MessageSquare,
  linkedin: LinkedinIcon,
  referral: Share2,
  direct: Globe,
};

const CHANNEL_COLORS = {
  whatsapp: '#D5FF45',
  linkedin: '#FF7547',
  referral: '#A9B49B',
  direct: '#8D8E84',
};

export default function ChannelBreakdown({ data }) {
  const channels = data?.channels || [];
  const total = data?.total_real_registrations || 0;

  if (channels.length === 0) {
    return (
      <div className="atelier-card rounded-2xl p-6 border border-border-atelier text-center py-10">
        <Layers className="w-8 h-8 text-soft-gray mx-auto mb-2 opacity-40" />
        <h4 className="text-sm font-display font-bold text-warm-paper">No Attribution Data Yet</h4>
        <p className="text-xs text-soft-gray max-w-xs mx-auto mt-1 font-mono">
          Channels will populate as students register with UTM parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="atelier-card rounded-2xl p-5 sm:p-6 border border-border-atelier">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-lime" />
            <h3 className="text-sm font-display font-bold text-warm-paper tracking-tight">
              Channel Attribution
            </h3>
          </div>
          <p className="text-xs text-soft-gray mt-0.5 font-mono">
            Acquisition breakdown by primary UTM channel
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-obsidian text-warm-paper border border-border-atelier">
          {total} TOTAL
        </span>
      </div>

      <div className="space-y-4">
        {channels.map((item) => {
          const Icon = CHANNEL_ICONS[item.channel.toLowerCase()] || Tag;
          const barColor = CHANNEL_COLORS[item.channel.toLowerCase()] || '#D5FF45';

          return (
            <div key={item.channel} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded bg-obsidian border border-border-atelier flex items-center justify-center text-warm-paper">
                    <Icon className="w-3 h-3" />
                  </div>
                  <span className="font-mono font-bold text-warm-paper uppercase tracking-wider text-[11px]">
                    {item.channel}
                  </span>
                </div>
                <div className="flex items-center space-x-2 font-mono">
                  <span className="font-bold text-warm-paper">{item.registrations_count}</span>
                  <span className="text-soft-gray">({item.percentage_of_total}%)</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-obsidian rounded-full h-2 overflow-hidden border border-border-atelier">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: barColor,
                    width: `${Math.max(item.percentage_of_total, 3)}%`
                  }}
                />
              </div>

              {/* Medium Sub-chips */}
              {item.mediums && item.mediums.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.mediums.map((m) => (
                    <span
                      key={m.medium}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-obsidian border border-border-atelier text-soft-gray"
                    >
                      {m.medium}: <strong className="text-warm-paper">{m.count}</strong>
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
