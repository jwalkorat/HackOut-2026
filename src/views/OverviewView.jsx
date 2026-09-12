import React from 'react';
import { MapPin, Sun, Wind, Zap, Leaf, DollarSign, ArrowRight, Sparkles } from 'lucide-react';
import OrbCanvas from '../components/world/OrbCanvas';
import { Glass, LiveDot } from '../components/ui/Glass';

export default function OverviewView({ userConfig, forecastData = [], forecastMeta, energyMode, onSwitchTab }) {
  // Empty state — no forecast run yet
  if (!userConfig || forecastData.length === 0) {
    const pillars = [
      {
        step: '01',
        title: 'Forecast',
        desc: 'Predict solar and wind output using live weather data, site parameters, and AI time-series models trained on historical generation records.',
        kind: 'sun',
        accent: 0x22d3ee,
        color: 'text-sky-700',
        bg: 'bg-sky-50 border-sky-200',
      },
      {
        step: '02',
        title: 'Flag',
        desc: 'Automatically detect upcoming windows of over-generation (surplus / curtailment risk) or under-generation (shortfall risk) against expected demand.',
        kind: 'core',
        accent: 0xf59e0b,
        color: 'text-amber-700',
        bg: 'bg-amber-50 border-amber-200',
      },
      {
        step: '03',
        title: 'Recommend',
        desc: 'Convert each flagged window into a specific, actionable grid response — curtail, dispatch storage, or activate backup — so the tool is decision-support, not just a chart.',
        kind: 'battery',
        accent: 0x34d399,
        color: 'text-emerald-700',
        bg: 'bg-emerald-50 border-emerald-200',
      },
    ];

    return (
      <div className="space-y-6 pointer-events-auto">
        {/* Hero */}
        <Glass className="p-8 text-center">
          <div className="text-[10px] font-mono uppercase tracking-widest text-sky-700 font-bold mb-2">AI-Powered Renewable Intelligence</div>
          <h2 className="font-display font-extrabold text-3xl text-slate-900 mb-3">
            Forecast · Flag · Recommend
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto mb-4">
            An AI forecasting and decision-support platform that predicts renewable generation 24–72 hours ahead and translates that forecast into actionable grid recommendations — for grid operators, utility companies, plant owners, and energy traders.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {['Grid Operators', 'Utility Companies', 'Plant Owners', 'Energy Traders'].map((u) => (
              <span key={u} className="glass-chip px-3 py-1 rounded-full text-[10px] font-mono text-sky-800 font-semibold border border-sky-200/60">{u}</span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onSwitchTab('config')}
            className="min-h-11 px-6 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-sm inline-flex items-center gap-2 shadow-md shadow-sky-500/20 hover:opacity-95 transition-opacity"
          >
            <Sparkles className="w-4 h-4" />Configure Plant &amp; Run Forecast
          </button>
        </Glass>

        {/* Three Pillars */}
        <div className="grid md:grid-cols-3 gap-4">
          {pillars.map((p) => (
            <Glass key={p.title} className="p-5">
              <div className="w-14 h-14 mx-auto mb-3">
                <OrbCanvas kind={p.kind} accent={p.accent} />
              </div>
              <div className={`text-[10px] font-mono uppercase tracking-widest font-bold mb-1 ${p.color}`}>Pillar {p.step}</div>
              <h3 className="font-display font-extrabold text-xl text-slate-900 mb-2">{p.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
            </Glass>
          ))}
        </div>

        {/* Layer system explainer */}
        <div className="grid md:grid-cols-2 gap-4">
          <Glass className="p-5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-sky-700 font-bold mb-2">Layer 1 — Required (~10 seconds)</div>
            <div className="space-y-1.5 text-xs text-slate-700">
              {['Location (geocoded to 0.25° weather grid)', 'Energy type: solar / wind / both', 'Demand / grid load (MW)', 'Installed capacity (MW)'].map((f) => (
                <div key={f} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            <p className="text-[11px] font-mono text-slate-500 mt-3">Generates a usable forecast using industry-standard defaults. Non-technical users can start immediately.</p>
          </Glass>
          <Glass className="p-5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-amber-600 font-bold mb-2">Layer 2 — Optional Accuracy Boosters</div>
            <div className="space-y-1.5 text-xs text-slate-700">
              {['Panel / turbine model preset (lookup table)', 'Tilt angle &amp; orientation', 'Hub height, cut-in / cut-out speed', 'Battery storage capacity &amp; SOC', 'Backup generator capacity'].map((f) => (
                <div key={f} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span dangerouslySetInnerHTML={{ __html: f }} />
                </div>
              ))}
            </div>
            <p className="text-[11px] font-mono text-slate-500 mt-3">Each skipped field falls back to a documented IEC default — the platform never blocks a first-time user.</p>
          </Glass>
        </div>
      </div>
    );
  }

  // ── Compute KPIs from real forecast data ────────────────────────────────────
  const today = forecastData.slice(0, 24);
  const solarMwh = today.reduce((sum, r) => sum + r.solarGen, 0);
  const windMwh = today.reduce((sum, r) => sum + r.windGen, 0);
  const activeMwh = today.reduce((sum, r) => sum + r.totalGen, 0);
  const demandMwh = today.reduce((sum, r) => sum + r.demand, 0);

  // Battery from userConfig (if provided)
  const batteryCapMwh = parseFloat(userConfig.batteryCapacity) || 0;
  const batterySocPct = parseFloat(userConfig.batterySOC) || 50;
  const storedMwh = batteryCapMwh * (batterySocPct / 100);

  const co2Avoided = activeMwh * 0.49;        // Avg grid emission factor
  const revenue = activeMwh * 126;             // Approx settlement $/MWh

  const fmt = (v) => `${Math.round(v * 10) / 10} MWh`;
  const fmtSigned = (v) => `${v >= 0 ? '+' : ''}${Math.round(v * 10) / 10} MWh`;

  const sourceTitle = energyMode === 'hybrid' ? 'Hybrid Co-Generation'
    : energyMode === 'wind' ? 'Wind Generation' : 'Solar Generation';

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

  // Weather snapshot from first daylight hour in forecast
  const dayHour = forecastData.find((r) => r.irradiance > 0) ?? forecastData[0];
  const avgWindSpeed = (forecastData.reduce((s, r) => s + r.windSpeed, 0) / forecastData.length).toFixed(1);
  const peakIrradiance = Math.max(...forecastData.map((r) => r.irradiance)).toFixed(0);

  const kpis = [
    energyMode === 'hybrid'
      ? { label: 'Total Generation Today', value: fmt(activeMwh), hint: `Solar ${fmt(solarMwh)} • Wind ${fmt(windMwh)}`, extra: fmtSigned(activeMwh - demandMwh), kind: 'core', accent: 0x22c55e }
      : energyMode === 'wind'
        ? { label: 'Wind Power Today', value: fmt(activeMwh), hint: `Avg ${avgWindSpeed} m/s at hub`, extra: `${userConfig.installedCapacityMw} MW installed`, kind: 'turbine', accent: 0x22c55e }
        : { label: 'Solar Power Today', value: fmt(activeMwh), hint: `Peak ${peakIrradiance} W/m²`, extra: `${userConfig.installedCapacityMw} MW installed`, kind: 'sun', accent: 0xa3e635 },

    storedMwh > 0
      ? { label: 'Battery Storage', value: fmt(storedMwh), hint: `${batterySocPct}% SOC`, extra: `${batteryCapMwh} MWh total`, kind: 'battery', accent: 0xa3e635 }
      : { label: 'Avg Wind Speed', value: `${avgWindSpeed} m/s`, hint: 'Hub-height wind', extra: 'No battery configured', kind: 'core', accent: 0x65a30d },

    { label: 'CO₂ Avoided Today', value: `${co2Avoided.toFixed(1)} T`, hint: '0.49 t/MWh grid factor', extra: sourceTitle, kind: 'sun', accent: 0x4ade80 },
    { label: 'Projected Settlement', value: `$${Math.round(revenue).toLocaleString()}`, hint: '$126/MWh avg rate', extra: fmtSigned(activeMwh - demandMwh) + ' net', kind: energyMode === 'solar' ? 'sun' : 'turbine', accent: 0x65a30d },
  ];

  const detailRows = [
    { label: 'Solar today', value: fmt(solarMwh), Icon: Sun, tone: 'text-amber-500' },
    { label: 'Wind today', value: fmt(windMwh), Icon: Wind, tone: 'text-emerald-600' },
    { label: 'Demand today', value: fmt(demandMwh), Icon: Zap, tone: 'text-violet-500' },
    { label: 'Net balance', value: fmtSigned(activeMwh - demandMwh), Icon: DollarSign, tone: 'text-amber-500' },
    { label: 'Peak irradiance', value: `${peakIrradiance} W/m²`, Icon: Sun, tone: 'text-amber-400' },
    { label: 'Avg wind 10m', value: `${avgWindSpeed} m/s`, Icon: Wind, tone: 'text-sky-500' },
  ];

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Left panel */}
      <div className="col-span-12 lg:col-span-3 space-y-4 pointer-events-auto">
        <Glass className="p-5">
          <div className="flex items-center gap-2 text-[11px] font-mono text-sky-700 font-bold uppercase tracking-[0.18em]">
            <LiveDot />Live Forecast
          </div>
          <h2 className="font-display font-extrabold text-2xl mt-2 leading-tight text-slate-900">{sourceTitle}</h2>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-600 font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            {userConfig.location}
          </div>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">{sourceDescription}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {modeTags.map((tag) => (
              <span key={tag} className="glass-chip px-2.5 py-1 rounded-full text-[10px] font-mono text-sky-800 font-medium">{tag}</span>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="glass-chip rounded-xl p-2.5"><div className="text-slate-500">Generation</div><div className="text-slate-900 font-bold">{fmt(activeMwh)}</div></div>
            <div className="glass-chip rounded-xl p-2.5"><div className="text-slate-500">Demand</div><div className="text-emerald-700 font-bold">{fmt(demandMwh)}</div></div>
            {storedMwh > 0 && <div className="glass-chip rounded-xl p-2.5"><div className="text-slate-500">Storage</div><div className="text-sky-700 font-bold">{fmt(storedMwh)}</div></div>}
            <div className="glass-chip rounded-xl p-2.5"><div className="text-slate-500">Capacity</div><div className="text-amber-700 font-bold">{userConfig.installedCapacityMw} MW</div></div>
          </div>
          {forecastMeta && (
            <div className="mt-2 text-[10px] font-mono text-slate-400 truncate">
              Source: {forecastMeta.weatherSource ?? 'Live weather'}
            </div>
          )}
        </Glass>
      </div>

      {/* Center — 3D scene area */}
      <div className="col-span-12 lg:col-span-6 min-h-[42vh] flex items-end justify-center pointer-events-none">
        <div className="pointer-events-none text-center mb-6 animate-float">
          <div className="text-[11px] font-mono tracking-[0.35em] uppercase text-sky-900 font-bold drop-shadow-sm">{sourceTitle}</div>
          <div className="text-slate-700 font-medium text-sm mt-1 drop-shadow-sm">
            {energyMode === 'hybrid' ? 'Wind flow + solar rays active' : energyMode === 'wind' ? 'Wind flow active' : 'Solar rays active'}
          </div>
        </div>
      </div>

      {/* Right panel — KPI cards */}
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

      {/* Bottom detail strip */}
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
