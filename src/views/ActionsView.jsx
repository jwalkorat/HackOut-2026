import React, { useState } from 'react';
import { ArrowRight, BatteryCharging, Flame, ShieldCheck, Terminal, CheckCircle2, Sparkles, Zap, Scissors, Battery, Power, RotateCcw, BarChart2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Glass } from '../components/ui/Glass';
import OrbCanvas from '../components/world/OrbCanvas';
import BessIntrospector from '../components/dashboard/BessIntrospector';

export default function ActionsView({ forecastData = [], flaggedWindows = [], setFlaggedWindows, userConfig }) {
  const [toast, setToast] = useState(null);
  const [showIntrospector, setShowIntrospector] = useState(false);

  const hasBess = Boolean(userConfig?.batteryCapacity && parseFloat(userConfig.batteryCapacity) > 0);

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!forecastData.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
        <Glass className="p-10 text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-4">
            <OrbCanvas kind="battery" accent={0xf59e0b} />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-slate-900 mb-2">No Actions Yet</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Flagged surplus and shortfall windows will appear here after running a forecast in the <strong>Setup</strong> tab.
          </p>
        </Glass>
      </div>
    );
  }

  const run = (id, name) => {
    confetti({ particleCount: 55, spread: 70, origin: { y: 0.75 }, colors: ['#22d3ee', '#34d399', '#fbbf24'] });
    setFlaggedWindows((prev) =>
      prev.map((f) => f.id === id ? { ...f, resolved: true, status: 'Dispatched to Balancing Bus' } : f)
    );
    setToast(`Grid command confirmed: ${name}`);
    setTimeout(() => setToast(null), 3500);
  };

  const handleAllClearClick = () => {
    if (unresolvedCount > 0) {
      confetti({
        particleCount: 75,
        spread: 85,
        origin: { y: 0.75 },
        colors: ['#22d3ee', '#34d399', '#10b981', '#fbbf24'],
      });
      setFlaggedWindows((prev) =>
        prev.map((f) => ({ ...f, resolved: true, status: 'Dispatched to Balancing Bus' }))
      );
      setToast(`All Clear: Dispatched all ${unresolvedCount} grid actions to Balancing Bus`);
      setTimeout(() => setToast(null), 3500);
      // Reveal the BESS introspector report post-dispatch
      if (hasBess) setShowIntrospector(true);
    } else {
      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.75 },
        colors: ['#34d399', '#10b981', '#6ee7b7'],
      });
      setToast('✓ All Clear: Grid operating within optimal balance across all 72 hours');
      setTimeout(() => setToast(null), 3500);
      if (hasBess) setShowIntrospector(true);
    }
  };

  const handleResetAll = () => {
    setFlaggedWindows((prev) =>
      prev.map((f) => ({ ...f, resolved: false, status: 'Pending Dispatch' }))
    );
    setToast('Simulation re-armed: All flagged windows reset to pending');
    setTimeout(() => setToast(null), 3500);
  };

  // Action type → badge config (Recommend pillar: curtail / dispatch storage / activate backup)
  const actionBadge = (type) => {
    switch (type) {
      case 'curtail':   return { label: 'Curtail Generation',     Icon: Scissors,     cls: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'charge':    return { label: 'Dispatch BESS Charging',  Icon: BatteryCharging, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'discharge': return { label: 'Discharge Storage',       Icon: Battery,       cls: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'backup':    return { label: 'Activate Backup Generator',Icon: Power,         cls: 'bg-violet-50 text-violet-700 border-violet-200' };
      default:          return null;
    }
  };

  const unresolvedCount = flaggedWindows.filter((w) => !w.resolved).length;

  return (
    <div className="space-y-4">
      {toast && (
        <div className="glass-hud rounded-2xl px-4 py-2.5 text-xs font-mono text-emerald-950 font-bold border border-emerald-300 shadow-md shadow-emerald-500/10 flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />{toast}
        </div>
      )}

      {/* Three Pillars context strip */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { step: '01', title: 'Forecast', color: 'text-sky-700', bg: 'bg-sky-50 border-sky-200' },
          { step: '02', title: 'Flag', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
          { step: '03', title: 'Recommend', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', active: true },
        ].map((p) => (
          <div key={p.title} className={`rounded-xl border px-3 py-2 text-center ${p.bg} ${p.active ? 'ring-2 ring-emerald-400/40' : 'opacity-60'}`}>
            <div className={`text-[9px] font-mono uppercase font-bold ${p.color}`}>Pillar {p.step}</div>
            <div className={`text-xs font-bold ${p.color}`}>{p.title}</div>
          </div>
        ))}
      </div>

      {/* Header summary */}
      <Glass className="p-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-display font-extrabold text-lg text-slate-900">Grid Action Center</h3>
          <p className="text-xs font-mono text-slate-500">
            {flaggedWindows.length} flagged window{flaggedWindows.length !== 1 ? 's' : ''} detected
            {unresolvedCount > 0 ? ` • ${unresolvedCount} require action` : ' • All resolved'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {unresolvedCount === 0 && flaggedWindows.length > 0 && (
            <button
              type="button"
              onClick={handleResetAll}
              className="text-xs font-mono px-3 py-1.5 rounded-full border border-slate-200 bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Reset all actions to pending to re-simulate"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Re-arm</span>
            </button>
          )}
          {hasBess && (
            <button
              type="button"
              onClick={() => setShowIntrospector(v => !v)}
              className={`text-xs font-mono px-3 py-1.5 rounded-full font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 ${
                showIntrospector
                  ? 'bg-sky-500 text-white border-sky-600 shadow-sky-300/30'
                  : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-300'
              }`}
              title="Toggle 72-Hour BESS Dispatch Introspector report"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>{showIntrospector ? 'Hide' : 'View'} BESS Report</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleAllClearClick}
            className={`text-xs font-mono px-3.5 py-1.5 rounded-full font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:shadow hover:scale-105 active:scale-95 ${
              unresolvedCount > 0
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 hover:border-amber-400'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 hover:border-emerald-400'
            }`}
            title={unresolvedCount > 0 ? `Click to resolve and clear all ${unresolvedCount} flagged actions` : "All Clear — click to verify optimal balance"}
          >
            {unresolvedCount > 0 ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>Clear All ({unresolvedCount})</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>All Clear</span>
              </>
            )}
          </button>
        </div>
      </Glass>

      {/* Flagged event cards */}
      {flaggedWindows.length === 0 ? (
        <Glass className="p-8 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h4 className="font-display font-bold text-slate-900">No surplus or shortfall windows</h4>
          <p className="text-xs text-slate-500 mt-1">Generation is well-balanced against demand across the full 72-hour horizon.</p>
        </Glass>
      ) : (
        <div className="space-y-3">
          {flaggedWindows.map((item) => (
            <Glass key={item.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className={`text-[10px] font-mono uppercase tracking-widest font-bold ${
                    item.type === 'surplus' ? 'text-emerald-700' : 'text-amber-700'
                  }`}>{item.id} • {item.timeframe}</div>
                  <h3 className="font-display font-extrabold text-lg mt-1 text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">{item.rootCause}</p>
                  {/* Recommend pillar: specific action-type badge */}
                  {(() => {
                    const badge = actionBadge(item.rows?.[0]?.actionType);
                    return badge ? (
                      <div className="mt-2.5 flex flex-wrap gap-2 items-center">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-2.5 py-1.5 rounded-xl border ${badge.cls}`}>
                          <badge.Icon className="w-3.5 h-3.5" />{badge.label}
                        </span>
                        {item.recommendation && (
                          <span className="text-xs font-mono text-sky-700 bg-sky-50 border border-sky-200/80 px-2.5 py-1.5 rounded-xl">
                            {item.recommendation}
                          </span>
                        )}
                      </div>
                    ) : item.recommendation ? (
                      <div className="mt-2.5">
                        <span className="text-xs font-mono text-sky-800 bg-sky-100/70 border border-sky-200/80 px-2.5 py-1.5 rounded-xl font-medium inline-block">
                          {item.recommendation}
                        </span>
                      </div>
                    ) : null;
                  })()}
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-extrabold tabular ${item.type === 'shortfall' ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {item.excessCapacity}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 font-medium capitalize">{item.severity} • {item.co2Saved}</div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                {item.resolved ? (
                  <span className="min-h-10 px-4 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />SCADA dispatched
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => run(item.id, item.actionButton)}
                    className="min-h-11 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-colors"
                  >
                    Simulate: {item.actionButton} <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </Glass>
          ))}
        </div>
      )}

      {/* Protocol cards */}
      <div className="grid md:grid-cols-3 gap-3">
        {[
          { icon: BatteryCharging, t: 'Surplus absorption', h: 'Tier-1 BESS charging & curtailment', b: 'When surplus exceeds threshold, charge storage before inverter clip.', s: 'Automated dispatch armed', k: 'battery', a: 0x34d399 },
          { icon: Flame, t: 'Shortfall deficit', h: 'BESS discharge + peaker pre-warm', b: 'Twilight drop plus wind lull fires discharge to cover demand gap.', s: '4h lead-time active', k: 'sun', a: 0xf59e0b },
          { icon: ShieldCheck, t: 'Storm safeguard', h: 'Rotor aerodynamic feathering', b: 'Gusts above 22 m/s feather blades and reroute to BESS buffers.', s: 'IEC 61400-1 enforced', k: 'turbine', a: 0x22d3ee },
        ].map((p) => (
          <Glass key={p.t} className="p-4">
            <div className="w-16 h-16 mx-auto mb-2"><OrbCanvas kind={p.k} accent={p.a} /></div>
            <div className="text-[10px] font-mono uppercase text-sky-700 font-bold">{p.t}</div>
            <h4 className="font-bold mt-1 text-slate-900">{p.h}</h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">{p.b}</p>
            <div className="mt-3 text-[11px] font-mono text-emerald-700 font-bold">{p.s}</div>
          </Glass>
        ))}
      </div>

      {/* SCADA log — generated from resolved flags */}
      <Glass className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Terminal className="w-4 h-4 text-sky-600" />
          <h3 className="font-display font-extrabold text-slate-900">SCADA command log</h3>
          <span className="ml-auto text-xs font-mono text-slate-400">Actions dispatched this session</span>
        </div>
        {flaggedWindows.filter((w) => w.resolved).length === 0 ? (
          <div className="text-xs font-mono text-slate-400 py-4 text-center">No commands dispatched yet — resolve flagged windows above</div>
        ) : (
          <div className="space-y-2">
            {flaggedWindows.filter((w) => w.resolved).map((w) => (
              <div key={w.id} className="glass-chip rounded-xl px-3 py-2.5 flex flex-wrap justify-between gap-2 text-xs font-mono">
                <span className="text-slate-500">{w.startTime}</span>
                <span className="font-bold text-slate-900">{w.id}</span>
                <span className="text-sky-700 font-semibold">{w.actionButton?.toUpperCase().replace(/ /g, '_')}</span>
                <span className="text-slate-700">{w.timeframe}</span>
                <span className="text-emerald-700 font-bold">Dispatched</span>
              </div>
            ))}
          </div>
        )}
      </Glass>

      {/* ── BESS Introspector Report (shown post Clear All or via toggle) ──────── */}
      {showIntrospector && hasBess && (
        <Glass className="p-5">
          <BessIntrospector forecastData={forecastData} userConfig={userConfig} />
        </Glass>
      )}

      {/* Nudge card: prompt user to configure BESS if not set */}
      {showIntrospector && !hasBess && (
        <Glass className="p-5 text-center">
          <Battery className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-mono text-slate-500">
            No BESS configured — add a battery capacity in the <strong>Setup</strong> tab to unlock the 72-hour introspector report.
          </p>
        </Glass>
      )}
    </div>
  );
}
