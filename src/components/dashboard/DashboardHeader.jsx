import React, { useState, useEffect } from 'react';
import { Zap, Sun, Wind, Activity, Download, RefreshCw, ChevronDown, CheckCircle2, ShieldCheck, Sparkles, Clock, Globe } from 'lucide-react';
import { siteProfiles } from '../../data/siteProfiles';

export default function DashboardHeader({
  selectedSiteIndex,
  onSelectSite,
  isLiveSimulating,
  onToggleSimulating,
  onExportData,
  onExecuteAll
}) {
  const [timeString, setTimeString] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const currentSite = siteProfiles[selectedSiteIndex] || siteProfiles[0];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }) + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-sky-200/80 shadow-[0_8px_30px_-12px_rgba(37,99,235,0.18)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Brand & Active System Badge */}
          <div className="flex items-center justify-between lg:justify-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-glow-sky ring-1 ring-white/50">
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

            {/* Live Clock & Frequency Pill */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="px-2.5 py-1 rounded-xl bg-sky-50 border border-sky-200 text-slate-700 text-xs font-mono font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{timeString}</span>
              </div>
            </div>
          </div>

          {/* Center: Site Selector Dropdown */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500 hidden xl:inline-block">
                Active Balancing Node:
              </span>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full sm:w-auto min-h-11 flex items-center justify-between gap-3 px-4 py-2 rounded-2xl bg-sky-50/80 hover:bg-sky-100/90 border border-sky-200 text-slate-900 cursor-pointer transition-colors duration-200 font-display text-sm font-bold shadow-sm"
              >
                <div className="flex items-center gap-2 text-left">
                  {currentSite.energyType === 'solar' ? (
                    <Sun className="w-4 h-4 text-amber-500" />
                  ) : currentSite.energyType === 'wind' ? (
                    <Wind className="w-4 h-4 text-sky-600" />
                  ) : (
                    <Zap className="w-4 h-4 text-emerald-600" />
                  )}
                  <div>
                    <div className="leading-tight">{currentSite.name}</div>
                    <div className="text-[10px] font-mono text-slate-500 font-normal">
                      {currentSite.location} • {currentSite.installedCapacity}
                    </div>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute top-full mt-2 left-0 sm:right-0 sm:left-auto w-72 p-2 rounded-2xl bg-white border border-sky-200 shadow-xl z-50 animate-fade-in">
                <div className="text-[10px] font-mono text-slate-400 px-3 py-1.5 uppercase font-semibold">
                  Select Utility Asset
                </div>
                {siteProfiles.map((site, idx) => (
                  <button
                    key={site.id}
                    onClick={() => {
                      onSelectSite(idx);
                      setDropdownOpen(false);
                    }}
                    className={`w-full min-h-11 flex items-center gap-3 p-2.5 rounded-xl text-left cursor-pointer transition-colors duration-200 ${
                      selectedSiteIndex === idx
                        ? 'bg-sky-100/80 text-sky-900 font-bold border border-sky-200'
                        : 'text-slate-700 hover:bg-sky-50 hover:text-slate-900'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      site.energyType === 'solar' ? 'bg-amber-100 text-amber-600' :
                      site.energyType === 'wind' ? 'bg-sky-100 text-sky-600' :
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                      {site.energyType === 'solar' ? <Sun className="w-4 h-4" /> :
                       site.energyType === 'wind' ? <Wind className="w-4 h-4" /> :
                       <Zap className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-display font-bold truncate">{site.name}</div>
                      <div className="text-[10px] font-mono text-slate-500">{site.installedCapacity} • {site.status}</div>
                    </div>
                    {selectedSiteIndex === idx && (
                      <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Status Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-slate-700 text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SCADA SYNCED</span>
              <span className="text-slate-400">|</span>
              <span className="text-sky-700 font-bold">{timeString}</span>
            </div>

            {/* Live Simulator Streaming Toggle */}
            <button
              onClick={onToggleSimulating}
              className={`flex items-center gap-1.5 min-h-10 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold cursor-pointer transition-colors duration-200 border ${
                isLiveSimulating
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLiveSimulating ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{isLiveSimulating ? 'Live Telemetry: ON' : 'Telemetry Paused'}</span>
            </button>

            {/* Export CSV Report */}
            <button
              onClick={onExportData}
              className="flex items-center gap-1.5 min-h-10 px-3 py-1.5 rounded-xl bg-white hover:bg-sky-50 text-sky-700 font-mono text-xs border border-sky-200 hover:border-sky-300 shadow-sm cursor-pointer transition-colors duration-200"
            >
              <Download className="w-3.5 h-3.5 text-sky-600" />
              <span>Export CSV</span>
            </button>

            {/* Quick Dispatch All */}
            <button
              onClick={onExecuteAll}
              className="flex items-center gap-1.5 min-h-10 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-display font-bold text-xs shadow-glow-sky cursor-pointer active:scale-[0.98] transition-colors duration-200"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quick Dispatch All</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
