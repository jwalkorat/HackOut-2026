import React from 'react';
import { Radio, Zap, Gauge, Activity, Cpu, Thermometer } from 'lucide-react';
import { Glass } from '../components/ui/Glass';
import OrbCanvas from '../components/world/OrbCanvas';

const waveform = [
  [7.2, 310], [8.5, 345], [9.1, 390], [11.4, 440], [12.8, 460], [13.5, 480], [14.2, 495], [13.8, 485],
  [12.1, 450], [10.5, 410], [9.2, 375], [8.4, 330], [9.8, 395], [11.9, 455], [13.1, 475], [12.6, 460], [11.0, 420], [9.5, 360],
];

export default function TelemetryView({ currentSite }) {
  const rings = [
    { label: 'System Availability', value: 99.2, color: '#34d399' },
    { label: 'Inverter Efficiency', value: 98.6, color: '#22d3ee' },
    { label: 'Battery SOC', value: currentSite?.storageSOC || 84, color: '#f59e0b' },
    { label: 'Substation Health', value: 96.4, color: '#818cf8' },
  ];
  const feeds = [
    { label: 'Grid Frequency', value: '60.018 Hz', status: 'Nominal', icon: Zap },
    { label: 'Busbar Voltage', value: '230.4 kV', status: 'Balanced', icon: Gauge },
    { label: 'Reactive Power', value: '+4.2 MVAR', status: 'PF 0.98', icon: Activity },
    { label: 'Transformer Oil', value: '43.5°C', status: 'Thermal safe', icon: Thermometer },
    { label: 'THD', value: '1.24%', status: 'IEEE 519', icon: Cpu },
    { label: 'Heartbeat', value: '12 ms', status: 'Sub-second', icon: Radio },
  ];

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-12 gap-4">
        <Glass className="md:col-span-8 p-5">
          <h3 className="font-display font-extrabold text-slate-900">Wind velocity vs generator waveform</h3>
          <p className="text-xs font-mono text-slate-500 mb-3">Anemometer m/s coupled to turbine inflow kW</p>
          <div className="h-44 flex items-end gap-1.5">
            {waveform.map(([speed, power], i) => (
              <div key={i} className="flex-1 flex flex-col justify-end gap-1 h-full group">
                <div className="w-full rounded-t bg-sky-400/90 group-hover:bg-sky-400 transition-colors" style={{ height: `${(speed / 16) * 45}%` }} />
                <div className="w-full rounded-b bg-amber-400/90 group-hover:bg-amber-400 transition-colors" style={{ height: `${(power / 500) * 50}%` }} />
              </div>
            ))}
          </div>
        </Glass>
        <Glass className="md:col-span-4 p-5">
          <div className="w-20 h-20 mx-auto mb-3"><OrbCanvas kind="turbine" accent={0x0284c7} /></div>
          <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">Site weather lock</div>
          <div className="text-3xl font-extrabold tabular mt-1 text-slate-900">{currentSite.windSpeed}</div>
          <div className="text-sm text-sky-800 font-semibold mt-0.5">{currentSite.irradiance} • {currentSite.ambientTemp}</div>
        </Glass>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {rings.map((r) => {
          const circ = 2 * Math.PI * 36;
          const off = circ - (r.value / 100) * circ;
          return (
            <Glass key={r.label} className="p-4 flex flex-col items-center">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(14, 165, 233, 0.16)" strokeWidth="8" />
                <circle cx="50" cy="50" r="36" fill="none" stroke={r.color} strokeWidth="8" strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" />
              </svg>
              <div className="-mt-16 text-xl font-extrabold tabular text-slate-900">{r.value}%</div>
              <div className="mt-10 text-xs font-mono text-slate-600 font-semibold text-center">{r.label}</div>
            </Glass>
          );
        })}
      </div>

      <Glass className="p-5">
        <div className="flex items-center gap-2 mb-3"><Radio className="w-4 h-4 text-sky-600 animate-pulse" /><h3 className="font-display font-extrabold text-slate-900">High-frequency sensor bay</h3></div>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
          {feeds.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="glass-chip rounded-2xl p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 font-medium"><Icon className="w-3.5 h-3.5 text-sky-600 shrink-0" />{f.label}</div>
                <div className="text-base font-bold tabular mt-1 text-slate-900">{f.value}</div>
                <div className="text-[10px] text-emerald-700 font-bold">{f.status}</div>
              </div>
            );
          })}
        </div>
      </Glass>
    </div>
  );
}
