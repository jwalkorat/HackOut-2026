import React from 'react';
import { Sun, Wind, Zap, Leaf, IndianRupee, Activity, MapPin, ArrowUpRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import Hero3DScene from '../Hero3DScene';
import GenerationChart from './GenerationChart';
import EnvironmentalPanel from './EnvironmentalPanel';
import FlaggedActionsFeed from './FlaggedActionsFeed';

export default function OverviewTab({ currentSite, forecastData, onSwitchTab }) {
  return (
    <div className="space-y-6">
      {/* 1. Real-time Generation Telemetry Ribbon (Screenshot 3 Inspiration: Top KPI Strip) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Actual / Forecast Generation */}
        <div className="p-5 rounded-3xl surface-card glass-card-hover relative overflow-hidden">
          <span className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-cyan-500" />
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>24h Forecast Delivery</span>
            <Zap className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-2">
            {currentSite.dailyForecastGen}
          </div>
          <div className="mt-1 text-[11px] font-mono text-slate-500">
            Demand Baseline: {currentSite.dailyDemand}
          </div>
        </div>

        {/* Card 2: Expected Imbalance / Balancing Action */}
        <div className="p-5 rounded-3xl surface-card glass-card-hover relative overflow-hidden">
          <span className={`absolute left-0 top-4 bottom-4 w-1 rounded-full ${
            currentSite.expectedSurplus.startsWith('+') ? 'bg-emerald-500' : 'bg-amber-500'
          }`} />
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>Projected Imbalance</span>
            <Activity className={`w-4 h-4 ${
              currentSite.expectedSurplus.startsWith('+') ? 'text-emerald-600' : 'text-amber-600'
            }`} />
          </div>
          <div className={`text-2xl sm:text-3xl font-black font-display mt-2 ${
            currentSite.expectedSurplus.startsWith('+') ? 'text-emerald-800' : 'text-amber-800'
          }`}>
            {currentSite.expectedSurplus}
          </div>
          <div className="mt-1 text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            BESS Absorption Protocol Ready
          </div>
        </div>

        {/* Card 3: Carbon Offset */}
        <div className="p-5 rounded-3xl surface-card glass-card-hover relative overflow-hidden">
          <span className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-emerald-500" />
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>CO₂ Avoided Today</span>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-2">
            {currentSite.carbonOffsetToday}
          </div>
          <div className="mt-1 text-[11px] font-mono text-slate-500">
            Displacing Natural Gas Peakers
          </div>
        </div>

        {/* Card 4: Clearing Settlement */}
        <div className="p-5 rounded-3xl surface-card glass-card-hover relative overflow-hidden">
          <span className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-blue-500" />
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>Projected Settlement</span>
            <IndianRupee className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-2">
            {currentSite.revenueProjected}
          </div>
          <div className="mt-1 text-[11px] font-mono text-sky-700 font-semibold">
            +14.8% via AI Pre-Dispatch
          </div>
        </div>
      </div>

      {/* 2. Plant Profile Banner (Clean Full-Width Telemetry Console, No Static Screenshots) */}
      <div className="p-6 sm:p-8 rounded-3xl surface-card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="font-display font-black text-2xl text-slate-900">
              {currentSite.name}
            </h3>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-300 font-bold">
              {currentSite.badge}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{currentSite.status} ({currentSite.metrics.capacityUtilization} Load)</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>{currentSite.location}</span>
            </span>
            <span>•</span>
            <span className="text-slate-400 font-medium">{currentSite.coordinates}</span>
          </div>
        </div>

        <p className="text-slate-600 text-sm leading-relaxed mb-5 font-sans max-w-5xl">
          {currentSite.description}
        </p>

        {/* Tag Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {currentSite.tags.map((tag, tIdx) => (
            <span
              key={tIdx}
              className="px-3 py-1 rounded-xl bg-sky-50 border border-sky-200 text-xs font-mono text-sky-800 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 6 Key Telemetry Specification Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-sky-100">
          <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
            <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Installed Capacity</span>
            <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">{currentSite.installedCapacity}</span>
            <span className="text-[10px] font-mono text-sky-700">Grid Connected</span>
          </div>
          <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
            <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Capacity Factor</span>
            <span className="text-sm font-bold font-mono text-emerald-700 mt-0.5 block">{currentSite.metrics.capacityUtilization}</span>
            <span className="text-[10px] font-mono text-emerald-700">Current Load Factor</span>
          </div>
          <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
            <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">System Efficiency</span>
            <span className="text-sm font-bold font-mono text-sky-700 mt-0.5 block">{currentSite.metrics.systemEfficiency}</span>
            <span className="text-[10px] font-mono text-slate-500">Inverter + Substation</span>
          </div>
          <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
            <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Runtime Today</span>
            <span className="text-sm font-bold font-mono text-indigo-700 mt-0.5 block">{currentSite.metrics.operationalHours}</span>
            <span className="text-[10px] font-mono text-indigo-600">Continuous Dispatch</span>
          </div>
          <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
            <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Active Fleet</span>
            <span className="text-sm font-bold font-mono text-amber-700 mt-0.5 block">
              {currentSite.metrics.activeTurbines || currentSite.metrics.activePanels || '100% Online'}
            </span>
            <span className="text-[10px] font-mono text-amber-600">Zero Offline Units</span>
          </div>
          <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
            <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Storage Buffer</span>
            <span className="text-sm font-bold font-mono text-emerald-700 mt-0.5 block">
              {currentSite.storageCapacity.split(' ')[0]} {currentSite.storageCapacity.split(' ')[1]}
            </span>
            <span className="text-[10px] font-mono text-emerald-600">{currentSite.storageSOC}% Ready</span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Clean 3D Plant Digital Twin Simulator */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
            <h3 className="font-display font-black text-base text-slate-900">
              Interactive 3D Substation & Fleet Digital Twin
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Real-time visual feedback: Inflow speed, rotor pitch & solar insolation
          </span>
        </div>
        <Hero3DScene energyMode={currentSite.energyType} />
      </div>

      {/* 4. Generation Chart & Weather Panel */}
      <div className="space-y-6">
        <GenerationChart forecastData={forecastData} />
        <EnvironmentalPanel siteProfile={currentSite} />
      </div>

      {/* 5. Flagged Grid Action Feed (Pillar 2 & 3 Integration) */}
      <FlaggedActionsFeed />
    </div>
  );
}
