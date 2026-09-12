import React from 'react';
import { Activity, Gauge, Cpu, Zap, Radio, CheckCircle2, ShieldCheck, Thermometer } from 'lucide-react';
import WindWaveformChart from './WindWaveformChart';
import GaugesAndRings from './GaugesAndRings';

export default function TelemetryTab({ currentSite }) {
  const sensorFeeds = [
    { label: 'Grid Frequency', value: '60.018 Hz', status: 'Nominal', statusColor: 'text-emerald-700', icon: Zap },
    { label: 'Busbar 3-Phase Voltage', value: '230.4 kV', status: 'Balanced', statusColor: 'text-sky-700', icon: Gauge },
    { label: 'Reactive Power (Q)', value: '+4.2 MVAR', status: 'Power Factor 0.98', statusColor: 'text-emerald-700', icon: Activity },
    { label: 'Transformer Oil Temp', value: '43.5°C', status: 'Thermal Safe (<65°C)', statusColor: 'text-sky-700', icon: Thermometer },
    { label: 'Harmonic Distortion (THD)', value: '1.24%', status: 'IEEE 519 Compliant', statusColor: 'text-emerald-700', icon: Cpu },
    { label: 'Telemetry Heartbeat', value: '12 ms Latency', status: 'Sub-second Sync', statusColor: 'text-sky-700', icon: Radio },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Waveform Analysis */}
      <WindWaveformChart siteProfile={currentSite} />

      {/* 2. Substation Diagnostic Health Rings */}
      <GaugesAndRings siteProfile={currentSite} />

      {/* 3. High-Frequency Real-Time Substation Sensor Telemetry Feed */}
      <div className="p-6 rounded-3xl bg-white/95 border border-sky-200/90 shadow-[0_4px_25px_-5px_rgba(2,132,199,0.08)]">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-sky-100">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-sky-600 animate-pulse" />
            <h4 className="font-display font-black text-base text-slate-900">
              High-Frequency Electrical Telemetry & Sensor Feeds
            </h4>
          </div>
          <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Real-Time Sub-Second Polling
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {sensorFeeds.map((feed, idx) => {
            const Icon = feed.icon;
            return (
              <div key={idx} className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200/80">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Icon className="w-3.5 h-3.5 text-sky-600" />
                  <span>{feed.label}</span>
                </div>
                <div className="text-base font-bold font-mono text-slate-900 mt-1">
                  {feed.value}
                </div>
                <div className={`text-[10px] font-mono mt-0.5 font-semibold ${feed.statusColor}`}>
                  {feed.status}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
