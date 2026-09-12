import React from 'react';
import { MapPin, Sun, Wind, Zap, Leaf, DollarSign, ArrowRight } from 'lucide-react';
import OrbCanvas from '../components/world/OrbCanvas';
import { Glass, LiveDot } from '../components/ui/Glass';

const numberFromLabel = (value) => {
  const match = String(value || '').replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

const formatEnergy = (value) => `${Math.round(value * 10) / 10} MWh`;
const formatSignedEnergy = (value) => `${value >= 0 ? '+' : ''}${Math.round(value * 10) / 10} MWh`;

export default function OverviewView({ currentSite, forecastData = [], energyMode, onModeChange, onSwitchTab }) {
  const today = forecastData.slice(0, 24);
  const solarMwh = today.reduce((sum, row) => sum + row.solarGen, 0);
  const windMwh = today.reduce((sum, row) => sum + row.windGen, 0);
  const activeMwh = today.reduce((sum, row) => sum + row.totalGen, 0);
  const demandMwh = today.reduce((sum, row) => sum + row.demand, 0);
  const storedMwh = numberFromLabel(currentSite.storageCapacity) * (currentSite.storageSOC / 100);
  const co2Avoided = activeMwh * 0.49;
  const revenue = activeMwh * 126;
  const sourceTitle = energyMode === 'hybrid' ? 'Hybrid Co-Generation' : energyMode === 'wind' ? 'Wind Generation' : 'Solar Generation';
  const sourceDescription = energyMode === 'hybrid'
    ? 'Wind flow and sun rays are both active. The console combines wind output, solar output, and battery state into one dispatch-ready total.'
    : energyMode === 'wind'
      ? 'Only wind flow is active. Solar rays and PV contribution are muted so the cards show turbine-side production and wind conditions.'
      : 'Only sun rays are active. Wind flow and turbine contribution are muted so the cards show PV-side production and solar conditions.';
  const modeTags = energyMode === 'hybrid'
    ? ['Solar + Wind Active', 'Combined Dispatch', 'Battery Buffer Online', 'Total Stored Power']
    : energyMode === 'wind'
      ? ['Wind Flow Active', 'Turbine Output Only', 'Anemometer Driven', 'Rotor Dispatch']
      : ['Solar Rays Active', 'PV Output Only', 'Irradiance Driven', 'Inverter Dispatch'];

  const kpis = [
    energyMode === 'hybrid'
      ? { label: 'Total Generation Today', value: formatEnergy(activeMwh), hint: `Solar ${formatEnergy(solarMwh)} • Wind ${formatEnergy(windMwh)}`, extra: formatSignedEnergy(activeMwh - demandMwh), kind: 'core', accent: 0x22c55e }
      : energyMode === 'wind'
        ? { label: 'Wind Power Today', value: formatEnergy(activeMwh), hint: `${currentSite.windSpeed} at 100m`, extra: `${currentSite.metrics.activeTurbines || 'Turbines active'}`, kind: 'turbine', accent: 0x22c55e }
        : { label: 'Solar Power Today', value: formatEnergy(activeMwh), hint: `${currentSite.irradiance} irradiance`, extra: `${currentSite.metrics.activePanels || 'PV array active'}`, kind: 'sun', accent: 0xa3e635 },
    energyMode === 'hybrid'
      ? { label: 'Total Power Stored', value: formatEnergy(storedMwh), hint: `${currentSite.storageSOC}% battery SOC`, extra: currentSite.storageCapacity, kind: 'battery', accent: 0xa3e635 }
      : energyMode === 'wind'
        ? { label: 'Wind Conditions', value: currentSite.windSpeed, hint: 'Rotor inflow velocity', extra: 'Solar contribution hidden', kind: 'core', accent: 0x65a30d }
        : { label: 'Solar Conditions', value: currentSite.irradiance, hint: `${currentSite.cloudCover} cloud cover`, extra: 'Wind contribution hidden', kind: 'core', accent: 0xfacc15 },
    { label: 'CO₂ Avoided Today', value: `${co2Avoided.toFixed(1)} Tons`, hint: 'Mode-filtered generation', extra: currentSite.weatherCondition, kind: 'sun', accent: 0x4ade80 },
    { label: 'Projected Settlement', value: `$${Math.round(revenue).toLocaleString()}`, hint: 'Based on selected mix', extra: sourceTitle, kind: energyMode === 'solar' ? 'sun' : 'turbine', accent: 0x65a30d },
  ];

  const detailRows = energyMode === 'hybrid'
    ? [
      { label: 'Solar today', value: formatEnergy(solarMwh), Icon: Sun, tone: 'text-lime-700' },
      { label: 'Wind today', value: formatEnergy(windMwh), Icon: Wind, tone: 'text-emerald-600' },
      { label: 'Total stored', value: formatEnergy(storedMwh), Icon: Zap, tone: 'text-emerald-300' },
      { label: 'Net balance', value: formatSignedEnergy(activeMwh - demandMwh), Icon: DollarSign, tone: 'text-amber-200' },
      { label: 'Irradiance', value: currentSite.irradiance, Icon: Sun, tone: 'text-amber-300' },
      { label: 'Wind 100m', value: currentSite.windSpeed, Icon: Wind, tone: 'text-emerald-600' },
    ]
    : energyMode === 'wind'
      ? [
        { label: 'Wind today', value: formatEnergy(activeMwh), Icon: Wind, tone: 'text-emerald-600' },
        { label: 'Wind 100m', value: currentSite.windSpeed, Icon: Wind, tone: 'text-emerald-600' },
        { label: 'Fleet', value: currentSite.metrics.activeTurbines || 'Wind fleet active', Icon: Zap, tone: 'text-lime-700' },
        { label: 'Runtime', value: currentSite.metrics.operationalHours, Icon: Leaf, tone: 'text-emerald-300' },
        { label: 'Stored buffer', value: formatEnergy(storedMwh), Icon: DollarSign, tone: 'text-amber-200' },
        { label: 'Coordinates', value: currentSite.coordinates, Icon: MapPin, tone: 'text-rose-300' },
      ]
      : [
        { label: 'Solar today', value: formatEnergy(activeMwh), Icon: Sun, tone: 'text-lime-700' },
        { label: 'Irradiance', value: currentSite.irradiance, Icon: Sun, tone: 'text-amber-300' },
        { label: 'Cloud cover', value: currentSite.cloudCover, Icon: Zap, tone: 'text-lime-700' },
        { label: 'Array', value: currentSite.metrics.activePanels || 'PV array active', Icon: Leaf, tone: 'text-emerald-300' },
        { label: 'Stored buffer', value: formatEnergy(storedMwh), Icon: DollarSign, tone: 'text-amber-200' },
        { label: 'Coordinates', value: currentSite.coordinates, Icon: MapPin, tone: 'text-rose-300' },
      ];

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 lg:col-span-3 space-y-4 pointer-events-auto">
        <Glass className="p-5">
          <div className="flex items-center gap-2 text-[11px] font-mono text-sky-700 font-bold uppercase tracking-[0.18em]">
            <LiveDot /> Digital twin
          </div>
          <h2 className="font-display font-extrabold text-2xl mt-2 leading-tight text-slate-900">{sourceTitle}</h2>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-600 font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            {currentSite.location}
          </div>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">{sourceDescription}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {modeTags.map((tag) => (
              <span key={tag} className="glass-chip px-2.5 py-1 rounded-full text-[10px] font-mono text-sky-800 font-medium">{tag}</span>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="glass-chip rounded-xl p-2.5"><div className="text-slate-500">Mode output</div><div className="text-slate-900 font-bold">{formatEnergy(activeMwh)}</div></div>
            <div className="glass-chip rounded-xl p-2.5"><div className="text-slate-500">Demand</div><div className="text-emerald-700 font-bold">{formatEnergy(demandMwh)}</div></div>
            <div className="glass-chip rounded-xl p-2.5"><div className="text-slate-500">Storage</div><div className="text-sky-700 font-bold">{formatEnergy(storedMwh)}</div></div>
            <div className="glass-chip rounded-xl p-2.5"><div className="text-slate-500">Runtime</div><div className="text-amber-700 font-bold">{currentSite.metrics.operationalHours}</div></div>
          </div>
        </Glass>

        <Glass className="p-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold mb-2">Twin energy mix</div>
          <div className="flex gap-1">
            {[
              { id: 'hybrid', label: 'Hybrid', icon: Zap },
              { id: 'wind', label: 'Wind', icon: Wind },
              { id: 'solar', label: 'Solar', icon: Sun },
            ].map((m) => {
              const Icon = m.icon;
              const on = energyMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onModeChange(m.id)}
                  className={`flex-1 min-h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${on ? 'bg-sky-500 text-white shadow-sm' : 'bg-white/60 text-slate-600 hover:bg-white/80'}`}
                >
                  <Icon className="w-3.5 h-3.5" /> {m.label}
                </button>
              );
            })}
          </div>
        </Glass>
      </div>

      <div className="col-span-12 lg:col-span-6 min-h-[42vh] flex items-end justify-center pointer-events-none">
        <div className="pointer-events-none text-center mb-6 animate-float">
          <div className="text-[11px] font-mono tracking-[0.35em] uppercase text-sky-900 font-bold drop-shadow-sm">{sourceTitle}</div>
          <div className="text-slate-700 font-medium text-sm mt-1 drop-shadow-sm">
            {energyMode === 'hybrid' ? 'Wind flow + solar rays active' : energyMode === 'wind' ? 'Wind flow active' : 'Solar rays active'}
          </div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-3 space-y-3 pointer-events-auto">
        {kpis.map((k, i) => (
          <Glass key={k.label} className="p-3 flex items-center gap-3" style={{ animationDelay: `${i * 70}ms` }}>
            <div className="w-16 h-16 shrink-0 rounded-2xl overflow-hidden bg-sky-950/10 ring-1 ring-sky-200/50">
              <OrbCanvas kind={k.kind} accent={k.accent} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">{k.label}</div>
              <div className="text-xl font-extrabold tabular leading-tight text-slate-900">{k.value}</div>
              <div className="text-[11px] text-slate-500 truncate">{k.hint}</div>
              <div className="text-[11px] text-sky-700 font-bold">{k.extra}</div>
            </div>
          </Glass>
        ))}
        <button
          type="button"
          onClick={() => onSwitchTab('actions')}
          className="w-full min-h-11 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 hover:opacity-95 transition-opacity"
        >
          Open dispatch bay <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="col-span-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 pointer-events-auto">
        {detailRows.map((row) => (
          <div key={row.label} className="glass-chip rounded-2xl px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 font-semibold uppercase">
              <row.Icon className={`w-3.5 h-3.5 ${row.tone}`} />
              {row.label}
            </div>
            <div className="text-sm font-bold tabular mt-1 text-slate-900">{row.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
