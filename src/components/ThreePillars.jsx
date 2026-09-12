import React, { useState } from 'react';
import { Eye, Flag, Zap, ArrowRight, ShieldCheck, Cpu, Database, BellRing, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ThreePillars() {
  const [activePillar, setActivePillar] = useState(0);

  const pillars = [
    {
      id: 'forecast',
      number: '01',
      name: 'Forecast',
      tagline: 'Predict 24–72h Solar & Wind Output',
      color: 'cyan',
      icon: Eye,
      accentBg: 'from-cyan-500/10 to-blue-500/5',
      borderColor: 'border-cyan-500/30',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      summary:
        'Ingests live satellite irradiance, atmospheric pressure, temperature, and wind vector grids combined with historical site telemetry to project hourly generation profiles across a 24–72 hour operational horizon.',
      coreMechanisms: [
        { title: 'Multi-Horizon Time Series', detail: 'Trained on LSTM & XGBoost ensembles tailored for diurnal solar curves and turbulence dynamics.' },
        { title: 'Satellite & Weather Feed Integration', detail: 'Real-time DNI/GHI irradiance and 100m wind velocity layers fetched automatically.' },
        { title: 'Site Physics Normalization', detail: 'Accounts for elevation, panel tilt, rotor swept area, and temperature degradation.' }
      ],
      mockSnippet: {
        label: 'Predictive Inference Tensor',
        status: 'Horizon: T+72h | Confidence: 96.4%',
        code: `model.predict_horizon(
  irradiance_stream=[920, 945, 910],
  wind_velocity_100m=[8.4, 9.1, 11.2],
  ambient_temp=28.5,
  asset_type="HYBRID_PV_WIND"
) -> 72-Point Generation Curve`
      }
    },
    {
      id: 'flag',
      number: '02',
      name: 'Flag',
      tagline: 'Detect Over- & Under-Generation Windows',
      color: 'amber',
      icon: Flag,
      accentBg: 'from-amber-500/10 to-orange-500/5',
      borderColor: 'border-amber-500/30',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      summary:
        'Continuously reconciles projected output against expected grid demand schedules and substation interconnection limits, automatically flagging surplus anomalies (curtailment risk) and shortfall anomalies (blackout risk).',
      coreMechanisms: [
        { title: 'Surplus Risk Windows', detail: 'Flags generation spikes that exceed transmission line ratings or localized balancing capacity.' },
        { title: 'Shortfall Risk Windows', detail: 'Identifies simultaneous solar twilight and wind lulls during peak grid demand periods.' },
        { title: 'Severity Classification', detail: 'Tags each event as Low, Medium, or Critical with precise start/end timestamps and MW delta.' }
      ],
      mockSnippet: {
        label: 'Anomaly Flagging Engine',
        status: '2 Windows Flagged in Next 48h',
        code: `grid_detector.evaluate_balance(
  forecast_curve, 
  scheduled_demand
) -> [
  FLAG_SURPLUS(T+14h, delta=+42.8MW, risk="CURTAILMENT"),
  FLAG_SHORTFALL(T+32h, delta=-38.4MW, risk="DEFICIT")
]`
      }
    },
    {
      id: 'recommend',
      number: '03',
      name: 'Recommend',
      tagline: 'Convert Flags into Actionable Grid Response',
      color: 'emerald',
      icon: Zap,
      accentBg: 'from-emerald-500/10 to-teal-500/5',
      borderColor: 'border-emerald-500/30',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      summary:
        'Rather than leaving operators to decipher numbers, MegaByte generates specific, executable grid decisions: dispatch battery storage (charge or discharge), stage dynamic curtailment, or pre-warm reserve capacity.',
      coreMechanisms: [
        { title: 'Curtailment Optimization', detail: 'Feather specific turbine arrays or throttle solar inverters precisely to preserve equipment.' },
        { title: 'BESS Storage Dispatch', detail: 'Schedules battery charging during zero-marginal surplus and injects during peak price hours.' },
        { title: 'Backup Activation', detail: 'Alerts reserve peakers 3 hours in advance, avoiding costly emergency cold-starts.' }
      ],
      mockSnippet: {
        label: 'Dispatch Execution Engine',
        status: 'Optimal Strategy Generated',
        code: `decision_engine.generate_action(flag) -> {
  primary_action: "DISPATCH_BESS_CHARGING",
  storage_target: "35.0 MW for 3.5 hrs",
  secondary_action: "DYNAMIC_CURTAILMENT(7.8 MW)",
  net_co2_abatement: "14.2 Tons"
}`
      }
    }
  ];

  return (
    <section id="pillars" className="relative py-24 bg-dark-950 border-t border-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Three-Pillar Architecture</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
            Decision-Support, <br />
            <span className="text-gradient-cyan">Not Just Another Chart.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 font-sans leading-relaxed">
            Most forecasting tools stop at a line graph. MegaByte bridges the gap from raw predictions 
            to closed-loop grid dispatch through a cohesive three-stage pipeline.
          </p>
        </div>

        {/* Pillar Switcher Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              const isActive = activePillar === idx;
              return (
                <button
                  key={pillar.id}
                  onClick={() => setActivePillar(idx)}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-display font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-dark-950 shadow-glow-cyan'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span className="font-mono text-xs opacity-75">{pillar.number}</span>
                  <Icon className="w-4 h-4" />
                  <span>{pillar.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Pillar Detail Card */}
        {(() => {
          const p = pillars[activePillar];
          const Icon = p.icon;
          return (
            <div className={`p-8 sm:p-10 rounded-3xl bg-gradient-to-br ${p.accentBg} border ${p.borderColor} backdrop-blur-xl shadow-2xl transition-all`}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Column: Descriptions and Mechanisms */}
                <div className="lg:col-span-7">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono border ${p.badgeColor}`}>
                      Pillar {p.number}
                    </span>
                    <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                      {p.tagline}
                    </h3>
                  </div>

                  <p className="text-slate-300 text-base leading-relaxed mb-6 font-sans">
                    {p.summary}
                  </p>

                  <div className="space-y-3.5">
                    {p.coreMechanisms.map((mech, mIdx) => (
                      <div key={mIdx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-dark-950/70 border border-slate-800/80">
                        <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{mech.title}</div>
                          <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{mech.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Code & Interactive Output Simulator */}
                <div className="lg:col-span-5">
                  <div className="rounded-2xl bg-dark-950 border border-slate-800 shadow-2xl overflow-hidden font-mono">
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                        <span className="text-slate-400 ml-2 text-[11px]">{p.mockSnippet.label}</span>
                      </div>
                      <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                        Live Python Engine
                      </span>
                    </div>

                    <div className="p-4 text-xs text-cyan-300/90 leading-relaxed overflow-x-auto">
                      <pre className="whitespace-pre-wrap">{p.mockSnippet.code}</pre>
                    </div>

                    <div className="px-4 py-2.5 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Status:</span>
                      <span className="text-emerald-400 font-semibold">{p.mockSnippet.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 3-Pillar Visual Flow Connectors */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-center font-mono text-xs text-slate-400">
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-center gap-2">
            <span className="text-cyan-400 font-bold">1. Ingest & Train</span>
            <span>→ Time-series physics</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-center gap-2">
            <span className="text-amber-400 font-bold">2. Evaluate & Flag</span>
            <span>→ Grid threshold check</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-center gap-2">
            <span className="text-emerald-400 font-bold">3. Formulate Action</span>
            <span>→ Curtail / Storage / Peaker</span>
          </div>
        </div>
      </div>
    </section>
  );
}
