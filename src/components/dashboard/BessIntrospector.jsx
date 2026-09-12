import React, { useMemo, useRef, useState } from 'react';
import {
  BatteryCharging, Battery, Scissors, Zap, Download,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  Cpu, FileText, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Glass } from '../ui/Glass';
import { runBessOptimizer, generateCSV, downloadCSV, generateNarrative } from '../../utils/bessOptimizer';

// ── SOC sparkline (pure SVG) ─────────────────────────────────────────────────
function SocTimeline({ schedule }) {
  const W = 720, H = 180, PT = 16, PB = 20;
  const plotH = H - PT - PB;
  const n = schedule.length;

  const xOf  = (t)   => (t / Math.max(1, n - 1)) * W;
  const yOf  = (soc) => PT + (1 - Math.max(0, Math.min(100, soc)) / 100) * plotH;

  const y15  = yOf(15);
  const y95  = yOf(95);
  const y50  = yOf(50);
  const y100 = yOf(100);

  // SVG polyline points for SOC line
  const pts = schedule.map((r, t) => `${xOf(t).toFixed(1)},${yOf(r.bessAfterSocPct).toFixed(1)}`).join(' ');

  // Area path (closed at bottom)
  const areaD = [
    `M ${xOf(0).toFixed(1)},${yOf(schedule[0]?.bessAfterSocPct ?? 50).toFixed(1)}`,
    ...schedule.map((r, t) => `L ${xOf(t).toFixed(1)},${yOf(r.bessAfterSocPct).toFixed(1)}`),
    `L ${xOf(n - 1).toFixed(1)},${(H - PB).toFixed(1)}`,
    `L ${xOf(0).toFixed(1)},${(H - PB).toFixed(1)} Z`,
  ].join(' ');

  // Dispatch mode color map
  const modeColor = {
    charge:    '#22c55e',
    discharge: '#f59e0b',
    curtail:   '#f43f5e',
    backup:    '#8b5cf6',
    balanced:  '#e2e8f0',
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full"
      preserveAspectRatio="none"
      aria-label="BESS SOC over 72 hours"
    >
      <defs>
        <linearGradient id="bessAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#0ea5e9" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.03" />
        </linearGradient>
      </defs>

      {/* Zone: danger floor (0–15%) */}
      <rect x="0" y={y15} width={W} height={H - PB - y15} fill="#fecdd3" fillOpacity="0.35" />
      {/* Zone: overfill ceiling (95–100%) */}
      <rect x="0" y={y100} width={W} height={y95 - y100} fill="#fef9c3" fillOpacity="0.45" />

      {/* Grid lines */}
      <line x1="0" y1={y95} x2={W} y2={y95} stroke="#22c55e" strokeWidth="1" strokeDasharray="5 4" strokeOpacity="0.6" />
      <line x1="0" y1={y50} x2={W} y2={y50} stroke="#94a3b8" strokeWidth="0.6" strokeDasharray="4 4" strokeOpacity="0.5" />
      <line x1="0" y1={y15} x2={W} y2={y15} stroke="#f87171" strokeWidth="1" strokeDasharray="5 4" strokeOpacity="0.6" />

      {/* Day separators (hours 24, 48) */}
      {[24, 48].map(h => (
        <line key={h} x1={xOf(h)} y1={PT} x2={xOf(h)} y2={H - PB}
          stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3 3" strokeOpacity="0.5" />
      ))}

      {/* Dispatch mode bar (bottom strip, height = PB) */}
      {schedule.map((r, t) => (
        <rect
          key={t}
          x={xOf(t).toFixed(1)}
          y={H - PB + 2}
          width={(W / n + 0.5).toFixed(1)}
          height={PB - 2}
          fill={modeColor[r.dispatchMode] ?? modeColor.balanced}
          fillOpacity="0.75"
        />
      ))}

      {/* SOC area fill */}
      <path d={areaD} fill="url(#bessAreaGrad)" />

      {/* SOC line */}
      <polyline
        points={pts}
        fill="none"
        stroke="#0ea5e9"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Y-axis labels */}
      <text x="4" y={y95 - 3} fontSize="9" fill="#16a34a" fontFamily="monospace" fontWeight="bold">95%</text>
      <text x="4" y={y15 - 3} fontSize="9" fill="#dc2626" fontFamily="monospace" fontWeight="bold">15%</text>
      <text x="4" y={y50 + 3} fontSize="8" fill="#64748b" fontFamily="monospace">50%</text>

      {/* Day labels */}
      <text x={xOf(12).toFixed(1)} y={H - 5} fontSize="8" fill="#475569" fontFamily="monospace" textAnchor="middle" fontWeight="bold">Day 1</text>
      <text x={xOf(36).toFixed(1)} y={H - 5} fontSize="8" fill="#475569" fontFamily="monospace" textAnchor="middle" fontWeight="bold">Day 2</text>
      <text x={xOf(60).toFixed(1)} y={H - 5} fontSize="8" fill="#475569" fontFamily="monospace" textAnchor="middle" fontWeight="bold">Day 3</text>
    </svg>
  );
}

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, unit, color, sub }) {
  return (
    <Glass className="p-4 flex flex-col gap-1.5">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color.bg}`}>
        <Icon className={`w-4 h-4 ${color.icon}`} />
      </div>
      <div className="flex items-baseline gap-1 mt-1">
        <span className={`text-2xl font-extrabold tabular ${color.text}`}>{value}</span>
        <span className="text-xs font-mono text-slate-500">{unit}</span>
      </div>
      <div className="text-[11px] font-mono text-slate-500 font-medium">{label}</div>
      {sub && <div className={`text-[10px] font-mono font-bold ${color.text}`}>{sub}</div>}
    </Glass>
  );
}

// ── Dispatch table row color ─────────────────────────────────────────────────
function rowCls(mode, unserved) {
  if (unserved > 0)        return 'bg-rose-50/70 border-rose-200/60';
  if (mode === 'charge')   return 'bg-emerald-50/60 border-emerald-200/50';
  if (mode === 'discharge')return 'bg-amber-50/60 border-amber-200/50';
  if (mode === 'curtail')  return 'bg-rose-50/40 border-rose-200/40';
  if (mode === 'backup')   return 'bg-violet-50/60 border-violet-200/50';
  return 'bg-slate-50/30 border-transparent';
}

function modeChip(mode, chargeMw, dischargeMw) {
  const cls = {
    charge:    'bg-emerald-100 text-emerald-800 border-emerald-300',
    discharge: 'bg-amber-100 text-amber-800 border-amber-300',
    curtail:   'bg-rose-100 text-rose-800 border-rose-300',
    backup:    'bg-violet-100 text-violet-800 border-violet-300',
    balanced:  'bg-slate-100 text-slate-600 border-slate-200',
  }[mode] ?? 'bg-slate-100 text-slate-600 border-slate-200';

  const label = {
    charge:    `+${chargeMw} MW`,
    discharge: `−${dischargeMw} MW`,
    curtail:   'Curtail',
    backup:    'Backup',
    balanced:  '—',
  }[mode] ?? '—';

  return (
    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${cls}`}>
      {label}
    </span>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function BessIntrospector({ forecastData, userConfig }) {
  const [tableExpanded, setTableExpanded] = useState(false);

  const bessCapMwh = parseFloat(userConfig?.batteryCapacity || 0);
  const bessInitSoc = parseFloat(userConfig?.batterySOC || 50);
  const hasBess = bessCapMwh > 0;

  const { schedule, summary } = useMemo(
    () => runBessOptimizer(forecastData, bessCapMwh, bessInitSoc),
    [forecastData, bessCapMwh, bessInitSoc]
  );

  const narrative = useMemo(
    () => generateNarrative(summary, schedule),
    [summary, schedule]
  );

  const handleExportCSV = () => {
    const csv = generateCSV(schedule, summary);
    downloadCSV(csv, `bess_72h_dispatch_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const visibleRows = tableExpanded ? schedule : schedule.slice(0, 24);

  return (
    <div className="space-y-4">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-slate-900 text-base">
              72-Hour BESS Dispatch Introspector
            </h3>
            <p className="text-[11px] font-mono text-slate-500 mt-0.5">
              Look-ahead optimizer • Night-priority discharge • Capacity-constrained
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasBess ? (
            <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              {bessCapMwh} MWh @ {bessInitSoc}% SOC
            </span>
          ) : (
            <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              No BESS configured
            </span>
          )}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 hover:border-sky-300 transition-all active:scale-95 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── KPI Summary Row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          icon={TrendingDown}
          label="Shortfall eliminated"
          value={summary.shortfallReductionPct}
          unit="%"
          color={{ bg: 'bg-emerald-100', icon: 'text-emerald-600', text: 'text-emerald-700' }}
          sub={summary.totalUnservedMwh === 0 ? '✓ Zero unserved' : `${summary.totalUnservedMwh} MWh unserved`}
        />
        <KpiCard
          icon={BatteryCharging}
          label="Energy absorbed (BESS)"
          value={summary.totalSurplusAbsorbedMwh}
          unit="MWh"
          color={{ bg: 'bg-sky-100', icon: 'text-sky-600', text: 'text-sky-700' }}
          sub={`${summary.chargeCycles} equiv. cycles`}
        />
        <KpiCard
          icon={summary.totalUnservedMwh > 0 ? AlertTriangle : CheckCircle2}
          label="Unserved load"
          value={summary.totalUnservedMwh}
          unit="MWh"
          color={
            summary.totalUnservedMwh > 0
              ? { bg: 'bg-rose-100', icon: 'text-rose-600', text: 'text-rose-700' }
              : { bg: 'bg-emerald-100', icon: 'text-emerald-600', text: 'text-emerald-700' }
          }
          sub={`Peak SOC: ${summary.peakSOC}% / Min: ${summary.minSOC}%`}
        />
        <KpiCard
          icon={Scissors}
          label="Curtailed surplus"
          value={summary.totalCurtailMwh}
          unit="MWh"
          color={{ bg: 'bg-amber-100', icon: 'text-amber-600', text: 'text-amber-700' }}
          sub={`Raw shortfall: ${summary.totalRawShortfallMwh} MWh`}
        />
      </div>

      {/* ── SOC Timeline Chart ────────────────────────────────────────────── */}
      {hasBess && (
        <Glass className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-display font-extrabold text-sm text-slate-900">Battery SOC Timeline</h4>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              {[
                { color: 'bg-emerald-400', label: 'Charging' },
                { color: 'bg-amber-400',   label: 'Discharging' },
                { color: 'bg-rose-400',    label: 'Curtailed' },
                { color: 'bg-violet-400',  label: 'Backup' },
                { color: 'bg-slate-300',   label: 'Balanced' },
              ].map(({ color, label }) => (
                <span key={label} className="flex items-center gap-1 text-slate-600">
                  <span className={`inline-block w-2.5 h-2.5 rounded-sm ${color}`} />
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="h-44 w-full overflow-hidden rounded-xl bg-white/50 border border-sky-100">
            <SocTimeline schedule={schedule} bessCapMwh={bessCapMwh} />
          </div>
        </Glass>
      )}

      {/* ── Narrative ─────────────────────────────────────────────────────── */}
      <Glass className="p-4">
        <div className="flex items-start gap-2">
          <FileText className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-display font-extrabold text-sm text-slate-900 mb-1.5">
              Dispatch Narrative
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed font-sans">{narrative}</p>
          </div>
        </div>
      </Glass>

      {/* ── Hour-by-Hour Dispatch Table ───────────────────────────────────── */}
      <Glass className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-display font-extrabold text-sm text-slate-900">
            Hour-by-Hour Dispatch Schedule
          </h4>
          <span className="text-[11px] font-mono text-slate-400">
            {schedule.length} hours • {schedule.filter(r => r.unservedMw > 0).length} unserved
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-sky-100">
          <table className="w-full text-xs font-mono min-w-[720px]">
            <thead>
              <tr className="bg-sky-50/80 text-left text-[10px] text-slate-500 uppercase tracking-wider">
                {['Hour', 'Time', 'Gen (MW)', 'Demand (MW)', 'Raw Net', 'BESS Action', 'SOC After', 'Unserved'].map(h => (
                  <th key={h} className="px-3 py-2 font-bold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleRows.map((r) => (
                <tr
                  key={r.hourOffset}
                  className={`border-b text-xs transition-colors hover:brightness-95 ${rowCls(r.dispatchMode, r.unservedMw)}`}
                >
                  <td className="px-3 py-2 text-slate-400 font-bold">{String(r.hourOffset).padStart(2, '0')}</td>
                  <td className="px-3 py-2 text-slate-800 font-bold whitespace-nowrap">{r.timeLabel}</td>
                  <td className="px-3 py-2 text-sky-700">{r.genMw.toFixed(1)}</td>
                  <td className="px-3 py-2 text-slate-600">{r.demMw.toFixed(1)}</td>
                  <td className={`px-3 py-2 font-bold ${r.rawNetMw >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {r.rawNetMw >= 0 ? '+' : ''}{r.rawNetMw.toFixed(1)}
                  </td>
                  <td className="px-3 py-2">
                    {modeChip(r.dispatchMode, r.bessChargeMw, r.bessDischargeMw)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-14 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-sky-500"
                          style={{ width: `${Math.min(100, r.bessAfterSocPct)}%` }}
                        />
                      </div>
                      <span className="text-slate-700 font-bold whitespace-nowrap">{r.bessAfterSocPct.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {r.unservedMw > 0 ? (
                      <span className="font-bold text-rose-700">⚠ {r.unservedMw.toFixed(1)}</span>
                    ) : (
                      <span className="text-emerald-600">✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Show more / show less */}
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => setTableExpanded(e => !e)}
            className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-4 py-1.5 rounded-full transition-all active:scale-95"
          >
            {tableExpanded ? (
              <><ChevronUp className="w-3.5 h-3.5" />Show less (Day 1 only)</>
            ) : (
              <><ChevronDown className="w-3.5 h-3.5" />Show all 72 hours</>
            )}
          </button>
        </div>
      </Glass>
    </div>
  );
}
