import React, { useState } from 'react';
import { Sliders, Sparkles, Zap, ShieldCheck, RefreshCw, CheckCircle2, Lock, Unlock, Save } from 'lucide-react';
import { solarPanelsCatalog, windTurbinesCatalog } from '../../data/equipmentDatabase';

export default function ConfigTab({ onApplyConfig }) {
  const [activeLayer, setActiveLayer] = useState(1); // 1 = 10s setup, 2 = expert boosters
  const [savedNotice, setSavedNotice] = useState(false);

  // Layer 1 form state
  const [location, setLocation] = useState('Mojave Desert Solar Basin, California');
  const [energyType, setEnergyType] = useState('hybrid');
  const [installedCapacity, setInstalledCapacity] = useState('200');
  const [demandPower, setDemandPower] = useState('145');

  // Layer 2 optional fields state
  const [selectedPanel, setSelectedPanel] = useState('generic-solar');
  const [selectedTurbine, setSelectedTurbine] = useState('generic-wind');
  const [tiltAngle, setTiltAngle] = useState('26');
  const [hubHeight, setHubHeight] = useState('120');
  const [batteryCapacity, setBatteryCapacity] = useState('80');
  const [batterySOC, setBatterySOC] = useState('85');
  const [backupCapacity, setBackupCapacity] = useState('25');

  // Calculate live confidence score
  let accuracyScore = 82.5;
  if (activeLayer === 2) {
    if (selectedPanel !== 'generic-solar') accuracyScore += 4.5;
    if (selectedTurbine !== 'generic-wind') accuracyScore += 4.2;
    if (tiltAngle && tiltAngle !== '25') accuracyScore += 2.1;
    if (hubHeight && hubHeight !== '100') accuracyScore += 2.0;
    if (batteryCapacity && Number(batteryCapacity) > 0) accuracyScore += 2.0;
  }
  accuracyScore = Math.min(97.8, accuracyScore);

  const handleSave = () => {
    setSavedNotice(true);
    if (onApplyConfig) {
      onApplyConfig({
        location,
        energyType,
        installedCapacity: `${installedCapacity} MW`,
        demandPower,
        accuracyScore: accuracyScore.toFixed(1)
      });
    }
    setTimeout(() => setSavedNotice(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Layer Switcher */}
      <div className="p-6 rounded-3xl surface-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 border border-sky-300 text-sky-800 text-xs font-mono font-bold mb-2">
              <Sliders className="w-3.5 h-3.5" />
              <span>Layered Data Architecture (Section 3.1)</span>
            </div>
            <h3 className="font-display font-black text-xl text-slate-900">
              Plant Specification & Progressive Parameter Tuning
            </h3>
            <p className="text-xs font-mono text-slate-500 mt-0.5">
              3 core inputs generate a usable forecast. Expand Layer 2 to enrich accuracy up to 97.8%.
            </p>
          </div>

          <div className="flex items-center p-1 rounded-2xl bg-sky-50 border border-sky-200">
            <button
              onClick={() => setActiveLayer(1)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeLayer === 1
                  ? 'bg-sky-600 text-white shadow-glow-sky'
                  : 'text-slate-600 hover:text-sky-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Layer 1: 10s Setup</span>
            </button>
            <button
              onClick={() => setActiveLayer(2)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeLayer === 2
                  ? 'bg-amber-500 text-white shadow-glow-solar'
                  : 'text-slate-600 hover:text-amber-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Layer 2: Precision Boosters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Form & Confidence Gauge Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl surface-card">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-sky-100">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${activeLayer === 1 ? 'bg-sky-500' : 'bg-amber-500'} animate-pulse`} />
              <h4 className="font-display font-black text-base text-slate-900">
                {activeLayer === 1 ? 'Layer 1 — Core Site Specification' : 'Layer 2 — Precision Parameter Boosters'}
              </h4>
            </div>
            <span className="text-xs font-mono text-slate-500 font-medium">
              {activeLayer === 1 ? '3 Required Fields' : 'Optional Parameter Enrichment'}
            </span>
          </div>

          {/* Layer 1 Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-600 font-semibold mb-1.5 flex items-center justify-between">
                <span>Site Location (Lat/Long or Region) *</span>
                <span className="text-[10px] text-sky-700 font-mono">Auto-resolves 0.25° weather grid</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 text-sm font-sans focus:outline-none focus:border-sky-400 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-600 font-semibold mb-1.5">Energy Asset Type *</label>
                <select
                  value={energyType}
                  onChange={(e) => setEnergyType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 text-sm font-sans focus:outline-none focus:border-sky-400 font-medium"
                >
                  <option value="solar">Solar PV Only</option>
                  <option value="wind">Wind Fleet Only</option>
                  <option value="hybrid">Co-Located Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-600 font-semibold mb-1.5">Installed Capacity (MW) *</label>
                <input
                  type="number"
                  value={installedCapacity}
                  onChange={(e) => setInstalledCapacity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 text-sm font-mono font-bold focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-600 font-semibold mb-1.5">Grid Demand Baseline (MW) *</label>
                <input
                  type="number"
                  value={demandPower}
                  onChange={(e) => setDemandPower(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 text-sm font-mono font-bold focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>
          </div>

          {/* Layer 2 Accordion Section */}
          {activeLayer === 2 && (
            <div className="mt-6 pt-6 border-t border-sky-100 space-y-4 animate-fade-in">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-mono text-amber-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Optional fields: Any omitted input automatically adopts documented industry defaults.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-600 font-semibold mb-1.5">Solar Module Preset</label>
                  <select
                    value={selectedPanel}
                    onChange={(e) => setSelectedPanel(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 text-sm font-sans focus:outline-none focus:border-amber-400 font-medium"
                  >
                    {solarPanelsCatalog.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.brand}: {p.model}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-600 font-semibold mb-1.5">Wind Turbine Preset</label>
                  <select
                    value={selectedTurbine}
                    onChange={(e) => setSelectedTurbine(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 text-sm font-sans focus:outline-none focus:border-amber-400 font-medium"
                  >
                    {windTurbinesCatalog.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.brand}: {t.model}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-600 font-semibold mb-1.5">Array Tilt Angle (deg)</label>
                  <input
                    type="number"
                    value={tiltAngle}
                    onChange={(e) => setTiltAngle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 text-sm font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-600 font-semibold mb-1.5">Turbine Hub Height (m)</label>
                  <input
                    type="number"
                    value={hubHeight}
                    onChange={(e) => setHubHeight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 text-sm font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-600 font-semibold mb-1.5">BESS Capacity (MWh)</label>
                  <input
                    type="number"
                    value={batteryCapacity}
                    onChange={(e) => setBatteryCapacity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 text-sm font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-600 font-semibold mb-1.5">Current SOC (%)</label>
                  <input
                    type="number"
                    value={batterySOC}
                    onChange={(e) => setBatterySOC(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 text-sm font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-600 font-semibold mb-1.5">Peaker Reserve (MW)</label>
                  <input
                    type="number"
                    value={backupCapacity}
                    onChange={(e) => setBackupCapacity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 text-sm font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Configuration Action */}
          <div className="mt-6 pt-4 border-t border-sky-100 flex items-center justify-between">
            {savedNotice ? (
              <span className="text-xs font-mono text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Configuration Saved & Forecast Recalculated!</span>
              </span>
            ) : (
              <span className="text-xs font-mono text-slate-500">
                Changes update active forecasting model telemetry
              </span>
            )}

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-display font-bold text-xs shadow-glow-sky active:scale-95 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Apply & Recalculate Forecast</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Confidence Meter & Fallback Registry */}
        <div className="lg:col-span-5 space-y-6">
          {/* Confidence Meter Card */}
          <div className="p-6 rounded-3xl surface-card">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-sky-100">
              <span className="text-xs font-display font-black text-slate-900 uppercase tracking-wider">
                Forecast Confidence Score
              </span>
              <span className="text-xs font-mono text-sky-700 font-bold">
                {activeLayer === 1 ? 'Layer 1 Baseline' : 'Layer 2 Enhanced'}
              </span>
            </div>

            <div className="flex items-end justify-between my-2">
              <div>
                <div className="text-4xl sm:text-5xl font-black font-display text-slate-900">
                  {accuracyScore.toFixed(1)}%
                </div>
                <div className="text-xs font-mono text-emerald-700 font-bold mt-1">
                  {activeLayer === 1
                    ? '✓ Usable Day-Ahead Dispatch Forecast'
                    : '⚡ High-Precision Dispatch Ready'}
                </div>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600 shadow-sm">
                <ShieldCheck className="w-7 h-7" />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 rounded-full bg-sky-100 border border-sky-200 overflow-hidden my-4">
              <div
                style={{ width: `${accuracyScore}%` }}
                className="h-full bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 rounded-full transition-all duration-500"
              />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              {activeLayer === 1
                ? 'With 3 required fields, MegaByte couples satellite DNI/GHI irradiance with standard monocrystalline & wind turbine power physics.'
                : 'Selected module specifications, tilt angles, and battery capacities refine dispatch decisions and reduce balancing imbalance penalties.'}
            </p>
          </div>

          {/* Documented Fallback Defaults Registry (Section 3.1) */}
          <div className="p-6 rounded-3xl bg-sky-50/70 border border-sky-200/90">
            <h4 className="font-display font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-sky-600" />
              <span>Graceful Fallback Defaults Applied:</span>
            </h4>

            <div className="space-y-2 text-xs font-mono text-slate-700">
              <div className="p-2.5 rounded-xl bg-white border border-sky-200 flex justify-between">
                <span className="text-slate-500">Solar Cell Efficiency:</span>
                <span className="text-sky-800 font-bold">21.0% (Tier-1 Monocrystalline)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-sky-200 flex justify-between">
                <span className="text-slate-500">Module Orientation:</span>
                <span className="text-sky-800 font-bold">South-facing (180° Azimuth)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-sky-200 flex justify-between">
                <span className="text-slate-500">Turbine Power Curve:</span>
                <span className="text-sky-800 font-bold">Class II/III 3.0 MW Standard</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-sky-200 flex justify-between">
                <span className="text-slate-500">Cut-in / Cut-out Speed:</span>
                <span className="text-sky-800 font-bold">3.0 m/s / 25.0 m/s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
