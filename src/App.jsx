import React, { Component, useState, useMemo, useEffect, useCallback } from 'react';
import PlantWorld from './components/world/PlantWorld';
import OrbCanvas from './components/world/OrbCanvas';
import OverviewView from './views/OverviewView';
import ForecastView from './views/ForecastView';
import ActionsView from './views/ActionsView';
import TelemetryView from './views/TelemetryView';
import ConfigView from './views/ConfigView';
import EquipmentView from './views/EquipmentView';
import MLOpsView from './views/MLOpsView';
import { siteProfiles } from './data/siteProfiles';
import { generate72HourData, flaggedActionWindows } from './data/mockForecastData';
import { postForecast } from './utils/apiClient';
import confetti from 'canvas-confetti';
import {
  Zap, Sun, Wind, Download, Sparkles, Radio,
  LayoutDashboard, TrendingUp, AlertTriangle, Activity, Sliders, Database, GitBranch, ChevronDown, CheckCircle2
} from 'lucide-react';

class SceneGuard extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return <div className="absolute inset-0 bg-[#eaf4ff]" />;
    }
    return this.props.children;
  }
}

const TABS = [
  { id: 'overview', label: 'Theater', icon: LayoutDashboard },
  { id: 'forecast', label: 'Horizon', icon: TrendingUp },
  { id: 'actions', label: 'Dispatch', icon: AlertTriangle },
  { id: 'diagnostics', label: 'Waves', icon: Activity },
  { id: 'config', label: 'Setup', icon: Sliders },
  { id: 'equipment', label: 'Fleet', icon: Database },
  { id: 'mlops', label: 'MLOps', icon: GitBranch },
];

