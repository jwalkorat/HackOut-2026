import React, { useState } from 'react';
import { ArrowRight, BatteryCharging, Flame, ShieldCheck, Terminal, CheckCircle2, Sparkles, Battery, SlidersHorizontal } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Glass } from '../components/ui/Glass';
import OrbCanvas from '../components/world/OrbCanvas';
import { flaggedActionWindows } from '../data/mockForecastData';
import BessIntrospector from '../components/dashboard/BessIntrospector';

export default function ActionsView({
  flaggedWindows = [],
  setFlaggedWindows = () => {},
  forecastData = [],
  userConfig = null
}) {
  const [internalFlags, setInternalFlags] = useState(flaggedActionWindows);
  const [toast, setToast] = useState(null);
  const [showIntrospector, setShowIntrospector] = useState(false);

  // Use props flags if available, otherwise internal fallback
  const activeFlags = flaggedWindows && flaggedWindows.length > 0 ? flaggedWindows : internalFlags;
  const updateFlags = (updater) => {
    if (flaggedWindows && flaggedWindows.length > 0 && setFlaggedWindows) {
      setFlaggedWindows(updater);
    } else {
      setInternalFlags(updater);
    }
  };

  const hasBess = Boolean(
    (userConfig?.batteryCapacity && parseFloat(userConfig.batteryCapacity) > 0) ||
    forecastData.some((r) => r.bessChargeKw > 0 || r.bessDischargeKw > 0)
  );

  const scadaLogs = [
    { time: '13:12:04 UTC', node: 'BESS-BAY-02', cmd: 'PRE_CHARGE_INIT', state: 'ACK (0x99A)', status: 'Success' },
    { time: '13:00:00 UTC', node: 'INVERTER_ARRAY_A', cmd: 'P_LIMIT_SET_95%', state: 'SYNCED', status: 'Success' },
    { time: '12:45:12 UTC', node: 'PEAKER_SUB_CAISO', cmd: 'WARM_STANDBY_PING', state: 'READY', status: 'Nominal' },
    { time: '12:30:00 UTC', node: 'SCADA_TELEMETRY', cmd: '72H_DISPATCH_BROADCAST', state: 'COMMITTED', status: 'Success' },
  ];

  const run = (id, name) => {
    confetti({ particleCount: 55, spread: 70, origin: { y: 0.75 }, colors: ['#22d3ee', '#34d399', '#fbbf24'] });
    updateFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, resolved: true, status: 'Dispatched to Balancing Bus' } : f))
    );
    setToast(`Grid command confirmed: ${name}`);
    setTimeout(() => setToast(null), 3500);
  };

  const handleResolveAll = () => {
    confetti({ particleCount: 80, spread: 90, origin: { y: 0.7 }, colors: ['#38bdf8', '#34d399', '#facc15'] });
    updateFlags((prev) => prev.map((f) => ({ ...f, resolved: true, status: 'Dispatched to Balancing Bus' })));
    setToast('All active grid imbalance flags dispatched to SCADA balancing bus');
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Toast alert */}
      {toast && (
        <div className="glass-hud rounded-2xl px-4 py-2.5 text-xs font-mono text-emerald-950 font-bold border border-emerald-300 shadow-md shadow-emerald-500/10 flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" /> {toast}
        </div>
      )}

      {/* Top action toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-slate-900 leading-tight">Grid Action Dispatch</h2>
          <p className="text-xs font-mono text-slate-500 mt-0.5">Automated Over/Under-generation mitigation protocols</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowIntrospector((v) => !v)}
            className={`min-h-10 px-4 rounded-xl text-xs font-bold font-mono border flex items-center gap-1.5 transition-colors ${
              showIntrospector
                ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20'
                : 'bg-white/60 text-slate-700 border-sky-200 hover:bg-white/80'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {showIntrospector ? 'Hide BESS Model' : 'BESS Introspector'}
          </button>
          <button
            type="button"
            onClick={handleResolveAll}
            className="min-h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" /> Clear All Grid Flags
          </button>
        </div>
      </div>

      {/* Flagged action cards */}
      <div className="space-y-3">
        {activeFlags.map((item) => (
          <Glass key={item.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 max-w-3xl">
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                  {item.id} • {item.timeframe}
                </div>
                <h3 className="font-display font-extrabold text-lg mt-1 text-slate-900">{item.title || 'Grid Imbalance Window'}</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.rootCause}</p>
                <div className="mt-2.5">
                  <span className="text-xs font-mono text-sky-800 bg-sky-100/70 border border-sky-200/80 px-2.5 py-1.5 rounded-xl font-medium inline-block">
                    {item.recommendation}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-2xl font-extrabold tabular ${item.type === 'shortfall' ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {item.excessCapacity}
                </div>
                <div className="text-[11px] font-mono text-slate-500 font-medium">
                  {item.severity} • {item.co2Saved}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              {item.resolved ? (
                <span className="min-h-10 px-4 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> SCADA dispatched
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => run(item.id, item.actionButton || 'Dispatch Balancing Order')}
                  className="min-h-11 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-colors"
                >
                  Simulate: {item.actionButton || 'Dispatch Balancing'} <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </Glass>
        ))}
      </div>

      {/* Protocol cards with OrbCanvas */}
      <div className="grid md:grid-cols-3 gap-3">
        {[
          { icon: BatteryCharging, t: 'Surplus absorption', h: 'Tier-1 BESS charging & curtailment', b: 'When surplus exceeds 25 MW, charge storage before inverter clip.', s: 'Automated dispatch armed', k: 'battery', a: 0x34d399 },
          { icon: Flame, t: 'Shortfall deficit', h: 'BESS discharge + peaker pre-warm', b: 'Twilight drop plus wind lull fires discharge up to 30 MW.', s: '4h lead-time active', k: 'sun', a: 0xf59e0b },
          { icon: ShieldCheck, t: 'Storm safeguard', h: 'Rotor aerodynamic feathering', b: 'Gusts above 22 m/s feather blades and reroute to BESS.', s: 'IEC 61400-1 enforced', k: 'turbine', a: 0x22d3ee },
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

      {/* SCADA command bus */}
      <Glass className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Terminal className="w-4 h-4 text-sky-600" />
          <h3 className="font-display font-extrabold text-slate-900">SCADA command bus</h3>
          <span className="ml-auto text-xs font-mono text-slate-400">Balancing authority loop active</span>
        </div>
        <div className="space-y-2">
          {scadaLogs.map((log) => (
            <div key={log.time + log.cmd} className="glass-chip rounded-xl px-3 py-2.5 flex flex-wrap justify-between gap-2 text-xs font-mono">
              <span className="text-slate-500">{log.time}</span>
              <span className="font-bold text-slate-900">{log.node}</span>
              <span className="text-sky-700 font-semibold">{log.cmd}</span>
              <span className="text-slate-700">{log.state}</span>
              <span className="text-emerald-700 font-bold">{log.status}</span>
            </div>
          ))}
        </div>
      </Glass>

      {/* BESS Introspector report */}
      {showIntrospector && (
        <Glass className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Battery className="w-5 h-5 text-sky-600" />
              <h3 className="font-display font-extrabold text-slate-900 text-lg">72-Hour BESS Introspector</h3>
            </div>
            <span className="text-xs font-mono text-slate-500">SOC & C-Rate Thermal Simulation</span>
          </div>
          <BessIntrospector forecastData={forecastData} userConfig={userConfig} />
        </Glass>
      )}
    </div>
  );
}
