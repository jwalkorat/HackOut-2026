import React, { useState } from 'react';
import { siteProfiles } from '../data/siteProfiles';
import { generate72HourData } from '../data/mockForecastData';
import GenerationChart from './dashboard/GenerationChart';
import WindWaveformChart from './dashboard/WindWaveformChart';
import GaugesAndRings from './dashboard/GaugesAndRings';
import EnvironmentalPanel from './dashboard/EnvironmentalPanel';
import FlaggedActionsFeed from './dashboard/FlaggedActionsFeed';
import { MapPin, Sun, Wind, Zap, Layers, IndianRupee, Leaf, Activity, ArrowUpRight, CheckCircle2, ChevronRight } from 'lucide-react';

export default function DashboardPreview() {
  const [selectedSiteIndex, setSelectedSiteIndex] = useState(2); // Default to Altair Hybrid
  const currentSite = siteProfiles[selectedSiteIndex];
  const forecastData = generate72HourData(currentSite.energyType);

  return (
    <section id="dashboard" className="relative py-20 bg-dark-950/90 border-t border-slate-900 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-3">
              <Activity className="w-3.5 h-3.5" />
              <span>Real-Time Operator Console</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
              Live Product Preview: <br />
              <span className="text-gradient-hybrid">Control Room Intelligence</span>
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-2xl font-sans">
              Interact with simulated live telemetry across solar, wind, and hybrid assets. 
              Review the 24–72h forecast curves, inspect turbine waveforms, and execute automated grid responses.
            </p>
          </div>

          {/* Site Selector Pills */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-dark-900/90 border border-slate-800 backdrop-blur-md">
            {siteProfiles.map((site, idx) => {
              const isActive = selectedSiteIndex === idx;
              return (
                <button
                  key={site.id}
                  onClick={() => setSelectedSiteIndex(idx)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-display font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-dark-950 shadow-glow-cyan'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {site.energyType === 'solar' ? (
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                  ) : site.energyType === 'wind' ? (
                    <Wind className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>{site.name.split(' ')[0]}</span>
                  <span className="text-[10px] font-mono opacity-80">({site.installedCapacity})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Top Telemetry Stat Cards (Floating Glassmorphic Cards - Screenshot 1 inspiration) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-dark-900/80 border border-slate-800/90 backdrop-blur-xl hover:border-cyan-500/40 transition-all group">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Daily AI Forecast</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-display text-white mt-2">
              {currentSite.dailyForecastGen}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-500">Demand: {currentSite.dailyDemand}</span>
              <span className="text-emerald-400 font-bold">{currentSite.expectedSurplus}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-dark-900/80 border border-slate-800/90 backdrop-blur-xl hover:border-amber-500/40 transition-all group">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Battery Storage SOC</span>
              <span className="text-amber-400 font-bold">{currentSite.storageSOC}%</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-display text-white mt-2">
              {currentSite.storageCapacity.split(' ')[0]} {currentSite.storageCapacity.split(' ')[1]}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-500">Chemistry: LFP Buffer</span>
              <span className="text-amber-400">Ready to Dispatch</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-dark-900/80 border border-slate-800/90 backdrop-blur-xl hover:border-emerald-500/40 transition-all group">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>CO₂ Offset Today</span>
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-display text-white mt-2 text-emerald-400">
              {currentSite.carbonOffsetToday}
            </div>
            <div className="mt-1 text-[11px] font-mono text-slate-500">
              Displacing Natural Gas Peakers
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-dark-900/80 border border-slate-800/90 backdrop-blur-xl hover:border-cyan-500/40 transition-all group">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Projected Settlement</span>
              <IndianRupee className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-display text-white mt-2">
              {currentSite.revenueProjected}
            </div>
            <div className="mt-1 text-[11px] font-mono text-cyan-400">
              +14.8% via AI Pre-dispatch
            </div>
          </div>
        </div>

        {/* Site Profile Feature Card (Screenshot 3 Inspiration: Aerial Map Profile with Floating Callouts) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-dark-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl mb-8 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Visual Thumbnail / Aerial representation */}
            <div className="lg:col-span-4 relative rounded-2xl overflow-hidden h-60 border border-slate-700/60 shadow-lg group">
              <img
                src="/images/solar-dashboard-mpt-blog-11.jpg"
                alt={currentSite.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent" />
              
              {/* Floating Live Metric Callout on photo (Screenshot 3 pattern) */}
              <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-dark-950/85 backdrop-blur-md border border-white/10 text-xs font-mono flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">Active Real-Time Status</div>
                  <div className="text-white font-bold">{currentSite.metrics.capacityUtilization} Load</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  {currentSite.status}
                </span>
              </div>
            </div>

            {/* Site Profile Information */}
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-2xl text-white">
                    {currentSite.name}
                  </h3>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    {currentSite.badge}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{currentSite.location}</span>
                </div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed mb-4 font-sans">
                {currentSite.description}
              </p>

              {/* Tag Pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {currentSite.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] font-mono text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Four Icon Stat Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
                <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Installed</span>
                  <span className="text-sm font-bold font-mono text-white">{currentSite.installedCapacity}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Efficiency</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">{currentSite.metrics.systemEfficiency}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Runtime</span>
                  <span className="text-sm font-bold font-mono text-cyan-400">{currentSite.metrics.operationalHours}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Active Units</span>
                  <span className="text-sm font-bold font-mono text-amber-400">
                    {currentSite.metrics.activeTurbines || currentSite.metrics.activePanels || '100% In Service'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Forecast Chart & Environmental Panel */}
        <div className="space-y-6 mb-8">
          <GenerationChart forecastData={forecastData} />
          <EnvironmentalPanel siteProfile={currentSite} />
        </div>

        {/* Dual-Metric Waveform Chart & Health Rings */}
        <div className="space-y-6 mb-8">
          <WindWaveformChart siteProfile={currentSite} />
          <GaugesAndRings siteProfile={currentSite} />
        </div>

        {/* Flagged Windows & Recommended Actions Feed (Pillars 2 & 3 Interactive) */}
        <div className="mb-6">
          <FlaggedActionsFeed />
        </div>
      </div>
    </section>
  );
}