export default function App() {
  const [selectedSiteIndex, setSelectedSiteIndex] = useState(2); // Default to Altair Energy Crossroads (Hybrid)
  const [customSite, setCustomSite] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // Default to Theater for immediate 3D wow factor
  const [isLiveSimulating, setIsLiveSimulating] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const [siteOpen, setSiteOpen] = useState(false);

  // Active site object
  const currentSite = customSite && selectedSiteIndex === -1
    ? customSite
    : (siteProfiles[selectedSiteIndex] || siteProfiles[0]);

  // Active energy mode (for 3D scene)
  const [energyMode, setEnergyMode] = useState(currentSite.energyType || 'hybrid');

  // Forecast state
  const [forecastData, setForecastData] = useState(() => generate72HourData(currentSite.energyType));
  const [flaggedWindows, setFlaggedWindows] = useState(() => flaggedActionWindows);
  const [forecastMeta, setForecastMeta] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState(null);
  const [userConfig, setUserConfig] = useState(null);

  // Synchronize energyMode whenever site changes
  useEffect(() => {
    setEnergyMode(currentSite.energyType || 'hybrid');
  }, [currentSite.energyType]);

  // Attempt to fetch real live forecast from backend for a site, with instantaneous fallback
  const fetchLiveForecastForSite = useCallback(async (site) => {
    if (!site?.latitude || !site?.longitude) return;
    setForecastLoading(true);
    setForecastError(null);

    const reqConfig = {
      location: site.location,
      latitude: site.latitude,
      longitude: site.longitude,
      energyType: site.energyType === 'solar' ? 'solar' : site.energyType === 'wind' ? 'wind' : 'hybrid',
      installedCapacityMw: site.installedCapacityMw || 100,
      demandMw: site.demandMw || 75,
      selectedPanel: site.equipment?.solarPanel || 'SunPower Maxeon 3',
      selectedTurbine: site.equipment?.windTurbine || 'Vestas V150-4.2',
      batteryCapacity: site.batteryCapacity || 40,
      batterySOC: site.batterySOC || 50,
      backupCapacity: site.backupCapacity || 10,
    };

    try {
      const result = await postForecast(reqConfig);
      setForecastData(result.forecastData);
      setFlaggedWindows(result.flaggedWindows);
      setForecastMeta(result.meta);
      setUserConfig(reqConfig);
    } catch {
      // Graceful fallback to synthetic data if backend API is not responding
      setForecastData(generate72HourData(site.energyType));
      setFlaggedWindows(flaggedActionWindows);
    } finally {
      setForecastLoading(false);
    }
  }, []);

  // On initial mount or site switch, load forecast
  useEffect(() => {
    fetchLiveForecastForSite(currentSite);
  }, [currentSite, fetchLiveForecastForSite]);

  // Run forecast from custom ConfigView
  const runForecast = async (cfg) => {
    setUserConfig(cfg);
    setForecastLoading(true);
    setForecastError(null);

    try {
      const result = await postForecast(cfg);
      setForecastData(result.forecastData);
      setFlaggedWindows(result.flaggedWindows);
      setForecastMeta(result.meta);
      setIsLiveSimulating(true);

      // Create or update custom site
      const custom = {
        id: 'site-custom',
        name: cfg.location || 'Custom Plant Facility',
        energyType: cfg.energyType,
        location: cfg.location,
        latitude: cfg.latitude,
        longitude: cfg.longitude,
        coordinates: `${cfg.latitude?.toFixed(4)}°, ${cfg.longitude?.toFixed(4)}°`,
        installedCapacity: `${cfg.installedCapacityMw} MW`,
        installedCapacityMw: parseFloat(cfg.installedCapacityMw) || 100,
        demandMw: parseFloat(cfg.demandMw) || 75,
        batteryCapacity: parseFloat(cfg.batteryCapacity) || 0,
        batterySOC: parseFloat(cfg.batterySOC) || 50,
        storageCapacity: cfg.batteryCapacity ? `${cfg.batteryCapacity} MWh BESS` : 'No Battery',
        status: 'Optimal',
        statusColor: 'emerald',
        badge: `${cfg.energyType.toUpperCase()} Custom Plant`,
        description: `Custom ${cfg.energyType} generation facility located at ${cfg.location}.`,
        tags: ['Custom Model Telemetry', 'Dynamic Grid Forecasting', 'AI Optimized'],
        metrics: {
          capacityUtilization: '92.4%',
          systemEfficiency: '97.5%',
          operationalHours: '72.0 hrs',
        }
      };

      setCustomSite(custom);
      setSelectedSiteIndex(-1);
      setToastMessage(`Forecast complete for ${cfg.location} — 72h generated`);
      setTimeout(() => setToastMessage(null), 4000);
      setActiveTab('overview');
    } catch (err) {
      setForecastError(err.message ?? 'Forecast failed');
      setToastMessage(`Error: ${err.message}`);
      setTimeout(() => setToastMessage(null), 6000);
    } finally {
      setForecastLoading(false);
    }
  };

  const handleExportData = () => {
    if (!forecastData.length) {
      setToastMessage('No forecast data to export');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    const csvRows = [
      ['Hour Offset', 'Timestamp', 'Solar MW', 'Wind MW', 'Total Gen MW', 'Demand MW', 'Net Delta MW', 'Flag Status'],
      ...forecastData.map((d) => [
        d.hourOffset,
        `"${d.timeLabel}"`,
        d.solarGen,
        d.windGen,
        d.totalGen,
        d.demand,
        d.netBalance,
        d.flagStatus
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.map((e) => e.join(',')).join('\n'));
    const link = document.createElement('a');
    link.href = csvContent;
    link.download = `MegaByte_${currentSite.name.replace(/\s+/g, '_')}_72h.csv`;
    link.click();
    setToastMessage('SCADA telemetry CSV exported');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExecuteAll = () => {
    confetti({ particleCount: 80, spread: 86, origin: { y: 0.72 }, colors: ['#38bdf8', '#60a5fa', '#facc15'] });
    setFlaggedWindows((prev) => prev.map((f) => ({ ...f, resolved: true, status: 'Dispatched to Balancing Bus' })));
    setToastMessage('All pending balancing commands dispatched to SCADA');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Badge count for active actions
  const flagCount = flaggedWindows.filter((w) => !w.resolved).length;

  return (
    <div className="theme-mint relative h-screen overflow-hidden text-slate-900 font-sans flex flex-col">
      {/* 3D Digital Twin World */}
      <SceneGuard>
        <PlantWorld energyMode={energyMode} cinematic={activeTab === 'overview'} />
      </SceneGuard>

      {/* Atmospheric overlays */}
      <div className="vignette pointer-events-none absolute inset-0 z-[1]" />
      <div className="pointer-events-none absolute -top-24 left-1/4 w-[480px] h-[280px] bg-sky-300/35 blur-[90px] rounded-full aurora-blob" />
      <div className="pointer-events-none absolute top-10 right-0 w-[380px] h-[240px] bg-blue-200/45 blur-[100px] rounded-full aurora-blob" />

      {/* Header bar */}
      <header className="relative z-20 px-4 sm:px-6 pt-2.5 pb-1 shrink-0">
        <div className="glass-hud rounded-2xl px-3 py-1.5 topbar-control">
          <div className="grid grid-cols-1 xl:grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5">
            {/* Brand */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl overflow-hidden bg-gradient-to-br from-sky-400 to-blue-600 ring-1 ring-sky-300/80 shadow-md shadow-sky-500/20 shrink-0 flex items-center justify-center relative group">
                <svg className="w-6 h-6 text-white animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="9" strokeOpacity="0.4" strokeDasharray="3 3" />
                  <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-30 12 12)" strokeOpacity="0.75" />
                  <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(30 12 12)" strokeOpacity="0.75" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] animate-pulse" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display font-extrabold tracking-tight text-lg leading-none text-slate-900">MegaByte</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 font-bold">CONSOLE</span>
                </div>
                <p className="text-[10px] font-mono text-slate-400 truncate mt-1">
                  Renewable forecast theater • HackOut'26
                </p>
              </div>
            </div>

            {/* Navigation tabs */}
            <nav className="overflow-x-auto no-scrollbar rounded-2xl bg-white/45 border border-white/10 p-1">
              <div className="topbar-nav flex items-center min-w-max">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const on = activeTab === tab.id;
                  const badge = tab.id === 'actions' && flagCount > 0 ? String(flagCount) : null;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      title={tab.label}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex items-center justify-center min-h-10 px-3.5 rounded-xl text-xs font-bold gap-1.5 transition-all ${
                        on
                          ? 'bg-sky-500 text-white shadow-[0_0_24px_rgba(14,165,233,0.26)]'
                          : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline font-mono">{tab.label}</span>
                      {badge && (
                        <span className={`min-w-4 h-4 px-1 flex items-center justify-center text-[9px] rounded-full border border-white/70 ${
                          on ? 'bg-white/25 text-white' : 'bg-sky-100 text-sky-800 font-bold'
                        }`}>
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Actions & Site selector */}
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-end gap-2 min-w-0">
              {/* Site selector dropdown */}
              <div className="relative min-w-0 flex-1 sm:flex-none">
                <button
                  type="button"
                  onClick={() => setSiteOpen((v) => !v)}
                  className="min-h-11 w-full sm:w-[17.5rem] flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white/70 border border-sky-200/80 hover:bg-white transition-colors"
                >
                  {currentSite.energyType === 'solar' ? (
                    <Sun className="w-4 h-4 text-amber-600 shrink-0" />
                  ) : currentSite.energyType === 'wind' ? (
                    <Wind className="w-4 h-4 text-emerald-700 shrink-0" />
                  ) : (
                    <Zap className="w-4 h-4 text-sky-700 shrink-0" />
                  )}
                  <div className="text-left min-w-0">
                    <div className="text-xs font-extrabold leading-tight truncate text-slate-900">{currentSite.name}</div>
                    <div className="text-[9px] font-mono text-slate-500 truncate">{currentSite.installedCapacity} • {currentSite.status}</div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 ml-auto transition-transform shrink-0 ${siteOpen ? 'rotate-180' : ''}`} />
                </button>

                {siteOpen && (
                  <div className="absolute z-50 right-0 mt-2 w-72 p-2 rounded-2xl glass-hud animate-fade-in shadow-xl">
                    <div className="text-[10px] font-mono text-slate-400 px-2 py-1 uppercase font-bold">Preset Fleet Sites</div>
                    {siteProfiles.map((site, idx) => (
                      <button
                        key={site.id}
                        type="button"
                        onClick={() => {
                          setSelectedSiteIndex(idx);
                          setSiteOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors ${
                          idx === selectedSiteIndex
                            ? 'bg-sky-100 border border-sky-300'
                            : 'hover:bg-white/60'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate text-slate-900">{site.name}</div>
                          <div className="text-[9px] font-mono text-slate-500 truncate">{site.badge}</div>
                        </div>
                        {idx === selectedSiteIndex && <CheckCircle2 className="w-4 h-4 text-sky-700 ml-auto shrink-0" />}
                      </button>
                    ))}

                    {customSite && (
                      <>
                        <div className="border-t border-sky-100 my-1" />
                        <div className="text-[10px] font-mono text-slate-400 px-2 py-1 uppercase font-bold">Custom Setup</div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSiteIndex(-1);
                            setSiteOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors ${
                            selectedSiteIndex === -1
                              ? 'bg-sky-100 border border-sky-300'
                              : 'hover:bg-white/60'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate text-slate-900">{customSite.name}</div>
                            <div className="text-[9px] font-mono text-slate-500 truncate">{customSite.badge}</div>
                          </div>
                          {selectedSiteIndex === -1 && <CheckCircle2 className="w-4 h-4 text-sky-700 ml-auto shrink-0" />}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Simulation status */}
              <button
                type="button"
                onClick={() => setIsLiveSimulating((v) => !v)}
                className={`min-h-10 px-3 rounded-xl text-[10px] font-mono border flex items-center gap-1.5 transition-colors ${
                  isLiveSimulating
                    ? 'border-sky-300 text-sky-800 bg-sky-100'
                    : 'border-slate-200 text-slate-500 bg-white/55'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isLiveSimulating ? 'bg-sky-500 animate-pulse' : 'bg-slate-400'}`} />
                {forecastLoading ? 'Forecasting…' : isLiveSimulating ? 'Live' : 'Paused'}
              </button>

              {/* Export CSV */}
              <button
                type="button"
                onClick={handleExportData}
                className="min-h-10 px-3 rounded-xl text-[10px] font-mono border border-sky-200 bg-white/70 hover:bg-white flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>

              {/* Dispatch all */}
              <button
                type="button"
                onClick={handleExecuteAll}
                className="min-h-10 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-500/20 active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" /> Dispatch All
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main View Port */}
      <main className={`relative z-10 flex-1 min-h-0 w-full px-4 sm:px-6 ${
        activeTab === 'overview'
          ? 'pointer-events-none py-1.5 flex flex-col justify-between overflow-hidden'
          : 'pointer-events-auto py-3 overflow-y-auto'
      }`}>
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 glass-hud rounded-2xl px-4 py-3 text-xs font-mono text-slate-900 border border-sky-300 shadow-xl flex items-center gap-2 animate-rise">
            <Radio className="w-4 h-4 text-sky-600 animate-pulse" />
            {toastMessage}
          </div>
        )}

        <div key={activeTab} className={`animate-rise max-w-[1440px] w-full mx-auto ${
          activeTab === 'overview' ? 'pointer-events-none h-full flex flex-col justify-between' : 'pointer-events-auto'
        }`}>
          {activeTab === 'overview' && (
            <OverviewView
              currentSite={currentSite}
              forecastData={forecastData}
              forecastMeta={forecastMeta}
              energyMode={energyMode}
              onModeChange={setEnergyMode}
              onSwitchTab={setActiveTab}
            />
          )}

          {activeTab === 'forecast' && (
            <ForecastView
              forecastData={forecastData}
              currentSite={currentSite}
              userConfig={userConfig}
              forecastMeta={forecastMeta}
            />
          )}

          {activeTab === 'actions' && (
            <ActionsView
              flaggedWindows={flaggedWindows}
              setFlaggedWindows={setFlaggedWindows}
              forecastData={forecastData}
              userConfig={userConfig}
            />
          )}

          {activeTab === 'diagnostics' && (
            <TelemetryView
              currentSite={currentSite}
              forecastData={forecastData}
              forecastMeta={forecastMeta}
            />
          )}

          {activeTab === 'config' && (
            <ConfigView
              onRunForecast={runForecast}
              forecastLoading={forecastLoading}
              forecastError={forecastError}
              userConfig={userConfig}
            />
          )}

          {activeTab === 'equipment' && (
            <EquipmentView />
          )}

          {activeTab === 'mlops' && (
            <MLOpsView />
          )}
        </div>
      </main>

      {/* Bottom status strip */}
      <footer className="relative z-20 px-6 py-1.5 border-t border-sky-100/60 bg-white/45 backdrop-blur-md flex items-center justify-between text-[11px] font-mono text-slate-500 shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            FastAPI Engine :8000
          </span>
          <span>•</span>
          <span>Open-Meteo Live Grid Feed</span>
          <span>•</span>
          <span className="text-slate-700 font-semibold">{currentSite.coordinates || 'Global Grid'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{currentSite.name}</span>
          <span>[{energyMode.toUpperCase()}]</span>
        </div>
      </footer>
    </div>
  );
}
