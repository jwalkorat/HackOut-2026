import React from 'react';
import { Sun, Wind, Zap, Leaf, DollarSign, MapPin, Battery } from 'lucide-react';
import Hero3DScene from '../Hero3DScene';
import GenerationChart from './GenerationChart';
import EnvironmentalPanel from './EnvironmentalPanel';
import FlaggedActionsFeed from './FlaggedActionsFeed';

/**
 * Derives KPIs from live forecastData (real API response) instead of hardcoded site profiles.
 */
function deriveKPIs(forecastData, siteInfo) {
  if (!forecastData || forecastData.length === 0) return null;

  const totalGen  = forecastData.reduce((s, d) => s + d.totalGen, 0);   // MWh over 72h
  const totalDem  = forecastData.reduce((s, d) => s + d.demand,   0);
  const netBal    = totalGen - totalDem;
  const daily     = totalGen / 3; // average daily

  // Peak gen
  const peakMW    = Math.max(...forecastData.map((d) => d.totalGen));

  // CO2: 0.82 tCO2/MWh for coal displacement (IPCC factor)
  const co2Tons   = (totalGen * 0.82).toFixed(0);

  // Revenue: assume $50/MWh average clearing price
  const revenue   = (totalGen * 50).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  // Surplus/shortfall counts
  const surplus  = forecastData.filter((d) => d.flagStatus === 'surplus').length;
  const shortfall = forecastData.filter((d) => d.flagStatus === 'shortfall').length;

  return {
    dailyGen:    `${daily.toFixed(1)} MWh`,
    totalGen:    `${totalGen.toFixed(1)} MWh`,
    demand:      `${(totalDem / 3).toFixed(1)} MWh/day`,
    netBalance:  netBal >= 0 ? `+${netBal.toFixed(1)} MWh` : `${netBal.toFixed(1)} MWh`,
    netPositive: netBal >= 0,
    peakMW:      `${peakMW.toFixed(1)} MW`,
    co2Tons:     `${Number(co2Tons).toLocaleString()} Tons`,
    revenue,
    surplus,
    shortfall,
  };
}

