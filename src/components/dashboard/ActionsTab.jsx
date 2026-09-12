import React, { useState } from 'react';
import { AlertOctagon, CheckCircle2, Zap, ArrowRight, ShieldCheck, BatteryCharging, Flame, Sliders, Terminal } from 'lucide-react';
import FlaggedActionsFeed from './FlaggedActionsFeed';

export default function ActionsTab({ forecastData = [] }) {
  const [scadaLogs, setScadaLogs] = useState([
    { time: '13:12:04 UTC', node: 'BESS-BAY-02', cmd: 'PRE_CHARGE_INIT', state: 'ACK (0x99A)', status: 'Success' },
    { time: '13:00:00 UTC', node: 'INVERTER_ARRAY_A', cmd: 'P_LIMIT_SET_95%', state: 'SYNCED', status: 'Success' },
    { time: '12:45:12 UTC', node: 'PEAKER_SUB_CAISO', cmd: 'WARM_STANDBY_PING', state: 'READY', status: 'Nominal' },
    { time: '12:30:00 UTC', node: 'SCADA_TELEMETRY', cmd: '72H_DISPATCH_BROADCAST', state: 'COMMITTED', status: 'Success' },
  ]);

  return (
    <div className="space-y-6">
      {/* 1. Flagged Actions Feed */}
      <FlaggedActionsFeed forecastData={forecastData} />

      {/* 2. Automated Action Decision Matrix & Protocols */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white/95 border border-sky-200/90 shadow-[0_4px_25px_-5px_rgba(2,132,199,0.08)]">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-mono font-bold uppercase mb-2">
            <BatteryCharging className="w-4 h-4 text-emerald-600" />
            <span>Surplus Absorption Protocol</span>
          </div>
          <h4 className="font-display font-black text-base text-slate-900 mb-2">
            Tier-1 BESS Charging & Dynamic Curtailment
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed font-sans mb-3">
            When forecasted renewable supply exceeds local demand by &gt;25 MW, MegaByte commands local 4h battery storage to absorb excess megawatts before triggering inverter curtailment, protecting revenue.
          </p>
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-mono text-emerald-800 font-semibold">
            Status: Automated Dispatch Armed
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white/95 border border-sky-200/90 shadow-[0_4px_25px_-5px_rgba(2,132,199,0.08)]">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-mono font-bold uppercase mb-2">
            <Flame className="w-4 h-4 text-amber-600" />
            <span>Shortfall Deficit Protocol</span>
          </div>
          <h4 className="font-display font-black text-base text-slate-900 mb-2">
            BESS Discharge + Peaker Pre-Warming
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed font-sans mb-3">
            If evening twilight and thermal wind lull coincide with peak residential load, the engine initiates battery discharge up to 30 MW and pre-heats gas/hydro reserves to eliminate blackouts.
          </p>
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-mono text-amber-800 font-semibold">
            Status: 4h Advance Lead-time Active
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white/95 border border-sky-200/90 shadow-[0_4px_25px_-5px_rgba(2,132,199,0.08)]">
          <div className="flex items-center gap-2 text-sky-800 text-xs font-mono font-bold uppercase mb-2">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>Storm & Cut-Out Safeguard</span>
          </div>
          <h4 className="font-display font-black text-base text-slate-900 mb-2">
            Rotor Aerodynamic Feathering
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed font-sans mb-3">
            Wind gusts exceeding 22 m/s trigger automated nacelle yaw adjustments and blade feathering stages to protect rotor mechanics while rerouting inflow to substation battery buffers.
          </p>
          <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-[11px] font-mono text-sky-800 font-semibold">
            Status: IEC 61400-1 Safety Enforced
          </div>
        </div>
      </div>

      {/* 3. Real-Time SCADA Command & Event Log */}
      <div className="p-6 rounded-3xl bg-white/95 border border-sky-200/90 shadow-[0_4px_25px_-5px_rgba(2,132,199,0.08)]">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-sky-100">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sky-600" />
            <h4 className="font-display font-black text-base text-slate-900">
              Live Substation SCADA Command Dispatch Bus
            </h4>
          </div>
          <span className="text-xs font-mono text-slate-500">
            DNP3 / Modbus TCP Stream Active
          </span>
        </div>

        <div className="space-y-2">
          {scadaLogs.map((log, lIdx) => (
            <div
              key={lIdx}
              className="p-3 rounded-xl bg-sky-50/70 border border-sky-200/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono"
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-400">{log.time}</span>
                <span className="font-bold text-slate-900">{log.node}</span>
                <span className="text-sky-700 font-semibold">{log.cmd}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-500">State: {log.state}</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
