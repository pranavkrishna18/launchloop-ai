import { useState } from 'react';
import { Calendar, TrendingUp } from 'lucide-react';

export default function DailyTrendChart({ trendData }) {
  const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'cumulative'
  const items = trendData?.items || [];

  if (items.length === 0) {
    return (
      <div className="atelier-card rounded-2xl p-6 border border-border-atelier text-center py-12">
        <TrendingUp className="w-8 h-8 text-soft-gray mx-auto mb-3 opacity-40" />
        <h3 className="text-sm font-display font-bold text-warm-paper">No Registrations in Selected Date Range</h3>
        <p className="text-xs text-soft-gray max-w-sm mx-auto mt-1 font-mono">
          Daily registration velocity will render dynamically as students register for the cohort.
        </p>
      </div>
    );
  }

  // Calculate SVG bounds
  const values = items.map((i) => (viewMode === 'cumulative' ? i.cumulative_count : i.count));
  const maxVal = Math.max(...values, 5);
  const height = 180;
  const width = 600;
  const paddingX = 40;
  const paddingY = 30;

  const points = items.map((item, index) => {
    const x = paddingX + (index / Math.max(items.length - 1, 1)) * (width - 2 * paddingX);
    const val = viewMode === 'cumulative' ? item.cumulative_count : item.count;
    const y = height - paddingY - (val / maxVal) * (height - 2 * paddingY);
    return { x, y, val, date: item.date };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');

  return (
    <div className="atelier-card rounded-2xl p-5 sm:p-6 border border-border-atelier">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-lime" />
            <h3 className="text-sm font-display font-bold text-warm-paper tracking-tight">
              Registration Velocity & Pace
            </h3>
          </div>
          <p className="text-xs text-soft-gray mt-0.5 font-mono">
            Authentic verified student registrations (excludes synthetic seed records)
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-1 bg-obsidian border border-border-atelier rounded-lg p-1 self-start sm:self-auto font-mono">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1 rounded text-xs transition cursor-pointer ${
              viewMode === 'daily'
                ? 'bg-lime text-obsidian font-bold'
                : 'text-soft-gray hover:text-warm-paper'
            }`}
          >
            DAILY PACE
          </button>
          <button
            onClick={() => setViewMode('cumulative')}
            className={`px-3 py-1 rounded text-xs transition cursor-pointer ${
              viewMode === 'cumulative'
                ? 'bg-lime text-obsidian font-bold'
                : 'text-soft-gray hover:text-warm-paper'
            }`}
          >
            CUMULATIVE
          </button>
        </div>
      </div>

      {/* SVG Line Graph */}
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[480px]">
          {/* Subtle Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#2D2E26" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#2D2E26" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#3D4034" strokeWidth="1" />

          {/* Line Stroke in Electric Lime */}
          <path
            d={pathD}
            fill="none"
            stroke="#D5FF45"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                fill="#171815"
                stroke="#D5FF45"
                strokeWidth="2"
              />
              <text
                x={p.x}
                y={p.y - 9}
                textAnchor="middle"
                fill="#D5FF45"
                fontSize="10"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                {p.val}
              </text>
              <text
                x={p.x}
                y={height - 10}
                textAnchor="middle"
                fill="#8D8E84"
                fontSize="9"
                fontFamily="JetBrains Mono"
              >
                {p.date.slice(5)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