export default function OverviewTab({ siteInfo, forecastData, onSwitchTab }) {
  const kpi = deriveKPIs(forecastData, siteInfo);

  const energyType  = siteInfo?.energyType || 'hybrid';
  const capacityMW  = siteInfo?.capacityMW  || 0;
  const location    = siteInfo?.location    || '—';
  const batteryMWh  = siteInfo?.batteryMWh  || 0;
  const batterySOC  = siteInfo?.batterySOC  || 50;
  const demandMW    = siteInfo?.demandMW    || 0;

  const EnergyIcon = energyType === 'solar' ? Sun : energyType === 'wind' ? Wind : Zap;

  return (
    <div className="space-y-6">
      {/* ── KPI Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1: 72h AI Generation */}
        <div className="p-5 rounded-3xl bg-white/95 border border-sky-200/90 shadow-[0_4px_25px_-5px_rgba(2,132,199,0.08)] hover:border-sky-400 transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>72h AI Generation</span>
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-2">
            {kpi ? kpi.totalGen : '—'}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-500">Daily avg: {kpi ? kpi.dailyGen : '—'}</span>
            {kpi && (
              <span className={`font-bold px-2 py-0.5 rounded-md border ${
                kpi.netPositive
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-rose-700 bg-rose-50 border-rose-200'
              }`}>
                {kpi.netBalance}
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Battery Storage */}
        <div className="p-5 rounded-3xl bg-white/95 border border-sky-200/90 shadow-[0_4px_25px_-5px_rgba(2,132,199,0.08)] hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>BESS Storage</span>
            <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              {batterySOC}%
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-2">
            {batteryMWh > 0 ? `${batteryMWh} MWh` : 'No BESS'}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-500">Demand: {demandMW} MW avg</span>
            <span className="text-amber-700 font-semibold">
              {batteryMWh > 0 ? 'Ready to Dispatch' : 'Not Configured'}
            </span>
          </div>
        </div>

        {/* Card 3: CO₂ Avoided */}
        <div className="p-5 rounded-3xl bg-white/95 border border-sky-200/90 shadow-[0_4px_25px_-5px_rgba(2,132,199,0.08)] hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>CO₂ Avoided (72h)</span>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-display text-emerald-700 mt-2">
            {kpi ? kpi.co2Tons : '—'}
          </div>
          <div className="mt-1 text-[11px] font-mono text-slate-500">
            Displacing coal @ 0.82 tCO₂/MWh
          </div>
        </div>

        {/* Card 4: Revenue */}
        <div className="p-5 rounded-3xl bg-white/95 border border-sky-200/90 shadow-[0_4px_25px_-5px_rgba(2,132,199,0.08)] hover:border-sky-400 transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>Projected Settlement</span>
            <DollarSign className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-2">
            {kpi ? kpi.revenue : '—'}
          </div>
          <div className="mt-1 text-[11px] font-mono text-sky-700 font-semibold">
            @$50/MWh avg clearing price
          </div>
        </div>
      </div>

      {/* ── Site Profile Banner ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/95 border border-sky-200/90 shadow-[0_4px_25px_-5px_rgba(2,132,199,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="font-display font-black text-2xl text-slate-900">{location}</h3>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-300 font-bold">
              {energyType === 'solar' ? 'Solar PV Plant' : energyType === 'wind' ? 'Wind Fleet' : 'Hybrid Co-Located'}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE Forecast Active</span>
            </span>
          </div>

          {siteInfo?.coords && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>{siteInfo.coords.latitude.toFixed(4)}° N, {siteInfo.coords.longitude.toFixed(4)}° E</span>
            </div>
          )}
        </div>

        <p className="text-slate-600 text-sm leading-relaxed mb-5 font-sans max-w-5xl">
          AI-powered 72-hour renewable generation forecast generated from live Open-Meteo weather data
          for <strong>{location}</strong>. Physics corrections applied using real equipment specifications.
          Grid balancing recommendations updated hourly via the MegaByte AI engine.
        </p>

        {/* Telemetry tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-sky-100">
          <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
            <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Installed Cap.</span>
            <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">{capacityMW} MW</span>
            <span className="text-[10px] font-mono text-sky-700">Grid Connected</span>
          </div>
          <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
            <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Peak Generation</span>
            <span className="text-sm font-bold font-mono text-emerald-700 mt-0.5 block">{kpi ? kpi.peakMW : '—'}</span>
            <span className="text-[10px] font-mono text-emerald-700">72h Peak</span>
          </div>
          <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
            <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Demand Baseline</span>
            <span className="text-sm font-bold font-mono text-sky-700 mt-0.5 block">{demandMW} MW</span>
            <span className="text-[10px] font-mono text-slate-500">Grid Draw</span>
          </div>
          <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
            <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Energy Type</span>
            <span className="text-sm font-bold font-mono text-indigo-700 mt-0.5 block capitalize">{energyType}</span>
            <span className="text-[10px] font-mono text-indigo-600">Generation Mode</span>
          </div>
          <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
            <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Surplus Hours</span>
            <span className="text-sm font-bold font-mono text-amber-700 mt-0.5 block">{kpi ? kpi.surplus : '—'} hrs</span>
            <span className="text-[10px] font-mono text-amber-600">Over-Generation</span>
          </div>
          <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
            <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">BESS Buffer</span>
            <span className="text-sm font-bold font-mono text-emerald-700 mt-0.5 block">
              {batteryMWh > 0 ? `${batteryMWh} MWh` : 'None'}
            </span>
            <span className="text-[10px] font-mono text-emerald-600">{batteryMWh > 0 ? `${batterySOC}% SOC` : 'Not Configured'}</span>
          </div>
        </div>
      </div>

      {/* ── 3D Digital Twin ── */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
            <h3 className="font-display font-black text-base text-slate-900">
              Interactive 3D Substation & Fleet Digital Twin
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Real-time visual: solar insolation, rotor pitch & wind inflow
          </span>
        </div>
        <Hero3DScene energyMode={energyType} />
      </div>

      {/* ── Generation Chart & Weather ── */}
      <div className="space-y-6">
        <GenerationChart forecastData={forecastData} />
        <EnvironmentalPanel forecastData={forecastData} siteInfo={siteInfo} />
      </div>

      {/* ── Flagged Actions ── */}
      <FlaggedActionsFeed forecastData={forecastData} />
    </div>
  );
}
