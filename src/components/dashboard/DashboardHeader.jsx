import React, { useState, useEffect } from 'react';
import {
  Zap, Sun, Wind, Download, RefreshCw, Settings2, MapPin, Clock
} from 'lucide-react';

export default function DashboardHeader({
  siteInfo,          // { location, energyType, capacityMW, demandMW, coords }
  isLiveSimulating,
  onToggleSimulating,
  onExportData,
  onExecuteAll,
  onReconfigure,     // goes back to input wizard
}) {
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-US', {
          hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
        }) + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const EnergyIcon = siteInfo?.energyType === 'solar' ? Sun
    : siteInfo?.energyType === 'wind' ? Wind : Zap;

  const energyColor = siteInfo?.energyType === 'solar' ? 'text-amber-500'
    : siteInfo?.energyType === 'wind' ? 'text-sky-500' : 'text-emerald-500';

  const energyLabel = siteInfo?.energyType === 'solar' ? 'Solar PV'
    : siteInfo?.energyType === 'wind' ? 'Wind Fleet' : 'Hybrid Co-Located';

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-sky-200/90 shadow-[0_4px_20px_-4px_rgba(2,132,199,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-glow-sky">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-xl text-slate-900 tracking-tight">
                  MegaByte<span className="text-sky-600">.AI</span>
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-sky-100/90 text-sky-800 text-[10px] font-mono font-bold border border-sky-300">
                  OPERATOR CONSOLE
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-500 hidden sm:block">
                Autonomous 24–72h Renewable Generation & Grid Balancing
              </p>
            </div>
          </div>

          {/* Active Site Info */}
          {siteInfo && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-sky-50/80 border border-sky-200">
              <EnergyIcon className={`w-4 h-4 shrink-0 ${energyColor}`} />
              <div className="min-w-0">
                <div className="font-display font-bold text-sm text-slate-900 truncate max-w-[200px]">
                  {siteInfo.location}
                </div>
                <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2">
                  <span>{energyLabel}</span>
                  <span>•</span>
                  <span>{siteInfo.capacityMW} MW</span>
                  {siteInfo.coords && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" />
                        {siteInfo.coords.latitude.toFixed(2)}°, {siteInfo.coords.longitude.toFixed(2)}°
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={onReconfigure}
                className="ml-1 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono text-slate-500 hover:text-sky-700 hover:bg-sky-100 border border-transparent hover:border-sky-200 transition-all"
                title="Edit configuration"
              >
                <Settings2 className="w-3 h-3" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            </div>
          )}

          {/* Right Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Clock */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-slate-700 text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE</span>
              <span className="text-slate-400">|</span>
              <Clock className="w-3 h-3 text-sky-600" />
              <span className="text-sky-700 font-bold">{timeString}</span>
            </div>

            {/* Live Telemetry Toggle */}
            <button
              onClick={onToggleSimulating}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all border ${
                isLiveSimulating
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLiveSimulating ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{isLiveSimulating ? 'Live Telemetry: ON' : 'Telemetry Paused'}</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={onExportData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-sky-50 text-sky-700 font-mono text-xs border border-sky-200 hover:border-sky-300 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5 text-sky-600" />
              <span>Export CSV</span>
            </button>

            {/* Quick Dispatch All */}
            <button
              onClick={onExecuteAll}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-display font-bold text-xs shadow-glow-sky active:scale-95 transition-all"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Quick Dispatch All</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
