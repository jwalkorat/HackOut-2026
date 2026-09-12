import React, { useState } from 'react';
import { Database, Search, Check, RefreshCw, Edit3, Lock, Unlock, ShieldCheck, Sparkles } from 'lucide-react';
import { solarPanelsCatalog, windTurbinesCatalog } from '../data/equipmentDatabase';

export default function EquipmentLookup() {
  const [category, setCategory] = useState('solar'); // 'solar' | 'wind'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSolarId, setSelectedSolarId] = useState('generic-solar');
  const [selectedWindId, setSelectedWindId] = useState('generic-wind');
  const [overrideEnabled, setOverrideEnabled] = useState(false);

  // Active items
  const activeCatalog = category === 'solar' ? solarPanelsCatalog : windTurbinesCatalog;
  const filteredCatalog = activeCatalog.filter(
    (item) =>
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentEquipment =
    category === 'solar'
      ? solarPanelsCatalog.find((p) => p.id === selectedSolarId) || solarPanelsCatalog[0]
      : windTurbinesCatalog.find((t) => t.id === selectedWindId) || windTurbinesCatalog[0];

  return (
    <section id="equipment" className="relative py-24 bg-dark-950 border-t border-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-4">
            <Database className="w-3.5 h-3.5" />
            <span>Hybrid Model-Lookup Engine (Section 3.2)</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
            Equipment Presets: <br />
            <span className="text-gradient-cyan">Zero Technical Jargon Required</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 font-sans leading-relaxed">
            Instead of forcing users to calculate thermal loss coefficients and power curve constants, 
            operators select their brand and model from a curated lookup table. Unrecognized equipment? 
            An explicit <strong className="text-slate-200">"Generic / Don't Know" fallback</strong> ensures 
            the forecast is never blocked.
          </p>
        </div>

        {/* Category Tabs: Solar vs Wind */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 rounded-2xl bg-slate-900/90 border border-slate-800">
            <button
              onClick={() => {
                setCategory('solar');
                setSearchQuery('');
              }}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-display font-bold transition-all ${
                category === 'solar'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-dark-950 shadow-glow-solar'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Solar PV Equipment Presets
            </button>
            <button
              onClick={() => {
                setCategory('wind');
                setSearchQuery('');
              }}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-display font-bold transition-all ${
                category === 'wind'
                  ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-dark-950 shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Wind Turbine Fleet Presets
            </button>
          </div>
        </div>

        {/* Master-Detail Lookup Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Search & Model Selector List */}
          <div className="lg:col-span-6 p-6 rounded-3xl bg-dark-900/80 border border-slate-800 backdrop-blur-xl shadow-xl">
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search manufacturer or model (e.g. LONGi, Vestas, Canadian Solar)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* Model Card Selection List */}
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {filteredCatalog.map((item) => {
                const isSelected =
                  category === 'solar' ? selectedSolarId === item.id : selectedWindId === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (category === 'solar') setSelectedSolarId(item.id);
                      else setSelectedWindId(item.id);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500/50 shadow-glow-cyan'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isSelected ? 'bg-cyan-400 text-black' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isSelected ? <Check className="w-3 h-3" /> : null}
                        </div>
                        <div>
                          <div className="font-display font-bold text-sm text-white">
                            {item.brand}
                          </div>
                          <div className="text-xs font-mono text-slate-300 mt-0.5">
                            {item.model}
                          </div>
                        </div>
                      </div>

                      {item.isDefault && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          Generic Fallback
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Fallback Guarantee Callout */}
            <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5 text-xs font-mono text-slate-400">
              <RefreshCw className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                "Generic / Don't know" mode is permanently available to prevent user drop-off.
              </span>
            </div>
          </div>

          {/* Right Column: Auto-Populated Parameters & Override Panel */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-dark-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                  Curated Parameter Registry
                </span>
                <h3 className="font-display font-bold text-xl text-white mt-0.5">
                  {currentEquipment.brand}
                </h3>
                <span className="text-xs font-mono text-slate-300">{currentEquipment.model}</span>
              </div>

              {/* Advanced Manual Override Toggle */}
              <button
                onClick={() => setOverrideEnabled(!overrideEnabled)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                  overrideEnabled
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {overrideEnabled ? <Unlock className="w-3.5 h-3.5 text-amber-400" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{overrideEnabled ? 'Manual Override ON' : 'Lock Preset Values'}</span>
              </button>
            </div>

            {/* Parameter Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {category === 'solar' ? (
                <>
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Module Rating</span>
                    <span className="text-base font-bold font-mono text-white mt-0.5 block">
                      {currentEquipment.ratedWattage} Wp
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Standard Test Conditions</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Module Efficiency</span>
                    <span className="text-base font-bold font-mono text-emerald-400 mt-0.5 block">
                      {currentEquipment.efficiencyPct}%
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Gross aperture conversion</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Temp. Coefficient</span>
                    <span className="text-base font-bold font-mono text-amber-400 mt-0.5 block">
                      {currentEquipment.tempCoefficient}% / °C
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Pmax degradation index</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Annual Degradation</span>
                    <span className="text-base font-bold font-mono text-cyan-400 mt-0.5 block">
                      {currentEquipment.degradationPerYear}% / yr
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Warranty benchmark</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Rated Nameplate</span>
                    <span className="text-base font-bold font-mono text-white mt-0.5 block">
                      {currentEquipment.ratedCapacityMW} MW
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Per turbine unit</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Rotor Swept Area</span>
                    <span className="text-base font-bold font-mono text-emerald-400 mt-0.5 block">
                      Ø {currentEquipment.rotorDiameterM}m
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Hub height: {currentEquipment.hubHeightM}m</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Cut-in / Cut-out</span>
                    <span className="text-base font-bold font-mono text-cyan-400 mt-0.5 block">
                      {currentEquipment.cutInSpeedMs} / {currentEquipment.cutOutSpeedMs} m/s
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Rated wind: {currentEquipment.ratedSpeedMs} m/s</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Power Coeff (Cp)</span>
                    <span className="text-base font-bold font-mono text-amber-400 mt-0.5 block">
                      {currentEquipment.powerCoefficientCp}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Betz limit normalized</span>
                  </div>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-slate-400 leading-relaxed font-sans bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
              {currentEquipment.description}
            </p>

            {/* Status Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-emerald-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Specs verified against manufacturer IEC certified curves</span>
              </span>
              <span className="text-slate-400">JSON Lookup Sync: OK</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
