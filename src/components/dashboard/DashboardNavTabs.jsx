import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  AlertTriangle,
  Activity,
  Sliders,
  Database
} from 'lucide-react';

export default function DashboardNavTabs({ activeTab, onSelectTab, flagCount = 3 }) {
  const tabs = [
    {
      id: 'overview',
      label: 'Control Room Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'forecast',
      label: '72h Forecast & Curves',
      icon: TrendingUp,
      badge: '24–72h',
    },
    {
      id: 'actions',
      label: 'Grid Action Center',
      icon: AlertTriangle,
      badge: flagCount > 0 ? `${flagCount} Flagged` : 'Normal',
      badgeColor: flagCount > 0 ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      id: 'diagnostics',
      label: 'Telemetry & Waveforms',
      icon: Activity,
      badge: 'Live',
    },
    {
      id: 'config',
      label: 'Plant Setup & Inputs',
      icon: Sliders,
      badge: 'Layer 1 & 2',
    },
    {
      id: 'equipment',
      label: 'Equipment Database',
      icon: Database,
      badge: 'Catalog',
    },
  ];

  return (
    <div className="w-full bg-white/70 backdrop-blur-xl border-b border-sky-200/70 sticky top-[68px] z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-2 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 min-h-11 px-3.5 py-2 rounded-xl text-xs font-display font-bold whitespace-nowrap cursor-pointer transition-colors duration-200 shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-glow-sky'
                    : 'text-slate-600 hover:text-sky-800 hover:bg-sky-100/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-sky-600'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.2 rounded-full border ${
                      isActive
                        ? 'bg-white/20 text-white border-white/30'
                        : tab.badgeColor || 'bg-sky-100 text-sky-800 border-sky-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
