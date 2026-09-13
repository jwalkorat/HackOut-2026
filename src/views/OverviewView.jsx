import React from 'react';
import { Glass } from '../components/ui/Glass';
import OrbCanvas from '../components/world/OrbCanvas';
import {
  Sun, Wind, Zap, MapPin, DollarSign, Leaf, ArrowRight,
  ZoomIn, ZoomOut, RotateCcw, Move
} from 'lucide-react';

const formatEnergy = (mwh) => `${Math.round(mwh).toLocaleString()} MWh`;
const formatSignedEnergy = (mwh) => {
  const rounded = Math.round(mwh);
  return `${rounded >= 0 ? '+' : ''}${rounded.toLocaleString()} MWh`;
};

function LiveDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
    </span>
  );
}

export default function OverviewView({ currentSite, forecastData = [], forecastMeta = null, energyMode = 'hybrid', onModeChange = () => {}, onSwitchTab = () => {} }) {
  if (!currentSite) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-sm">
        Select or configure a plant site to load the 3D digital twin.
      </div>
    );
  }

  const solarMwh = forecastData.reduce((acc, d) => acc + (d.solarGen || 0), 0);
  const windMwh = forecastData.reduce((acc, d) => acc + (d.windGen || 0), 0);
  const demandMwh = forecastData.reduce((acc, d) => acc + (d.demand || 0), 0);
  const storedMwh = currentSite?.batteryCapacity ? currentSite.batteryCapacity * 4 : 80;

  const activeMwh = energyMode === 'solar'
    ? solarMwh
    : energyMode === 'wind'
      ? windMwh
      : solarMwh + windMwh;

  const co2Avoided = activeMwh * 0.49; // ~0.49 tCO2/MWh for clean generation
  const revenue = activeMwh * 126; // $126/MWh avg settlement

  const sourceTitle = energyMode === 'solar'
    ? `${currentSite.name} · Solar Array`
    : energyMode === 'wind'
      ? `${currentSite.name} · Wind Fleet`
      : `${currentSite.name} · Hybrid Complex`;

  const sourceDescription = energyMode === 'solar'
    ? 'Photovoltaic generation tracking irradiance and ambient thermal derating curves.'
    : energyMode === 'wind'
      ? 'Aerodynamic turbine generation coupled to real-time inflow wind speeds.'
      : currentSite.description;

  const modeTags = energyMode === 'solar'
    ? ['PV String Monitored', 'MPPT Synchronized', 'Direct Inverter Link']
    : energyMode === 'wind'
      ? ['Pitch Dynamic', 'Yaw Autonomous', 'Turbine Health 98.4%']
      : (currentSite.tags || ['Grid Synchronized', 'Dynamic Curtailment Ready', '4h BESS Storage']);

  const kpis = [
    energyMode === 'hybrid'
      ? { label: 'Combined Peak Output', value: formatEnergy(activeMwh), hint: 'Solar + Wind aggregate', extra: `${Math.round(solarMwh)} MWs · ${Math.round(windMwh)} MWw`, kind: 'core', accent: 0x0284c7 }
      : energyMode === 'wind'
        ? { label: 'Fleet Output', value: formatEnergy(windMwh), hint: currentSite.metrics?.activeTurbines || 'Turbines online', extra: 'Peak wind window', kind: 'turbine', accent: 0x38bdf8 }
        : { label: 'Solar Conditions', value: currentSite.irradiance || '920 W/m²', hint: `${currentSite.cloudCover || '4%'} cloud cover`, extra: 'PV Array active', kind: 'sun', accent: 0xfacc15 },
    { label: 'CO₂ Avoided Today', value: `${co2Avoided.toFixed(1)} Tons`, hint: 'Clean generation offset', extra: currentSite.weatherCondition || 'Optimal', kind: 'sun', accent: 0x4ade80 },
    { label: 'Projected Settlement', value: `$${Math.round(revenue).toLocaleString()}`, hint: '$126/MWh avg rate', extra: formatSignedEnergy(activeMwh - demandMwh) + ' net', kind: energyMode === 'solar' ? 'sun' : 'turbine', accent: 0x65a30d },
  ];

  const detailRows = energyMode === 'hybrid'
    ? [
      { label: 'Solar today', value: formatEnergy(solarMwh), Icon: Sun, tone: 'text-lime-700' },
      { label: 'Wind today', value: formatEnergy(windMwh), Icon: Wind, tone: 'text-emerald-600' },
      { label: 'Total stored', value: formatEnergy(storedMwh), Icon: Zap, tone: 'text-emerald-500' },
      { label: 'Net balance', value: formatSignedEnergy(activeMwh - demandMwh), Icon: DollarSign, tone: 'text-amber-600' },
      { label: 'Irradiance', value: currentSite.irradiance || '920 W/m²', Icon: Sun, tone: 'text-amber-500' },
      { label: 'Wind 100m', value: currentSite.windSpeed || '8.6 m/s', Icon: Wind, tone: 'text-emerald-600' },
    ]
    : energyMode === 'wind'
      ? [
        { label: 'Wind today', value: formatEnergy(activeMwh), Icon: Wind, tone: 'text-emerald-600' },
        { label: 'Wind 100m', value: currentSite.windSpeed || '12.4 m/s', Icon: Wind, tone: 'text-emerald-600' },
        { label: 'Fleet', value: currentSite.metrics?.activeTurbines || 'Wind fleet active', Icon: Zap, tone: 'text-lime-700' },
        { label: 'Runtime', value: currentSite.metrics?.operationalHours || '24.0 hrs', Icon: Leaf, tone: 'text-emerald-500' },
        { label: 'Stored buffer', value: formatEnergy(storedMwh), Icon: DollarSign, tone: 'text-amber-600' },
        { label: 'Coordinates', value: currentSite.coordinates || `${currentSite.latitude}, ${currentSite.longitude}`, Icon: MapPin, tone: 'text-rose-500' },
      ]
      : [
        { label: 'Solar today', value: formatEnergy(activeMwh), Icon: Sun, tone: 'text-lime-700' },
        { label: 'Irradiance', value: currentSite.irradiance || '920 W/m²', Icon: Sun, tone: 'text-amber-500' },
        { label: 'Cloud cover', value: currentSite.cloudCover || '4%', Icon: Zap, tone: 'text-lime-700' },
        { label: 'Array', value: currentSite.metrics?.activePanels || 'PV array active', Icon: Leaf, tone: 'text-emerald-500' },
        { label: 'Stored buffer', value: formatEnergy(storedMwh), Icon: DollarSign, tone: 'text-amber-600' },
        { label: 'Coordinates', value: currentSite.coordinates || `${currentSite.latitude}, ${currentSite.longitude}`, Icon: MapPin, tone: 'text-rose-500' },
      ];

  const triggerAction = (detail) => {
    window.dispatchEvent(new CustomEvent('mb-3d-action', { detail }));
  };

  return (
    <div className="w-full h-full flex flex-col justify-between gap-2.5">
      {/* Top 3-column area */}
      <div className="grid grid-cols-12 gap-3.5 items-start flex-1 min-h-0">
        {/* Left panel — unified compact Glass card with Digital Twin & Energy Mix */}
        <div className="col-span-12 lg:col-span-3 space-y-2 pointer-events-auto">
          <Glass className="p-4">
            <div className="flex items-center gap-2 text-[10px] font-mono text-sky-700 font-bold uppercase tracking-[0.18em]">
              <LiveDot /> Digital twin
            </div>
            <h2 className="font-display font-extrabold text-xl lg:text-2xl mt-1.5 leading-tight text-slate-900">{sourceTitle}</h2>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              {currentSite.location}
            </div>
            <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">{sourceDescription}</p>

            <div className="mt-2.5 flex flex-wrap gap-1">
              {modeTags.map((tag) => (
                <span key={tag} className="glass-chip px-2 py-0.5 rounded-full text-[9.5px] font-mono text-sky-800 font-medium">{tag}</span>
              ))}
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[11px] font-mono">
              <div className="glass-chip rounded-xl p-2"><div className="text-slate-500 text-[10px]">Mode output</div><div className="text-slate-900 font-bold text-xs">{formatEnergy(activeMwh)}</div></div>
              <div className="glass-chip rounded-xl p-2"><div className="text-slate-500 text-[10px]">Demand</div><div className="text-emerald-700 font-bold text-xs">{formatEnergy(demandMwh)}</div></div>
              <div className="glass-chip rounded-xl p-2"><div className="text-slate-500 text-[10px]">Storage</div><div className="text-sky-700 font-bold text-xs">{formatEnergy(storedMwh)}</div></div>
              <div className="glass-chip rounded-xl p-2"><div className="text-slate-500 text-[10px]">Runtime</div><div className="text-amber-700 font-bold text-xs">{currentSite.metrics?.operationalHours || '24.0 hrs'}</div></div>
            </div>

            {/* Twin energy mix toggle integrated directly into card */}
            <div className="mt-3 pt-2.5 border-t border-sky-100/60">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold mb-1.5">Twin energy mix</div>
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
                      className={`flex-1 min-h-9 py-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        on ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30' : 'bg-white/60 text-slate-600 hover:bg-white/80'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" /> {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {forecastMeta && (
              <div className="mt-2 text-[9.5px] font-mono text-slate-400 truncate">
                Weather Feed: {forecastMeta.weatherSource ?? 'Open-Meteo Live'}
              </div>
            )}
          </Glass>
        </div>

        {/* Center 3D stage with floating Navigation HUD */}
        <div className="col-span-12 lg:col-span-6 h-full flex flex-col justify-between items-center pointer-events-none py-1">
          {/* Floating 3D Navigation HUD Toolbar */}
          <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-2xl glass-hud shadow-md border border-white/60 backdrop-blur-md animate-fade-in">
            <button
              type="button"
              title="Zoom In (+)"
              onClick={() => triggerAction('zoom-in')}
              className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center transition-all shadow-sm active:scale-90"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Zoom Out (-)"
              onClick={() => triggerAction('zoom-out')}
              className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center transition-all shadow-sm active:scale-90"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-sky-200/80 mx-0.5" />
            <button
              type="button"
              title="Focus Solar Field"
              onClick={() => triggerAction('solar')}
              className="w-8 h-8 rounded-xl bg-white/80 hover:bg-amber-100 text-amber-700 flex items-center justify-center transition-all shadow-sm active:scale-90"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Focus Wind Turbines"
              onClick={() => triggerAction('wind')}
              className="w-8 h-8 rounded-xl bg-white/80 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-all shadow-sm active:scale-90"
            >
              <Wind className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Reset Perspective / Center"
              onClick={() => triggerAction('reset')}
              className="w-8 h-8 rounded-xl bg-white/80 hover:bg-sky-100 text-sky-700 flex items-center justify-center transition-all shadow-sm active:scale-90"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-500 px-2 hidden sm:inline select-none">
              Drag to rotate · Right-click/Shift to move · Zoom with +/- buttons
            </span>
          </div>

          {/* Center floating plant title */}
          <div className="pointer-events-none text-center mb-1 animate-float">
            <div className="text-[10.5px] font-mono tracking-[0.35em] uppercase text-sky-900 font-bold drop-shadow-sm">{sourceTitle}</div>
            <div className="text-slate-600 font-medium text-xs mt-0.5 drop-shadow-sm">
              {energyMode === 'hybrid' ? 'Wind flow + solar rays active' : energyMode === 'wind' ? 'Wind flow active' : 'Solar rays active'}
            </div>
          </div>
        </div>

        {/* Right panel — KPI cards with 3D Orbs */}
        <div className="col-span-12 lg:col-span-3 space-y-2 pointer-events-auto">
          {kpis.map((k, i) => (
            <Glass key={k.label} className="p-2.5 flex items-center gap-3" style={{ animationDelay: `${i * 70}ms` }}>
              <div className="w-14 h-14 shrink-0 rounded-2xl overflow-hidden bg-sky-950/10 ring-1 ring-sky-200/50">
                <OrbCanvas kind={k.kind} accent={k.accent} />
              </div>
              <div className="min-w-0">
                <div className="text-[9.5px] font-mono uppercase tracking-wider text-slate-500 font-bold">{k.label}</div>
                <div className="text-lg font-extrabold tabular leading-tight text-slate-900">{k.value}</div>
                <div className="text-[10.5px] text-slate-500 truncate">{k.hint}</div>
                <div className="text-[10.5px] text-sky-700 font-bold">{k.extra}</div>
              </div>
            </Glass>
          ))}
          <button
            type="button"
            onClick={() => onSwitchTab('actions')}
            className="w-full min-h-10 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-sky-500/20 hover:opacity-95 active:scale-98 transition-all"
          >
            Open dispatch bay <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom detail strip — completely visible within one page */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pointer-events-auto shrink-0 pb-1">
        {detailRows.map((row) => (
          <div key={row.label} className="glass-chip rounded-xl px-3 py-1.5 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-slate-500 font-semibold uppercase">
              <row.Icon className={`w-3.5 h-3.5 ${row.tone}`} />
              {row.label}
            </div>
            <div className="text-sm font-bold tabular mt-0.5 text-slate-900">{row.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
