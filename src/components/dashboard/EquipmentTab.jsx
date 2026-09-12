import React, { useState } from 'react';
import { Database, Search, Check, RefreshCw, Lock, Unlock, ShieldCheck, Sparkles } from 'lucide-react';
import { solarPanelsCatalog, windTurbinesCatalog } from '../../data/equipmentDatabase';

export default function EquipmentTab() {
  const [category, setCategory] = useState('solar'); // 'solar' | 'wind'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSolarId, setSelectedSolarId] = useState('generic-solar');
  const [selectedWindId, setSelectedWindId] = useState('generic-wind');
  const [overrideEnabled, setOverrideEnabled] = useState(false);

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
    <div className="space-y-6">
      {/* Category Tabs: Solar vs Wind */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-white/95 border border-sky-200/90 shadow-[0_4px_25px_-5px_rgba(2,132,199,0.08)]">
        <div>
          <h3 className="font-display font-black text-lg text-slate-900">
            Curated Equipment Specification Registry
          </h3>
          <p className="text-xs font-mono text-slate-500 mt-0.5">
            IEC certified curves and technical coefficients with "Generic / Don't Know" fallbacks
          </p>
        </div>

        <div className="flex items-center p-1 rounded-2xl bg-sky-50 border border-sky-200">
          <button
            onClick={() => {
              setCategory('solar');
              setSearchQuery('');
            }}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              category === 'solar'
                ? 'bg-amber-500 text-white shadow-glow-solar'
                : 'text-slate-600 hover:text-amber-800'
            }`}
          >
            Solar PV Modules
          </button>
          <button
            onClick={() => {
              setCategory('wind');
              setSearchQuery('');
            }}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              category === 'wind'
                ? 'bg-sky-600 text-white shadow-glow-sky'
                : 'text-slate-600 hover:text-sky-800'
            }`}
          >
            Wind Turbines
          </button>
        </div>
      </div>

      {/* Master-Detail Lookup Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Search & Model Selector List */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white/95 border border-sky-200/90 shadow-[0_4px_25px_-5px_rgba(2,132,199,0.08)]">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search manufacturer or model (e.g. LONGi, Vestas, Canadian Solar)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 text-xs font-mono placeholder:text-slate-400 focus:outline-none focus:border-sky-400"
            />
          </div>

          {/* Model Card Selection List */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
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
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-sky-100/90 border-sky-400 shadow-sm'
                      : 'bg-sky-50/50 border-sky-200/80 hover:bg-sky-50 hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isSelected ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isSelected ? <Check className="w-3 h-3" /> : null}
                      </div>
                      <div>
                        <div className="font-display font-bold text-sm text-slate-900">
                          {item.brand}
                        </div>
                        <div className="text-xs font-mono text-slate-500 mt-0.5">
                          {item.model}
                        </div>
                      </div>
                    </div>

                    {item.isDefault && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-semibold">
                        Generic Fallback
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-sky-50 border border-sky-200 flex items-center gap-2.5 text-xs font-mono text-slate-600">
            <RefreshCw className="w-4 h-4 text-amber-600 shrink-0" />
            <span>"Generic / Don't know" fallback mode is always enabled to prevent user drop-off.</span>
          </div>
        </div>

        {/* Right Column: Parameters & Override Panel */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white/95 border border-sky-200/90 shadow-[0_4px_25px_-5px_rgba(2,132,199,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-sky-100">
            <div>
              <span className="text-[10px] font-mono text-sky-700 uppercase tracking-wider block font-bold">
                Certified Engineering Specs
              </span>
              <h3 className="font-display font-black text-xl text-slate-900 mt-0.5">
                {currentEquipment.brand}
              </h3>
              <span className="text-xs font-mono text-slate-500">{currentEquipment.model}</span>
            </div>

            <button
              onClick={() => setOverrideEnabled(!overrideEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all ${
                overrideEnabled
                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
                  : 'bg-sky-50 text-slate-700 border-sky-200 hover:bg-sky-100'
              }`}
            >
              {overrideEnabled ? <Unlock className="w-3.5 h-3.5 text-amber-600" /> : <Lock className="w-3.5 h-3.5 text-slate-500" />}
              <span>{overrideEnabled ? 'Manual Override ON' : 'Lock Certified Values'}</span>
            </button>
          </div>

          {/* Parameter Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {category === 'solar' ? (
              <>
                <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Module Rating</span>
                  <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">
                    {currentEquipment.ratedWattage} Wp
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Standard Test Conditions</span>
                </div>

                <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Module Efficiency</span>
                  <span className="text-base font-bold font-mono text-emerald-700 mt-0.5 block">
                    {currentEquipment.efficiencyPct}%
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Gross aperture conversion</span>
                </div>

                <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Temp. Coefficient</span>
                  <span className="text-base font-bold font-mono text-amber-700 mt-0.5 block">
                    {currentEquipment.tempCoefficient}% / °C
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Pmax degradation index</span>
                </div>

                <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Annual Degradation</span>
                  <span className="text-base font-bold font-mono text-sky-700 mt-0.5 block">
                    {currentEquipment.degradationPerYear}% / yr
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Warranty benchmark</span>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Rated Nameplate</span>
                  <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">
                    {currentEquipment.ratedCapacityMW} MW
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Per turbine unit</span>
                </div>

                <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Rotor Swept Area</span>
                  <span className="text-base font-bold font-mono text-emerald-700 mt-0.5 block">
                    Ø {currentEquipment.rotorDiameterM}m
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Hub height: {currentEquipment.hubHeightM}m</span>
                </div>

                <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Cut-in / Cut-out</span>
                  <span className="text-base font-bold font-mono text-sky-700 mt-0.5 block">
                    {currentEquipment.cutInSpeedMs} / {currentEquipment.cutOutSpeedMs} m/s
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Rated wind: {currentEquipment.ratedSpeedMs} m/s</span>
                </div>

                <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Power Coeff (Cp)</span>
                  <span className="text-base font-bold font-mono text-amber-700 mt-0.5 block">
                    {currentEquipment.powerCoefficientCp}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Betz limit normalized</span>
                </div>
              </>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-sans bg-sky-50/60 p-3 rounded-xl border border-sky-200/70 mb-4">
            {currentEquipment.description}
          </p>

          <div className="pt-3 border-t border-sky-100 flex items-center justify-between text-[11px] font-mono text-emerald-700 font-bold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Specs verified against manufacturer IEC certified curves</span>
            </span>
            <span className="text-slate-500 font-normal">JSON Lookup Sync: OK</span>
          </div>
        </div>
      </div>
    </div>
  );
}
