import React, { Component, useMemo, useState } from 'react';
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
import { generate72HourData } from './data/mockForecastData';
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
  { id: 'actions', label: 'Dispatch', icon: AlertTriangle, badge: '3' },
  { id: 'diagnostics', label: 'Waves', icon: Activity },
  { id: 'config', label: 'Setup', icon: Sliders },
  { id: 'equipment', label: 'Fleet', icon: Database },
  { id: 'mlops', label: 'MLOps', icon: GitBranch },
];

export default function App() {
  const [selectedSiteIndex, setSelectedSiteIndex] = useState(2);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLiveSimulating, setIsLiveSimulating] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const [energyMode, setEnergyMode] = useState('hybrid');
  const [siteOpen, setSiteOpen] = useState(false);
  const currentSite = siteProfiles[selectedSiteIndex] || siteProfiles[0];
  const forecastData = useMemo(() => generate72HourData(energyMode), [energyMode]);

  React.useEffect(() => {
    setEnergyMode(currentSite.energyType);
  }, [currentSite.energyType]);

  const handleExportData = () => {
    const csvRows = [
      ['Hour Offset', 'Timestamp', 'Solar MW', 'Wind MW', 'Total Gen MW', 'Demand MW', 'Net Delta MW', 'Flag Status'],
      ...forecastData.map((d) => [d.hourOffset, `"${d.timeLabel}"`, d.solarGen, d.windGen, d.totalGen, d.demand, d.netBalance, d.flagStatus]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.map((e) => e.join(',')).join('\n'));
    const link = document.createElement('a');
    link.href = csvContent;
    link.download = `MegaByte_${currentSite.id}_Forecast_72h.csv`;
    link.click();
    setToastMessage('SCADA telemetry CSV exported');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExecuteAll = () => {
    confetti({ particleCount: 80, spread: 86, origin: { y: 0.72 }, colors: ['#38bdf8', '#60a5fa', '#facc15'] });
    setToastMessage('All pending balancing commands dispatched to SCADA');
    setTimeout(() => setToastMessage(null), 4000);
  };

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
                <p className="text-[10px] font-mono text-slate-400 truncate mt-1">Renewable forecast theater • HackOut'26</p>
              </div>
            </div>

            <nav className="overflow-x-auto no-scrollbar rounded-2xl bg-white/45 border border-white/10 p-1">
              <div className="topbar-nav flex items-center min-w-max">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const on = activeTab === tab.id;
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
                      {tab.badge && (
                        <span className={`absolute -right-1 -top-1 min-w-4 h-4 px-1 flex items-center justify-center text-[9px] rounded-full border border-white/70 ${on ? 'bg-white/25 text-white' : 'bg-sky-100 text-sky-800'}`}>{tab.badge}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className="flex flex-wrap sm:flex-nowrap items-center justify-end gap-2 min-w-0">
              <div className="relative min-w-0 flex-1 sm:flex-none">
                <button
                  type="button"
                  onClick={() => setSiteOpen((v) => !v)}
                  className="min-h-11 w-full sm:w-[17rem] flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
                >
                  {currentSite.energyType === 'solar' ? <Sun className="w-4 h-4 text-amber-600 shrink-0" /> : currentSite.energyType === 'wind' ? <Wind className="w-4 h-4 text-emerald-700 shrink-0" /> : <Zap className="w-4 h-4 text-sky-700 shrink-0" />}
                  <div className="text-left min-w-0">
                    <div className="text-xs font-extrabold leading-tight truncate">{currentSite.name}</div>
                    <div className="text-[9px] font-mono text-slate-400 truncate">{currentSite.installedCapacity} • {currentSite.status}</div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 ml-auto transition-transform shrink-0 ${siteOpen ? 'rotate-180' : ''}`} />
                </button>
                {siteOpen && (
                  <div className="absolute z-50 mt-2 w-full p-2 rounded-2xl glass-hud animate-fade-in">
                    {siteProfiles.map((site, idx) => (
                      <button
                        key={site.id}
                        type="button"
                        onClick={() => { setSelectedSiteIndex(idx); setSiteOpen(false); }}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left ${idx === selectedSiteIndex ? 'bg-sky-100 border border-sky-300' : 'hover:bg-white/60'}`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">{site.name}</div>
                          <div className="text-[9px] font-mono text-slate-400 truncate">{site.badge}</div>
                        </div>
                        {idx === selectedSiteIndex && <CheckCircle2 className="w-4 h-4 text-sky-700 ml-auto shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsLiveSimulating((v) => !v)}
                className={`min-h-10 px-3 rounded-xl text-[10px] font-mono border ${isLiveSimulating ? 'border-sky-300 text-sky-800 bg-sky-100' : 'border-sky-200 text-slate-500 bg-white/55'}`}
              >
                {isLiveSimulating ? 'Live' : 'Paused'}
              </button>
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
              currentSite={currentSite}
              forecastData={forecastData}
              energyMode={energyMode}
              onModeChange={setEnergyMode}
              onSwitchTab={setActiveTab}
            />
          )}
          {activeTab === 'forecast' && <ForecastView forecastData={forecastData} currentSite={currentSite} />}
          {activeTab === 'actions' && <ActionsView />}
          {activeTab === 'diagnostics' && <TelemetryView currentSite={currentSite} />}
          {activeTab === 'config' && (
            <ConfigView
              onApplyConfig={(cfg) => {
                setToastMessage(`Plant parameters applied: ${cfg.installedCapacity} at ${cfg.location}`);
                setTimeout(() => setToastMessage(null), 4000);
              }}
            />
          )}
          {activeTab === 'equipment' && <EquipmentView />}
          {activeTab === 'mlops' && <MLOpsView />}
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
