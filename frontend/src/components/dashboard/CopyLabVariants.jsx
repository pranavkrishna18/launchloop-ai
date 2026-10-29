import { FileText, MousePointer, UserCheck, MessageSquare } from 'lucide-react';

const LinkedinIcon = ({ className = 'w-3 h-3' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28" />
  </svg>
);

export default function CopyLabVariants({ variantsData }) {
  const variants = variantsData?.variants || [];

  if (variants.length === 0) {
    return (
      <div className="atelier-card rounded-2xl p-6 border border-border-atelier text-center py-10">
        <FileText className="w-8 h-8 text-soft-gray mx-auto mb-2 opacity-40" />
        <h4 className="text-sm font-display font-bold text-warm-paper">No Copy Variants Tracked</h4>
        <p className="text-xs text-soft-gray max-w-xs mx-auto mt-1 font-mono">
          Promotional copy variants will display here once initialized in campaign settings.
        </p>
      </div>
    );
  }

  return (
    <div className="atelier-card rounded-2xl p-5 sm:p-6 border border-border-atelier">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-lime" />
            <h3 className="text-sm font-display font-bold text-warm-paper tracking-tight">
              Campaign Copy Lab Variants
            </h3>
          </div>
          <p className="text-xs text-soft-gray mt-0.5 font-mono">
            A/B messaging and distribution performance
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-obsidian text-warm-paper border border-border-atelier">
          {variants.length} VARIANTS
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border-atelier text-soft-gray uppercase text-[10px] font-mono tracking-wider">
              <th className="py-2.5 px-3">Variant Key</th>
              <th className="py-2.5 px-3">Channel</th>
              <th className="py-2.5 px-3">Headline</th>
              <th className="py-2.5 px-3 text-right">Impressions</th>
              <th className="py-2.5 px-3 text-right">Clicks</th>
              <th className="py-2.5 px-3 text-right">Registrations</th>
              <th className="py-2.5 px-3 text-right">CTR</th>
              <th className="py-2.5 px-3 text-right">Conv. Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-atelier font-mono">
            {variants.map((v) => {
              const isWhatsApp = v.channel.toLowerCase() === 'whatsapp';
              return (
                <tr key={v.variant_key} className="hover:bg-graphite-light/40 transition">
                  <td className="py-3 px-3 font-semibold text-lime whitespace-nowrap">
                    {v.variant_key}
                    {v.is_seed && (
                      <span className="ml-1.5 text-[9px] px-1 py-0.5 rounded bg-obsidian text-soft-gray font-mono border border-border-atelier">
                        SEED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-obsidian border border-border-atelier text-warm-paper">
                      {isWhatsApp ? (
                        <MessageSquare className="w-2.5 h-2.5 text-lime" />
                      ) : (
                        <LinkedinIcon className="w-2.5 h-2.5 text-tangerine" />
                      )}
                      <span className="uppercase">{v.channel}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans text-warm-paper max-w-xs truncate" title={v.headline}>
                    {v.headline}
                  </td>
                  <td className="py-3 px-3 text-right text-soft-gray">{v.impressions.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right text-warm-paper font-semibold">{v.clicks.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right text-lime font-bold">{v.registrations.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right text-warm-paper">
                    {v.ctr_percentage !== null ? `${v.ctr_percentage}%` : 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-right text-lime font-semibold">
                    {v.conversion_rate_percentage !== null ? `${v.conversion_rate_percentage}%` : 'N/A'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
