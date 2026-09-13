import React from 'react';
import { Radio, Zap, Gauge, Activity, Cpu, Thermometer } from 'lucide-react';
import { Glass } from '../components/ui/Glass';
import OrbCanvas from '../components/world/OrbCanvas';

export default function TelemetryView({ currentSite, forecastData = [], forecastMeta = null }) {
  const fallbackWaveform = [
    [7.2, 31.0], [8.5, 34.5], [9.1, 39.0], [11.4, 44.0], [12.8, 46.0], [13.5, 48.0], [14.2, 49.5], [13.8, 48.5],
    [12.1, 45.0], [10.5, 41.0], [9.2, 37.5], [8.4, 33.0], [9.8, 39.5], [11.9, 45.5], [13.1, 47.5], [12.6, 46.0], [11.0, 42.0], [9.5, 36.0],
  ];

  const waveform = forecastData.length >= 18
    ? forecastData.slice(0, 18).map((d) => [d.windSpeed || 7, d.totalGen || 35])
    : fallbackWaveform;

  const maxSpeed = Math.max(16, ...waveform.map(([s]) => s));
  const maxGen = Math.max(50, ...waveform.map(([, g]) => g));

  const rings = [
    { label: 'System Availability', value: 99.2, color: '#34d399' },
    { label: 'Inverter Efficiency', value: 98.6, color: '#22d3ee' },
    { label: 'Battery SOC', value: currentSite?.batterySOC || currentSite?.storageSOC || 84, color: '#f59e0b' },
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

  const windDisplay = forecastData[0]?.windSpeed != null
    ? `${forecastData[0].windSpeed.toFixed(1)} m/s`
    : (currentSite?.windSpeed || '8.6 m/s');

  const irradianceDisplay = forecastData[0]?.irradiance != null
    ? `${Math.round(forecastData[0].irradiance)} W/m²`
    : (currentSite?.irradiance || '920 W/m²');

  const tempDisplay = forecastData[0]?.ambientTemp != null
    ? `${Math.round(forecastData[0].ambientTemp)}°C`
    : (currentSite?.ambientTemp || '22°C');

  return (
    <div className="space-y-4">
      {/* Waveform and weather lock */}
      <div className="grid md:grid-cols-12 gap-4">
        <Glass className="md:col-span-8 p-5">
          <h3 className="font-display font-extrabold text-slate-900">Wind velocity vs generator waveform</h3>
          <p className="text-xs font-mono text-slate-500 mb-3">
            Anemometer m/s (blue) coupled to turbine inflow MW (amber) · First 18 hours
          </p>
          <div className="h-44 flex items-end gap-1.5">
            {waveform.map(([speed, power], i) => (
              <div key={i} className="flex-1 flex flex-col justify-end gap-1 h-full group" title={`${speed} m/s · ${power} MW`}>
                <div
                  className="w-full rounded-t bg-sky-400/90 group-hover:bg-sky-400 transition-colors"
                  style={{ height: `${(speed / maxSpeed) * 45}%` }}
                />
                <div
                  className="w-full rounded-b bg-amber-400/90 group-hover:bg-amber-400 transition-colors"
                  style={{ height: `${(power / maxGen) * 50}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[11px] font-mono text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-sky-400 inline-block" />Wind speed m/s</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-400 inline-block" />Generation MW</span>
          </div>
        </Glass>

        <Glass className="md:col-span-4 p-5 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 mx-auto mb-3"><OrbCanvas kind="turbine" accent={0x0284c7} /></div>
          <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">Site weather lock</div>
          <div className="text-3xl font-extrabold tabular mt-1 text-slate-900">{windDisplay}</div>
          <div className="text-sm text-sky-800 font-semibold mt-0.5">{irradianceDisplay} • {tempDisplay}</div>
          {currentSite?.location && (
            <div className="text-[11px] font-mono text-slate-400 mt-2 truncate max-w-full px-2">
              {currentSite.location}
            </div>
          )}
        </Glass>
      </div>

      {/* Ring gauges */}
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

      {/* High-frequency sensor bay */}
      <Glass className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Radio className="w-4 h-4 text-sky-600 animate-pulse" />
          <h3 className="font-display font-extrabold text-slate-900">High-frequency sensor bay</h3>
          <span className="ml-auto text-[11px] font-mono text-slate-400">Sub-second telemetry sync</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
          {feeds.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="glass-chip rounded-2xl p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 font-medium">
                  <Icon className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  {f.label}
                </div>
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
