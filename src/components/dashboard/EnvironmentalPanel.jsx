import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Wind, Sun, CloudRain, Gauge, Thermometer, Compass, CloudLightning } from 'lucide-react';

export default function EnvironmentalPanel({ siteProfile }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="rounded-3xl bg-white/95 border border-sky-200/90 shadow-[0_4px_25px_-5px_rgba(2,132,199,0.08)] overflow-hidden transition-all">
      {/* Panel Header with Collapsible Toggle */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-5 flex items-center justify-between cursor-pointer select-none bg-sky-50/60 hover:bg-sky-100/70 transition-colors border-b border-sky-100"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 shadow-sm">
            <CloudLightning className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-display font-black text-sm text-slate-900">
                Atmospheric & Satellite Weather Telemetry
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 font-bold">
                ECMWF / NOAA Ingested
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-500">
              High-resolution 0.25° atmospheric mesh updating every 15 minutes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-600 hover:text-sky-800">
          <span className="text-xs font-mono font-semibold hidden sm:inline-block">
            {isCollapsed ? 'Expand Weather Telemetry' : 'Collapse'}
          </span>
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded Environmental Metric Grid */}
      {!isCollapsed && (
        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Solar Irradiance</span>
            </div>
            <div className="text-base font-bold font-mono text-slate-900 mt-1">
              {siteProfile?.irradiance || '920 W/m²'}
            </div>
            <div className="text-[10px] text-amber-700 font-mono mt-0.5">DNI Direct Normal</div>
          </div>

          <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <Wind className="w-3.5 h-3.5 text-sky-600" />
              <span>Wind Speed (100m)</span>
            </div>
            <div className="text-base font-bold font-mono text-slate-900 mt-1">
              {siteProfile?.windSpeed || '12.4 m/s'}
            </div>
            <div className="text-[10px] text-sky-700 font-mono mt-0.5">Hub-height shear</div>
          </div>

          <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>Prevailing Yaw</span>
            </div>
            <div className="text-base font-bold font-mono text-slate-900 mt-1">
              232.0° WSW
            </div>
            <div className="text-[10px] text-emerald-700 font-mono mt-0.5">Rotor face angle</div>
          </div>

          <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <Thermometer className="w-3.5 h-3.5 text-rose-500" />
              <span>Ambient Temp</span>
            </div>
            <div className="text-base font-bold font-mono text-slate-900 mt-1">
              {siteProfile?.ambientTemp || '22°C'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Temp coeff: -0.29%/°C</div>
          </div>

          <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <CloudRain className="w-3.5 h-3.5 text-blue-500" />
              <span>Cloud Cover</span>
            </div>
            <div className="text-base font-bold font-mono text-slate-900 mt-1">
              {siteProfile?.cloudCover || '4%'}
            </div>
            <div className="text-[10px] text-blue-700 font-mono mt-0.5">Clear Sky Index: 0.94</div>
          </div>

          <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <Gauge className="w-3.5 h-3.5 text-indigo-500" />
              <span>Barometric Pressure</span>
            </div>
            <div className="text-base font-bold font-mono text-slate-900 mt-1">
              1012.4 hPa
            </div>
            <div className="text-[10px] text-indigo-700 font-mono mt-0.5">Air density: 1.22 kg/m³</div>
          </div>
        </div>
      )}
    </div>
  );
}
