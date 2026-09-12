import React from 'react';
import { X, Terminal, CheckCircle2, Zap, ArrowRight, ExternalLink, ShieldCheck, Sparkles, FileText } from 'lucide-react';

export default function JudgePitchModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-dark-900 border border-cyan-500/40 shadow-2xl p-6 sm:p-8 text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
          aria-label="Close pitch modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-2xl text-white">MegaByte HackOut'26</h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                2-Minute Pitch Brief
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400">
              Theme: Renewable Energy Intelligence • Submission Pitch Document
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm">
          {/* Executive Summary */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <h4 className="font-display font-bold text-white text-base mb-1">
              Executive Problem & Value Proposition
            </h4>
            <p className="text-slate-300 leading-relaxed font-sans text-xs sm:text-sm">
              Solar and wind output fluctuates constantly with weather, forcing grids into a costly double-bind: 
              <strong> dumping zero-marginal-cost clean energy</strong> or <strong>firing up carbon-heavy fossil peakers</strong>. 
              MegaByte solves this by forecasting generation 24–72 hours ahead and converting volatility into concrete grid actions: 
              <span className="text-cyan-400 font-semibold"> Curtailment</span>, 
              <span className="text-amber-400 font-semibold"> Storage Dispatch</span>, or 
              <span className="text-emerald-400 font-semibold"> Peaker Pre-warming</span>.
            </p>
          </div>

          {/* 3 Pillars Summary */}
          <div>
            <h4 className="font-display font-bold text-white text-sm mb-2.5 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>The Three Pillars (Decision-Support Core)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-cyan-400 font-bold block mb-1">1. Forecast</span>
                <span className="text-slate-400 text-[11px]">24–72h prediction via LSTM & XGBoost from live weather & site telemetry.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-amber-400 font-bold block mb-1">2. Flag</span>
                <span className="text-slate-400 text-[11px]">Detects upcoming surplus (over-gen) and shortfall (deficit) windows.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-1">3. Recommend</span>
                <span className="text-slate-400 text-[11px]">Outputs actionable grid dispatch commands to balancing authorities.</span>
              </div>
            </div>
          </div>

          {/* Key Differentiators */}
          <div>
            <h4 className="font-display font-bold text-white text-sm mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Core Architectural Innovations</span>
            </h4>
            <ul className="space-y-2 text-xs font-sans text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Layered Progressive Input:</strong> 3 required fields (~10 seconds) produces a fully functional forecast using sensible defaults; optional Layer 2 unlocks up to 97% confidence.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Equipment Lookup & Default Fallback:</strong> Searchable model preset catalog with explicit "Generic / Don't know" fallback — no user is ever blocked by technical jargon.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Self-Healing MLOps Loop:</strong> Automated retraining on scheduled cadence or drift threshold spikes, validated in MLflow before zero-downtime deployment.</span>
              </li>
            </ul>
          </div>

          {/* Tech Stack Summary */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono text-slate-400">
            <span className="text-white font-semibold">Tech Stack:</span> Python (LSTM, XGBoost), MLflow, FastAPI, Supabase, React, Vite, Tailwind CSS, Three.js WebGL.
          </div>

          {/* Action CTAs */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-mono text-slate-500">
              Submission: HackOut'26 • Team MegaByte
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-dark-950 font-display font-bold text-xs shadow-glow-cyan hover:brightness-110 transition-all"
            >
              Resume Interactive Platform Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
