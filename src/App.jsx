import React, { Component, useState } from 'react';
import PlantWorld from './components/world/PlantWorld';
import OrbCanvas from './components/world/OrbCanvas';
import OverviewView from './views/OverviewView';
import ForecastView from './views/ForecastView';
import ActionsView from './views/ActionsView';
import TelemetryView from './views/TelemetryView';
import ConfigView from './views/ConfigView';
import EquipmentView from './views/EquipmentView';
import { postForecast } from './utils/apiClient';
import confetti from 'canvas-confetti';
import {
  Zap, Sun, Wind, Download, Sparkles, Radio,
  LayoutDashboard, TrendingUp, AlertTriangle, Activity, Sliders, Database, ChevronDown
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
];

export default function App() {
  const [activeTab, setActiveTab] = useState('config'); // Start on Setup so user enters data first
  const [isLiveSimulating, setIsLiveSimulating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // User config — comes from ConfigView submit
  const [userConfig, setUserConfig] = useState(null);

  // Forecast result — from real backend API
  const [forecastData, setForecastData] = useState([]);       // transformed rows
  const [flaggedWindows, setFlaggedWindows] = useState([]);   // derived events
  const [forecastMeta, setForecastMeta] = useState(null);     // totals, equipment, etc.
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState(null);

  // Derive energyMode from userConfig (for the 3D scene)
  const energyMode = userConfig?.energyType ?? 'hybrid';

  // Run forecast against real backend
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
      setToastMessage(`Forecast complete — ${result.forecastData.length}h generated`);
      setTimeout(() => setToastMessage(null), 4000);
      // Auto-switch to overview after first successful forecast
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
      setToastMessage('No forecast data to export — run a forecast first');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }
    const csvRows = [
      ['Hour Offset', 'Timestamp', 'Solar MW', 'Wind MW', 'Total Gen MW', 'Demand MW', 'Net Delta MW', 'Wind m/s', 'Irradiance', 'Flag'],
      ...forecastData.map((d) => [
        d.hourOffset, `"${d.timeLabel}"`,
        d.solarGen, d.windGen, d.totalGen,
        d.demand, d.netBalance,
        d.windSpeed, d.irradiance, d.flagStatus,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.map((e) => e.join(',')).join('\n'));
    const link = document.createElement('a');
    link.href = csvContent;
    link.download = `MegaByte_Forecast_72h.csv`;
    link.click();
    setToastMessage('Forecast CSV exported');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExecuteAll = () => {
    confetti({ particleCount: 80, spread: 86, origin: { y: 0.72 }, colors: ['#38bdf8', '#60a5fa', '#facc15'] });
    setToastMessage('All pending balancing commands dispatched to SCADA');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Badge on Dispatch tab — number of unresolved flagged windows
  const flagCount = flaggedWindows.filter((w) => !w.resolved).length;

  return (
    <div className="theme-mint relative h-screen overflow-hidden text-slate-900 font-sans flex flex-col">
      <SceneGuard>
        <PlantWorld energyMode={energyMode} cinematic={activeTab === 'overview'} />
      </SceneGuard>
      <div className="vignette pointer-events-none absolute inset-0 z-[1]" />
      <div className="pointer-events-none absolute -top-24 left-1/4 w-[480px] h-[280px] bg-sky-300/35 blur-[90px] rounded-full aurora-blob" />
      <div className="pointer-events-none absolute top-10 right-0 w-[380px] h-[240px] bg-blue-200/45 blur-[100px] rounded-full aurora-blob" />

      <header className="relative z-20 px-4 sm:px-6 pt-4">
        <div className="glass-hud rounded-3xl px-3 py-2 topbar-control">
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
                  <span className="font-display font-extrabold tracking-tight text-lg leading-none">MegaByte</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">CONSOLE</span>
                </div>
                <p className="text-[10px] font-mono text-slate-400 truncate mt-1">
                  {userConfig
                    ? `${userConfig.location} • ${userConfig.installedCapacityMw} MW ${userConfig.energyType}`
                    : 'Configure a plant in Setup to begin forecasting'}
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
                      aria-label={tab.label}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex items-center justify-center min-h-10 w-10 rounded-xl text-xs font-bold transition-colors ${on ? 'bg-sky-500 text-white shadow-[0_0_24px_rgba(14,165,233,0.26)]' : 'text-slate-600 hover:bg-white/70'}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {badge && (
                        <span className={`absolute -right-1 -top-1 min-w-4 h-4 px-1 flex items-center justify-center text-[9px] rounded-full border border-white/70 ${on ? 'bg-white/25 text-white' : 'bg-sky-100 text-sky-800'}`}>{badge}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Actions */}
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-end gap-2 min-w-0">
              {/* Live status indicator */}
              <div className={`min-h-10 px-3 rounded-xl text-[10px] font-mono border flex items-center gap-1.5 ${
                forecastLoading ? 'border-amber-300 text-amber-800 bg-amber-50'
                : forecastData.length > 0 && isLiveSimulating ? 'border-sky-300 text-sky-800 bg-sky-100'
                : 'border-slate-200 text-slate-500 bg-white/55'
              }`}>
                {forecastLoading ? (
                  <><span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />Forecasting…</>
                ) : forecastData.length > 0 ? (
                  <><span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse shrink-0" />Live</>
                ) : (
                  <><span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />No forecast</>
                )}
              </div>
              <button type="button" onClick={handleExportData} className="min-h-10 px-3 rounded-xl text-[10px] font-mono border border-white/10 bg-white/5 hover:bg-white/10 flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
              <button type="button" onClick={handleExecuteAll} className="min-h-10 px-3.5 rounded-xl text-[10px] font-bold bg-gradient-to-r from-sky-500 to-blue-500 text-white flex items-center gap-1.5 shadow-[0_10px_24px_-14px_rgba(14,116,144,0.8)]">
                <Sparkles className="w-3.5 h-3.5" /> Dispatch
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className={`relative z-10 flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 pb-6 pt-4 ${activeTab === 'overview' ? 'pointer-events-none' : 'pointer-events-auto'}`}>
        <div key={activeTab} className={`animate-rise max-w-[1440px] mx-auto ${activeTab === 'overview' ? 'pointer-events-none' : 'pointer-events-auto'}`}>
          {activeTab === 'overview' && (
            <OverviewView
              userConfig={userConfig}
              forecastData={forecastData}
              forecastMeta={forecastMeta}
              energyMode={energyMode}
              onSwitchTab={setActiveTab}
            />
          )}
          {activeTab === 'forecast' && (
            <ForecastView forecastData={forecastData} userConfig={userConfig} forecastMeta={forecastMeta} />
          )}
          {activeTab === 'actions' && (
            <ActionsView
              forecastData={forecastData}
              flaggedWindows={flaggedWindows}
              setFlaggedWindows={setFlaggedWindows}
              userConfig={userConfig}
            />
          )}
          {activeTab === 'diagnostics' && (
            <TelemetryView forecastData={forecastData} userConfig={userConfig} forecastMeta={forecastMeta} />
          )}
          {activeTab === 'config' && (
            <ConfigView
              onRunForecast={runForecast}
              forecastLoading={forecastLoading}
              forecastError={forecastError}
              userConfig={userConfig}
            />
          )}
          {activeTab === 'equipment' && <EquipmentView />}
        </div>
      </main>

      {toastMessage && (
        <div role="status" className="fixed bottom-6 right-6 z-50 glass-hud rounded-2xl px-5 py-3 flex items-center gap-2.5 text-xs font-mono text-sky-950 font-bold border border-sky-300 shadow-xl shadow-sky-900/10 animate-fade-in">
          <Radio className="w-4 h-4 text-sky-600 animate-pulse shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
