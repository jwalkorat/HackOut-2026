import React, { useState } from 'react';
import Hero3DScene from './Hero3DScene';
import { ArrowRight, ShieldAlert, Cpu, Sparkles, ChevronDown, CheckCircle2, Sliders, Play, Layers } from 'lucide-react';

export default function HeroSection({ onOpenDashboard }) {
  const [selectedEnergyMode, setSelectedEnergyMode] = useState('hybrid');

  return (
    <section className="relative pt-8 pb-20 md:pt-14 md:pb-28 overflow-hidden">
      {/* Background ambient lighting glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-amber-500/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span>HackOut'26 Official Submission</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-semibold">Team MegaByte</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 text-xs text-slate-300 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Theme: Renewable Energy Intelligence</span>
          </div>
        </div>

        {/* Hero Headline & Value Proposition (Directly from Report) */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.08] text-white">
            Forecast renewable output <br />
            <span className="text-gradient-hybrid">24–72 hours ahead.</span> <br />
            <span className="text-slate-200">Turn volatile power into decisive grid action.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-sans">
            Weather volatility forces grids to either waste clean energy or spin up costly fossil peakers. 
            <strong className="text-slate-200 font-medium"> MegaByte bridges the gap</strong> with an AI platform that predicts solar and wind generation, 
            flags impending surplus or shortfall anomalies, and delivers concrete commands: <span className="text-cyan-400 font-semibold">Curtail</span>, <span className="text-amber-400 font-semibold">Dispatch Storage</span>, or <span className="text-emerald-400 font-semibold">Activate Backup</span>.
          </p>

          {/* Interactive Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#dashboard"
              className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-400 text-dark-950 font-display font-bold text-base shadow-glow-cyan hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Launch Live Dashboard Preview</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="#progressive-input"
              className="flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 text-slate-200 font-medium text-sm transition-all"
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Try 10-Second Progressive Input</span>
            </a>
          </div>
        </div>

        {/* Interactive 3D Canvas Scene with Mode Selection */}
        <div className="mt-8">
          <Hero3DScene energyMode={selectedEnergyMode} onModeChange={setSelectedEnergyMode} />
        </div>

        {/* Key Operational Pillars Bar (Under Hero) */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-dark-900/70 border border-slate-800/80 backdrop-blur-md">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Prediction Horizon</div>
            <div className="text-2xl font-black font-display text-white mt-1">24–72 Hours</div>
            <div className="text-xs text-cyan-400 mt-0.5">Day-ahead utility scheduling</div>
          </div>

          <div className="p-4 rounded-2xl bg-dark-900/70 border border-slate-800/80 backdrop-blur-md">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Decision Architecture</div>
            <div className="text-2xl font-black font-display text-white mt-1">3 Pillars</div>
            <div className="text-xs text-emerald-400 mt-0.5">Forecast → Flag → Recommend</div>
          </div>

          <div className="p-4 rounded-2xl bg-dark-900/70 border border-slate-800/80 backdrop-blur-md">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Non-Technical Setup</div>
            <div className="text-2xl font-black font-display text-white mt-1">~10 Seconds</div>
            <div className="text-xs text-amber-400 mt-0.5">3 required fields + auto-defaults</div>
          </div>

          <div className="p-4 rounded-2xl bg-dark-900/70 border border-slate-800/80 backdrop-blur-md">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">MLOps Resilience</div>
            <div className="text-2xl font-black font-display text-white mt-1">Self-Healing</div>
            <div className="text-xs text-cyan-400 mt-0.5">Drift-triggered retraining loop</div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="mt-12 flex flex-col items-center justify-center text-slate-500 hover:text-slate-300 transition-colors">
          <span className="text-xs font-mono uppercase tracking-widest mb-1.5">Explore Problem & Architecture</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
