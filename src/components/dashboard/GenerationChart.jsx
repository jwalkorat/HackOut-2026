import React, { useState } from 'react';
import { TrendingUp, Calendar, Zap, AlertCircle, Eye, ChevronRight } from 'lucide-react';

export default function GenerationChart({ forecastData = [] }) {
  const [horizon, setHorizon] = useState(24); // 24 | 48 | 72
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const displayedPoints = forecastData.slice(0, horizon);
  const maxVal = 140; // Max MW scale

  return (
    <div className="p-6 rounded-3xl bg-white/95 border border-sky-200/90 shadow-[0_4px_25px_-5px_rgba(2,132,199,0.08)]">
      {/* Chart Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
            <h4 className="font-display font-black text-lg text-slate-900">
              Continuous 24–72h Generation vs Demand Curve
            </h4>
          </div>
          <p className="text-xs font-mono text-slate-500 mt-0.5">
            AI Ensemble Forecast (Sky Blue) vs Scheduled Demand Baseline (Indigo dashed)
          </p>
        </div>

        {/* Horizon Filter Selector */}
        <div className="flex items-center p-1 rounded-2xl bg-sky-50 border border-sky-200 text-xs font-mono">
          {[24, 48, 72].map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                horizon === h
                  ? 'bg-sky-600 text-white shadow-glow-sky'
                  : 'text-slate-600 hover:text-sky-800'
              }`}
            >
              {h}h Outlook
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative w-full h-64 sm:h-72 select-none">
        <svg
          className="w-full h-full overflow-visible"
          viewBox={`0 0 ${displayedPoints.length * 36 + 60} 220`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="areaGenGradLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.32" />
              <stop offset="65%" stopColor="#38bdf8" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="surplusFillLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[40, 90, 140, 190].map((y) => (
            <line
              key={y}
              x1="30"
              y1={y}
              x2={displayedPoints.length * 36 + 40}
              y2={y}
              stroke="#e2e8f0"
              strokeDasharray="3 3"
            />
          ))}

          {/* Shaded Generation Area */}
          <polygon
            fill="url(#areaGenGradLight)"
            points={`40,190 ${displayedPoints
              .map((pt, idx) => `${40 + idx * 36},${190 - (pt.totalGen / maxVal) * 160}`)
              .join(' ')} ${40 + (displayedPoints.length - 1) * 36},190`}
          />

          {/* Baseline Demand Line (Indigo dashed) */}
          <polyline
            fill="none"
            stroke="#6366f1"
            strokeWidth="2"
            strokeDasharray="4 4"
            points={displayedPoints
              .map((pt, idx) => `${40 + idx * 36},${190 - (pt.demand / maxVal) * 160}`)
              .join(' ')}
          />

          {/* Forecast Total Generation Line (Ocean Sky-Blue) */}
          <polyline
            fill="none"
            stroke="#0284c7"
            strokeWidth="3.2"
            strokeLinecap="round"
            points={displayedPoints
              .map((pt, idx) => `${40 + idx * 36},${190 - (pt.totalGen / maxVal) * 160}`)
              .join(' ')}
          />

          {/* Hover hit points & dots */}
          {displayedPoints.map((pt, idx) => {
            const cx = 40 + idx * 36;
            const cy = 190 - (pt.totalGen / maxVal) * 160;
            const isHovered = hoveredPoint?.hourOffset === pt.hourOffset;
            const isSurplus = pt.flagStatus === 'surplus';
            const isShortfall = pt.flagStatus === 'shortfall';

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredPoint(pt)}
                className="cursor-pointer group"
              >
                {/* Invisible hover area */}
                <rect x={cx - 16} y="10" width="32" height="190" fill="transparent" />

                {/* Vertical cursor guide line when hovered */}
                {isHovered && (
                  <line x1={cx} y1="10" x2={cx} y2="190" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="2 2" />
                )}

                {/* Data point dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : isSurplus || isShortfall ? 4.5 : 3}
                  fill={isSurplus ? '#059669' : isShortfall ? '#d97706' : '#0284c7'}
                  stroke="#ffffff"
                  strokeWidth="2"
                />

                {/* Clean steady halo ring for flagged surplus / shortfall points (no erratic transform shift) */}
                {(isSurplus || isShortfall) && idx % 3 === 0 && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="7"
                    fill="none"
                    stroke={isSurplus ? '#059669' : '#d97706'}
                    strokeWidth="1.5"
                    opacity="0.45"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay (Light Mode) */}
        {hoveredPoint && (
          <div className="absolute top-2 right-2 p-3.5 rounded-2xl bg-white/95 border border-sky-300 shadow-xl backdrop-blur-md pointer-events-none text-xs font-mono z-20">
            <div className="text-sky-700 font-bold border-b border-sky-100 pb-1.5 mb-1.5 flex items-center justify-between gap-4">
              <span>{hoveredPoint.timeLabel}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                hoveredPoint.flagStatus === 'surplus' ? 'bg-emerald-100 text-emerald-800' :
                hoveredPoint.flagStatus === 'shortfall' ? 'bg-amber-100 text-amber-800' :
                'bg-sky-100 text-sky-800'
              }`}>
                {hoveredPoint.flagStatus}
              </span>
            </div>
            <div className="space-y-1 text-slate-700">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Total Generation:</span>
                <span className="text-slate-900 font-bold">{hoveredPoint.totalGen} MW</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Grid Demand:</span>
                <span className="text-indigo-600 font-semibold">{hoveredPoint.demand} MW</span>
              </div>
              <div className="flex justify-between gap-4 pt-1 border-t border-sky-100">
                <span className="text-slate-500">Net Delta:</span>
                <span className={`font-bold ${hoveredPoint.netBalance >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {hoveredPoint.netBalance > 0 ? `+${hoveredPoint.netBalance}` : hoveredPoint.netBalance} MW
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer Indicators */}
      <div className="mt-4 pt-3 border-t border-sky-100 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-sky-600 rounded-full" />
            <span className="text-slate-700 font-medium">AI Total Gen</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-indigo-500 border-b border-dashed" />
            <span className="text-slate-600">Grid Demand Base</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-emerald-700 font-medium">Surplus (BESS Buffer)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-amber-700 font-medium">Shortfall Alert</span>
          </div>
        </div>
        <span className="text-slate-500 text-[11px]">Model: XGBoost + Temporal Fusion Transformer</span>
      </div>
    </div>
  );
}
