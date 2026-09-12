import React from 'react';
import { Wind, Compass, Gauge, ArrowUpRight, CheckCircle2, RotateCw } from 'lucide-react';

export default function WindWaveformChart({ siteProfile }) {
  const waveformBars = [
    { speed: 7.2, power: 310 },
    { speed: 8.5, power: 345 },
    { speed: 9.1, power: 390 },
    { speed: 11.4, power: 440 },
    { speed: 12.8, power: 460 },
    { speed: 13.5, power: 480 },
    { speed: 14.2, power: 495 },
    { speed: 13.8, power: 485 },
    { speed: 12.1, power: 450 },
    { speed: 10.5, power: 410 },
    { speed: 9.2, power: 375 },
    { speed: 8.4, power: 330 },
    { speed: 9.8, power: 395 },
    { speed: 11.9, power: 455 },
    { speed: 13.1, power: 475 },
    { speed: 12.6, power: 460 },
    { speed: 11.0, power: 420 },
    { speed: 9.5, power: 360 },
  ];

  const targetCompletion = 88.4;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
      {/* 1. Dual-Metric Waveform Chart (Wind Speed vs Power Output) */}
      <div className="md:col-span-8 p-6 rounded-3xl bg-white/95 border border-sky-200/90 shadow-[0_4px_25px_-5px_rgba(2,132,199,0.08)] flex flex-col justify-between">
        <div className="flex items-center justify-between pb-4 border-b border-sky-100 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-sky-600" />
              <h4 className="font-display font-black text-base text-slate-900">
                Wind Velocity vs. Generator kW Waveform
              </h4>
            </div>
            <p className="text-xs font-mono text-slate-500 mt-0.5">
              Dual-metric coupled spectrum (Anemometer m/s vs Turbine Inflow kW)
            </p>
          </div>
          <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-200 font-semibold">
            Nacelle Fleet Telemetry
          </span>
        </div>

        {/* Bar Waveform Visualizer */}
        <div className="h-44 flex items-center justify-between gap-1.5 px-3 py-4 bg-sky-50/70 rounded-2xl border border-sky-200/80">
          {waveformBars.map((bar, idx) => {
            const speedHeight = Math.round((bar.speed / 16) * 60);
            const powerHeight = Math.round((bar.power / 500) * 65);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center justify-center h-full group relative cursor-pointer">
                {/* Wind Speed upper bar (Sky Blue) */}
                <div
                  style={{ height: `${speedHeight}%` }}
                  className="w-full max-w-[8px] bg-sky-500 rounded-t-sm group-hover:bg-sky-400 transition-all shadow-sm"
                />
                {/* Center zero-line separator dot */}
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 my-0.5 group-hover:bg-sky-700" />
                {/* Power Output lower bar (Warm Amber) */}
                <div
                  style={{ height: `${powerHeight}%` }}
                  className="w-full max-w-[8px] bg-amber-500 rounded-b-sm group-hover:bg-amber-400 transition-all shadow-sm"
                />

                {/* Hover Tooltip */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center p-1.5 rounded-lg bg-white border border-sky-200 shadow-xl text-[10px] font-mono z-30 pointer-events-none whitespace-nowrap text-slate-800">
                  <span className="text-sky-700 font-bold">{bar.speed} m/s</span>
                  <span className="text-amber-700 font-bold">{bar.power} kW</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Waveform Legend */}
        <div className="mt-4 pt-3 border-t border-sky-100 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-sky-500 rounded-sm" />
              <span className="text-slate-700 font-medium">Wind Velocity (m/s)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm" />
              <span className="text-slate-700 font-medium">Generator Power (kW)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Rotor Dynamic Rate:</span>
            <span className="text-slate-900 font-bold">20.4 RPM</span>
          </div>
        </div>
      </div>

      {/* 2. Semicircular Target Gauge & Nacelle Direction */}
      <div className="md:col-span-4 p-6 rounded-3xl bg-white/95 border border-sky-200/90 shadow-[0_4px_25px_-5px_rgba(2,132,199,0.08)] flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-sky-100">
          <span className="text-xs font-display font-black text-slate-900 uppercase tracking-wider">
            Target Completion & Yaw
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
            Optimal Output
          </span>
        </div>

        {/* Semicircular Gauge SVG */}
        <div className="relative flex flex-col items-center justify-center my-3">
          <svg className="w-48 h-28 overflow-visible" viewBox="0 0 160 90">
            <defs>
              <linearGradient id="gaugeGradLight" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="50%" stopColor="#059669" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            {/* Background Arc */}
            <path
              d="M 20 80 A 60 60 0 0 1 140 80"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Active Progress Arc */}
            <path
              d="M 20 80 A 60 60 0 0 1 140 80"
              fill="none"
              stroke="url(#gaugeGradLight)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="188.4"
              strokeDashoffset={188.4 * (1 - targetCompletion / 100)}
            />
          </svg>

          {/* Centered Readout Value */}
          <div className="absolute top-12 flex flex-col items-center text-center">
            <span className="text-2xl font-black font-display text-slate-900 tracking-tight">
              {targetCompletion}%
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Day-Ahead Target Met
            </span>
          </div>
        </div>

        {/* Nacelle & Wind Compass mini-bar */}
        <div className="pt-3 border-t border-sky-100 grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-200/80">
            <div className="text-[10px] text-slate-500">Wind Direction</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-sky-600" />
              <span>232° WSW</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
            <div className="text-[10px] text-slate-500">Active Power</div>
            <div className="text-sm font-bold text-amber-700 mt-0.5">
              345 kW / turbine
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
