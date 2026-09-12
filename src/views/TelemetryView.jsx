import React from 'react';
import { Radio, Zap, Gauge, Activity, Cpu, Thermometer, Sparkles } from 'lucide-react';
import { Glass } from '../components/ui/Glass';
import OrbCanvas from '../components/world/OrbCanvas';

export default function TelemetryView({ forecastData = [], userConfig, forecastMeta }) {
  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!forecastData.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
        <Glass className="p-10 text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-4">
            <OrbCanvas kind="turbine" accent={0x0284c7} />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-slate-900 mb-2">No Telemetry Data</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Run a forecast from the <strong>Setup</strong> tab to see live wind, irradiance, and generation waveforms here.
          </p>
        </Glass>
      </div>
    );
  }

  // ── Derive waveform from real forecast data (first 24h for readability) ─────
  const slice = forecastData.slice(0, 24);
  const waveform = slice.map((r) => [r.windSpeed, r.totalGen]);
  const maxSpeed = Math.max(...slice.map((r) => r.windSpeed), 1);
  const maxGen   = Math.max(...slice.map((r) => r.totalGen), 1);

  // ── Compute ring values from API data ────────────────────────────────────────
  const avgIrradiance  = forecastData.reduce((s, r) => s + r.irradiance, 0) / forecastData.length;
  const peakIrradiance = Math.max(...forecastData.map((r) => r.irradiance));
  const peakGen        = Math.max(...forecastData.map((r) => r.totalGen));
  const installedKw    = forecastMeta?.installedCapacityKw ?? 1;
  const peakUtilPct    = Math.min(100, Math.round((peakGen / (installedKw / 1000)) * 100 * 10) / 10);

  const avgTemp  = forecastData.reduce((s, r) => s + r.ambientTemp, 0) / forecastData.length;
  const avgWind  = forecastData.reduce((s, r) => s + r.windSpeed, 0) / forecastData.length;
  const avgCloud = forecastData.reduce((s, r) => s + r.cloudCover, 0) / forecastData.length;

  // Storage SOC from user config
  const batterySocPct = parseFloat(userConfig?.batterySOC) || 0;

  const rings = [
    { label: 'Peak Capacity Factor', value: peakUtilPct, color: '#34d399' },
    { label: 'Avg Irradiance Index', value: Math.min(100, Math.round((avgIrradiance / 1100) * 100)), color: '#f59e0b' },
    { label: 'Battery SOC', value: batterySocPct > 0 ? batterySocPct : 0, color: '#22d3ee', empty: batterySocPct === 0 },
    { label: 'Avg Cloud Cover', value: Math.min(100, Math.round(avgCloud)), color: '#818cf8', inverted: true },
  ];

  // ── Sensor feeds from real API data ─────────────────────────────────────────
  const latestHour = forecastData[0];
  const feeds = [
    { label: 'Wind Speed (10m)', value: `${avgWind.toFixed(1)} m/s`, status: avgWind > 3 ? 'Above cut-in' : 'Below cut-in', icon: Zap },
    { label: 'Solar Irradiance', value: `${Math.round(peakIrradiance)} W/m²`, status: 'Peak 72h', icon: Gauge },
    { label: 'Avg Ambient Temp', value: `${avgTemp.toFixed(1)}°C`, status: avgTemp > 35 ? 'High — check derating' : 'Nominal', icon: Thermometer },
    { label: 'Cloud Cover', value: `${avgCloud.toFixed(0)}%`, status: avgCloud < 20 ? 'Clear sky' : avgCloud < 60 ? 'Partial cloud' : 'Overcast', icon: Activity },
    { label: 'Total Forecast kWh', value: `${Math.round(forecastMeta?.totalForecastedKwh ?? 0).toLocaleString()}`, status: '72h total', icon: Cpu },
    { label: 'Weather Source', value: forecastMeta?.weatherSource ?? '—', status: 'Live feed', icon: Radio },
  ];

  // Current site weather snapshot (most recent forecast hour)
  const currentWindSpeed = `${forecastData[0]?.windSpeed?.toFixed(1) ?? '—'} m/s`;
  const currentIrradiance = `${forecastData[0]?.irradiance?.toFixed(0) ?? '—'} W/m²`;
  const currentTemp = `${forecastData[0]?.ambientTemp?.toFixed(1) ?? '—'}°C`;

  return (
    <div className="space-y-4">
      {/* Waveform chart */}
      <div className="grid md:grid-cols-12 gap-4">
        <Glass className="md:col-span-8 p-5">
          <h3 className="font-display font-extrabold text-slate-900">Wind velocity vs generation waveform</h3>
          <p className="text-xs font-mono text-slate-500 mb-3">
            Anemometer m/s (blue) · Generation MW (amber) · First 24 hours
          </p>
          <div className="h-44 flex items-end gap-1">
            {waveform.map(([speed, gen], i) => (
              <div key={i} className="flex-1 flex flex-col justify-end gap-0.5 h-full group" title={`${speed} m/s · ${gen} MW`}>
                <div
                  className="w-full rounded-t bg-sky-400/90 group-hover:bg-sky-400 transition-colors"
                  style={{ height: `${(speed / maxSpeed) * 45}%` }}
                />
                <div
                  className="w-full rounded-b bg-amber-400/90 group-hover:bg-amber-400 transition-colors"
                  style={{ height: `${(gen / maxGen) * 50}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[11px] font-mono text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-sky-400 inline-block" />Wind speed m/s</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-400 inline-block" />Generation MW</span>
          </div>
        </Glass>

        <Glass className="md:col-span-4 p-5 flex flex-col items-center justify-center">
          <div className="w-20 h-20 mx-auto mb-3"><OrbCanvas kind="turbine" accent={0x0284c7} /></div>
          <div className="text-[10px] font-mono uppercase text-slate-500 font-bold text-center">Live weather snapshot</div>
          <div className="text-3xl font-extrabold tabular mt-1 text-slate-900">{currentWindSpeed}</div>
          <div className="text-sm text-sky-800 font-semibold mt-0.5 text-center">{currentIrradiance} · {currentTemp}</div>
          {userConfig?.location && (
            <div className="text-[11px] font-mono text-slate-500 mt-3 text-center truncate w-full px-2">{userConfig.location}</div>
          )}
        </Glass>
      </div>

      {/* Ring gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {rings.map((r) => {
          const circ = 2 * Math.PI * 36;
          const displayVal = r.empty ? 0 : r.value;
          const off = circ - (displayVal / 100) * circ;
          return (
            <Glass key={r.label} className="p-4 flex flex-col items-center">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(14, 165, 233, 0.16)" strokeWidth="8" />
                <circle cx="50" cy="50" r="36" fill="none" stroke={r.empty ? '#e2e8f0' : r.color} strokeWidth="8" strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" />
              </svg>
              <div className="-mt-16 text-xl font-extrabold tabular text-slate-900">
                {r.empty ? 'N/A' : `${r.value}%`}
              </div>
              <div className="mt-10 text-xs font-mono text-slate-600 font-semibold text-center">{r.label}</div>
              {r.inverted && <div className="text-[10px] font-mono text-slate-400 text-center">(lower is better)</div>}
              {r.empty && <div className="text-[10px] font-mono text-slate-400 text-center">No battery configured</div>}
            </Glass>
          );
        })}
      </div>

      {/* Sensor feeds */}
      <Glass className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Radio className="w-4 h-4 text-sky-600 animate-pulse" />
          <h3 className="font-display font-extrabold text-slate-900">Weather & generation sensor bay</h3>
          <span className="ml-auto text-[11px] font-mono text-slate-400">From live forecast API</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
          {feeds.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="glass-chip rounded-2xl p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 font-medium">
                  <Icon className="w-3.5 h-3.5 text-sky-600 shrink-0" />{f.label}
                </div>
                <div className="text-base font-bold tabular mt-1 text-slate-900 truncate">{f.value}</div>
                <div className="text-[10px] text-emerald-700 font-bold">{f.status}</div>
              </div>
            );
          })}
        </div>
      </Glass>
    </div>
  );
}
