import React, { useState } from 'react';
import { AlertTriangle, Flame, CloudRain, ZapOff, TrendingUp, CheckCircle, ArrowRight, Activity, ShieldAlert } from 'lucide-react';

export default function ProblemSection() {
  const [viewMode, setViewMode] = useState('with_megabyte'); // 'with_megabyte' | 'without_megabyte'

  // Synthetic 24-hour timeline points for volatile generation vs AI forecast
  const timePoints = [
    { hour: '00:00', actualVolatile: 28, aiForecast: 30, demand: 45, peakerFired: false, energyDumped: false },
    { hour: '03:00', actualVolatile: 18, aiForecast: 22, demand: 40, peakerFired: true, energyDumped: false },
    { hour: '06:00', actualVolatile: 42, aiForecast: 45, demand: 62, peakerFired: false, energyDumped: false },
    { hour: '09:00', actualVolatile: 88, aiForecast: 85, demand: 75, peakerFired: false, energyDumped: false },
    { hour: '12:00', actualVolatile: 125, aiForecast: 120, demand: 82, peakerFired: false, energyDumped: true }, // Sudden surplus
    { hour: '14:00', actualVolatile: 118, aiForecast: 114, demand: 80, peakerFired: false, energyDumped: true },
    { hour: '16:00', actualVolatile: 65, aiForecast: 68, demand: 85, peakerFired: false, energyDumped: false },
    { hour: '18:00', actualVolatile: 22, aiForecast: 25, demand: 110, peakerFired: true, energyDumped: false }, // Severe shortfall
    { hour: '20:00', actualVolatile: 15, aiForecast: 18, demand: 105, peakerFired: true, energyDumped: false },
    { hour: '22:00', actualVolatile: 32, aiForecast: 34, demand: 70, peakerFired: false, energyDumped: false },
  ];

  return (
    <section id="problem" className="relative py-20 bg-dark-950/80 border-t border-slate-900 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-red-500/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 -left-32 w-96 h-96 bg-cyan-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono mb-4">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>The Central Renewable Dilemma</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
            Weather volatility makes renewables <br />
            <span className="text-gradient-solar">impossible to plan blindly.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 font-sans leading-relaxed">
            Unlike coal or natural gas, solar and wind power cannot be dialed up on demand. 
            Sudden cloud cover or wind lulls force operators into an expensive double-bind: 
            <strong className="text-slate-200"> waste clean energy through curtailment</strong> or 
            <strong className="text-slate-200"> fire up carbon-heavy fossil peakers</strong> at exorbitant spot prices.
          </p>
        </div>

        {/* Two-Column Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Card 1: Over-generation & Curtailment */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-amber-500/20 backdrop-blur-md relative overflow-hidden group hover:border-amber-500/40 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5">
              <ZapOff className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-2xl text-white mb-2">
              Cost of Over-Generation: Curtailment
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              When midday sun and strong gusts surge generation beyond grid transmission limits, operators are forced to dump clean energy. In CAISO and ERCOT, gigawatt-hours of zero-marginal-cost renewable power are curtailed annually, destroying asset ROI.
            </p>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 font-mono text-xs text-amber-400">
              <span className="font-bold">Grid Penalty:</span> Zero revenue for dumped clean kilowatt-hours.
            </div>
          </div>

          {/* Card 2: Under-generation & Fossil Peakers */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-red-500/20 backdrop-blur-md relative overflow-hidden group hover:border-red-500/40 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-5">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-2xl text-white mb-2">
              Cost of Under-Generation: Fossil Peakers
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              When wind velocity collapses or a storm front darkens solar panels during the evening peak, the grid faces immediate blackout risk. Operators must start fast-firing fossil combustion turbines, causing emission spikes and massive balancing fees.
            </p>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 font-mono text-xs text-red-400">
              <span className="font-bold">Grid Penalty:</span> High spot emissions + up to $5,000/MWh peak scarcity pricing.
            </div>
          </div>
        </div>

        {/* Interactive Volatility Comparison Chart Widget */}
        <div className="p-6 sm:p-8 rounded-3xl bg-dark-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                <h3 className="font-display font-bold text-xl text-white">
                  Real-Time Volatility Simulator: 24-Hour Dispatch Horizon
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Toggle below to compare unpredicted volatile reality vs. MegaByte's 24–72h smoothed predictive action band.
              </p>
            </div>

            {/* Interactive Toggle Button */}
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                onClick={() => setViewMode('without_megabyte')}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium font-mono transition-all ${
                  viewMode === 'without_megabyte'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Without MegaByte (Reactive Chaos)
              </button>
              <button
                onClick={() => setViewMode('with_megabyte')}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium font-mono transition-all ${
                  viewMode === 'with_megabyte'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                With MegaByte AI (Proactive Balance)
              </button>
            </div>
          </div>

          {/* SVG Line / Bar Visualization */}
          <div className="relative w-full h-72 sm:h-80">
            {/* Chart SVG */}
            <svg className="w-full h-full overflow-visible" viewBox="0 0 900 280">
              <defs>
                <linearGradient id="volatileGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid horizontal rule lines */}
              {[50, 100, 150, 200, 250].map((y) => (
                <line key={y} x1="40" y1={y} x2="880" y2={y} stroke="#1e293b" strokeDasharray="3 3" />
              ))}

              {/* Demand Baseline Line (dashed purple) */}
              <polyline
                fill="none"
                stroke="#818cf8"
                strokeWidth="2"
                strokeDasharray="4 4"
                points={timePoints
                  .map((pt, idx) => `${70 + idx * 85},${250 - (pt.demand / 130) * 200}`)
                  .join(' ')}
              />

              {/* Mode 1: Volatile curve (Red, Jagged) */}
              {viewMode === 'without_megabyte' ? (
                <>
                  <polyline
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                    points={timePoints
                      .map((pt, idx) => `${70 + idx * 85},${250 - (pt.actualVolatile / 130) * 200}`)
                      .join(' ')}
                  />
                  {timePoints.map((pt, idx) => {
                    const cx = 70 + idx * 85;
                    const cy = 250 - (pt.actualVolatile / 130) * 200;
                    return (
                      <g key={idx}>
                        <circle cx={cx} cy={cy} r="5" fill="#ef4444" />
                        {pt.energyDumped && (
                          <g>
                            <rect x={cx - 35} y={cy - 30} width="70" height="20" rx="4" fill="#991b1b" />
                            <text x={cx} y={cy - 16} fill="#fca5a5" fontSize="9" textAnchor="middle" fontFamily="monospace">
                              DUMPED
                            </text>
                          </g>
                        )}
                        {pt.peakerFired && (
                          <g>
                            <rect x={cx - 45} y={cy + 12} width="90" height="20" rx="4" fill="#7f1d1d" />
                            <text x={cx} y={cy + 26} fill="#fca5a5" fontSize="9" textAnchor="middle" fontFamily="monospace">
                              PEAKER FIRED
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </>
              ) : (
                /* Mode 2: MegaByte AI Forecast Curve (Smooth Cyan with Pre-dispatched Storage) */
                <>
                  <polygon
                    fill="url(#aiGrad)"
                    points={`70,250 ${timePoints
                      .map((pt, idx) => `${70 + idx * 85},${250 - (pt.aiForecast / 130) * 200}`)
                      .join(' ')} 835,250`}
                  />
                  <polyline
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="3.5"
                    points={timePoints
                      .map((pt, idx) => `${70 + idx * 85},${250 - (pt.aiForecast / 130) * 200}`)
                      .join(' ')}
                  />
                  {timePoints.map((pt, idx) => {
                    const cx = 70 + idx * 85;
                    const cy = 250 - (pt.aiForecast / 130) * 200;
                    return (
                      <g key={idx}>
                        <circle cx={cx} cy={cy} r="5" fill="#00f2fe" stroke="#050811" strokeWidth="2" />
                        {pt.energyDumped && (
                          <g>
                            <rect x={cx - 48} y={cy - 30} width="96" height="20" rx="4" fill="#065f46" />
                            <text x={cx} y={cy - 16} fill="#6ee7b7" fontSize="9" textAnchor="middle" fontFamily="monospace">
                              CHARGING BESS
                            </text>
                          </g>
                        )}
                        {pt.peakerFired && (
                          <g>
                            <rect x={cx - 50} y={cy - 30} width="100" height="20" rx="4" fill="#075985" />
                            <text x={cx} y={cy - 16} fill="#7dd3fc" fontSize="9" textAnchor="middle" fontFamily="monospace">
                              DISPATCH BESS
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </>
              )}

              {/* Time X-axis labels */}
              {timePoints.map((pt, idx) => (
                <text
                  key={idx}
                  x={70 + idx * 85}
                  y="272"
                  fill="#94a3b8"
                  fontSize="11"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {pt.hour}
                </text>
              ))}
            </svg>
          </div>

          {/* Chart Legend & Status explanation */}
          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-indigo-400 border-b border-dashed" />
                <span className="text-slate-400">Grid Demand Curve</span>
              </div>
              {viewMode === 'without_megabyte' ? (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-red-500" />
                  <span className="text-red-400">Volatile Supply (Unpredicted)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 bg-cyan-400" />
                  <span className="text-cyan-300">MegaByte 24-72h AI Forecast</span>
                </div>
              )}
            </div>

            <div className="text-slate-300 font-sans text-xs">
              {viewMode === 'without_megabyte' ? (
                <span className="text-red-400 font-medium">⚠️ 3 Fossil peaker events + 2 emergency curtailment drops</span>
              ) : (
                <span className="text-emerald-400 font-medium">✓ 100% Curtailment averted via scheduled battery buffer</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
