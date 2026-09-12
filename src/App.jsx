import React, { useState } from 'react';
import InputWizard from './components/dashboard/InputWizard';
import DashboardHeader from './components/dashboard/DashboardHeader';
import DashboardNavTabs from './components/dashboard/DashboardNavTabs';
import OverviewTab from './components/dashboard/OverviewTab';
import ForecastTab from './components/dashboard/ForecastTab';
import ActionsTab from './components/dashboard/ActionsTab';
import TelemetryTab from './components/dashboard/TelemetryTab';
import ConfigTab from './components/dashboard/ConfigTab';
import EquipmentTab from './components/dashboard/EquipmentTab';
import { transformApiResponse, mapConfigToApiRequest } from './utils/apiHelpers';
import confetti from 'canvas-confetti';
import { Zap } from 'lucide-react';

export default function App() {
  // ── App-level state ──────────────────────────────────────────
  const [screen, setScreen]               = useState('wizard');  // 'wizard' | 'dashboard'
  const [activeTab, setActiveTab]         = useState('overview');
  const [isLiveSimulating, setIsLiveSimulating] = useState(true);
  const [toastMessage, setToastMessage]   = useState(null);

  // Forecast & site state (all real — no mock data)
  const [forecastData, setForecastData]   = useState([]);
  const [isLoading, setIsLoading]         = useState(false);
  const [apiError, setApiError]           = useState(null);
  const [siteInfo, setSiteInfo]           = useState(null);    // set by wizard / config

  // ── Shared fetch helper ───────────────────────────────────────
  const fetchForecastFromPayload = async (payload) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await fetch('/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`API ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setForecastData(transformApiResponse(data.forecast, data.energy_type));
      return true;
    } catch (err) {
      console.error('Forecast fetch failed:', err);
      setApiError('Could not reach the Forecasting Engine. Please ensure the backend is running on port 8000.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Called by InputWizard on submit ───────────────────────────
  const handleWizardSubmit = async (payload, info) => {
    setSiteInfo(info);
    const ok = await fetchForecastFromPayload(payload);
    if (ok) {
      setScreen('dashboard');
      setActiveTab('overview');
    }
  };

  // ── Called by ConfigTab "Apply & Recalculate" ─────────────────
  const handleConfigFetch = async (configPayload) => {
    const ok = await fetchForecastFromPayload(configPayload);
    if (ok) setActiveTab('forecast');
  };

  // ── CSV Export ────────────────────────────────────────────────
  const handleExportData = () => {
    if (!forecastData.length) return;
    const rows = [
      ['Hour', 'Timestamp', 'Solar MW', 'Wind MW', 'Total Gen MW', 'Demand MW', 'Net MW', 'Flag'],
      ...forecastData.map((d) => [
        d.hourOffset, `"${d.timeLabel}"`,
        d.solarGen, d.windGen, d.totalGen, d.demand, d.netBalance, d.flagStatus
      ])
    ];
    const csv = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `MegaByte_${(siteInfo?.location || 'forecast').replace(/,\s*/g, '_')}_72h.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ 72-Hour SCADA Telemetry CSV Exported');
  };

  // ── Quick Dispatch ────────────────────────────────────────────
  const handleExecuteAll = () => {
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 }, colors: ['#0284c7', '#059669', '#f59e0b'] });
    showToast('⚡ All Pending Balancing Commands Dispatched to Substation SCADA');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ── Wizard screen ─────────────────────────────────────────────
  if (screen === 'wizard') {
    return <InputWizard onSubmit={handleWizardSubmit} />;
  }

  // ── Dashboard screen ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f0f7ff] text-slate-800 font-sans antialiased selection:bg-sky-500 selection:text-white flex flex-col justify-between">
      <div>
        {/* Header */}
        <DashboardHeader
          siteInfo={siteInfo}
          isLiveSimulating={isLiveSimulating}
          onToggleSimulating={() => setIsLiveSimulating(!isLiveSimulating)}
          onExportData={handleExportData}
          onExecuteAll={handleExecuteAll}
          onReconfigure={() => { setScreen('wizard'); setForecastData([]); setSiteInfo(null); }}
        />

        {/* Nav Tabs */}
        <DashboardNavTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          flagCount={forecastData.filter((d) => d.flagStatus !== 'balanced').length}
        />

        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-600 text-white font-mono font-bold text-xs shadow-2xl animate-fade-in border border-sky-400">
            <Zap className="w-4 h-4 fill-current" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading overlay */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 font-mono text-sm animate-pulse">Synchronizing with AI Forecasting Engine...</p>
            </div>
          )}

          {/* API error banner */}
          {apiError && !isLoading && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono flex items-center gap-3">
              <span className="font-bold">⚠ ERROR</span>
              <span>{apiError}</span>
              <button
                onClick={() => setScreen('wizard')}
                className="ml-auto px-3 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 border border-rose-300 font-bold text-xs transition-colors"
              >
                Reconfigure
              </button>
            </div>
          )}

          {!isLoading && !apiError && (
            <>
              {activeTab === 'overview' && (
                <OverviewTab
                  siteInfo={siteInfo}
                  forecastData={forecastData}
                  onSwitchTab={setActiveTab}
                />
              )}
              {activeTab === 'forecast' && (
                <ForecastTab forecastData={forecastData} currentSite={siteInfo} />
              )}
              {activeTab === 'actions' && (
                <ActionsTab forecastData={forecastData} />
              )}
              {activeTab === 'diagnostics' && (
                <TelemetryTab currentSite={siteInfo} />
              )}
              {activeTab === 'config' && (
                <ConfigTab
                  onFetchForecast={handleConfigFetch}
                  onApplyConfig={(cfg) => {
                    setSiteInfo((prev) => ({ ...prev, ...cfg }));
                    showToast(`✓ Parameters Updated & Forecast Recalculated for ${cfg.location}`);
                  }}
                />
              )}
              {activeTab === 'equipment' && <EquipmentTab />}
            </>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-white/80 border-t border-sky-200/90 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">MegaByte Operator Console</span>
            <span>•</span>
            <span>HackOut'26 Submission</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">Live AI Forecasting — No Mock Data</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{siteInfo?.location || '—'}</span>
            <span className="text-sky-700 font-bold">
              {forecastData.length > 0 ? `${forecastData.length}h Forecast Active` : 'No Forecast'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
