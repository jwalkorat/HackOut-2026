import React, { useState } from 'react';
import { AlertOctagon, CheckCircle2, Zap, BatteryCharging, ArrowRight, ShieldCheck, Flame, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { flaggedWindowsMock } from '../../data/mockForecastData';

export default function FlaggedActionsFeed() {
  const [flags, setFlags] = useState(flaggedWindowsMock);
  const [toastMessage, setToastMessage] = useState(null);

  const handleExecuteAction = (flagId, actionName) => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#0284c7', '#059669', '#f59e0b']
    });

    setFlags((prev) =>
      prev.map((f) =>
        f.id === flagId
          ? { ...f, resolved: true, status: 'Dispatched to Balancing Bus' }
          : f
      )
    );

    setToastMessage(`✓ Grid Dispatch Command Confirmed: ${actionName} routed via SCADA telemetry.`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className="p-6 rounded-3xl bg-white/95 border border-sky-200/90 shadow-[0_4px_25px_-5px_rgba(2,132,199,0.08)] relative">
      {/* Toast notification banner */}
      {toastMessage && (
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs font-mono shadow-xl animate-fade-in">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Feed Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-sky-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <h4 className="font-display font-black text-lg text-slate-900">
              Flagged Anomaly Windows & Automated Grid Recommendations
            </h4>
          </div>
          <p className="text-xs font-mono text-slate-500 mt-0.5">
            Automated Decision Support: Dynamic Curtailment, BESS Buffering, or Fast-Start Peaker Activation
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500">Autonomous Decision Loop:</span>
          <span className="text-sky-700 font-bold bg-sky-100 px-2.5 py-1 rounded-full border border-sky-200">
            Active Substation Telemetry
          </span>
        </div>
      </div>

      {/* Flagged Item Cards */}
      <div className="space-y-4">
        {flags.map((item) => {
          const isSurplus = item.type === 'surplus';
          const isShortfall = item.type === 'shortfall';

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all ${
                item.resolved
                  ? 'bg-emerald-50/80 border-emerald-300'
                  : isSurplus
                  ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                  : isShortfall
                  ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                  : 'bg-sky-50/40 border-sky-200 hover:border-sky-300'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      item.resolved
                        ? 'bg-emerald-100 text-emerald-700'
                        : isSurplus
                        ? 'bg-amber-100 text-amber-700'
                        : isShortfall
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-sky-100 text-sky-700'
                    }`}
                  >
                    {item.resolved ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isShortfall ? (
                      <Flame className="w-5 h-5" />
                    ) : (
                      <Zap className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-sm sm:text-base text-slate-900">
                        {item.title}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          item.severity === 'critical'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {item.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      Window: <strong className="text-slate-800">{item.timeframe}</strong> • Delta: <strong className={isSurplus ? 'text-emerald-700' : 'text-rose-700'}>{item.excessCapacity}</strong>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                      item.resolved
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Root Cause & Recommendation Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs pt-3 border-t border-slate-200/80">
                <div className="md:col-span-6 p-3 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold mb-1">
                    Ingested Root Cause (Weather / Demand Coupling)
                  </span>
                  <p className="text-slate-700 text-xs leading-relaxed font-sans">
                    {item.rootCause}
                  </p>
                </div>

                <div className="md:col-span-6 p-3 rounded-xl bg-sky-50/80 border border-sky-200">
                  <span className="text-[10px] font-mono text-sky-800 uppercase tracking-wider block font-bold mb-1">
                    Actionable Grid Recommendation
                  </span>
                  <p className="text-sky-900 text-xs font-semibold leading-relaxed font-sans">
                    {item.recommendation}
                  </p>
                </div>
              </div>

              {/* Impact Tag & Execution Action Button */}
              <div className="mt-3.5 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-800 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Projected Benefit: {item.co2Saved}</span>
                </div>

                <div>
                  {item.resolved ? (
                    <button
                      disabled
                      className="px-4 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-mono font-bold text-xs border border-emerald-300 flex items-center gap-1.5 cursor-default"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>SCADA Dispatched</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleExecuteAction(item.id, item.actionButton)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-display font-bold text-xs shadow-glow-sky active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <span>Simulate Grid Action: {item.actionButton}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
