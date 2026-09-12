import React, { useState } from 'react';
import { Search, Check, Lock, Unlock, ShieldCheck, RefreshCw } from 'lucide-react';
import { solarPanelsCatalog, windTurbinesCatalog } from '../data/equipmentDatabase';
import { Glass } from '../components/ui/Glass';
import OrbCanvas from '../components/world/OrbCanvas';

export default function EquipmentView() {
  const [category, setCategory] = useState('solar');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSolarId, setSelectedSolarId] = useState('generic-solar');
  const [selectedWindId, setSelectedWindId] = useState('generic-wind');
  const [overrideEnabled, setOverrideEnabled] = useState(false);
  const catalog = category === 'solar' ? solarPanelsCatalog : windTurbinesCatalog;
  const filtered = catalog.filter((i) => i.brand.toLowerCase().includes(searchQuery.toLowerCase()) || i.model.toLowerCase().includes(searchQuery.toLowerCase()));
  const current = category === 'solar'
    ? solarPanelsCatalog.find((p) => p.id === selectedSolarId) || solarPanelsCatalog[0]
    : windTurbinesCatalog.find((t) => t.id === selectedWindId) || windTurbinesCatalog[0];

  return (
    <div className="space-y-4">
      <Glass className="p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display font-extrabold text-lg text-slate-900">Equipment registry</h3>
          <p className="text-xs font-mono text-slate-500">IEC curves with generic fallbacks</p>
        </div>
        <div className="flex p-1 rounded-2xl bg-white/60 border border-sky-200/80">
          <button type="button" onClick={() => { setCategory('solar'); setSearchQuery(''); }} className={`min-h-11 px-4 rounded-xl text-xs font-bold transition-colors ${category === 'solar' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Solar PV</button>
          <button type="button" onClick={() => { setCategory('wind'); setSearchQuery(''); }} className={`min-h-11 px-4 rounded-xl text-xs font-bold transition-colors ${category === 'wind' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Wind turbines</button>
        </div>
      </Glass>

      <div className="grid lg:grid-cols-12 gap-4">
        <Glass className="lg:col-span-6 p-5">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search LONGi, Vestas…" className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/80 border border-sky-200/80 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white transition-colors" />
          </div>
          <div className="space-y-2 max-h-[380px] overflow-auto pr-1">
            {filtered.map((item) => {
              const on = category === 'solar' ? selectedSolarId === item.id : selectedWindId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => (category === 'solar' ? setSelectedSolarId(item.id) : setSelectedWindId(item.id))}
                  className={`w-full text-left p-3 rounded-2xl border transition-colors ${on ? 'bg-sky-100/90 border-sky-300 shadow-sm' : 'border-sky-100/80 hover:bg-white/70'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-2">{on && <Check className="w-4 h-4 text-sky-600 shrink-0" />}{item.brand}</div>
                      <div className="text-xs font-mono text-slate-500">{item.model}</div>
                    </div>
                    {item.isDefault && <span className="text-[10px] font-mono text-amber-800 bg-amber-100/80 border border-amber-300 px-2 py-0.5 rounded-full font-bold">Generic</span>}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-3 text-xs font-mono text-slate-500 flex items-center gap-2"><RefreshCw className="w-4 h-4 text-amber-600" /> Generic fallback always available</div>
        </Glass>

        <Glass className="lg:col-span-6 p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-sky-100/60 ring-1 ring-sky-300/60 shrink-0 p-1 flex items-center justify-center">
                <OrbCanvas kind={category === 'solar' ? 'sun' : 'turbine'} accent={category === 'solar' ? 0xf59e0b : 0x0284c7} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase text-sky-700 font-bold">Certified specs</div>
                <h3 className="font-display font-extrabold text-xl truncate text-slate-900">{current.brand}</h3>
                <div className="text-xs font-mono text-slate-500 truncate">{current.model}</div>
              </div>
            </div>
            <button type="button" onClick={() => setOverrideEnabled((v) => !v)} className="min-h-10 px-3 rounded-xl text-xs font-mono border border-sky-200/80 bg-white/80 hover:bg-white text-slate-800 font-medium transition-colors shrink-0 shadow-sm">
              {overrideEnabled ? <Unlock className="w-3.5 h-3.5 inline mr-1 text-sky-600" /> : <Lock className="w-3.5 h-3.5 inline mr-1 text-slate-500" />}
              {overrideEnabled ? 'Override ON' : 'Locked'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {category === 'solar' ? (
              <>
                <Spec k="Module rating" v={`${current.ratedWattage} Wp`} />
                <Spec k="Efficiency" v={`${current.efficiencyPct}%`} />
                <Spec k="Temp coeff" v={`${current.tempCoefficient}% / °C`} />
                <Spec k="Degradation" v={`${current.degradationPerYear}% / yr`} />
              </>
            ) : (
              <>
                <Spec k="Nameplate" v={`${current.ratedCapacityMW} MW`} />
                <Spec k="Rotor" v={`Ø ${current.rotorDiameterM}m`} />
                <Spec k="Cut-in / out" v={`${current.cutInSpeedMs} / ${current.cutOutSpeedMs} m/s`} />
                <Spec k="Cp" v={`${current.powerCoefficientCp}`} />
              </>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-4 leading-relaxed">{current.description}</p>
          <div className="mt-3 text-[11px] font-mono text-emerald-700 font-bold flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> IEC certified curves synced</div>
        </Glass>
      </div>
    </div>
  );
}

function Spec({ k, v }) {
  return (
    <div className="glass-chip rounded-xl p-3">
      <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">{k}</div>
      <div className="text-sm font-bold tabular mt-1 text-slate-900">{v}</div>
    </div>
  );
}
