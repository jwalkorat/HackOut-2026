import React, { useState, useMemo } from 'react';
import DashboardHeader from './components/dashboard/DashboardHeader';
import DashboardNavTabs from './components/dashboard/DashboardNavTabs';
import OverviewTab from './components/dashboard/OverviewTab';
import ForecastTab from './components/dashboard/ForecastTab';
import ActionsTab from './components/dashboard/ActionsTab';
import TelemetryTab from './components/dashboard/TelemetryTab';
import ConfigTab from './components/dashboard/ConfigTab';
import EquipmentTab from './components/dashboard/EquipmentTab';
import MLOpsTab from './components/dashboard/MLOpsTab';
import { siteProfiles } from './data/siteProfiles';
import { generate72HourData } from './data/mockForecastData';
import confetti from 'canvas-confetti';
import { ShieldCheck, Zap, Heart } from 'lucide-react';

export default function App() {
  const [selectedSiteIndex, setSelectedSiteIndex] = useState(2); // Default to Altair Hybrid Crossroads
  const [activeTab, setActiveTab] = useState('overview');
  const [isLiveSimulating, setIsLiveSimulating] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const currentSite = siteProfiles[selectedSiteIndex] || siteProfiles[0];
  const forecastData = useMemo(() => generate72HourData(currentSite.energyType), [currentSite.energyType]);

  // CSV Export
  const handleExportData = () => {
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
      ])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MegaByte_${currentSite.id}_Forecast_72h.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage('✓ SCADA Telemetry CSV Exported Successfully');
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Quick Dispatch All
  const handleExecuteAll = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#0284c7', '#059669', '#f59e0b']
    });
    setToastMessage('⚡ All 3 Pending Balancing Commands Dispatched to Substation SCADA');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#f0f7ff] text-slate-800 font-sans antialiased selection:bg-sky-500 selection:text-white flex flex-col justify-between">
      <div>
        {/* 1. Global Operator Header */}
        <DashboardHeader
          selectedSiteIndex={selectedSiteIndex}
          onSelectSite={setSelectedSiteIndex}
          isLiveSimulating={isLiveSimulating}
          onToggleSimulating={() => setIsLiveSimulating(!isLiveSimulating)}
          onExportData={handleExportData}
          onExecuteAll={handleExecuteAll}
        />

        {/* 2. Sticky Tabbed Navigation Bar */}
        <DashboardNavTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          flagCount={3}
        />

        {/* Global Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-600 text-white font-mono font-bold text-xs shadow-2xl animate-fade-in border border-sky-400">
            <Zap className="w-4 h-4 fill-current" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 3. Main Dashboard Tab View Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <OverviewTab
              currentSite={currentSite}
              forecastData={forecastData}
              onSwitchTab={setActiveTab}
            />
          )}

          {activeTab === 'forecast' && (
            <ForecastTab
              forecastData={forecastData}
              currentSite={currentSite}
            />
          )}

          {activeTab === 'actions' && (
            <ActionsTab />
          )}

          {activeTab === 'diagnostics' && (
            <TelemetryTab currentSite={currentSite} />
          )}

          {activeTab === 'config' && (
            <ConfigTab
              onApplyConfig={(newConfig) => {
                setToastMessage(`✓ Plant Parameters Applied: ${newConfig.installedCapacity} at ${newConfig.location}`);
                setTimeout(() => setToastMessage(null), 4000);
              }}
            />
          )}

          {activeTab === 'equipment' && (
            <EquipmentTab />
          )}

          {activeTab === 'mlops' && (
            <MLOpsTab />
          )}
        </main>
      </div>

      {/* 4. Operator Console Footer */}
      <footer className="mt-16 bg-white/80 border-t border-sky-200/90 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">MegaByte Operator Console</span>
            <span>•</span>
            <span>HackOut'26 Submission</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">Substation Feed 100% Operational</span>
          </div>
          <div className="flex items-center gap-4">
            <span>CAISO / ERCOT / CEN Telemetry Protocol</span>
            <span className="text-sky-700 font-bold">Latency: 12ms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
