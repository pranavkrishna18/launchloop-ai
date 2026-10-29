import { useState } from 'react';
import { Sparkles, Brain, CheckCircle2, AlertTriangle, Lightbulb, RefreshCw, ShieldAlert, Cpu } from 'lucide-react';
import { generateGrowthInsights } from '../../api/analytics';

const EFFORT_COLORS = {
  Low: 'bg-lime text-obsidian font-mono font-bold',
  Medium: 'bg-sage text-obsidian font-mono font-bold',
  High: 'bg-tangerine text-obsidian font-mono font-bold',
};

export default function AIGrowthInsightsPanel({ authCredential }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateGrowthInsights(authCredential);
      setInsights(data);
    } catch (err) {
      setError(err.message || 'Failed to generate growth recommendations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="atelier-card rounded-2xl p-6 sm:p-8 border border-border-atelier relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border-atelier">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-graphite-light border border-border-atelier text-lime text-xs font-mono font-medium uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-lime" />
            <span>AI Growth Intelligence</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-warm-paper tracking-tight">
            Strategic Growth Experiments & Hypotheses
          </h2>
          <p className="text-xs text-soft-gray mt-1 max-w-xl font-mono">
            Analyzes live campaign velocity, channel attribution, and referral loop efficiency to target 500 registrations on ₹2,000 budget.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn-lime self-start sm:self-center py-2.5 px-5 rounded-xl font-mono font-bold text-xs flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>ANALYZING TELEMETRY...</span>
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 text-obsidian" />
              <span>{insights ? 'REFRESH AI INSIGHTS' : 'GENERATE AI EXPERIMENTS'}</span>
            </>
          )}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 rounded-xl p-4 bg-obsidian border border-tangerine text-tangerine text-xs flex items-center space-x-2.5">
          <AlertTriangle className="w-4 h-4 text-tangerine shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Initial Empty State */}
      {!insights && !loading && !error && (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-border-atelier bg-obsidian/40">
          <Cpu className="w-10 h-10 text-soft-gray mx-auto mb-3 opacity-50" />
          <h3 className="text-sm font-display font-bold text-warm-paper">AI Intelligence Engine Standby</h3>
          <p className="text-xs text-soft-gray max-w-md mx-auto mt-1 mb-5 font-mono">
            Click the button above to synthesize live registration telemetry and viral referral data with Google Gemini.
          </p>
          <button
            onClick={handleGenerate}
            className="btn-outline-atelier py-2 px-4 rounded-xl text-xs font-mono cursor-pointer"
          >
            RUN GROWTH TELEMETRY ANALYSIS
          </button>
        </div>
      )}

      {/* Recommendations List */}
      {insights && (
        <div className="space-y-6 animate-fadeIn">
          {/* Metadata & Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-obsidian border border-border-atelier text-[11px] font-mono text-soft-gray">
            <div className="flex items-center space-x-2">
              <span className="text-warm-paper">PROVIDER:</span>
              <span className="text-lime">{insights.provider}</span>
              <span>•</span>
              <span className="text-warm-paper">MODEL:</span>
              <span className="text-warm-paper">{insights.model}</span>
              <span>•</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                insights.is_ai_generated
                  ? 'bg-lime text-obsidian'
                  : 'bg-graphite-light text-warm-paper border border-border-atelier'
              }`}>
                {insights.is_ai_generated ? 'LIVE GEMINI ANALYSIS' : 'HEURISTIC DIAGNOSTIC FALLBACK'}
              </span>
            </div>
            <span className="text-soft-gray">
              TIMESTAMP: {new Date(insights.generated_at).toLocaleTimeString()}
            </span>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.recommendations.map((rec, idx) => {
              const effortBadge = EFFORT_COLORS[rec.effort] || 'bg-graphite-light text-warm-paper';

              return (
                <div
                  key={idx}
                  className="rounded-xl p-5 bg-obsidian border border-border-atelier hover:border-lime transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Title & Effort */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-md bg-graphite-light text-lime text-xs font-mono font-bold flex items-center justify-center shrink-0 border border-border-atelier">
                          0{idx + 1}
                        </span>
                        <h4 className="text-sm font-display font-bold text-warm-paper tracking-tight leading-snug">
                          {rec.title}
                        </h4>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase shrink-0 ${effortBadge}`}>
                        {rec.effort} Effort
                      </span>
                    </div>

                    {/* Observed Evidence */}
                    <div className="p-3 rounded-lg bg-graphite border border-border-atelier font-mono">
                      <div className="flex items-center space-x-1.5 text-[10px] font-bold text-lime mb-1 uppercase">
                        <Lightbulb className="w-3.5 h-3.5 text-lime shrink-0" />
                        <span>Measured Evidence:</span>
                      </div>
                      <p className="text-xs text-soft-gray leading-relaxed pl-5 font-sans">
                        {rec.observed_evidence}
                      </p>
                    </div>

                    {/* Proposed Action */}
                    <div>
                      <div className="flex items-center space-x-1.5 text-[11px] font-mono font-bold text-warm-paper mb-1 uppercase">
                        <CheckCircle2 className="w-3.5 h-3.5 text-lime shrink-0" />
                        <span>Proposed Tactical Intervention:</span>
                      </div>
                      <p className="text-xs text-warm-paper/90 leading-relaxed pl-5">
                        {rec.proposed_action}
                      </p>
                    </div>

                    {/* Rationale */}
                    <div className="text-xs text-soft-gray pl-5 leading-relaxed">
                      <strong className="text-warm-paper">Hypothesis Rationale:</strong> {rec.rationale}
                    </div>
                  </div>

                  {/* Impact & Limitations Footer */}
                  <div className="pt-3 border-t border-border-atelier space-y-1.5 font-mono">
                    <div className="text-[11px] text-lime">
                      TARGET IMPACT: {rec.expected_impact}
                    </div>
                    <div className="text-[10px] text-soft-gray">
                      LIMITATIONS: {rec.confidence_and_limitations}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compliance & Anti-Hallucination Disclaimer */}
          <div className="p-3.5 rounded-xl bg-obsidian border border-border-atelier text-[11px] font-mono text-soft-gray flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-soft-gray shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-warm-paper">Growth Intelligence Audit:</strong> {insights.disclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
