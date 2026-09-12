import React from 'react';
import { BatteryCharging, Cpu, ShieldCheck, Activity, Check } from 'lucide-react';

export default function GaugesAndRings({ siteProfile }) {
  const rings = [
    {
      label: 'System Availability',
      value: 99.2,
      color: '#059669', // Clean Emerald
      status: 'Optimal',
      subtext: 'Grid synced continuously',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      label: 'Inverter Efficiency',
      value: 98.6,
      color: '#0284c7', // Sky Blue
      status: 'Nominal',
      subtext: 'Low harmonic distortion',
      badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
    },
    {
      label: 'Battery SOC Level',
      value: siteProfile?.storageSOC || 84,
      color: '#f59e0b', // Solar Amber
      status: 'Standby Buffer',
      subtext: siteProfile?.storageCapacity || '40 MWh BESS',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      label: 'Substation Health Index',
      value: 96.4,
      color: '#6366f1', // Indigo
      status: 'Healthy',
      subtext: 'No thermal stress alerts',
      badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    }
  ];

  return (
    <div className="p-6 rounded-3xl surface-card">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-sky-100">
        <div>
          <h4 className="font-display font-black text-base text-slate-900">
            Performance & Substation Health Diagnostic Rings
          </h4>
          <p className="text-xs font-mono text-slate-500 mt-0.5">
            Continuous diagnostic loops across inverters, BESS storage, and step-up transformers
          </p>
        </div>
        <span className="text-xs font-mono text-emerald-800 font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>All Systems 100% Online</span>
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {rings.map((ring, idx) => {
          const radius = 38;
          const circumference = 2 * Math.PI * radius;
          const strokeOffset = circumference - (ring.value / 100) * circumference;

          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200/80 flex flex-col items-center text-center relative overflow-hidden group hover:bg-sky-50 hover:border-sky-300 transition-all"
            >
              {/* Circular SVG Ring */}
              <div className="relative w-24 h-24 my-2 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 overflow-visible" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                  />
                  {/* Dynamic Progress Stroke */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={ring.color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                    style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                  />
                </svg>

                {/* Center Percentage Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center font-display font-black text-xl text-slate-900">
                  <span>{ring.value}%</span>
                </div>
              </div>

              <div className="font-display font-bold text-xs text-slate-900 mt-1">
                {ring.label}
              </div>

              <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                {ring.subtext}
              </div>

              <span
                className={`mt-2.5 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${ring.badgeClass}`}
              >
                {ring.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
