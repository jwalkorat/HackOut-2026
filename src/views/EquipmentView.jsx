import React, { useState, useEffect } from 'react';
import { Search, Check, Lock, Unlock, ShieldCheck, RefreshCw, Pencil, RotateCcw } from 'lucide-react';
import { solarPanelsCatalog, windTurbinesCatalog } from '../data/equipmentDatabase';
import { Glass } from '../components/ui/Glass';
import OrbCanvas from '../components/world/OrbCanvas';

export default function EquipmentView() {
  const [category, setCategory] = useState('solar');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSolarId, setSelectedSolarId] = useState('generic-solar');
  const [selectedWindId, setSelectedWindId] = useState('generic-wind');
  const [overrideEnabled, setOverrideEnabled] = useState(false);

  // Override fields — solar
  const [overrideSolarEfficiency, setOverrideSolarEfficiency] = useState('');
  const [overrideSolarTempCoeff, setOverrideSolarTempCoeff] = useState('');
  const [overrideSolarWattage, setOverrideSolarWattage] = useState('');

  // Override fields — wind
  const [overrideWindHubHeight, setOverrideWindHubHeight] = useState('');
  const [overrideWindCutIn, setOverrideWindCutIn] = useState('');
  const [overrideWindCutOut, setOverrideWindCutOut] = useState('');

  const catalog = category === 'solar' ? solarPanelsCatalog : windTurbinesCatalog;
  const filtered = catalog.filter(
    (i) =>
      i.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.model.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const current =
    category === 'solar'
      ? solarPanelsCatalog.find((p) => p.id === selectedSolarId) || solarPanelsCatalog[0]
      : windTurbinesCatalog.find((t) => t.id === selectedWindId) || windTurbinesCatalog[0];

  // Sync override fields when selected equipment changes or override toggled on
  useEffect(() => {
    if (category === 'solar') {
      setOverrideSolarEfficiency(String(current.efficiencyPct));
      setOverrideSolarTempCoeff(String(current.tempCoefficient));
      setOverrideSolarWattage(String(current.ratedWattage));
    } else {
      setOverrideWindHubHeight(String(current.hubHeightM));
      setOverrideWindCutIn(String(current.cutInSpeedMs));
      setOverrideWindCutOut(String(current.cutOutSpeedMs));
    }
    // Reset override when switching category
    setOverrideEnabled(false);
  }, [selectedSolarId, selectedWindId, category]);

  const handleResetOverride = () => {
    if (category === 'solar') {
      setOverrideSolarEfficiency(String(current.efficiencyPct));
      setOverrideSolarTempCoeff(String(current.tempCoefficient));
      setOverrideSolarWattage(String(current.ratedWattage));
    } else {
      setOverrideWindHubHeight(String(current.hubHeightM));
      setOverrideWindCutIn(String(current.cutInSpeedMs));
      setOverrideWindCutOut(String(current.cutOutSpeedMs));
    }
  };

  return (
    <div className="space-y-4">
      <Glass className="p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display font-extrabold text-lg text-slate-900">Equipment registry</h3>
          <p className="text-xs font-mono text-slate-500">IEC curves with generic fallbacks — advanced users may override any certified value</p>
        </div>
        <div className="flex p-1 rounded-2xl bg-white/60 border border-sky-200/80">
          <button
            type="button"
            onClick={() => { setCategory('solar'); setSearchQuery(''); }}
            className={`min-h-11 px-4 rounded-xl text-xs font-bold transition-colors ${category === 'solar' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Solar PV
          </button>
          <button
            type="button"
            onClick={() => { setCategory('wind'); setSearchQuery(''); }}
            className={`min-h-11 px-4 rounded-xl text-xs font-bold transition-colors ${category === 'wind' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Wind turbines
          </button>
        </div>
      </Glass>

      <div className="grid lg:grid-cols-12 gap-4">
        {/* Left: Catalog list */}
        <Glass className="lg:col-span-6 p-5">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search LONGi, Vestas, Canadian Solar…"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/80 border border-sky-200/80 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white transition-colors"
            />
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
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        {on && <Check className="w-4 h-4 text-sky-600 shrink-0" />}
                        {item.brand}
                      </div>
                      <div className="text-xs font-mono text-slate-500">{item.model}</div>
                    </div>
                    {item.isDefault && (
                      <span className="text-[10px] font-mono text-amber-800 bg-amber-100/80 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                        Generic / Don't Know
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-3 text-xs font-mono text-slate-500 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-600" />
            "Generic / Don't know" fallback always available — prevents operator drop-off
          </div>
        </Glass>

        {/* Right: Specs + Override Panel */}
        <Glass className="lg:col-span-6 p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-sky-100/60 ring-1 ring-sky-300/60 shrink-0 p-1 flex items-center justify-center">
                <OrbCanvas kind={category === 'solar' ? 'sun' : 'turbine'} accent={category === 'solar' ? 0xf59e0b : 0x0284c7} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase text-sky-700 font-bold">
                  {overrideEnabled ? '⚠ Manual Override Active' : 'Certified specs'}
                </div>
                <h3 className="font-display font-extrabold text-xl truncate text-slate-900">{current.brand}</h3>
                <div className="text-xs font-mono text-slate-500 truncate">{current.model}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {overrideEnabled && (
                <button
                  type="button"
                  onClick={handleResetOverride}
                  title="Reset to preset values"
                  className="min-h-10 px-3 rounded-xl text-xs font-mono border border-sky-200/80 bg-white/80 hover:bg-sky-50 text-slate-700 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={() => setOverrideEnabled((v) => !v)}
                className={`min-h-10 px-3 rounded-xl text-xs font-mono border transition-all shadow-sm flex items-center gap-1.5 ${
                  overrideEnabled
                    ? 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                    : 'border-sky-200/80 bg-white/80 hover:bg-white text-slate-800'
                }`}
              >
                {overrideEnabled ? (
                  <Unlock className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                )}
                {overrideEnabled ? 'Override ON' : 'Locked'}
              </button>
            </div>
          </div>

          {/* Override hint banner */}
          {overrideEnabled && (
            <div className="mb-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-mono text-amber-800 flex items-center gap-2 animate-fade-in">
              <Pencil className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              Advanced override: editing values will override preset specs for this session's forecast.
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mt-2">
            {category === 'solar' ? (
              <>
                <SpecField
                  k="Module rating (Wp)"
                  v={`${current.ratedWattage} Wp`}
                  editable={overrideEnabled}
                  inputValue={overrideSolarWattage}
                  onChange={setOverrideSolarWattage}
                  unit="Wp"
                  inputType="number"
                />
                <SpecField
                  k="Efficiency (%)"
                  v={`${current.efficiencyPct}%`}
                  editable={overrideEnabled}
                  inputValue={overrideSolarEfficiency}
                  onChange={setOverrideSolarEfficiency}
                  unit="%"
                  inputType="number"
                  step="0.1"
                />
                <SpecField
                  k="Temp coeff (% / °C)"
                  v={`${current.tempCoefficient}% / °C`}
                  editable={overrideEnabled}
                  inputValue={overrideSolarTempCoeff}
                  onChange={setOverrideSolarTempCoeff}
                  unit="% / °C"
                  inputType="number"
                  step="0.01"
                />
                <SpecField
                  k="Degradation"
                  v={`${current.degradationPerYear}% / yr`}
                  editable={false}
                />
              </>
            ) : (
              <>
                <SpecField
                  k="Nameplate (MW)"
                  v={`${current.ratedCapacityMW} MW`}
                  editable={false}
                />
                <SpecField
                  k="Rotor diameter"
                  v={`Ø ${current.rotorDiameterM}m`}
                  editable={false}
                />
                <SpecField
                  k="Hub height (m)"
                  v={`${current.hubHeightM} m`}
                  editable={overrideEnabled}
                  inputValue={overrideWindHubHeight}
                  onChange={setOverrideWindHubHeight}
                  unit="m"
                  inputType="number"
                />
                <SpecField
                  k="Cut-in speed (m/s)"
                  v={`${current.cutInSpeedMs} m/s`}
                  editable={overrideEnabled}
                  inputValue={overrideWindCutIn}
                  onChange={setOverrideWindCutIn}
                  unit="m/s"
                  inputType="number"
                  step="0.1"
                />
                <SpecField
                  k="Cut-out speed (m/s)"
                  v={`${current.cutOutSpeedMs} m/s`}
                  editable={overrideEnabled}
                  inputValue={overrideWindCutOut}
                  onChange={setOverrideWindCutOut}
                  unit="m/s"
                  inputType="number"
                  step="0.1"
                />
                <SpecField
                  k="Power coeff (Cp)"
                  v={`${current.powerCoefficientCp}`}
                  editable={false}
                />
              </>
            )}
          </div>

          <p className="text-xs text-slate-600 mt-4 leading-relaxed">{current.description}</p>
          <div className="mt-3 text-[11px] font-mono font-bold flex items-center gap-1.5">
            {overrideEnabled ? (
              <span className="text-amber-700 flex items-center gap-1.5">
                <Pencil className="w-3.5 h-3.5 text-amber-600" />
                Manual override active — certified values replaced for this session
              </span>
            ) : (
              <span className="text-emerald-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                IEC certified curves synced
              </span>
            )}
          </div>
        </Glass>
      </div>
    </div>
  );
}

function SpecField({ k, v, editable, inputValue, onChange, unit, inputType = 'text', step }) {
  return (
    <div className={`glass-chip rounded-xl p-3 transition-all ${editable ? 'ring-1 ring-amber-300/80 bg-amber-50/40' : ''}`}>
      <div className="text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">{k}</div>
      {editable ? (
        <input
          type={inputType}
          step={step}
          value={inputValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-sm font-bold font-mono text-amber-900 bg-amber-50/80 border border-amber-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-400"
        />
      ) : (
        <div className="text-sm font-bold tabular mt-0.5 text-slate-900">{v}</div>
      )}
    </div>
  );
}
