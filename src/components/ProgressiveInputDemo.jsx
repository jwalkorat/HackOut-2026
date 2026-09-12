import React, { useState } from 'react';
import { Sliders, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Sparkles, Zap, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { solarPanelsCatalog, windTurbinesCatalog } from '../data/equipmentDatabase';

export default function ProgressiveInputDemo() {
  const [activeLayer, setActiveLayer] = useState(1); // 1 = 10s setup, 2 = expert mode
  
  // Layer 1 form state
  const [location, setLocation] = useState('Bakersfield, Kern County, California');
  const [energyType, setEnergyType] = useState('hybrid');
  const [installedCapacity, setInstalledCapacity] = useState('150');
  const [demandPower, setDemandPower] = useState('110');

  // Layer 2 optional fields state
  const [selectedPanel, setSelectedPanel] = useState('generic-solar');
  const [selectedTurbine, setSelectedTurbine] = useState('generic-wind');
  const [tiltAngle, setTiltAngle] = useState('28');
  const [hubHeight, setHubHeight] = useState('120');
  const [batteryCapacity, setBatteryCapacity] = useState('45');
  const [batterySOC, setBatterySOC] = useState('80');
  const [backupCapacity, setBackupCapacity] = useState('20');

  // Calculate live confidence score
  let accuracyScore = 82.0; // Base Layer 1
  if (activeLayer === 2) {
    if (selectedPanel !== 'generic-solar') accuracyScore += 4.5;
    if (selectedTurbine !== 'generic-wind') accuracyScore += 4.2;
    if (tiltAngle && tiltAngle !== '25') accuracyScore += 2.1;
    if (hubHeight && hubHeight !== '100') accuracyScore += 2.0;
    if (batteryCapacity && Number(batteryCapacity) > 0) accuracyScore += 2.0;
  }
  accuracyScore = Math.min(97.8, accuracyScore);

  return (
    <section id="progressive-input" className="relative py-24 bg-dark-950/95 border-t border-slate-900 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 w-[500px] h-[300px] bg-cyan-500/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-4">
            <Sliders className="w-3.5 h-3.5" />
            <span>Layered Data Architecture (Section 3.1)</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
            Progressive Input: <br />
            <span className="text-gradient-cyan">10-Second Setup to Expert Mode</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 font-sans leading-relaxed">
            Requiring 20 technical parameters upfront excludes non-experts. MegaByte solves this: 
            <strong className="text-slate-200"> 3 required fields are enough to run</strong> using sensible 
            industry fallbacks, while expert operators can unlock up to 97% accuracy with optional boosters.
          </p>
        </div>

        {/* Interactive Mode Toggle Bar */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md">
            <button
              onClick={() => setActiveLayer(1)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs sm:text-sm font-display font-bold transition-all ${
                activeLayer === 1
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-dark-950 shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Layer 1: 10-Second Setup (Required)</span>
            </button>

            <button
              onClick={() => setActiveLayer(2)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs sm:text-sm font-display font-bold transition-all ${
                activeLayer === 2
                  ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-dark-950 shadow-glow-solar'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Layer 2: Expert Mode (Accuracy Boosters)</span>
            </button>
          </div>
        </div>

        {/* Live Interactive Form Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Controls (Left 7 Cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-dark-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${activeLayer === 1 ? 'bg-cyan-400' : 'bg-amber-400'} animate-pulse`} />
                <h3 className="font-display font-bold text-lg text-white">
                  {activeLayer === 1 ? 'Layer 1 — Core Site Specification' : 'Layer 2 — Precision Parameter Boosters'}
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {activeLayer === 1 ? '3 Required Fields' : 'Optional Parameter Enrichment'}
              </span>
            </div>

            {/* Layer 1 Fields (Always visible) */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Site Location (Lat/Long or City) *</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Auto-resolves weather grid</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm font-sans focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">Energy Asset Type *</label>
                  <select
                    value={energyType}
                    onChange={(e) => setEnergyType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm font-sans focus:outline-none focus:border-cyan-400"
                  >
                    <option value="solar">Solar PV Only</option>
                    <option value="wind">Wind Farm Only</option>
                    <option value="hybrid">Co-Located Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">Installed Capacity (MW) *</label>
                  <input
                    type="number"
                    value={installedCapacity}
                    onChange={(e) => setInstalledCapacity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">Baseline Grid Demand (MW) *</label>
                  <input
                    type="number"
                    value={demandPower}
                    onChange={(e) => setDemandPower(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Layer 2 Accordion Section */}
            {activeLayer === 2 && (
              <div className="mt-6 pt-6 border-t border-slate-800 space-y-4 animate-fade-in">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Optional fields: Any omitted input automatically adopts documented industry defaults.</span>
                </div>

                {/* Equipment Presets Dropdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">Solar Module Model</label>
                    <select
                      value={selectedPanel}
                      onChange={(e) => setSelectedPanel(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm font-sans focus:outline-none focus:border-amber-400"
                    >
                      {solarPanelsCatalog.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.brand}: {p.model}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">Wind Turbine Model</label>
                    <select
                      value={selectedTurbine}
                      onChange={(e) => setSelectedTurbine(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm font-sans focus:outline-none focus:border-amber-400"
                    >
                      {windTurbinesCatalog.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.brand}: {t.model}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Physical Specifications */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">Array Tilt Angle (deg)</label>
                    <input
                      type="number"
                      value={tiltAngle}
                      onChange={(e) => setTiltAngle(e.target.value)}
                      placeholder="Default: 25°"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">Turbine Hub Height (m)</label>
                    <input
                      type="number"
                      value={hubHeight}
                      onChange={(e) => setHubHeight(e.target.value)}
                      placeholder="Default: 100m"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Storage & Backup Generator for sharper recommendations */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">BESS Capacity (MWh)</label>
                    <input
                      type="number"
                      value={batteryCapacity}
                      onChange={(e) => setBatteryCapacity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">Current SOC (%)</label>
                    <input
                      type="number"
                      value={batterySOC}
                      onChange={(e) => setBatterySOC(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">Peaker Backup (MW)</label>
                    <input
                      type="number"
                      value={backupCapacity}
                      onChange={(e) => setBackupCapacity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-sm font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Accuracy & Fallback Status Panel (Right 5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Real-time Accuracy Gauge Card */}
            <div className="p-6 rounded-3xl bg-dark-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <span className="text-xs font-display font-bold text-white uppercase tracking-wider">
                  Forecast Confidence Score
                </span>
                <span className="text-xs font-mono text-cyan-400">
                  {activeLayer === 1 ? 'Layer 1 Baseline' : 'Layer 2 Enhanced'}
                </span>
              </div>

              {/* Big Gauge Metric */}
              <div className="flex items-end justify-between my-2">
                <div>
                  <div className="text-4xl sm:text-5xl font-black font-display text-white">
                    {accuracyScore.toFixed(1)}%
                  </div>
                  <div className="text-xs font-mono text-emerald-400 mt-1">
                    {activeLayer === 1
                      ? '✓ Usable Day-Ahead Scheduling Forecast'
                      : '⚡ High-Precision Dispatch Ready'}
                  </div>
                </div>

                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <ShieldCheck className="w-7 h-7" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden my-4">
                <div
                  style={{ width: `${accuracyScore}%` }}
                  className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-500"
                />
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {activeLayer === 1
                  ? 'Even with only 3 required fields, MegaByte synthesizes satellite DNI/GHI irradiance and wind fields with industry-standard cell physics.'
                  : 'Adding specific module models, tilt angles, and battery capacities sharpens the dispatch recommendations and prevents grid penalty over-commitments.'}
              </p>
            </div>

            {/* Documented Fallback Defaults Table (Section 3.1) */}
            <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 backdrop-blur-xl">
              <h4 className="font-display font-bold text-sm text-white mb-3 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <span>Graceful Fallback Defaults Applied:</span>
              </h4>

              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="p-2 rounded-lg bg-dark-900/60 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Solar Cell Efficiency:</span>
                  <span className="text-cyan-400 font-semibold">21.0% (Tier-1 Monocrystalline)</span>
                </div>
                <div className="p-2 rounded-lg bg-dark-900/60 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Module Orientation:</span>
                  <span className="text-cyan-400 font-semibold">South-facing (180° Azimuth)</span>
                </div>
                <div className="p-2 rounded-lg bg-dark-900/60 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Turbine Power Curve:</span>
                  <span className="text-cyan-400 font-semibold">Class II/III 3.0 MW IEC Standard</span>
                </div>
                <div className="p-2 rounded-lg bg-dark-900/60 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Rotor Cut-in / Cut-out:</span>
                  <span className="text-cyan-400 font-semibold">3.0 m/s / 25.0 m/s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
